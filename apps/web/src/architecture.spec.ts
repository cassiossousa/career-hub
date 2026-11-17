import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const SRC_ROOT = __dirname;
const FEATURES_ROOT = path.join(SRC_ROOT, 'features');
const COMPONENTS_ROOT = path.join(SRC_ROOT, 'components');
const SERVICES_ROOT = path.join(SRC_ROOT, 'services');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const IMPORT_PATTERN =
  /(?:import|export)\s[^'"]*?\sfrom\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) return listSourceFiles(fullPath);
    return SOURCE_EXTENSIONS.has(path.extname(entry)) ? [fullPath] : [];
  });
}

function relativeImports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(IMPORT_PATTERN)]
    .map((match) => match[1] ?? match[2])
    .filter((specifier): specifier is string => specifier !== undefined)
    .filter((specifier) => specifier.startsWith('.'));
}

function resolveSpecifier(file: string, specifier: string): string {
  return path.resolve(path.dirname(file), specifier);
}

function featureOf(resolvedPath: string): string | null {
  const relative = path.relative(FEATURES_ROOT, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return relative.split(path.sep)[0] ?? null;
}

function isInside(root: string, resolvedPath: string): boolean {
  const relative = path.relative(root, resolvedPath);
  return (
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
  );
}

describe('architecture boundaries', () => {
  it('features never import internals from sibling features', () => {
    const violations = listSourceFiles(FEATURES_ROOT).flatMap((file) => {
      const sourceFeature = path
        .relative(FEATURES_ROOT, file)
        .split(path.sep)[0];
      return relativeImports(file)
        .map((specifier) => resolveSpecifier(file, specifier))
        .filter((resolved) => {
          const targetFeature = featureOf(resolved);
          return targetFeature !== null && targetFeature !== sourceFeature;
        })
        .map((resolved) => `${file} -> ${resolved}`);
    });

    expect(violations).toEqual([]);
  });

  it('shared components never import features or services', () => {
    const violations = listSourceFiles(COMPONENTS_ROOT).flatMap((file) =>
      relativeImports(file)
        .map((specifier) => resolveSpecifier(file, specifier))
        .filter(
          (resolved) =>
            featureOf(resolved) !== null || isInside(SERVICES_ROOT, resolved),
        )
        .map((resolved) => `${file} -> ${resolved}`),
    );

    expect(violations).toEqual([]);
  });
});
