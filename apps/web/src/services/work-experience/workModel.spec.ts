import fc from 'fast-check';

import en from '../../i18n/locales/en';
import type { ContentEntry } from '../../types/content';
import type { Locale } from '../../types/i18n';
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
  bullets: fc.array(fc.string()),
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
            .filter(Boolean);

          return (
            role.company === (entry.frontmatter.company ?? '') &&
            role.title === (entry.frontmatter.role ?? '') &&
            JSON.stringify(role.bullets) === JSON.stringify(expectedBullets) &&
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
            role.bullets.every((bullet) => bullet.trim() !== ''),
        );
      }),
    );
  });
});
