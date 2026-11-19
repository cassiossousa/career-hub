import { getDictionary } from './dictionaries';
import en from './locales/en';
import ptBR from './locales/pt-BR';

function flattenLeaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string>>(
      (acc, [key, child]) => {
        Object.assign(
          acc,
          flattenLeaves(child, prefix ? `${prefix}.${key}` : key),
        );
        return acc;
      },
      {},
    );
  }
  return {};
}

describe('i18n dictionaries', () => {
  const enLeaves = flattenLeaves(en);
  const ptBrLeaves = flattenLeaves(ptBR);

  it('en and pt-BR expose identical key sets', () => {
    expect(Object.keys(ptBrLeaves).toSorted()).toEqual(
      Object.keys(enLeaves).toSorted(),
    );
  });

  it('no leaf is empty or whitespace-only', () => {
    for (const [key, value] of Object.entries(enLeaves)) {
      expect(value.trim().length).toBeGreaterThan(0);
      expect(ptBrLeaves[key]?.trim().length).toBeGreaterThan(0);
    }
  });

  it('pseudo-localization expands strings ~35% without dropping keys', () => {
    const pseudo = Object.fromEntries(
      Object.entries(enLeaves).map(([key, value]) => [
        key,
        `⟦${value}⟧`.padEnd(Math.ceil(value.length * 1.35), '·'),
      ]),
    );
    expect(Object.keys(pseudo).toSorted()).toEqual(
      Object.keys(enLeaves).toSorted(),
    );
    for (const [key, value] of Object.entries(pseudo)) {
      expect(value.length).toBeGreaterThanOrEqual(
        Math.ceil((enLeaves[key]?.length ?? 0) * 1.35),
      );
    }
  });

  it('getDictionary resolves both locales', () => {
    expect(getDictionary('en')).toBeDefined();
    expect(getDictionary('pt-BR')).toBeDefined();
  });
});
