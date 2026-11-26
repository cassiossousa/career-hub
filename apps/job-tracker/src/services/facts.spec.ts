import {
  diffFactRows,
  findFactRowError,
  isValidFactKey,
  normalizeFactKey,
  toFactRowDrafts,
} from './facts';
import type { ProfileFact } from './types/facts';

const fact = (key: string, value = 'yes'): ProfileFact => ({
  key,
  category: 'preferences',
  value,
  sensitivity: 'normal',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
});

describe('normalizeFactKey / isValidFactKey', () => {
  it('trims and lowercases keys', () => {
    expect(normalizeFactKey('  Work_Auth ')).toBe('work_auth');
  });

  it('accepts backend-shaped slugs and rejects the rest', () => {
    expect(isValidFactKey('work_authorization')).toBe(true);
    expect(isValidFactKey('a1_')).toBe(true);
    expect(isValidFactKey('1abc')).toBe(false);
    expect(isValidFactKey('Has-Dash')).toBe(false);
    expect(isValidFactKey('has space')).toBe(false);
    expect(isValidFactKey('')).toBe(false);
  });
});

describe('toFactRowDrafts', () => {
  it('maps facts to editable rows', () => {
    const rows = toFactRowDrafts([fact('email', 'a@b.c')]);
    expect(rows).toEqual([
      {
        key: 'email',
        category: 'preferences',
        value: 'a@b.c',
        sensitivity: 'normal',
        isNew: false,
      },
    ]);
  });
});

describe('findFactRowError', () => {
  const base = {
    category: 'identity' as const,
    value: 'x',
    sensitivity: 'normal' as const,
    isNew: true,
  };

  it('returns null for untouched blank rows and valid rows', () => {
    expect(findFactRowError([{ ...base, key: '', value: '' }])).toBeNull();
    expect(findFactRowError([{ ...base, key: 'ok_key' }])).toBeNull();
  });

  it('flags value without key, bad keys, duplicates and empty values', () => {
    expect(findFactRowError([{ ...base, key: '', value: 'x' }])).toBe(
      'keyRequired',
    );
    expect(findFactRowError([{ ...base, key: 'Bad Key' }])).toBe('invalidKey');
    expect(
      findFactRowError([
        { ...base, key: 'dup' },
        { ...base, key: 'DUP' },
      ]),
    ).toBe('duplicateKey');
    expect(findFactRowError([{ ...base, key: 'k', value: '  ' }])).toBe(
      'valueRequired',
    );
  });
});

describe('diffFactRows', () => {
  it('produces no changes for an untouched draft', () => {
    const facts = [fact('email', 'a@b.c')];
    expect(diffFactRows(facts, toFactRowDrafts(facts))).toEqual({
      upserts: [],
      deletes: [],
    });
  });

  it('upserts new and changed rows and deletes removed ones', () => {
    const facts = [fact('email', 'a@b.c'), fact('phone', '123')];
    const rows = [
      {
        key: 'email',
        category: 'preferences' as const,
        value: 'new@b.c',
        sensitivity: 'normal' as const,
        isNew: false,
      },
      {
        key: 'linkedin_url',
        category: 'links' as const,
        value: 'https://x',
        sensitivity: 'normal' as const,
        isNew: true,
      },
    ];
    const changes = diffFactRows(facts, rows);
    expect(changes.deletes).toEqual(['phone']);
    expect(changes.upserts).toEqual([
      {
        key: 'email',
        fact: {
          category: 'preferences',
          value: 'new@b.c',
          sensitivity: 'normal',
        },
      },
      {
        key: 'linkedin_url',
        fact: {
          category: 'links',
          value: 'https://x',
          sensitivity: 'normal',
        },
      },
    ]);
  });

  it('normalizes keys so casing/whitespace edits upsert the same fact', () => {
    const facts = [fact('email', 'a@b.c')];
    const rows = [
      {
        key: '  EMAIL ',
        category: 'preferences' as const,
        value: 'a@b.c',
        sensitivity: 'normal' as const,
        isNew: false,
      },
    ];
    const changes = diffFactRows(facts, rows);
    expect(changes.deletes).toEqual([]);
    expect(changes.upserts).toEqual([]);
  });
});
