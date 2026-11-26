/**
 * Shared contract for the per-app `app/storage.ts` Web Storage wrappers.
 * Each app keeps its own module (it is the storage boundary), but the
 * failure-mode behavior — never throw, degrade gracefully — is identical,
 * so the spec body lives here once.
 */
export interface StorageFns {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function describeStorageContract(
  storage: StorageFns,
  key: string,
): void {
  describe('storage helpers', () => {
    beforeEach(() => {
      // eslint-disable-next-line no-restricted-syntax -- the contract asserts raw Web Storage state
      localStorage.clear();
      jest.restoreAllMocks();
    });

    it('reads and writes values through localStorage', () => {
      storage.setItem(key, 'pt-BR');

      expect(storage.getItem(key)).toBe('pt-BR');
      // eslint-disable-next-line no-restricted-syntax -- asserting the raw store, not the wrapper
      expect(localStorage.getItem(key)).toBe('pt-BR');
    });

    it('returns null for missing keys', () => {
      expect(storage.getItem('missing')).toBeNull();
    });

    it('removes stored values', () => {
      storage.setItem(key, 'pt-BR');
      storage.removeItem(key);

      expect(storage.getItem(key)).toBeNull();
    });

    it('does not throw when storage removal fails', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(() => {
        storage.removeItem(key);
      }).not.toThrow();
    });

    it('returns null instead of throwing when storage reads fail', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(storage.getItem(key)).toBeNull();
    });

    it('does not throw when storage writes fail', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        storage.setItem(key, 'en');
      }).not.toThrow();
    });
  });
}
