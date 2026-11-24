import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

function findStrykerCli(dir) {
  const candidate = join(
    dir,
    'node_modules',
    '@stryker-mutator',
    'core',
    'bin',
    'stryker.js',
  );
  if (existsSync(candidate)) return candidate;

  const parent = dirname(dir);
  if (parent === dir) {
    throw new Error(`@stryker-mutator/core bin not found from ${REPO_ROOT}`);
  }
  return findStrykerCli(parent);
}

export function runStryker(
  appRoot,
  mutate,
  { ignoreStatic = false, configFile, extraArgs = process.argv.slice(2) } = {},
) {
  const args = [findStrykerCli(REPO_ROOT), 'run'];
  if (configFile) args.push(configFile);
  args.push('--mutate', mutate);
  if (ignoreStatic) args.push('--ignoreStatic');
  args.push(...extraArgs);

  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: appRoot,
  });

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
}
