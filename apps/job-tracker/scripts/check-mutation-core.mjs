import { runStryker } from './run-stryker.mjs';

// Mutation-tests the pure-logic core on every run — the diff-based gate only
// covers changed files, so pre-existing weak spots would never surface.

const CORE_GLOBS = [
  'src/services/**',
  'src/types/**',
  'src/store/**',
  'src/i18n/dictionaries.ts',
  'src/i18n/interpolate.ts',
  'src/app/storage.ts',
  'src/app/routePaths.ts',
  '!src/**/*.spec.ts',
  '!src/**/*.test.ts',
].join(',');

runStryker(CORE_GLOBS, {
  ignoreStatic: true,
  configFile: 'stryker.core.config.mjs',
});
