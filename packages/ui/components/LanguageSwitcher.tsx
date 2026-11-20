import { Box, IconButton, Stack } from '@mui/material';
import { type FlagCode, FlagIcon } from './FlagIcon';

export interface LanguageOption<T extends string> {
  value: T;
  label: string;
  ariaLabel: string;
  flag?: FlagCode;
}

function localeLabel(value: string): string {
  return value.slice(0, 2).toUpperCase();
}

export function createLanguageOptions<T extends string>(
  entries: readonly { value: T; ariaLabel: string; flag?: FlagCode }[],
): LanguageOption<T>[] {
  return entries.map(({ value, ariaLabel, flag }) => ({
    value,
    label: localeLabel(value),
    ariaLabel,
    ...(flag === undefined ? {} : { flag }),
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
      {options.map((option) => {
        const selected = locale === option.value;
        return (
          <IconButton
            key={option.value}
            type="button"
            onClick={() => {
              onLocaleChange(option.value);
            }}
            aria-label={option.ariaLabel}
            aria-pressed={selected}
            sx={{
              width: 36,
              height: 36,
              p: 0.75,
              border: 1,
              borderColor: selected ? 'primary.main' : 'transparent',
              borderRadius: 1,
            }}
          >
            {option.flag === undefined ? (
              <Box
                component="span"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  color: selected ? 'text.primary' : 'text.secondary',
                }}
              >
                {option.label}
              </Box>
            ) : (
              <FlagIcon code={option.flag} />
            )}
          </IconButton>
        );
      })}
    </Stack>
  );
}
