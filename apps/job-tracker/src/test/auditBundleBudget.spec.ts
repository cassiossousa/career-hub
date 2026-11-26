import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { repoScript, runNodeScript, tempFixtureDir } from './scriptGate';

const SCRIPT = repoScript('audit-bundle-budget.mjs');

function makeDistApp(root: string, jsBytes: number) {
  const assetsDir = path.join(root, 'dist', 'assets');
  mkdirSync(assetsDir, { recursive: true });
  // Incompressible-ish payload so gzip size tracks byte size.
  const chunk = Array.from({ length: 64 }, (_, i) =>
    String.fromCharCode(33 + ((i * 37) % 90)),
  ).join('');
  writeFileSync(
    path.join(assetsDir, 'bundle.js'),
    chunk.repeat(Math.ceil(jsBytes / chunk.length)),
  );
}

function runBudget(appDir: string, extraArgs: string[] = []) {
  return runNodeScript(SCRIPT, [appDir, ...extraArgs]);
}

describe('audit:bundle-budget gate', () => {
  const fixtureRoot = tempFixtureDir('bundle-budget-');

  it('passes a small bundle under the limit', () => {
    makeDistApp(fixtureRoot(), 2048);
    const result = runBudget(fixtureRoot(), ['--js-limit-kb', '400']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('— OK');
  });

  it('fails when the gzip total exceeds the configured limit', () => {
    makeDistApp(fixtureRoot(), 2048);
    const result = runBudget(fixtureRoot(), ['--js-limit-kb', '0']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('BUDGET EXCEEDED');
  });

  it('fails when the bundle grows >5 kB over the recorded baseline', () => {
    makeDistApp(fixtureRoot(), 64 * 1024);
    // Random bytes stay ~incompressible so the gzip delta is real.
    writeFileSync(
      path.join(fixtureRoot(), 'dist', 'assets', 'bundle.js'),
      randomBytes(64 * 1024),
    );
    writeFileSync(
      path.join(fixtureRoot(), '.bundle-baseline.json'),
      JSON.stringify({ jsGzipBytes: 0, cssGzipBytes: 0 }),
    );
    const result = runBudget(fixtureRoot(), ['--js-limit-kb', '400']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('BUNDLE GREW');
  });
});
