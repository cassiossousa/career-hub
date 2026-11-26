#!/usr/bin/env node
/**
 * Guarantees every endpoint the job-tracker frontend calls through
 * `apiClient` has a corresponding MSW handler in `src/mocks/`.
 *
 * Scans all of `src` (excluding specs and mocks) for
 * `apiClient.<method>(<url>)` calls, normalizes the URL path
 * (`${expr}` -> `:param`, query string stripped), then requires a
 * matching `http.<method>('<path>')` registration in the mocks.
 * Path segments match when they are equal or the mock side is a
 * `:param`/`*` wildcard; a dynamic client segment therefore requires a
 * parameterized mock route, not a coincidental static one.
 *
 * Exits 1 and lists every uncovered call site when a route is missing.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// --app-root <dir> / --app-root=<dir> lets falsification specs point the gate
// at a fixture tree; production runs always scan this app's real directory.
const appRootArg =
  process.argv.find((arg) => arg.startsWith('--app-root=')) ??
  (process.argv.includes('--app-root')
    ? `--app-root=${process.argv[process.argv.indexOf('--app-root') + 1] ?? ''}`
    : undefined);
const APP_ROOT = appRootArg
  ? resolve(appRootArg.slice('--app-root='.length))
  : fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = join(APP_ROOT, 'src');
const MOCKS_DIR = join(SRC_DIR, 'mocks');

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const METHOD_PATTERN = METHODS.join('|');

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

function isExcludedSource(file) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/');
  return (
    rel.startsWith('mocks/') ||
    rel.startsWith('test/') ||
    /\.(spec|test)\.(ts|tsx)$/.test(rel)
  );
}

// Matches `apiClient.get<unknown>(` followed by a string/template literal.
const CALL_RE = new RegExp(
  `apiClient\\.(${METHOD_PATTERN})(?:<[^>]*>)?\\s*\\(\\s*` +
    '(`([^`]*)`|\'([^\']*)\'|"([^"]*)")',
  'g',
);
// Matches the call opener itself, to flag non-literal (dynamic) URLs.
const CALL_OPENER_RE = new RegExp(
  `apiClient\\.(${METHOD_PATTERN})(?:<[^>]*>)?\\s*\\(`,
  'g',
);
const MOCK_RE = new RegExp(
  `http\\.(${METHOD_PATTERN})\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]`,
  'g',
);

function stripQuery(path) {
  let depth = 0;
  for (let i = 0; i < path.length; i += 1) {
    const ch = path[i];
    if (ch === '$' && path[i + 1] === '{') {
      depth += 1;
      i += 1;
    } else if (ch === '}' && depth > 0) {
      depth -= 1;
    } else if (ch === '?' && depth === 0) {
      return path.slice(0, i);
    }
  }
  return path;
}

function normalizeClientPath(raw) {
  const path = stripQuery(raw)
    .replaceAll('${', ':')
    .replace(/:[^/]+/g, (m) =>
      m.startsWith(':') && m.length > 1 ? ':param' : m,
    );
  return path;
}

function segments(path) {
  return path.split('/').filter((s) => s.length > 0);
}

function segmentMatches(mockSeg, clientSeg) {
  if (mockSeg === clientSeg) return true;
  if (mockSeg.startsWith(':') || mockSeg === '*') return true;
  return false;
}

function routeCovered(method, clientPath, mockRoutes) {
  const clientSegs = segments(clientPath);
  return mockRoutes.some(
    (route) =>
      route.method === method &&
      route.segments.length === clientSegs.length &&
      route.segments.every((mockSeg, i) =>
        segmentMatches(mockSeg, clientSegs[i]),
      ),
  );
}

const calls = [];
const dynamicCalls = [];

for (const file of walk(SRC_DIR)) {
  if (isExcludedSource(file)) continue;
  const text = readFileSync(file, 'utf8');
  const rel = relative(APP_ROOT, file).replaceAll('\\', '/');

  for (const match of text.matchAll(CALL_RE)) {
    const method = match[1].toLowerCase();
    const raw = match[3] ?? match[4] ?? match[5] ?? '';
    const line = text.slice(0, match.index).split('\n').length;
    calls.push({ method, path: normalizeClientPath(raw), file: rel, line });
  }

  const literalSpans = [...text.matchAll(CALL_RE)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  for (const opener of text.matchAll(CALL_OPENER_RE)) {
    const after = text.slice(
      opener.index + opener[0].length,
      opener.index + opener[0].length + 40,
    );
    const isLiteral = /^[`'"]/.test(after.trimStart());
    const insideLiteral = literalSpans.some(
      ([s, e]) => opener.index >= s && opener.index < e,
    );
    if (!isLiteral && !insideLiteral) {
      const line = text.slice(0, opener.index).split('\n').length;
      dynamicCalls.push({ method: opener[1].toLowerCase(), file: rel, line });
    }
  }
}

if (calls.length === 0) {
  console.error(
    'check-api-mocks: no apiClient calls found — scanner is broken or the API layer moved.',
  );
  process.exit(1);
}

const mockRoutes = [];
for (const file of walk(MOCKS_DIR)) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(MOCK_RE)) {
    mockRoutes.push({
      method: match[1].toLowerCase(),
      segments: segments(match[2]),
    });
  }
}

const missing = calls.filter(
  (call) => !routeCovered(call.method, call.path, mockRoutes),
);

if (dynamicCalls.length > 0) {
  console.error('check-api-mocks: apiClient calls with non-literal URLs:');
  for (const call of dynamicCalls) {
    console.error(`  ${call.method.toUpperCase()} ${call.file}:${call.line}`);
  }
  process.exit(1);
}

if (missing.length > 0) {
  console.error('check-api-mocks: endpoints without MSW handlers:');
  for (const call of missing) {
    console.error(
      `  ${call.method.toUpperCase()} ${call.path}  (${call.file}:${call.line})`,
    );
  }
  process.exit(1);
}

const unique = new Set(calls.map((c) => `${c.method} ${c.path}`));
console.log(
  `check-api-mocks: OK — ${calls.length} call sites covering ${unique.size} unique routes, all mocked.`,
);
