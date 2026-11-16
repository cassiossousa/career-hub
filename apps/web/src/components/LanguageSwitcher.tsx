import { IconButton, Stack } from '@mui/material';
import { useTranslation } from '../i18n/provider';

export default function LanguageSwitcher() {
  const { locale, messages, onLocaleChange } = useTranslation();

  return (
    <Stack direction="row" spacing={1}>
      <IconButton
        type="button"
        onClick={() => onLocaleChange('en')}
        aria-label={messages.navigation.switchToEnglish}
        aria-pressed={locale === 'en'}
        size="small"
        color={locale === 'en' ? 'primary' : 'default'}
      >
        🇺🇸
      </IconButton>
      <IconButton
        type="button"
        onClick={() => onLocaleChange('pt-BR')}
        aria-label={messages.navigation.switchToPortuguese}
        aria-pressed={locale === 'pt-BR'}
        size="small"
        color={locale === 'pt-BR' ? 'primary' : 'default'}
      >
        🇧🇷
      </IconButton>
    </Stack>
  );
}
