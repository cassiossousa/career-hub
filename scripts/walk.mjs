import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.stryker-tmp',
  'playwright-report',
  'test-results',
  'generated',
]);

/** Recursively yields file paths under `dir`, skipping SKIP_DIRS. */
export function* walk(dir, include = () => true) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full, include);
    } else if (include(full)) {
      yield full;
    }
  }
}
