import fc from 'fast-check';
import {
  applyLabelEdits,
  cleanLabelMap,
  diffLabelEdits,
  diffSkillRows,
  findDuplicateSkillName,
  type LabelEdits,
  type LabelEntry,
  type SkillRowDraft,
  skillNameKey,
  toLabelEntries,
  toRowDrafts,
} from './skills';
import type { Skill, SkillGroupLabels } from './types/skills';

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 1,
    name: 'React',
    group: 'frontend',
    labels: {},
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

describe('cleanLabelMap', () => {
  it('trims values and drops blank locales', () => {
    expect(
      cleanLabelMap({ en: '  React ', 'pt-BR': '   ', fr: 'React.js' }),
    ).toEqual({ en: 'React', fr: 'React.js' });
  });
});

describe('toLabelEntries', () => {
  it('builds skill rows plus one row per category', () => {
    const skills = [makeSkill({ id: 7, labels: { en: 'React' } })];
    const groupLabels: SkillGroupLabels[] = [
      { group: 'frontend', labels: { 'pt-BR': 'Front-end' } },
    ];
    const entries = toLabelEntries(skills, groupLabels);
    expect(entries).toHaveLength(7);
    expect(entries[0]).toEqual({
      kind: 'skill',
      skillId: 7,
      name: 'React',
      group: 'frontend',
      labels: { en: 'React' },
    });
    const frontend = entries.find(
      (entry) => entry.kind === 'group' && entry.group === 'frontend',
    );
    expect(frontend?.labels).toEqual({ 'pt-BR': 'Front-end' });
    const backend = entries.find(
      (entry) => entry.kind === 'group' && entry.group === 'backend',
    );
    expect(backend?.labels).toEqual({});
  });
});

describe('applyLabelEdits', () => {
  it('overlays edits on server entries without mutating them', () => {
    const entries = toLabelEntries([makeSkill()], []);
    const skill = entries[0];
    if (skill?.kind !== 'skill') throw new Error('expected skill row');
    const rows = applyLabelEdits(entries, {
      'skill:1': { en: 'React.js' },
    });
    expect(rows[0]?.labels).toEqual({ en: 'React.js' });
    expect(skill.labels).toEqual({});
  });
});

describe('diffLabelEdits', () => {
  const entries: LabelEntry[] = [
    {
      kind: 'skill',
      skillId: 1,
      name: 'React',
      group: 'frontend',
      labels: { en: 'React', 'pt-BR': 'React' },
    },
    { kind: 'group', group: 'frontend', labels: {} },
    { kind: 'group', group: 'backend', labels: { en: 'Backend' } },
  ];

  it('returns no changes for empty or reverted edits', () => {
    expect(diffLabelEdits(entries, {})).toEqual({
      skillUpdates: [],
      groupUpdates: [],
    });
    const edits: LabelEdits = {
      'skill:1': { en: ' React ', 'pt-BR': 'React' },
      'group:backend': { en: 'Backend' },
    };
    expect(diffLabelEdits(entries, edits)).toEqual({
      skillUpdates: [],
      groupUpdates: [],
    });
  });

  it('detects skill and group changes with cleaned maps', () => {
    const edits: LabelEdits = {
      'skill:1': { en: '  React.js ', 'pt-BR': '  ' },
      'group:frontend': { en: 'Front-end' },
      'group:missing': { en: 'Ignored' },
    };
    expect(diffLabelEdits(entries, edits)).toEqual({
      skillUpdates: [{ id: 1, labels: { en: 'React.js' } }],
      groupUpdates: [{ group: 'frontend', labels: { en: 'Front-end' } }],
    });
  });
});

describe('skillNameKey (property)', () => {
  it('is idempotent for arbitrary names', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        expect(skillNameKey(skillNameKey(name))).toBe(skillNameKey(name));
      }),
    );
  });

  it('always returns a trimmed, single-spaced, lowercase key', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const key = skillNameKey(name);
        expect(key).toBe(key.trim());
        expect(key).toBe(key.toLowerCase());
        expect(key.includes('  ')).toBe(false);
      }),
    );
  });
});
