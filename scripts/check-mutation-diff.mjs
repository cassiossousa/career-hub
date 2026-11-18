import { execFileSync } from 'node:child_process';
import { runStryker } from './run-stryker.mjs';

const changedFiles = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=ACMRT', 'origin/main'],
  { encoding: 'utf8' },
)
  .split(/\r?\n/)
  .filter(
    (file) =>
      file.startsWith('apps/web/src/') &&
      /\.(ts|tsx)$/.test(file) &&
      !/\.(test|spec)\.(ts|tsx)$/.test(file),
  );

if (changedFiles.length === 0) {
  console.log('No changed TypeScript source files to mutation-test.');
  process.exit(0);
}

runStryker(changedFiles.join(','));
