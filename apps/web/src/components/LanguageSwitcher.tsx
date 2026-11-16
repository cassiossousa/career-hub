import { Button, Stack } from '@mui/material';
import { useTranslation } from '../i18n/provider';

export default function LanguageSwitcher() {
  const { locale, messages, onLocaleChange } = useTranslation();

  return (
    <Stack direction="row" spacing={1}>
      <Button
        type="button"
        onClick={() => onLocaleChange('en')}
        aria-label={messages.navigation.switchToEnglish}
        aria-pressed={locale === 'en'}
        variant={locale === 'en' ? 'contained' : 'text'}
        size="small"
        sx={{ minWidth: 40, px: 1 }}
      >
        🇺🇸
      </Button>
      <Button
        type="button"
        onClick={() => onLocaleChange('pt-BR')}
        aria-label={messages.navigation.switchToPortuguese}
        aria-pressed={locale === 'pt-BR'}
        variant={locale === 'pt-BR' ? 'contained' : 'text'}
        size="small"
        sx={{ minWidth: 40, px: 1 }}
      >
        🇧🇷
      </Button>
    </Stack>
  );
}
