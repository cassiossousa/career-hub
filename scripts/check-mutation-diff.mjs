#!/usr/bin/env node
/**
 * Mutation-tests the sources a workspace changed vs origin/main. The diff
 * gate only covers changed files — run via `check:mutate:diff`.
 *
 * `git diff` runs in the current working directory, so invoke from inside
 * the repo (or a fixture repo, for tests). `--dry-run` prints the resolved
 * mutate targets and exits without spawning Stryker.
 */
import { execFileSync } from 'node:child_process';
import { resolveMutationWorkspace } from './mutation-targets.mjs';
import { runStryker } from './run-stryker.mjs';

const { workspaceDir, workspace, workspaceRoot, dryRun, extraArgs } =
  resolveMutationWorkspace('check-mutation-diff.mjs');

const changedFiles = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=ACMRT', 'origin/main'],
  { encoding: 'utf8' },
)
  .split(/\r?\n/)
  .filter(
    (file) =>
      workspace.srcPrefixes.some((prefix) => file.startsWith(prefix)) &&
      /\.(ts|tsx)$/.test(file) &&
      !file.endsWith('.d.ts') &&
      !/\.(test|spec)\.(ts|tsx)$/.test(file),
  )
  // Stryker runs with the workspace dir as its working directory — strip
  // the repo-root-relative prefix git reports down to that dir.
  .map((file) => file.slice(`${workspaceDir}/`.length));

if (changedFiles.length === 0) {
  console.log(
    `No changed TypeScript source files to mutation-test (${workspaceDir}).`,
  );
  process.exit(0);
}

if (dryRun) {
  console.log(`Mutation targets (${workspaceDir}): ${changedFiles.join(',')}`);
  process.exit(0);
}

runStryker(workspaceRoot, changedFiles.join(','), { extraArgs });
