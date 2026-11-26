import type {
  FactCategory,
  FactSensitivity,
  ProfileFact,
  ProfileFactUpsert,
} from './types/facts';

/** Mirrors the backend fact-key rule: lowercase slug, <= 64 chars. */
const FACT_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
export const FACT_KEY_MAX_LENGTH = 64;
export const FACT_VALUE_MAX_LENGTH = 2000;

/** Editable row in the facts table; `isNew` marks not-yet-persisted rows. */
export interface FactRowDraft {
  key: string;
  category: FactCategory;
  value: string;
  sensitivity: FactSensitivity;
  isNew: boolean;
}

export function normalizeFactKey(key: string): string {
  return key.trim().toLowerCase();
}

export function isValidFactKey(key: string): boolean {
  return key.length <= FACT_KEY_MAX_LENGTH && FACT_KEY_PATTERN.test(key);
}

export function toFactRowDrafts(facts: readonly ProfileFact[]): FactRowDraft[] {
  return facts.map((fact) => ({
    key: fact.key,
    category: fact.category,
    value: fact.value,
    sensitivity: fact.sensitivity,
    isNew: false,
  }));
}

export interface FactChanges {
  upserts: { key: string; fact: ProfileFactUpsert }[];
  deletes: string[];
}

function rowChanged(
  row: FactRowDraft,
  existing: ProfileFact | undefined,
): boolean {
  if (existing === undefined) return true;
  return (
    existing.category !== row.category ||
    existing.value !== row.value.trim() ||
    existing.sensitivity !== row.sensitivity
  );
}

/**
 * Diffs draft rows against the server facts. Rows are matched by key — the
 * backend upserts on key, so a renamed key naturally becomes delete + create.
 * Rows with a blank key and blank value are ignored (untouched add-row slots);
 * any other incomplete row is reported via `findFactRowError` before saving.
 */
export function diffFactRows(
  original: readonly ProfileFact[],
  rows: readonly FactRowDraft[],
): FactChanges {
  const originalByKey = new Map(original.map((fact) => [fact.key, fact]));
  const seenKeys = new Set<string>();
  const upserts: FactChanges['upserts'] = [];

  for (const row of rows) {
    const key = normalizeFactKey(row.key);
    const value = row.value.trim();
    if (key === '' && value === '') continue;
    if (key === '') continue;
    seenKeys.add(key);
    if (!rowChanged({ ...row, key }, originalByKey.get(key))) continue;
    upserts.push({
      key,
      fact: {
        category: row.category,
        value,
        sensitivity: row.sensitivity,
      },
    });
  }

  const deletes = original
    .filter((fact) => !seenKeys.has(fact.key))
    .map((fact) => fact.key);
  return { upserts, deletes };
}

// prettier-ignore
// biome-ignore format: prettier and biome disagree on broken-union style
export type FactRowError =
  | 'keyRequired'
  | 'invalidKey'
  | 'duplicateKey'
  | 'valueRequired';

function factRowError(
  row: FactRowDraft,
  seen: Set<string>,
): FactRowError | null {
  const key = normalizeFactKey(row.key);
  const value = row.value.trim();
  if (key === '' && value === '') return null;
  if (key === '') return 'keyRequired';
  if (!isValidFactKey(key)) return 'invalidKey';
  if (seen.has(key)) return 'duplicateKey';
  seen.add(key);
  if (value === '') return 'valueRequired';
  return null;
}

/** First blocking row problem, or null when every row is saveable. */
export function findFactRowError(
  rows: readonly FactRowDraft[],
): FactRowError | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const error = factRowError(row, seen);
    if (error) return error;
  }
  return null;
}
