import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'package-vercel.mjs');

function makeFixtureApp(root: string, vercelJson: string) {
  const appDir = path.join(root, 'apps', 'fixture-app');
  const distDir = path.join(appDir, 'dist');
  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(distDir, 'index.html'), '<html></html>\n');
  writeFileSync(path.join(distDir, 'app.js'), 'console.log(1);\n');
  writeFileSync(path.join(appDir, 'vercel.json'), vercelJson);
  return appDir;
}

function runPackage(root: string) {
  return spawnSync(
    process.execPath,
    [SCRIPT, `--root=${root}`, 'fixture-app'],
    { encoding: 'utf8' },
  );
}

const VALID_VERCEL_JSON = JSON.stringify({
  rewrites: [{ source: '/(.*)', destination: '/index.html' }],
});

describe('package:vercel gate', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'package-vercel-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('packages dist into Build Output API v3 layout', () => {
    const appDir = makeFixtureApp(root, VALID_VERCEL_JSON);
    const result = runPackage(root);
    expect(result.status).toBe(0);

    const outputDir = path.join(appDir, '.vercel', 'output');
    const config: unknown = JSON.parse(
      readFileSync(path.join(outputDir, 'config.json'), 'utf8'),
    );
    expect(config).toMatchObject({ version: 3 });
    expect(existsSync(path.join(outputDir, 'static', 'index.html'))).toBe(true);
    expect(existsSync(path.join(outputDir, 'static', 'app.js'))).toBe(true);
  });

  it('fails on more than one SPA fallback rewrite', () => {
    makeFixtureApp(
      root,
      JSON.stringify({
        rewrites: [
          { source: '/a', destination: '/index.html' },
          { source: '/b', destination: '/index.html' },
        ],
      }),
    );
    const result = runPackage(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('at most one SPA fallback');
  });

  it('fails on a malformed rewrite entry', () => {
    makeFixtureApp(root, JSON.stringify({ rewrites: [{ source: '/x' }] }));
    const result = runPackage(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid rewrite entry');
  });

  it('fails when the app has no vercel.json', () => {
    const appDir = path.join(root, 'apps', 'fixture-app');
    mkdirSync(path.join(appDir, 'dist'), { recursive: true });
    writeFileSync(path.join(appDir, 'dist', 'index.html'), '<html></html>');
    const result = runPackage(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Missing');
  });
});
