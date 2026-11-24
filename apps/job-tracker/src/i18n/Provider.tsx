import { createTranslationProvider } from '@career-hub/ui/i18n';
import { storageGetItem, storageSetItem } from '../app/storage';
import type { Translation } from '../types/i18n';
import { getDictionary } from './dictionaries';
import { LOCALE_STORAGE_KEY } from './localeStorageKey';

const { TranslationProvider, useTranslation } =
  createTranslationProvider<Translation>({
    storageKey: LOCALE_STORAGE_KEY,
    getItem: storageGetItem,
    setItem: storageSetItem,
    getDictionary,
    syncDocumentLang: true,
  });

export { TranslationProvider, useTranslation };
