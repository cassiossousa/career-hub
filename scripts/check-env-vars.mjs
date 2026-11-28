import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { resolveRootArg } from './repo-root.mjs';
import { walk } from './walk.mjs';

// Every environment variable an app reads must be documented in that app's
// .env.example, and every documented variable must actually be referenced —
// undocumented vars are invisible to anyone setting up the repo, and stale
// docs rot into misinformation. Scans import.meta.env/process.env/fileEnv
// member access plus viteEnv.d.ts declarations, per app workspace.

const ROOT = resolveRootArg();
const APPS_DIR = path.join(ROOT, 'apps');

// Vite builtins and Node conventions — never documented in .env.example.
const BUILTIN_VARS = new Set([
  'DEV',
  'PROD',
  'MODE',
  'BASE_URL',
  'SSR',
  'NODE_ENV',
]);

const ENV_ACCESS =
  /\b(?:import\.meta\.env|process\.env|fileEnv)\.([A-Z][A-Z0-9_]*)/g;
const ENV_ASSIGNMENT = /\bprocess\.env\.([A-Z][A-Z0-9_]*)\s*=(?!=)/g;
const VITE_DECLARATION = /\breadonly\s+(VITE_[A-Z0-9_]+)\??:/g;
const ENV_EXAMPLE_KEY = /^\s*#?\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/;

function referencedVars(appDir) {
  const found = new Set();
  // Vars vite.config assigns itself (e.g. PORTFOLIO_ROOT for its plugins)
  // are plumbing, not configuration — never documented. Only the config
  // file counts: spec files legitimately assign process.env in test setup.
  const assigned = new Set();
  const configFile = path.join(appDir, 'vite.config.ts');
  if (statSync(configFile, { throwIfNoEntry: false })?.isFile()) {
    for (const match of readFileSync(configFile, 'utf8').matchAll(
      ENV_ASSIGNMENT,
    )) {
      const name = match[1];
      if (name !== undefined) assigned.add(name);
    }
  }
  const candidates = [configFile, ...walk(path.join(appDir, 'src'))];
  for (const file of candidates) {
    // Specs are test scaffolding, not shipped config surface — they may read
    // env vars (.env fixtures, process.env setup) that need no documentation.
    if (
      /\.(spec|test)\.[tj]sx?$/.test(file) ||
      !/\.(ts|tsx|mts|cts)$/.test(file) ||
      !statSync(file, { throwIfNoEntry: false })?.isFile()
    )
      continue;
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(ENV_ACCESS)) {
      const name = match[1];
      if (name !== undefined && !BUILTIN_VARS.has(name)) found.add(name);
    }
    for (const match of text.matchAll(VITE_DECLARATION)) {
      const name = match[1];
      if (name !== undefined) found.add(name);
    }
  }
  for (const name of assigned) found.delete(name);
  return found;
}

function documentedVars(examplePath) {
  const found = new Set();
  for (const line of readFileSync(examplePath, 'utf8').split('\n')) {
    const match = ENV_EXAMPLE_KEY.exec(line);
    const key = match?.[1];
    if (key !== undefined) found.add(key);
  }
  return found;
}

function checkApp(appName) {
  const appDir = path.join(APPS_DIR, appName);
  const examplePath = path.join(appDir, '.env.example');
  const referenced = referencedVars(appDir);
  const documented = documentedVars(examplePath);

  const undocumented = [...referenced]
    .filter((name) => !documented.has(name))
    .toSorted();
  const stale = [...documented]
    .filter((name) => !referenced.has(name))
    .toSorted();

  if (undocumented.length === 0 && stale.length === 0) {
    console.log(`Env check OK: ${appName}`);
    return true;
  }

  for (const name of undocumented) {
    console.error(
      `${appName}: ${name} is read by code but missing from .env.example`,
    );
  }
  for (const name of stale) {
    console.error(
      `${appName}: ${name} is documented in .env.example but never referenced`,
    );
  }
  return false;
}

const apps = readdirSync(APPS_DIR).filter((entry) =>
  statSync(path.join(APPS_DIR, entry)).isDirectory(),
);

let ok = true;
for (const app of apps.toSorted()) {
  ok = checkApp(app) && ok;
}

if (!ok) {
  console.error('Env var documentation check failed.');
  process.exit(1);
}
