import { execFileSync } from 'node:child_process';

// Fails when a PR changes render-affecting source without updating the
// committed linux visual baselines. Baselines are generated in the Playwright
// Docker image — see AGENTS.md §3 for the update ritual.

const VISUAL_SOURCES = [
  /^apps\/web\/src\/.*\.tsx$/,
  /^apps\/web\/src\/app\/theme\.ts$/,
  /^apps\/web\/src\/i18n\//,
  /^apps\/web\/e2e\/visual\.spec\.ts$/,
  /^apps\/web\/playwright\.config\.ts$/,
];
const SNAPSHOT_DIR = 'apps/web/e2e/visual.spec.ts-snapshots/';
const isSpec = /\.(spec|test)\.tsx?$/;

function changedFiles() {
  try {
    return execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=ACMRT', 'origin/main...HEAD'],
      { encoding: 'utf8' },
    )
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    console.log(
      'No merge-base with origin/main — skipping baseline drift check.',
    );
    process.exit(0);
  }
}

const files = changedFiles();
const visualChanges = files.filter((file) => {
  if (!VISUAL_SOURCES.some((pattern) => pattern.test(file))) return false;
  // Spec files under src/ are tests, not render output; e2e/config files count.
  return file.startsWith('apps/web/src/') ? !isSpec.test(file) : true;
});
const snapshotChanges = files.filter((file) => file.startsWith(SNAPSHOT_DIR));

if (visualChanges.length === 0) {
  console.log('No visual-affecting changes — baseline drift check skipped.');
  process.exit(0);
}

if (snapshotChanges.length > 0) {
  console.log(
    `Visual changes detected with ${snapshotChanges.length} updated baseline(s) — OK.`,
  );
  process.exit(0);
}

console.error(
  'Visual-affecting files changed without updating screenshot baselines:\n' +
    visualChanges.map((file) => `  ${file}`).join('\n') +
    '\n\nRegenerate baselines in the Playwright Docker image and commit them ' +
    'in this PR (see AGENTS.md §3).',
);
process.exit(1);
