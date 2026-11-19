import { execFileSync } from 'node:child_process';
import { runStryker } from './run-stryker.mjs';

const WEB_SRC_PREFIX = 'apps/professional-portfolio/src/';

const changedFiles = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=ACMRT', 'origin/main'],
  { encoding: 'utf8' },
)
  .split(/\r?\n/)
  .filter(
    (file) =>
      file.startsWith(WEB_SRC_PREFIX) &&
      /\.(ts|tsx)$/.test(file) &&
      !/\.(test|spec)\.(ts|tsx)$/.test(file),
  )
  // Stryker runs with apps/professional-portfolio as its working directory — strip the
  // repo-root-relative prefix git reports.
  .map((file) => file.slice('apps/professional-portfolio/'.length));

if (changedFiles.length === 0) {
  console.log('No changed TypeScript source files to mutation-test.');
  process.exit(0);
}

runStryker(changedFiles.join(','));
