import en from '../i18n/locales/en';
import ptBR from '../i18n/locales/pt-BR';
import { getAllEntries } from './content';
import {
  collectSkillGroups,
  findSkillCategory,
  type SkillCategory,
  skills,
} from './skills';
import { mapContentToWorkRoles } from './work-experience/workModel';

const CATEGORIES = Object.keys(skills) as SkillCategory[];

const role = (
  entries: { category: SkillCategory; name: string }[],
): {
  bullets: { skills: { category: SkillCategory; name: string }[] }[];
} => ({ bullets: [{ skills: entries }] });

describe('findSkillCategory', () => {
  it('maps canonical skill names to their category', () => {
    expect(findSkillCategory('React')).toBe('frontend');
    expect(findSkillCategory('Node.js')).toBe('backend');
    expect(findSkillCategory('PostgreSQL')).toBe('databases');
    expect(findSkillCategory('Kafka')).toBe('distributed');
    expect(findSkillCategory('Docker')).toBe('cloud');
    expect(findSkillCategory('Jest')).toBe('testing');
  });

  it('maps extra aliases to their category', () => {
    expect(findSkillCategory('Svelte')).toBe('frontend');
    expect(findSkillCategory('Scala')).toBe('backend');
    expect(findSkillCategory('Play Framework')).toBe('backend');
  });

  it('returns undefined for unknown or differently-cased names', () => {
    expect(findSkillCategory('NotARealSkill')).toBeUndefined();
    expect(findSkillCategory('react')).toBeUndefined();
    expect(findSkillCategory('')).toBeUndefined();
  });

  it('resolves every listed skill name back to its own category', () => {
    for (const category of CATEGORIES) {
      for (const name of skills[category]) {
        expect(findSkillCategory(name)).toBe(category);
      }
    }
  });
});

describe('collectSkillGroups', () => {
  it('returns every category with canonical skills when no roles mention extras', () => {
    const groups = collectSkillGroups([]);

    expect(groups.map((group) => group.category)).toEqual(CATEGORIES);
    expect(
      groups.find((group) => group.category === 'frontend')?.items,
    ).toEqual(skills.frontend);
  });

  it('appends mentioned skills not in the canonical list, deduped', () => {
    const groups = collectSkillGroups([
      role([
        { category: 'frontend', name: 'Preact' },
        { category: 'frontend', name: 'React' },
        { category: 'backend', name: 'Preact' },
      ]),
      role([{ category: 'frontend', name: 'Preact' }]),
    ]);

    const frontend = groups.find((group) => group.category === 'frontend');
    const backend = groups.find((group) => group.category === 'backend');

    expect(frontend?.items).toEqual([...skills.frontend, 'Preact']);
    expect(backend?.items).toEqual([...skills.backend, 'Preact']);
  });
});

describe('committed work-experience content', () => {
  it.each([
    ['en', en],
    ['pt-BR', ptBR],
  ] as const)(
    'every skills tag in %s content resolves to a known skill',
    (locale, dictionary) => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const entries = getAllEntries('work-experience', locale);
        const roles = mapContentToWorkRoles(entries, dictionary, locale);

        expect(roles.length).toBeGreaterThan(0);
        expect(warn).not.toHaveBeenCalledWith(
          expect.stringContaining('Unknown skill'),
        );
      } finally {
        warn.mockRestore();
      }
    },
  );
});
