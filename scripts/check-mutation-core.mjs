import { runStryker } from './run-stryker.mjs';

// Mutation-tests the pure-logic core on every run — the diff-based gate only
// covers changed files, so pre-existing weak spots would never surface.

const CORE_GLOBS = [
  'apps/web/src/services/**',
  'apps/web/src/types/**',
  'apps/web/src/i18n/dictionaries.ts',
  'apps/web/src/app/storage.ts',
  'apps/web/src/app/routePaths.ts',
  '!apps/web/src/**/*.spec.ts',
  '!apps/web/src/**/*.test.ts',
].join(',');

runStryker(CORE_GLOBS, {
  ignoreStatic: true,
  configFile: 'stryker.core.config.mjs',
});
