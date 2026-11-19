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

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const args = process.argv.slice(2);
const appDir = args.find((arg) => !arg.startsWith('--'));
const flagValue = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : Number(args[index + 1]);
};

if (!appDir) {
  console.error(
    'Usage: node scripts/audit-bundle-budget.mjs <appDir> ' +
      '[--js-limit-kb N] [--css-limit-kb N] [--update-baseline]',
  );
  process.exit(1);
}

const APP_ROOT = path.resolve(ROOT, appDir);
const DIST_ASSETS = path.join(APP_ROOT, 'dist', 'assets');
const BASELINE_FILE = path.join(APP_ROOT, '.bundle-baseline.json');
const UPDATE_BASELINE = args.includes('--update-baseline');

// Budgets are gzip sizes — what actually ships over the wire.
const BUDGETS = [
  {
    key: 'js',
    pattern: /\.js$/,
    limitBytes: flagValue('--js-limit-kb', 150) * 1024,
    label: 'JS',
  },
  {
    key: 'css',
    pattern: /\.css$/,
    limitBytes: flagValue('--css-limit-kb', 20) * 1024,
    label: 'CSS',
  },
];

// Bundle may shrink freely but may not grow more than this over the recorded
// baseline without an explicit `--update-baseline` commit.
const DELTA_LIMIT_BYTES = 5 * 1024;

if (!statSync(DIST_ASSETS, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`${appDir}: dist/assets not found — run build first.`);
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
      `BUDGET EXCEEDED: ${appDir} ${budget.label} bundle is ${totalKb} kB ` +
        `gzipped (limit ${limitKb} kB).`,
    );
    for (const name of matched) {
      const gz = gzipSync(readFileSync(path.join(DIST_ASSETS, name))).length;
      console.error(`  ${name}: ${(gz / 1024).toFixed(1)} kB gzipped`);
    }
  } else {
    console.log(
      `${appDir} ${budget.label} bundle: ${totalKb} kB gzipped ` +
        `(limit ${limitKb} kB) — OK`,
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
        `BUNDLE GREW: ${appDir} ${budget.label} gzip increased by ` +
          `${(delta / 1024).toFixed(1)} kB over the recorded baseline ` +
          `(limit ${DELTA_LIMIT_BYTES / 1024} kB). If intentional, run ` +
          `node scripts/audit-bundle-budget.mjs ${appDir} --update-baseline ` +
          'and commit .bundle-baseline.json.',
      );
    } else if (delta > 0) {
      console.log(
        `${appDir} ${budget.label} bundle grew ` +
          `${(delta / 1024).toFixed(1)} kB vs baseline — within tolerance.`,
      );
    }
  }
} else {
  console.log(
    `${appDir}: no .bundle-baseline.json — record one with ` +
      `--update-baseline.`,
  );
}

process.exit(failed ? 1 : 0);
