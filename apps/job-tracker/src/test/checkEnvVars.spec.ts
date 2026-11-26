import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  repoScript,
  runNodeScript,
  tempFixtureDir,
  tsSource,
} from './scriptGate';

const SCRIPT = repoScript('check-env-vars.mjs');

/** Builds an index.ts that reads the given `name = import.meta.env.X` decls. */
function envIndexSource(...decls: string[]): string {
  const names = decls.map((decl) => decl.split('=')[0]?.trim() ?? '');
  return tsSource(
    ...decls.map((decl) => `const ${decl};`),
    `void ${names.join('; void ')};`,
  );
}

function writeAppFiles(appDir: string, files: Record<string, string>) {
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(appDir, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function makeFixtureApp(root: string, envExample: string) {
  writeAppFiles(path.join(root, 'apps', 'fixture-app'), {
    'src/index.ts': envIndexSource(
      'apiUrl = import.meta.env.VITE_FIXTURE_API_URL',
      'mode = import.meta.env.MODE',
    ),
    '.env.example': envExample,
  });
}

function runEnvCheck(root: string) {
  return runNodeScript(SCRIPT, ['--root', root]);
}

describe('check:env gate', () => {
  const fixtureRoot = tempFixtureDir('env-gate-');

  it('passes on the real repo (every read var documented, no stale docs)', () => {
    const result = runEnvCheck(REPO_ROOT);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Env check OK');
  }, 30000);

  it('fails when code reads a var missing from .env.example', () => {
    makeFixtureApp(fixtureRoot(), '# no vars documented yet\n');
    const result = runEnvCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'VITE_FIXTURE_API_URL is read by code but missing from .env.example',
    );
  });

  it('fails when .env.example documents a var nothing reads', () => {
    makeFixtureApp(
      fixtureRoot(),
      [
        '# VITE_FIXTURE_API_URL=https://api.example.invalid',
        '# VITE_FIXTURE_STALE=unused',
        '',
      ].join('\n'),
    );
    const result = runEnvCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'VITE_FIXTURE_STALE is documented in .env.example but never referenced',
    );
  });

  it('ignores Vite builtins and vars the vite config assigns itself', () => {
    writeAppFiles(path.join(fixtureRoot(), 'apps', 'fixture-app'), {
      'src/index.ts': envIndexSource(
        'url = import.meta.env.VITE_FIXTURE_API_URL',
        'dev = import.meta.env.DEV',
      ),
      'vite.config.ts':
        'process.env.PORTFOLIO_ROOT = "/tmp";\nexport default {};\n',
      '.env.example': '# VITE_FIXTURE_API_URL=https://api.example.invalid\n',
    });
    const result = runEnvCheck(fixtureRoot());
    expect(result.status).toBe(0);
  });
});
