import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Closed string vocabularies (enums) must have exactly ONE canonical
// declaration: an `as const` array in the domain types module. Union types,
// zod schemas, option lists, and i18n maps derive from it. jscpd cannot see
// this defect class — the same values re-declared in different syntactic
// forms are not textual clones. This check parses the TypeScript AST and
// fails when one normalized literal set is declared in more than one place
// within a workspace.
//
// Declaration forms detected:
//   union — `type X = 'a' | 'b'` or inline `kind: 'a' | 'b'` property types
//   array — `const X = ['a', 'b']` (as const / annotated / plain)
//   zod   — `z.enum(['a', 'b'])` literal lists (z.enum(IDENT) is derived)
//
// Clustering is per workspace (apps/<name>, packages/<name>) so legitimately
// separate vocabularies in different packages do not collide.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_ROOTS = ['apps', 'packages/ui'];
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.stryker-tmp',
  'playwright-report',
  'test-results',
  // Auto-generated artifacts (e.g. openapi-typescript output) are themselves
  // single-sourced from their upstream spec — not hand-maintained vocab.
  'generated',
]);
const EXCLUDED_KEYMAP_PATH = /[/\\]locales[/\\]/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
      yield full;
    }
  }
}

function lineOf(sourceFile, node) {
  return ts.getLineAndCharacterOfPosition(sourceFile, node.getStart()).line + 1;
}

function stringLiteralText(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
}

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function unionLiteralSet(typeNode) {
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const values = [];
  for (const member of typeNode.types) {
    if (
      !ts.isLiteralTypeNode(member) ||
      member.literal.kind !== ts.SyntaxKind.StringLiteral
    ) {
      return null;
    }
    values.push(member.literal.text);
  }
  return values.length >= 2 ? values : null;
}

function arrayLiteralSet(initializer) {
  const expr = initializer && unwrapExpression(initializer);
  if (!expr || !ts.isArrayLiteralExpression(expr)) return null;
  const values = [];
  for (const element of expr.elements) {
    const text = stringLiteralText(element);
    if (text === null) return null;
    values.push(text);
  }
  return values.length >= 2 ? values : null;
}

function zodEnumSet(callExpr) {
  const callee = callExpr.expression;
  if (
    !ts.isPropertyAccessExpression(callee) ||
    callee.name.text !== 'enum' ||
    callee.expression.getText() !== 'z'
  ) {
    return null;
  }
  const arg = callExpr.arguments[0];
  if (!arg) return null;
  const expr = unwrapExpression(arg);
  if (!expr || !ts.isArrayLiteralExpression(expr)) return null;
  const values = [];
  for (const element of expr.elements) {
    const text = stringLiteralText(element);
    if (text === null) return null;
    values.push(text);
  }
  return values.length >= 2 ? values : null;
}

