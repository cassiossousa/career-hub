import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dev accelerator, NOT a gate: runs only the Jest specs related to the
// working-tree changes via --findRelatedTests, instead of the full suite.
// verify:all/verify:push still run everything — never wire this into them.
// Deterministic: git + jest module graph only, sorted output, arg-array
// spawn (no shell), explicit exit codes.

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Above this many changed files per workspace the change is broad enough
// that related-tests selection saves little — run that workspace's whole
// Jest suite instead of risking Windows command-line length limits.
export const FULL_SUITE_FILE_THRESHOLD = 100;

// Prefix → Jest config. Anything outside these prefixes has no Jest specs.
const JEST_WORKSPACES = [
  {
    prefix: 'apps/professional-portfolio/',
    config: 'apps/professional-portfolio/jest.config.cjs',
  },
  { prefix: 'apps/job-tracker/', config: 'apps/job-tracker/jest.config.cjs' },
  { prefix: 'packages/ui/', config: 'packages/ui/jest.config.cjs' },
];

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function changedFiles() {
  const files = new Set();

  // Staged + unstaged tracked changes (deletions are dropped by the
  // existsSync filter below) plus untracked files.
  for (const line of git(['diff', '--name-only', 'HEAD']).split('\n')) {
    if (line.trim()) files.add(line.trim());
  }
  for (const line of git(['ls-files', '--others', '--exclude-standard']).split(
    '\n',
  )) {
    if (line.trim()) files.add(line.trim());
  }

  const baseIndex = process.argv.indexOf('--base');
  if (baseIndex !== -1) {
    const ref = process.argv[baseIndex + 1];
    if (!ref) {
      console.error('test-changed: --base requires a git ref');
      process.exit(2);
    }
    for (const line of git(['diff', '--name-only', `${ref}...HEAD`]).split(
      '\n',
    )) {
      if (line.trim()) files.add(line.trim());
    }
  }

  return [...files]
    .map((f) => f.replaceAll('\\', '/'))
    .filter(
      (f) => f && existsSync(join(ROOT, f)) && statSync(join(ROOT, f)).isFile(),
    )
    .toSorted();
}

// Bucket repo-relative changed paths into per-workspace Jest runs. Pure —
// exported for scripts/test-changed.spec.mjs.
export function planRuns(files) {
  const byWorkspace = new Map();
  const unowned = [];
  for (const file of files) {
    const ws = JEST_WORKSPACES.find((w) => file.startsWith(w.prefix));
    if (!ws) {
      unowned.push(file);
      continue;
    }
    if (!byWorkspace.has(ws.config)) byWorkspace.set(ws.config, []);
    byWorkspace.get(ws.config).push(join(ROOT, file));
  }
  const runs = [...byWorkspace.entries()]
    .toSorted()
    .map(([config, targets]) => ({
      config,
      targets,
      fullSuite: targets.length > FULL_SUITE_FILE_THRESHOLD,
    }));
  return { runs, unowned };
}

function findJestBin() {
  let dir = ROOT;
  for (;;) {
    const candidate = join(dir, 'node_modules', 'jest', 'bin', 'jest.js');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('jest bin not found — run npm install first');
    }
    dir = parent;
  }
}

function main() {
  const files = changedFiles();
  if (files.length === 0) {
    console.log('test-changed: no changed files — nothing to run.');
    return 0;
  }

  const { runs, unowned } = planRuns(files);
  if (unowned.length > 0) {
    console.log(
      `test-changed: ${unowned.length} changed file(s) outside Jest workspaces ignored.`,
    );
  }
  if (runs.length === 0) {
    console.log('test-changed: no changed files belong to a Jest workspace.');
    return 0;
  }

  const jestBin = findJestBin();
  let failed = false;

  for (const { config, targets, fullSuite } of runs) {
    const args = [jestBin, '--config', join(ROOT, config)];
    if (fullSuite) {
      console.log(
        `test-changed: ${targets.length} files changed in ${config} — running its full Jest suite.`,
      );
    } else {
      args.push('--findRelatedTests', ...targets);
      console.log(
        `test-changed: ${config} — ${targets.length} changed file(s), running related specs.`,
      );
    }

    const result = spawnSync(process.execPath, args, {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) failed = true;
  }

  return failed ? 1 : 0;
}

const invokedAsScript =
  process.argv[1] &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (invokedAsScript) {
  process.exitCode = main();
}
