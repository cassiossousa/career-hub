import { Locale, Translation } from '../types/i18n';
import en from './locales/en';
import ptBR from './locales/pt-BR';

export function getDictionary(locale: Locale): Translation {
  switch (locale) {
    case 'pt-BR':
      return ptBR;
    case 'en':
    default:
      return en;
  }
}
