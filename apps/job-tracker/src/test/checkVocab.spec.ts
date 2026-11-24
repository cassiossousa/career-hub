import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve(__dirname, '../..');
const REPO_ROOT = path.resolve(APP_ROOT, '../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'check-vocab.mjs');
const FIXTURE = path.join(APP_ROOT, 'src', '__vocabGateFixture.ts');

function runVocabCheck() {
  return spawnSync(process.execPath, [SCRIPT], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
}

describe('check:vocab gate', () => {
  afterEach(() => {
    rmSync(FIXTURE, { force: true });
  });

  it('passes on the current tree (no multi-form vocabularies)', () => {
    const result = runVocabCheck();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Vocab check OK');
  }, 30000);

  it('fails when one vocabulary is declared as both a union and an array', () => {
    writeFileSync(
      FIXTURE,
      [
        "export type FixtureLevel = 'alpha' | 'beta';",
        "export const FIXTURE_LEVELS = ['alpha', 'beta'] as const;",
        '',
      ].join('\n'),
    );
    const result = runVocabCheck();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('FixtureLevel');
    expect(result.stderr).toContain('declared more than once');
  }, 30000);
});
