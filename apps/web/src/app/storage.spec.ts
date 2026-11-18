import { storageGetItem, storageSetItem } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('reads and writes values through localStorage', () => {
    storageSetItem('lang', 'pt-BR');

    expect(storageGetItem('lang')).toBe('pt-BR');
    expect(localStorage.getItem('lang')).toBe('pt-BR');
  });

  it('returns null for missing keys', () => {
    expect(storageGetItem('missing')).toBeNull();
  });

  it('returns null instead of throwing when storage reads fail', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(storageGetItem('lang')).toBeNull();
  });

  it('does not throw when storage writes fail', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(() => {
      storageSetItem('lang', 'en');
    }).not.toThrow();
  });
});