function collectDeclarations(sourceFile, relPath) {
  const sites = [];
  const visit = (node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      const values = unionLiteralSet(node.type);
      if (values) {
        sites.push({
          form: 'union',
          name: node.name.text,
          line: lineOf(sourceFile, node),
          values,
          relPath,
        });
      }
    }
    if (
      (ts.isPropertySignature(node) || ts.isPropertyAssignment(node)) &&
      node.type &&
      ts.isUnionTypeNode(node.type)
    ) {
      const values = unionLiteralSet(node.type);
      if (values) {
        sites.push({
          form: 'union',
          name: node.name.getText(sourceFile),
          line: lineOf(sourceFile, node),
          values,
          relPath,
        });
      }
    }
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const values = arrayLiteralSet(node.initializer);
      if (values && ts.isIdentifier(node.name)) {
        sites.push({
          form: 'array',
          name: node.name.text,
          line: lineOf(sourceFile, node),
          values,
          relPath,
        });
      }
    }
    if (ts.isCallExpression(node)) {
      const values = zodEnumSet(node);
      if (values) {
        sites.push({
          form: 'zod',
          name: 'z.enum',
          line: lineOf(sourceFile, node),
          values,
          relPath,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return sites;
}

function normalizeLiteral(value) {
  return value.toLowerCase().replace(/[-_\s]/g, '');
}

function clusterKey(values) {
  return [...new Set(values.map(normalizeLiteral))].toSorted().join('|');
}

function keyMapKeySets(sourceFile) {
  const sets = [];
  const visit = (node) => {
    let members = null;
    if (ts.isTypeLiteralNode(node)) {
      members = node.members.filter(ts.isPropertySignature);
    } else if (ts.isObjectLiteralExpression(node)) {
      members = node.properties.filter(
        (p) =>
          ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p),
      );
    }
    if (members && members.length >= 3) {
      const keys = members
        .map((m) => {
          const name = m.name;
          if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
            return name.text;
          }
          return null;
        })
        .filter((k) => k !== null);
      if (keys.length === members.length) {
        sets.push({ key: clusterKey(keys), line: lineOf(sourceFile, node) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return sets;
}

function workspaceOf(relPath) {
  const parts = relPath.split(path.sep);
  if (parts[0] === 'apps' || parts[0] === 'packages') {
    return `${parts[0]}/${parts[1]}`;
  }
  return '(root)';
}

const allSites = [];
const allKeyMaps = [];

for (const scanRoot of SCAN_ROOTS) {
  const absRoot = path.join(ROOT, scanRoot);
  for (const file of walk(absRoot)) {
    const relPath = path.relative(ROOT, file);
    const text = readFileSync(file, 'utf8');
    const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(
      relPath,
      text,
      ts.ScriptTarget.Latest,
      true,
      kind,
    );
    allSites.push(...collectDeclarations(sourceFile, relPath));
    if (!EXCLUDED_KEYMAP_PATH.test(relPath)) {
      allKeyMaps.push({
        relPath,
        sets: keyMapKeySets(sourceFile),
      });
    }
  }
}

const clusters = new Map();
for (const site of allSites) {
  const ws = workspaceOf(site.relPath);
  const key = `${ws}${clusterKey(site.values)}`;
  if (!clusters.has(key)) {
    clusters.set(key, { ws, values: site.values, sites: [] });
  }
  clusters.get(key).sites.push(site);
}

const violations = [...clusters.values()].filter((c) => c.sites.length > 1);
const warns = [];
if (violations.length > 0) {
  for (const cluster of violations) {
    const display = [...new Set(cluster.values)].toSorted().join(', ');
    console.log(
      `\nVocabulary declared ${cluster.sites.length}x (${cluster.ws}): ${display}`,
    );
    for (const site of cluster.sites) {
      console.log(
        `  ${site.relPath}:${site.line}  [${site.form}] ${site.name}`,
      );
    }
  }
}

// WARN tier: key-map literals that mirror a known vocabulary (e.g. an i18n
// type block re-listing enum keys). Non-fatal but printed for visibility.
const clusterKeysByWs = new Map();
for (const cluster of clusters.values()) {
  if (!clusterKeysByWs.has(cluster.ws))
    clusterKeysByWs.set(cluster.ws, new Set());
  clusterKeysByWs.get(cluster.ws).add(clusterKey(cluster.values));
}
// WARN tier targets only the Translation interface files — component-level
// Record<Enum, …> label maps are the sanctioned derived pattern, not noise.
const KEYMAP_WATCH = /[/\\]types[/\\]i18n\.tsx?$/;
for (const { relPath, sets } of allKeyMaps) {
  if (!KEYMAP_WATCH.test(relPath)) continue;
  const ws = workspaceOf(relPath);
  const known = clusterKeysByWs.get(ws);
  if (!known) continue;
  for (const set of sets) {
    if (known.has(set.key)) {
      warns.push(`${relPath}:${set.line}`);
    }
  }
}

if (warns.length > 0) {
  console.log(
    '\nWARN: key-maps mirroring a declared vocabulary (prefer Record<Enum, string>):',
  );
  for (const w of warns) console.log(`  ${w}`);
}

if (violations.length > 0) {
  console.error(
    `\n${violations.length} vocabulary cluster(s) declared more than once. ` +
      'Keep ONE `as const` array in the domain types module and derive ' +
      'types (typeof X[number]), zod (z.enum(X)), and i18n maps (Record<X, string>) from it.',
  );
  process.exit(1);
}

console.log(
  `Vocab check OK (${allSites.length} declarations, ${clusters.size} vocabularies).`,
);
