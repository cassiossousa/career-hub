import { defineMessages, type Translation, yearsSince } from './i18n';

describe('yearsSince', () => {
  it('returns the number of years elapsed since the given year', () => {
    const currentYear = new Date().getFullYear();

    expect(yearsSince(currentYear)).toBe(0);
    expect(yearsSince(currentYear - 5)).toBe(5);
    expect(yearsSince(currentYear + 1)).toBe(-1);
  });
});

describe('defineMessages', () => {
  it('returns the messages object unchanged', () => {
    const messages = { home: { name: 'x' } } as Translation;
    expect(defineMessages(messages)).toBe(messages);
  });
});
