import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_ASSETS = path.resolve('apps/web/dist/assets');

// Budgets are gzip sizes — what actually ships over the wire.
const BUDGETS = [
  { pattern: /\.js$/, limitBytes: 150 * 1024, label: 'JS' },
  { pattern: /\.css$/, limitBytes: 20 * 1024, label: 'CSS' },
];

if (!statSync(DIST_ASSETS, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('apps/web/dist/assets not found — run `npm run build` first.');
  process.exit(1);
}

const files = readdirSync(DIST_ASSETS).filter((name) =>
  BUDGETS.some((budget) => budget.pattern.test(name)),
);

let failed = false;

for (const budget of BUDGETS) {
  const matched = files.filter((name) => budget.pattern.test(name));
  const totalBytes = matched.reduce(
    (sum, name) =>
      sum + gzipSync(readFileSync(path.join(DIST_ASSETS, name))).length,
    0,
  );
  const totalKb = (totalBytes / 1024).toFixed(1);
  const limitKb = (budget.limitBytes / 1024).toFixed(0);

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

process.exit(failed ? 1 : 0);
