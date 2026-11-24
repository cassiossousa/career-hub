import fc from 'fast-check';

import en from '../../i18n/locales/en';
import type { ContentEntry } from '../../types/content';
import type { Locale } from '../../types/i18n';
import { type SkillCategory, skills } from '../skills';
import { SKILLS_TAG_PATTERN } from './skillTags';
import {
  mapContentToWorkRoles,
  sortRolesByStart,
  type WorkRole,
} from './workModel';

const locale: Locale = 'en';

const dateStringArb = fc
  .integer({ min: Date.UTC(1970, 0, 1), max: Date.UTC(2100, 0, 1) })
  .map((millis) => new Date(millis).toISOString());

const nonBlankStringArb = fc
  .string({ minLength: 1 })
  .filter((value) => value.trim() !== '');

const orderedDatesArb = fc
  .tuple(
    fc.option(dateStringArb, { nil: undefined }),
    fc.option(dateStringArb, { nil: undefined }),
  )
  .filter(
    ([start, end]) => start === undefined || end === undefined || start <= end,
  );

const validEntryArb: fc.Arbitrary<ContentEntry> = fc
  .tuple(
    fc.record({
      slug: nonBlankStringArb,
      type: fc.constant('work-experience' as const),
      frontmatter: fc.record({
        company: nonBlankStringArb,
        role: nonBlankStringArb,
        location: fc.option(fc.string(), { nil: undefined }),
      }),
      content: fc.string(),
      readingTime: fc.option(fc.nat(), { nil: undefined }),
    }),
    orderedDatesArb,
  )
  .map(([entry, [start, end]]) => ({
    ...entry,
    frontmatter: { ...entry.frontmatter, start, end },
  }));

const anyEntryArb: fc.Arbitrary<ContentEntry> = fc.record({
  slug: fc.string(),
  type: fc.constant('work-experience' as const),
  frontmatter: fc.record({
    company: fc.option(fc.string(), { nil: undefined }),
    role: fc.option(fc.string(), { nil: undefined }),
    start: fc.option(fc.string(), { nil: undefined }),
    end: fc.option(fc.string(), { nil: undefined }),
  }),
  content: fc.string(),
});

const workEntry = (
  frontmatter: ContentEntry['frontmatter'],
  content = '',
): ContentEntry => ({
  slug: 'slug',
  type: 'work-experience',
  frontmatter,
  content,
});

const roleIdentity = (role: WorkRole) =>
  JSON.stringify([role.company, role.title, role.start, role.end]);

const parseableStart = (value?: string) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const workRoleArb: fc.Arbitrary<WorkRole> = fc.record({
  company: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  location: fc.option(fc.string(), { nil: undefined }),
  start: fc.option(fc.string(), { nil: undefined }),
  end: fc.option(fc.string(), { nil: undefined }),
  period: fc.string(),
  bullets: fc.array(
    fc.record({
      line: fc.string(),
      skills: fc.array(
        fc.record({
          category: fc.constantFrom(
            ...(Object.keys(skills) as SkillCategory[]),
          ),
          name: fc.string(),
        }),
      ),
    }),
  ),
});

describe('sortRolesByStart', () => {
  it('sorts roles newest first without mutating the input', () => {
    const roles: WorkRole[] = [
      {
        company: 'Older company',
        title: 'Engineer',
        start: '2020-01-01',
        period: '2020',
        bullets: [],
      },
      {
        company: 'Newer company',
        title: 'Engineer',
        start: '2024-01-01',
        period: '2024',
        bullets: [],
      },
    ];
    const originalRoles = [...roles];

    const sortedRoles = sortRolesByStart(roles);

    expect(sortedRoles.map(({ company }) => company)).toEqual([
      'Newer company',
      'Older company',
    ]);
    expect(roles).toEqual(originalRoles);
  });

  it('preserves length, is a permutation, and does not mutate the input', () => {
    fc.assert(
      fc.property(fc.array(workRoleArb, { maxLength: 25 }), (roles) => {
        const snapshot = JSON.stringify(roles);
        const sorted = sortRolesByStart(roles);

        const sortedIdentities = sorted.map(roleIdentity).toSorted();
        const inputIdentities = roles.map(roleIdentity).toSorted();

        return (
          sorted.length === roles.length &&
          JSON.stringify(sortedIdentities) ===
            JSON.stringify(inputIdentities) &&
          JSON.stringify(roles) === snapshot
        );
      }),
    );
  });

  it('orders valid dates newest first and keeps undated/invalid roles last', () => {
    fc.assert(
      fc.property(fc.array(workRoleArb, { maxLength: 25 }), (roles) => {
        const sorted = sortRolesByStart(roles);

        for (let i = 0; i < sorted.length - 1; i++) {
          const current = parseableStart(sorted[i].start);
          const next = parseableStart(sorted[i + 1].start);
          if (current === null || next === null) continue;
          if (current < next) return false;
        }

        const tailStart = sorted.findLastIndex(
          (role) => parseableStart(role.start) !== null,
        );
        return sorted
          .slice(0, tailStart + 1)
          .every((role) => parseableStart(role.start) !== null);
      }),
    );
  });
});

