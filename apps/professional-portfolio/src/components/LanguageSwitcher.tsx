import {
  createLanguageOptions,
  LanguageSwitcher as SharedLanguageSwitcher,
} from '@career-hub/ui/components';
import { useTranslation } from '../i18n/Provider';
import type { Locale } from '../types/i18n';

export default function LanguageSwitcher() {
  const { locale, messages, onLocaleChange } = useTranslation();

  const options = createLanguageOptions<Locale>([
    { value: 'en', ariaLabel: messages.navigation.switchToEnglish },
    { value: 'pt-BR', ariaLabel: messages.navigation.switchToPortuguese },
  ]);

  return (
    <SharedLanguageSwitcher
      locale={locale}
      options={options}
      onLocaleChange={onLocaleChange}
    />
  );
}
