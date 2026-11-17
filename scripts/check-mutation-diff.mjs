import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

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

const strykerCli = resolve(
  'node_modules',
  '@stryker-mutator',
  'core',
  'bin',
  'stryker.js',
);
const result = spawnSync(
  process.execPath,
  [
    strykerCli,
    'run',
    '--mutate',
    changedFiles.join(','),
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