describe('mapContentToWorkRoles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps every valid entry and derives bullets from non-empty trimmed lines', () => {
    fc.assert(
      fc.property(fc.array(validEntryArb, { maxLength: 20 }), (entries) => {
        const roles = mapContentToWorkRoles(entries, en, locale);

        if (roles.length !== entries.length) return false;

        return roles.every((role, index) => {
          const entry = entries[index];
          const expectedBullets = entry.content
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.replace(SKILLS_TAG_PATTERN, '').trim())
            .filter((line) => line !== '');

          return (
            role.company === (entry.frontmatter.company ?? '') &&
            role.title === (entry.frontmatter.role ?? '') &&
            JSON.stringify(role.bullets.map((bullet) => bullet.line)) ===
              JSON.stringify(expectedBullets) &&
            (entry.frontmatter.start === undefined
              ? role.period === ''
              : role.period !== '')
          );
        });
      }),
    );
  });

  it('never emits blank company/title or empty bullets for arbitrary entries', () => {
    fc.assert(
      fc.property(fc.array(anyEntryArb, { maxLength: 20 }), (entries) => {
        const roles = mapContentToWorkRoles(entries, en, locale);

        return roles.every(
          (role) =>
            role.company.trim() !== '' &&
            role.title.trim() !== '' &&
            role.bullets.every((bullet) => bullet.line.trim() !== ''),
        );
      }),
    );
  });
  it('formats periods for dated, open-ended, and undated roles', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry({
          company: 'A',
          role: 'Eng',
          start: '2020-01-15',
          end: '2021-03-20',
        }),
        workEntry({ company: 'B', role: 'Eng', start: '2022-06-15' }),
        workEntry({ company: 'C', role: 'Eng' }),
      ],
      en,
      locale,
    );

    expect(roles.map((role) => role.period)).toEqual([
      'Jan 2020 - Mar 2021',
      'Jun 2022 - Present',
      '',
    ]);
  });

  it('rejects invalid dates and reports the offending field', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry({ company: 'A', role: 'Eng', start: 'not-a-date' }),
        workEntry({ company: 'B', role: 'Eng', end: 'garbage' }),
      ],
      en,
      locale,
    );

    expect(roles).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid work entry for A:',
      expect.arrayContaining([
        expect.objectContaining({
          field: 'start',
          message: 'Invalid start date format',
        }),
      ]),
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid work entry for B:',
      expect.arrayContaining([
        expect.objectContaining({
          field: 'end',
          message: 'Invalid end date format',
        }),
      ]),
    );
  });

  it('rejects whitespace-only company and role', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry({ company: '   ', role: 'Eng' }),
        workEntry({ company: 'A', role: '\t ' }),
        workEntry({ company: 'B', role: 'Eng' }),
      ],
      en,
      locale,
    );

    expect(roles.map((role) => role.company)).toEqual(['B']);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid work entry'),
      expect.arrayContaining([
        expect.objectContaining({
          field: 'company',
          message: 'Company is required',
        }),
      ]),
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid work entry for A:',
      expect.arrayContaining([
        expect.objectContaining({
          field: 'role',
          message: 'Role title is required',
        }),
      ]),
    );
  });

  it('rejects end before start but accepts equal and open-ended dates', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry({
          company: 'Bad',
          role: 'Eng',
          start: '2021-01-15',
          end: '2020-01-15',
        }),
        workEntry({
          company: 'Same',
          role: 'Eng',
          start: '2020-06-15',
          end: '2020-06-15',
        }),
        workEntry({ company: 'Open', role: 'Eng', start: '2019-01-15' }),
      ],
      en,
      locale,
    );

    expect(roles.map((role) => role.company)).toEqual(['Same', 'Open']);
    expect(console.warn).toHaveBeenCalledWith(
      'Invalid work entry for Bad:',
      expect.arrayContaining([
        expect.objectContaining({
          field: 'end',
          message: 'End date must be after start date',
        }),
      ]),
    );
  });

  it('sorts valid starts descending and keeps undated or invalid starts last', () => {
    const roles: WorkRole[] = [
      { company: 'undated', title: 't', period: '', bullets: [] },
      {
        company: 'invalid',
        title: 't',
        start: 'garbage',
        period: '',
        bullets: [],
      },
      {
        company: 'old',
        title: 't',
        start: '2020-01-15',
        period: '',
        bullets: [],
      },
      {
        company: 'new',
        title: 't',
        start: '2024-01-15',
        period: '',
        bullets: [],
      },
    ];

    expect(sortRolesByStart(roles).map((role) => role.company)).toEqual([
      'new',
      'old',
      'undated',
      'invalid',
    ]);
  });

  it('extracts categorized skills from bullet tags and strips the tag', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry(
          { company: 'A', role: 'Eng' },
          'Shipped UI <!-- skills: React, TypeScript -->\n' +
            'Scaled APIs <!-- skills: Node.js, PostgreSQL, React -->',
        ),
      ],
      en,
      locale,
    );

    expect(roles[0].bullets).toEqual([
      {
        line: 'Shipped UI',
        skills: [
          { category: 'frontend', name: 'React' },
          { category: 'frontend', name: 'TypeScript' },
        ],
      },
      {
        line: 'Scaled APIs',
        skills: [
          { category: 'backend', name: 'Node.js' },
          { category: 'databases', name: 'PostgreSQL' },
          { category: 'frontend', name: 'React' },
        ],
      },
    ]);
  });

  it('warns and skips unknown skills, dedupes names, and drops tag-only bullets', () => {
    const roles = mapContentToWorkRoles(
      [
        workEntry(
          { company: 'A', role: 'Eng' },
          '<!-- skills: React -->\n' +
            'Did things <!-- skills: NotARealSkill, React, React -->',
        ),
      ],
      en,
      locale,
    );

    expect(roles[0].bullets).toEqual([
      {
        line: 'Did things',
        skills: [{ category: 'frontend', name: 'React' }],
      },
    ]);
    expect(console.warn).toHaveBeenCalledWith(
      'Unknown skill "NotARealSkill" in work experience content',
    );
  });
});
