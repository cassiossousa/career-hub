import { createContext, type ReactNode, useContext, useState } from 'react';

export type UiLocale = 'en' | 'pt-BR';

const DEFAULT_LOCALE: UiLocale = 'en';

function isUiLocale(value: string | null): value is UiLocale {
  return value === 'en' || value === 'pt-BR';
}

export interface TranslationContextValue<TMessages> {
  locale: UiLocale;
  messages: TMessages;
  onLocaleChange: (locale: UiLocale) => void;
}

export interface TranslationProviderConfig<TMessages> {
  storageKey: string;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  getDictionary: (locale: UiLocale) => TMessages;
  syncDocumentLang?: boolean;
}

export function createTranslationProvider<TMessages>(
  config: TranslationProviderConfig<TMessages>,
) {
  const TranslationContext =
    createContext<TranslationContextValue<TMessages> | null>(null);

  // biome-ignore lint/correctness/noComponentHookFactories: factory is invoked once per app at module level, so the returned component/hook identities are stable.
  function TranslationProvider({
    onLocaleChange,
    children,
  }: {
    onLocaleChange?: (locale: UiLocale) => void;
    children: ReactNode;
  }) {
    const [locale, setLocale] = useState<UiLocale>(() => {
      const stored = config.getItem(config.storageKey);
      return isUiLocale(stored) ? stored : DEFAULT_LOCALE;
    });
    const messages = config.getDictionary(locale);

    function changeLocale(nextLocale: UiLocale) {
      if (config.syncDocumentLang) {
        document.documentElement.lang = nextLocale;
      }
      config.setItem(config.storageKey, nextLocale);
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

  // biome-ignore lint/correctness/noComponentHookFactories: factory is invoked once per app at module level, so the returned component/hook identities are stable.
  function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) {
      throw new Error('useTranslation must be used within TranslationProvider');
    }
    return context;
  }

  return { TranslationProvider, useTranslation };
}
