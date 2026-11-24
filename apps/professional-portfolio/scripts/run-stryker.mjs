import { fileURLToPath } from 'node:url';
import { runStryker as run } from '../../../scripts/run-stryker.mjs';

const APP_ROOT = fileURLToPath(new URL('..', import.meta.url));

export function runStryker(mutate, options = {}) {
  run(APP_ROOT, mutate, options);
}
