/* eslint-disable security/detect-non-literal-fs-filename -- directory arguments are the scan roots supplied by callers */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

export const IMPORT_PATTERN =
  /(?:import|export)\s[^'"]*?from\s+['"][^'"]+['"]|\bimport\s*['"][^'"]+['"]/g;

export const SPECIFIER_PATTERN = /['"]([^'"]+)['"]/;

export function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) return listSourceFiles(fullPath);
    return SOURCE_EXTENSIONS.has(path.extname(entry)) ? [fullPath] : [];
  });
}

export function relativeImports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const specifiers: string[] = [];

  for (const match of source.matchAll(IMPORT_PATTERN)) {
    const specifier = match[0].match(SPECIFIER_PATTERN)?.[1];
    if (specifier) specifiers.push(specifier);
  }

  return specifiers.filter((specifier) => specifier.startsWith('.'));
}

export function resolveSpecifier(file: string, specifier: string): string {
  return path.resolve(path.dirname(file), specifier);
}

export function featureOf(
  featuresRoot: string,
  resolvedPath: string,
): string | null {
  const relative = path.relative(featuresRoot, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return relative.split(path.sep)[0] ?? null;
}

export function isInside(root: string, resolvedPath: string): boolean {
  const relative = path.relative(root, resolvedPath);
  return (
    relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
  );
}

export function findCrossFeatureImports(srcRoot: string): string[] {
  const featuresRoot = path.join(srcRoot, 'features');
  return listSourceFiles(featuresRoot).flatMap((file) => {
    const sourceFeature = path.relative(featuresRoot, file).split(path.sep)[0];
    return relativeImports(file)
      .map((specifier) => resolveSpecifier(file, specifier))
      .filter((resolved) => {
        const targetFeature = featureOf(featuresRoot, resolved);
        return targetFeature !== null && targetFeature !== sourceFeature;
      })
      .map((resolved) => `${file} -> ${resolved}`);
  });
}
