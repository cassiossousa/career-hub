import { LOCALE_STORAGE_KEY } from '../i18n/localeStorageKey';
import { storageGetItem, storageRemoveItem, storageSetItem } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('reads and writes values through localStorage', () => {
    storageSetItem(LOCALE_STORAGE_KEY, 'pt-BR');

    expect(storageGetItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
  });

  it('returns null for missing keys', () => {
    expect(storageGetItem('missing')).toBeNull();
  });

  it('removes stored values', () => {
    storageSetItem(LOCALE_STORAGE_KEY, 'pt-BR');
    storageRemoveItem(LOCALE_STORAGE_KEY);

    expect(storageGetItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('does not throw when storage removal fails', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(() => {
      storageRemoveItem(LOCALE_STORAGE_KEY);
    }).not.toThrow();
  });

  it('returns null instead of throwing when storage reads fail', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(storageGetItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('does not throw when storage writes fail', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(() => {
      storageSetItem(LOCALE_STORAGE_KEY, 'en');
    }).not.toThrow();
  });
});
