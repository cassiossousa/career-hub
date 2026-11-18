import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

export function runStryker(mutate, { ignoreStatic = false, configFile } = {}) {
  const strykerCli = resolve(
    'node_modules',
    '@stryker-mutator',
    'core',
    'bin',
    'stryker.js',
  );

  const args = [strykerCli, 'run'];
  if (configFile) args.push(configFile);
  args.push('--mutate', mutate);
  if (ignoreStatic) args.push('--ignoreStatic');
  args.push(...process.argv.slice(2));

  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
}
