import { IconButton, Stack } from '@mui/material';

export interface LanguageOption<T extends string> {
  value: T;
  flag: string;
  ariaLabel: string;
}

const LOCALE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  'pt-BR': '🇧🇷',
};

export function createLanguageOptions<T extends string>(
  entries: readonly { value: T; ariaLabel: string }[],
): LanguageOption<T>[] {
  return entries.map(({ value, ariaLabel }) => ({
    value,
    flag: LOCALE_FLAGS[value] ?? value,
    ariaLabel,
  }));
}

export interface LanguageSwitcherProps<T extends string> {
  locale: T;
  options: readonly LanguageOption<T>[];
  onLocaleChange: (locale: T) => void;
}

export function LanguageSwitcher<T extends string>({
  locale,
  options,
  onLocaleChange,
}: LanguageSwitcherProps<T>) {
  return (
    <Stack direction="row" spacing={1}>
      {options.map((option) => (
        <IconButton
          key={option.value}
          type="button"
          onClick={() => {
            onLocaleChange(option.value);
          }}
          aria-label={option.ariaLabel}
          aria-pressed={locale === option.value}
          size="small"
          color={locale === option.value ? 'primary' : 'default'}
        >
          {option.flag}
        </IconButton>
      ))}
    </Stack>
  );
}
