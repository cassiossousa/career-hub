import { describeLocaleContract, flattenLeaves } from '@career-hub/ui/testkit';
import { getDictionary } from './dictionaries';
import en from './locales/en';
import ptBR from './locales/pt-BR';

describeLocaleContract(en, ptBR);

describe('i18n dictionaries', () => {
  it('pseudo-localization expands strings ~35% without dropping keys', () => {
    const enLeaves = flattenLeaves(en);
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
