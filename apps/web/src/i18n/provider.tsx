import { createContext, useContext, useState } from 'react';
import { storageGetItem, storageSetItem } from '../app/storage';
import type { Locale, Translation } from '../types/i18n';
import { getDictionary } from './dictionaries';

const LOCALE_STORAGE_KEY = 'lang';

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'pt-BR';
}

function storedLocale(): Locale {
  const stored = storageGetItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : 'en';
}

interface TranslationContextValue {
  locale: Locale;
  messages: Translation;
  onLocaleChange: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  onLocaleChange,
  children,
}: {
  onLocaleChange?: (locale: Locale) => void;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(storedLocale);
  const messages = getDictionary(locale);

  function changeLocale(nextLocale: Locale) {
    storageSetItem(LOCALE_STORAGE_KEY, nextLocale);
    setLocale(nextLocale);
    onLocaleChange?.(nextLocale);
  }

  return (
    <TranslationContext.Provider
      value={{ locale, messages, onLocaleChange: changeLocale }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
