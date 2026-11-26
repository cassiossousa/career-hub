#!/usr/bin/env node
/**
 * Guarantees every MSW handler in `src/mocks/` corresponds to a real endpoint
 * in `contract/openapi.json`. `check-api-mocks` proves call sites have
 * handlers; this proves handlers don't drift into mocking endpoints the API
 * doesn't have (stale mocks that let the UI "work" against a fantasy API).
 *
 * OpenAPI `{param}` segments and MSW `:param`/`*` segments both normalize to
 * `:`, so `/api/jobs/{id}` matches `http.get('/api/jobs/:id')`.
 *
 * Exits 1 and lists every unmatched handler when drift is found.
 * `--app-root=<dir>` points the gate at a fixture tree (falsification specs).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRootArg = process.argv.find((arg) => arg.startsWith('--app-root='));
const APP_ROOT = appRootArg
  ? resolve(appRootArg.slice('--app-root='.length))
  : fileURLToPath(new URL('..', import.meta.url));
const MOCKS_DIR = join(APP_ROOT, 'src', 'mocks');
const CONTRACT_PATH = join(APP_ROOT, 'contract', 'openapi.json');

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const METHOD_PATTERN = METHODS.join('|');
const MOCK_RE = new RegExp(
  `http\\.(${METHOD_PATTERN})\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]`,
  'g',
);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      yield full;
    }
  }
}

// Both syntaxes reduce to ':' for parameter segments.
function segments(path) {
  return path
    .split('/')
    .filter((s) => s.length > 0)
    .map((s) =>
      s.startsWith('{') || s.startsWith(':') || s === '*' ? ':' : s,
    );
}

function contractRoutes(openapi) {
  const routes = new Set();
  for (const [path, ops] of Object.entries(openapi.paths ?? {})) {
    for (const method of Object.keys(ops)) {
      if (METHODS.includes(method.toLowerCase())) {
        routes.add(`${method.toLowerCase()} ${segments(path).join('/')}`);
      }
    }
  }
  return routes;
}

const openapi = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'));
const known = contractRoutes(openapi);

const handlers = [];
for (const file of walk(MOCKS_DIR)) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(APP_ROOT, file).replaceAll('\\', '/');
  for (const match of text.matchAll(MOCK_RE)) {
    handlers.push({
      method: match[1].toLowerCase(),
      segments: segments(match[2]),
      file: rel,
    });
  }
}

if (handlers.length === 0) {
  console.error(
    'check-mock-contract: no MSW handlers found — scanner is broken or the mocks moved.',
  );
  process.exit(1);
}

const unknown = handlers.filter(
  (h) => !known.has(`${h.method} ${h.segments.join('/')}`),
);

if (unknown.length > 0) {
  console.error(
    'check-mock-contract: MSW handlers with no matching openapi.json route:',
  );
  for (const h of unknown) {
    console.error(
      `  ${h.method.toUpperCase()} /${h.segments.join('/')}  (${h.file})`,
    );
  }
  process.exit(1);
}

console.log(
  `check-mock-contract: OK — ${handlers.length} MSW handlers all match contract/openapi.json routes.`,
);
