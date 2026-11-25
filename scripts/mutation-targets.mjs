/**
 * Single registry of mutation-gated workspaces: which source prefix the
 * diff gate watches and which globs the core gate mutates. A workspace only
 * belongs here once it has a stryker.config.mjs and Jest specs covering the
 * scoped surface — mutating untested code produces a permanently red gate.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MUTATION_WORKSPACES = {
  'apps/job-tracker': {
    // Repo-root-relative prefix `git diff --name-only` must match.
    srcPrefix: 'apps/job-tracker/src/',
    coreGlobs: [
      'src/services/**',
      'src/types/**',
      'src/store/**',
      'src/i18n/dictionaries.ts',
      'src/i18n/interpolate.ts',
      'src/app/storage.ts',
      'src/app/routePaths.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.spec.tsx',
      '!src/**/*.test.ts',
      '!src/**/*.test.tsx',
    ].join(','),
  },
  'apps/professional-portfolio': {
    srcPrefix: 'apps/professional-portfolio/src/',
    coreGlobs: [
      'src/services/**',
      'src/types/**',
      'src/i18n/dictionaries.ts',
      'src/app/storage.ts',
      'src/app/routePaths.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.spec.tsx',
      '!src/**/*.test.ts',
      '!src/**/*.test.tsx',
    ].join(','),
  },
  'packages/ui': {
    // packages/ui has no src/ dir — its mutation surface is components/,
    // the only directory with Jest specs. theme/, pdf/, i18n/, testkit/
    // are untested and stay out until specs exist.
    srcPrefix: 'packages/ui/components/',
    coreGlobs: [
      'components/**',
      '!components/**/*.spec.ts',
      '!components/**/*.spec.tsx',
      '!components/**/*.test.ts',
      '!components/**/*.test.tsx',
      '!**/*.d.ts',
    ].join(','),
  },
};

/**
 * Parses `<workspaceDir> [--dry-run]` for a check-mutation-*.mjs script.
 * Exits 1 with usage on missing/unknown workspace. Returns the registry
 * entry plus the resolved workspace root for runStryker's cwd.
 */
export function resolveMutationWorkspace(scriptName, argv = process.argv) {
  const workspaceDir = argv[2];
  const workspace = MUTATION_WORKSPACES[workspaceDir];

  if (!workspaceDir || workspaceDir.startsWith('--') || !workspace) {
    console.error(
      `Usage: node scripts/${scriptName} <workspaceDir> [--dry-run]\n` +
        `Known workspaces: ${Object.keys(MUTATION_WORKSPACES).join(', ')}`,
    );
    process.exit(1);
  }

  const workspaceRoot = path.join(ROOT, workspaceDir);
  if (!existsSync(workspaceRoot)) {
    console.error(`Unknown workspace dir: ${workspaceDir}`);
    process.exit(1);
  }

  return {
    workspaceDir,
    workspace,
    workspaceRoot,
    dryRun: argv.includes('--dry-run'),
    // Args after <workspaceDir>, minus our own flags — forwarded to Stryker.
    extraArgs: argv.slice(3).filter((arg) => arg !== '--dry-run'),
  };
}
