import { describeStorageContract } from '@career-hub/ui/testkit';
import { LOCALE_STORAGE_KEY } from '../i18n/localeStorageKey';
import { storageGetItem, storageRemoveItem, storageSetItem } from './storage';

describeStorageContract(
  {
    getItem: storageGetItem,
    setItem: storageSetItem,
    removeItem: storageRemoveItem,
  },
  LOCALE_STORAGE_KEY,
);
