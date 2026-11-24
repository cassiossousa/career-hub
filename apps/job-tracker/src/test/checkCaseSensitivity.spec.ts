import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { makeFixtureRepo } from './gitRepoFixture';
import { findRepoRoot } from './repoRoot';

const SCRIPT = path.join(
  findRepoRoot(__dirname),
  'scripts',
  'check-case-sensitivity.mjs',
);

function runCheck(cwd: string) {
  return spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });
}

describe('check:case gate', () => {
  it('passes when index casing matches the working tree', () => {
    const repo = makeFixtureRepo();
    try {
      repo.write('src/MixedCase.ts');
      repo.commit('add file');
      const result = runCheck(repo.dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Case check OK');
    } finally {
      repo.dispose();
    }
  });

  it('fails when a tracked path has different casing on disk', () => {
    const repo = makeFixtureRepo();
    try {
      repo.write('src/MixedCase.ts');
      repo.commit('add file');
      // Inject an index entry whose casing differs from the on-disk name —
      // reproduces the Windows->Linux break without needing a real rename.
      const sha = repo.run(['hash-object', '-w', 'src/MixedCase.ts']).trim();
      repo.run([
        'update-index',
        '--add',
        '--cacheinfo',
        `100644,${sha},src/mixedcase.ts`,
      ]);
      const result = runCheck(repo.dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('src/mixedcase.ts');
      expect(result.stderr).toContain('Case-sensitivity mismatch');
    } finally {
      repo.dispose();
    }
  });
});
