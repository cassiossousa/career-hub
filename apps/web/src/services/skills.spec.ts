import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  collectSkillGroups,
  findSkillCategory,
  type SkillCategory,
  skills,
} from './skills';

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

const SKILLS_TAG_PATTERN = /<!--\s*skills:\s*(.+?)\s*-->/g;

function skillTagNames(content: string): string[] {
  return [...content.matchAll(SKILLS_TAG_PATTERN)].flatMap((match) =>
    match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

describe('work-experience content skill tags', () => {
  // apps/web/src/services -> repo root is four levels up.
  const CONTENT_DIR = path.resolve(
    __dirname,
    '../../../..',
    'content/work-experience',
  );

  it('every skills tag in committed MDX resolves to a known skill', () => {
    const unknown = readdirSync(CONTENT_DIR)
      .filter((name) => name.endsWith('.mdx'))
      .flatMap((file) =>
        skillTagNames(readFileSync(path.join(CONTENT_DIR, file), 'utf8')).map(
          (name) => ({ file, name }),
        ),
      )
      .filter(({ name }) => !findSkillCategory(name))
      .map(({ file, name }) => `${file}: ${name}`);

    expect(unknown).toEqual([]);
  });
});
