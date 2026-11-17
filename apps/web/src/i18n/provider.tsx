import { createContext, useContext } from 'react';
import type { Locale, Translation } from '../types/i18n';
import { getDictionary } from './dictionaries';

interface TranslationContextValue {
  locale: Locale;
  messages: Translation;
  onLocaleChange: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale,
  onLocaleChange,
  children,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  children: React.ReactNode;
}) {
  const messages = getDictionary(locale);

  return (
    <TranslationContext.Provider value={{ locale, messages, onLocaleChange }}>
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
