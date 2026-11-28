import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// Optional `--root <dir>` (or another flag) override exists so falsification
// specs can point gates at fixture trees; production runs always use ROOT.
export function resolveRootArg(flag = '--root') {
  const index = process.argv.indexOf(flag);
  return index === -1 ? ROOT : path.resolve(process.argv[index + 1] ?? '.');
}
