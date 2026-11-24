/* eslint-disable security/detect-non-literal-fs-filename -- path segments are joined from __dirname only */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Walks up from `start` to the monorepo root — identified by the
 * package.json that declares `workspaces`. Unlike a fixed `../..` count,
 * this still resolves correctly inside a Stryker sandbox, which nests the
 * app copy under `apps/<app>/.stryker-tmp/sandbox-*` inside the real repo.
 */
export function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    const manifest = path.join(dir, 'package.json');
    if (existsSync(manifest)) {
      const parsed: unknown = JSON.parse(readFileSync(manifest, 'utf8'));
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'workspaces' in parsed
      ) {
        return dir;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(`repo root not found from ${start}`);
    }
    dir = parent;
  }
}
