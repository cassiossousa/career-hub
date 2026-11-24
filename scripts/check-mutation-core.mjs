#!/usr/bin/env node
/**
 * Mutation-tests each workspace's core on every run — the diff-based gate
 * only covers changed files, so pre-existing weak spots would never
 * surface. Core globs live in scripts/mutation-targets.mjs.
 */
import { resolveMutationWorkspace } from './mutation-targets.mjs';
import { runStryker } from './run-stryker.mjs';

const { workspaceDir, workspace, workspaceRoot, dryRun, extraArgs } =
  resolveMutationWorkspace('check-mutation-core.mjs');

if (dryRun) {
  console.log(`Mutation targets (${workspaceDir}): ${workspace.coreGlobs}`);
  process.exit(0);
}

runStryker(workspaceRoot, workspace.coreGlobs, {
  ignoreStatic: true,
  configFile: 'stryker.core.config.mjs',
  extraArgs,
});
