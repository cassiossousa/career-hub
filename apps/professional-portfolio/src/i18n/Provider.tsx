import { createTranslationProvider } from '@career-hub/ui/i18n';
import { storageGetItem, storageSetItem } from '../app/storage';
import type { Translation } from '../types/i18n';
import { getDictionary } from './dictionaries';

export const { TranslationProvider, useTranslation } =
  createTranslationProvider<Translation>({
    storageKey: 'lang',
    getItem: storageGetItem,
    setItem: storageSetItem,
    getDictionary,
  });
