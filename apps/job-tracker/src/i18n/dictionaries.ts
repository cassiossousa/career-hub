import type { Locale, Translation } from '../types/i18n';
import { defineMessages } from '../types/i18n';
import en from './locales/en';
import ptBR from './locales/pt-BR';

const dictionaries: Record<Locale, Translation> = {
  en: defineMessages(en),
  'pt-BR': defineMessages(ptBR),
};

export function getDictionary(locale: Locale): Translation {
  return dictionaries[locale];
}
