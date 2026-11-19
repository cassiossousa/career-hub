import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const WEB_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST_ASSETS = path.join(WEB_ROOT, 'dist', 'assets');
const BASELINE_FILE = path.join(WEB_ROOT, '.bundle-baseline.json');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

// Budgets are gzip sizes — what actually ships over the wire.
const BUDGETS = [
  { key: 'js', pattern: /\.js$/, limitBytes: 150 * 1024, label: 'JS' },
  { key: 'css', pattern: /\.css$/, limitBytes: 20 * 1024, label: 'CSS' },
];

// Bundle may shrink freely but may not grow more than this over the recorded
// baseline without an explicit `--update-baseline` commit.
const DELTA_LIMIT_BYTES = 5 * 1024;

if (!statSync(DIST_ASSETS, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('dist/assets not found — run `npm run build` first.');
  process.exit(1);
}

const files = readdirSync(DIST_ASSETS).filter((name) =>
  BUDGETS.some((budget) => budget.pattern.test(name)),
);

const totals = {};
for (const budget of BUDGETS) {
  totals[budget.key] = files
    .filter((name) => budget.pattern.test(name))
    .reduce(
      (sum, name) =>
        sum + gzipSync(readFileSync(path.join(DIST_ASSETS, name))).length,
      0,
    );
}

if (UPDATE_BASELINE) {
  writeFileSync(
    BASELINE_FILE,
    `${JSON.stringify(
      {
        jsGzipBytes: totals.js,
        cssGzipBytes: totals.css,
        recordedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Bundle baseline updated: ${BASELINE_FILE}`);
  process.exit(0);
}

let failed = false;

for (const budget of BUDGETS) {
  const totalBytes = totals[budget.key];
  const totalKb = (totalBytes / 1024).toFixed(1);
  const limitKb = (budget.limitBytes / 1024).toFixed(0);
  const matched = files.filter((name) => budget.pattern.test(name));

  if (totalBytes > budget.limitBytes) {
    failed = true;
    console.error(
      `BUDGET EXCEEDED: ${budget.label} bundle is ${totalKb} kB gzipped ` +
        `(limit ${limitKb} kB).`,
    );
    for (const name of matched) {
      const gz = gzipSync(readFileSync(path.join(DIST_ASSETS, name))).length;
      console.error(`  ${name}: ${(gz / 1024).toFixed(1)} kB gzipped`);
    }
  } else {
    console.log(
      `${budget.label} bundle: ${totalKb} kB gzipped (limit ${limitKb} kB) — OK`,
    );
  }
}

if (existsSync(BASELINE_FILE)) {
  const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
  const baselineBytes = (budget_key) => baseline[`${budget_key}GzipBytes`] ?? 0;
  for (const budget of BUDGETS) {
    const delta = totals[budget.key] - baselineBytes(budget.key);
    if (delta > DELTA_LIMIT_BYTES) {
      failed = true;
      console.error(
        `BUNDLE GREW: ${budget.label} gzip increased by ` +
          `${(delta / 1024).toFixed(1)} kB over the recorded baseline ` +
          `(limit ${DELTA_LIMIT_BYTES / 1024} kB). If intentional, run ` +
          '`npm run check:bundle -- --update-baseline` and commit ' +
          '.bundle-baseline.json.',
      );
    } else if (delta > 0) {
      console.log(
        `${budget.label} bundle grew ${(delta / 1024).toFixed(1)} kB vs baseline — within tolerance.`,
      );
    }
  }
} else {
  console.log(
    'No .bundle-baseline.json — run with --update-baseline to record one.',
  );
}

process.exit(failed ? 1 : 0);
