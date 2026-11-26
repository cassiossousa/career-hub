// Packages each app's built `dist/` into Vercel's Build Output API v3 layout so
// CI can upload `.vercel/output` as an artifact and deploy it later with
// `vercel deploy --prebuilt` (no rebuild). Deterministic: filesystem only.
// Usage: node scripts/package-vercel.mjs [app-name ...]
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { ROOT as REPO_ROOT } from './repo-root.mjs';

// --root=<dir> lets falsification specs package fixture apps; CI always uses
// the real repository root.
const rootArg = process.argv.find((arg) => arg.startsWith('--root='));
const ROOT = rootArg
  ? path.resolve(rootArg.slice('--root='.length))
  : REPO_ROOT;

const DEFAULT_APPS = ['professional-portfolio', 'job-tracker'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function rewriteToRoute(rewrite) {
  if (
    typeof rewrite?.source !== 'string' ||
    typeof rewrite?.destination !== 'string'
  ) {
    fail(`Invalid rewrite entry in vercel.json: ${JSON.stringify(rewrite)}`);
  }
  return { src: rewrite.source, dest: rewrite.destination };
}

function packageApp(app) {
  const appDir = path.join(ROOT, 'apps', app);
  const distDir = path.join(appDir, 'dist');
  const vercelJsonPath = path.join(appDir, 'vercel.json');

  if (!existsSync(vercelJsonPath)) {
    fail(`Missing ${vercelJsonPath}`);
  }
  if (!existsSync(path.join(distDir, 'index.html'))) {
    fail(
      `Missing build output for ${app}: run \`npm run build --workspace ${app}\` first`,
    );
  }

  const vercelJson = JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
  const rewrites = Array.isArray(vercelJson.rewrites)
    ? vercelJson.rewrites
    : [];
  const spaFallbacks = rewrites.filter(
    (rewrite) => rewrite?.destination === '/index.html',
  );
  const earlyRewrites = rewrites.filter(
    (rewrite) => rewrite?.destination !== '/index.html',
  );

  if (spaFallbacks.length > 1) {
    fail(`${app}: expected at most one SPA fallback rewrite to /index.html`);
  }
  for (const rewrite of rewrites) {
    if (
      typeof rewrite?.source !== 'string' ||
      typeof rewrite?.destination !== 'string'
    ) {
      fail(
        `Invalid rewrite entry in ${vercelJsonPath}: ${JSON.stringify(rewrite)}`,
      );
    }
  }

  const outputDir = path.join(appDir, '.vercel', 'output');
  const staticDir = path.join(outputDir, 'static');
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(staticDir, { recursive: true });
  for (const entry of readdirSync(distDir)) {
    cpSync(path.join(distDir, entry), path.join(staticDir, entry), {
      recursive: true,
    });
  }

  const routes = [
    ...earlyRewrites.map(rewriteToRoute),
    { handle: 'filesystem' },
    ...spaFallbacks.map(rewriteToRoute),
  ];
  writeFileSync(
    path.join(outputDir, 'config.json'),
    `${JSON.stringify({ version: 3, routes }, null, 2)}\n`,
    'utf8',
  );

  console.log(`Packaged ${app}: ${path.relative(ROOT, outputDir)}`);
}

const apps = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const targets = apps.length > 0 ? apps : DEFAULT_APPS;
for (const app of targets) {
  packageApp(app);
}
