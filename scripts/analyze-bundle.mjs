import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROOT } from './repo-root.mjs';

const appDir = process.argv[2];

if (!appDir) {
  console.error(
    'Usage: node scripts/analyze-bundle.mjs <appDir> ' +
      '(e.g. apps/job-tracker, apps/professional-portfolio)',
  );
  process.exit(1);
}

const APP_ROOT = path.resolve(ROOT, appDir);
const DIST_ASSETS = path.join(APP_ROOT, 'dist', 'assets');
const OUT_DIR = path.join(APP_ROOT, '.bundle-analysis');

if (!existsSync(APP_ROOT) || !existsSync(path.join(APP_ROOT, 'package.json'))) {
  console.error(`${appDir}: not an app workspace.`);
  process.exit(1);
}

// On-demand visualizer: rebuilds with sourcemaps, then renders an
// interactive treemap per JS asset. Not a gate — output is for humans.
// .cmd shims must be invoked directly on Windows — shell:true with an args
// array is deprecated (DEP0190) and concatenates unescaped.
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

console.log(`[analyze-bundle] building ${appDir} with sourcemaps...`);
execFileSync(NPM, ['run', 'build', '--', '--sourcemap'], {
  cwd: APP_ROOT,
  stdio: 'inherit',
});

if (!statSync(DIST_ASSETS, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`${appDir}: dist/assets not found after build.`);
  process.exit(1);
}

const bundles = readdirSync(DIST_ASSETS)
  .filter((name) => name.endsWith('.js'))
  .map((name) => path.join(DIST_ASSETS, name));

if (bundles.length === 0) {
  console.error(`${appDir}: no JS assets in dist/assets.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const htmlReport = path.join(OUT_DIR, 'report.html');
const jsonReport = path.join(OUT_DIR, 'report.json');

console.log(
  `[analyze-bundle] rendering treemap for ${bundles.length} asset(s)...`,
);
// --html and --json are mutually exclusive — run explorer twice.
for (const [flag, outFile] of [
  ['--html', htmlReport],
  ['--json', jsonReport],
]) {
  execFileSync(
    NPX,
    ['source-map-explorer', ...bundles, flag, outFile, '--no-border-checks'],
    { cwd: ROOT, stdio: 'inherit' },
  );
}

// Console digest: gzip size per emitted asset.
console.log('\n[analyze-bundle] gzip sizes:');
for (const bundle of bundles) {
  const gzipBytes = gzipSync(readFileSync(bundle)).length;
  console.log(
    `  ${(gzipBytes / 1024).toFixed(1).padStart(8)} kB  ${path.basename(bundle)}`,
  );
}
console.log(`\n[analyze-bundle] HTML report: ${htmlReport}`);
console.log(`[analyze-bundle] JSON data:   ${jsonReport}`);
