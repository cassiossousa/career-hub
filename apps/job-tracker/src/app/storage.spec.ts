import { describeStorageContract } from '@career-hub/ui/testkit';
import { LOCALE_STORAGE_KEY } from '../i18n/localeStorageKey';
import {
  storageGetItem,
  storageGetJson,
  storageRemoveItem,
  storageSetItem,
  storageSetJson,
} from './storage';

describeStorageContract(
  {
    getItem: storageGetItem,
    setItem: storageSetItem,
    removeItem: storageRemoveItem,
  },
  LOCALE_STORAGE_KEY,
);

describe('storage JSON helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips JSON values', () => {
    storageSetJson('persisted', { filters: { status: 'saved' }, page: 2 });

    expect(storageGetJson('persisted')).toEqual({
      filters: { status: 'saved' },
      page: 2,
    });
  });

  it('returns null for missing or corrupt JSON', () => {
    expect(storageGetJson('missing')).toBeNull();
    localStorage.setItem('corrupt', '{not json');
    expect(storageGetJson('corrupt')).toBeNull();
  });
});
