import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const REPO_ROOT = path.resolve(__dirname, '../../../..');
export const JOB_TRACKER_ROOT = path.join(REPO_ROOT, 'apps', 'job-tracker');

export function repoScript(...segments: string[]): string {
  return path.join(REPO_ROOT, 'scripts', ...segments);
}

export function appScript(...segments: string[]): string {
  return path.join(JOB_TRACKER_ROOT, 'scripts', ...segments);
}

/** Runs a node gate script and returns the spawn result. */
export function runNodeScript(script: string, args: string[] = []) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
  });
}

/**
 * Registers beforeEach/afterEach hooks that hand each test a fresh temp
 * dir and remove it afterwards. Returns an accessor for the current dir —
 * call it inside tests/fixtures, never at module scope.
 */
export function tempFixtureDir(prefix: string): () => string {
  let root = '';
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), prefix));
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return () => root;
}

/** Joins source lines into a fixture file body (trailing newline). */
export function tsSource(...lines: string[]): string {
  return [...lines, ''].join('\n');
}

/** Builds an MSW handlers module exporting the given route handlers. */
export function mswHandlers(...routes: string[]): string {
  return tsSource(
    "import { http } from 'msw';",
    `export const handlers = [${routes.join(', ')}];`,
  );
}
