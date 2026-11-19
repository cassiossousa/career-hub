import { getDictionary } from './dictionaries';

describe('getDictionary', () => {
  it('returns the English dictionary for en', () => {
    const dict = getDictionary('en');

    expect(dict.home.name).toBe('Cássio dos Santos Sousa');
    expect(dict.home.title).toBe('Senior Software Engineer');
  });

  it('returns the Portuguese dictionary for pt-BR', () => {
    const dict = getDictionary('pt-BR');

    expect(dict.home.title).toBe('Engenheiro de Software Sênior');
    expect(dict.navigation.switchToEnglish).toBe('Mudar para inglês');
  });

  it('returns distinct dictionaries per locale', () => {
    expect(getDictionary('pt-BR')).not.toBe(getDictionary('en'));
  });
});
