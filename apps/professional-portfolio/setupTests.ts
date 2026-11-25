import '@testing-library/jest-dom';
import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

// content.ts resolves committed MDX from PORTFOLIO_ROOT (repo root). Jest's
// cwd is the app dir — and under Stryker a sandbox dir nested inside it —
// so walk up to the package.json that declares workspaces rather than
// counting ../.. levels.
function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    const manifest = path.join(dir, 'package.json');
    if (fs.existsSync(manifest)) {
      const parsed: unknown = JSON.parse(fs.readFileSync(manifest, 'utf8'));
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

process.env.PORTFOLIO_ROOT ??= findRepoRoot(__dirname);
