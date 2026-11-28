import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { repoScript, runNodeScript, tempFixtureDir } from './scriptGate';

const SCRIPT = repoScript('check-supply-chain.mjs');

function writeLockfile(root: string, packages: Record<string, unknown>) {
  const lockfile = path.join(root, 'package-lock.json');
  writeFileSync(
    lockfile,
    JSON.stringify({ name: 'fixture', lockfileVersion: 3, packages }),
  );
  return lockfile;
}

const REGISTRY_PKG = {
  version: '1.0.0',
  resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
  integrity: 'sha512-abc=',
};

function runSupplyChain(lockfile: string) {
  return runNodeScript(SCRIPT, ['--lockfile', lockfile]);
}

describe('check:supply-chain audit', () => {
  const fixtureRoot = tempFixtureDir('supply-chain-');

  it('passes on the real repo lockfile', () => {
    const result = runNodeScript(SCRIPT);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Supply-chain check OK');
  });

  it('passes on a clean registry-only fixture', () => {
    const root = fixtureRoot();
    mkdirSync(root, { recursive: true });
    const lockfile = writeLockfile(root, {
      '': { name: 'fixture' },
      'apps/web': { name: 'web', version: '0.0.1' },
      'node_modules/pkg': { ...REGISTRY_PKG },
      'node_modules/pkg/node_modules/nested': {
        ...REGISTRY_PKG,
        resolved: 'https://registry.npmjs.org/nested/-/nested-1.0.0.tgz',
      },
      'node_modules/linked': { link: true, resolved: 'packages/ui' },
    });

    const result = runSupplyChain(lockfile);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Supply-chain check OK');
  });

  it('fails on a git-sourced dependency', () => {
    const root = fixtureRoot();
    mkdirSync(root, { recursive: true });
    const lockfile = writeLockfile(root, {
      '': { name: 'fixture' },
      'node_modules/evil': {
        version: '1.0.0',
        resolved: 'git+ssh://git@github.com/evil/evil.git#abc123',
      },
    });

    const result = runSupplyChain(lockfile);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('non-registry URL');
  });

  it('fails on a registry tarball missing an integrity hash', () => {
    const root = fixtureRoot();
    mkdirSync(root, { recursive: true });
    const lockfile = writeLockfile(root, {
      '': { name: 'fixture' },
      'node_modules/pkg': {
        version: '1.0.0',
        resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
      },
    });

    const result = runSupplyChain(lockfile);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('missing "integrity" hash');
  });

  it('fails on a package with no resolved URL', () => {
    const root = fixtureRoot();
    mkdirSync(root, { recursive: true });
    const lockfile = writeLockfile(root, {
      '': { name: 'fixture' },
      'node_modules/mystery': { version: '1.0.0' },
    });

    const result = runSupplyChain(lockfile);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('no "resolved" URL');
  });

  it('reports install-script packages without failing', () => {
    const root = fixtureRoot();
    mkdirSync(root, { recursive: true });
    const lockfile = writeLockfile(root, {
      '': { name: 'fixture' },
      'node_modules/native': {
        ...REGISTRY_PKG,
        resolved: 'https://registry.npmjs.org/native/-/native-1.0.0.tgz',
        hasInstallScript: true,
      },
    });

    const result = runSupplyChain(lockfile);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('install-script: native');
  });
});
