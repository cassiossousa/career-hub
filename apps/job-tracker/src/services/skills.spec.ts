import {
  diffSkillRows,
  findDuplicateSkillName,
  type SkillRowDraft,
  skillNameKey,
  toRowDrafts,
} from './skills';
import type { Skill } from './types/skills';

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 1,
    name: 'React',
    group: 'frontend',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('skillNameKey', () => {
  it('normalizes case and whitespace like the backend', () => {
    expect(skillNameKey('  Ruby   on Rails ')).toBe('ruby on rails');
    expect(skillNameKey('REACT')).toBe(skillNameKey('react'));
  });
});

describe('toRowDrafts', () => {
  it('maps skills to editable rows', () => {
    expect(toRowDrafts([makeSkill()])).toEqual([
      { id: 1, name: 'React', group: 'frontend' },
    ]);
  });
});

describe('diffSkillRows', () => {
  const original = [
    makeSkill({ id: 1, name: 'React', group: 'frontend' }),
    makeSkill({ id: 2, name: 'PostgreSQL', group: 'databases' }),
  ];

  it('returns no changes when rows match the server state', () => {
    expect(diffSkillRows(original, toRowDrafts(original))).toEqual({
      creates: [],
      updates: [],
      deletes: [],
    });
  });

  it('detects creates, updates, and deletes', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: 'React', group: 'backend' },
      { id: null, name: 'Go', group: 'backend' },
    ];
    expect(diffSkillRows(original, rows)).toEqual({
      creates: [{ name: 'Go', group: 'backend' }],
      updates: [{ id: 1, patch: { group: 'backend' } }],
      deletes: [2],
    });
  });

  it('patches only the changed fields', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: 'Preact', group: 'frontend' },
      { id: 2, name: 'PostgreSQL', group: 'databases' },
    ];
    expect(diffSkillRows(original, rows).updates).toEqual([
      { id: 1, patch: { name: 'Preact' } },
    ]);
  });

  it('ignores blank new rows and never deletes a row left blank', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: '', group: 'frontend' },
      { id: null, name: '   ', group: 'backend' },
      { id: 2, name: 'PostgreSQL', group: 'databases' },
    ];
    expect(diffSkillRows(original, rows)).toEqual({
      creates: [],
      updates: [],
      deletes: [],
    });
  });

  it('trims names before comparing and creating', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: '  React  ', group: 'frontend' },
      { id: 2, name: 'PostgreSQL', group: 'databases' },
      { id: null, name: '  Kafka  ', group: 'distributed' },
    ];
    const changes = diffSkillRows(original, rows);
    expect(changes.updates).toEqual([]);
    expect(changes.creates).toEqual([{ name: 'Kafka', group: 'distributed' }]);
  });
});

describe('findDuplicateSkillName', () => {
  it('detects duplicates ignoring case and whitespace', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: 'React', group: 'frontend' },
      { id: null, name: '  react ', group: 'backend' },
    ];
    expect(findDuplicateSkillName(rows)).toBe('react');
  });

  it('returns null for unique names and skips blanks', () => {
    const rows: SkillRowDraft[] = [
      { id: 1, name: 'React', group: 'frontend' },
      { id: null, name: '', group: 'backend' },
      { id: null, name: '   ', group: 'backend' },
    ];
    expect(findDuplicateSkillName(rows)).toBeNull();
  });
});
