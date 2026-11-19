import { Box, IconButton, Stack } from '@mui/material';

export interface LanguageOption<T extends string> {
  value: T;
  label: string;
  ariaLabel: string;
}

function localeLabel(value: string): string {
  return value.slice(0, 2).toUpperCase();
}

export function createLanguageOptions<T extends string>(
  entries: readonly { value: T; ariaLabel: string }[],
): LanguageOption<T>[] {
  return entries.map(({ value, ariaLabel }) => ({
    value,
    label: localeLabel(value),
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
            size="small"
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
                height: 18,
                px: 0.5,
                border: 1,
                borderColor: selected ? 'action.active' : 'divider',
                borderRadius: 0.5,
                color: selected ? 'text.primary' : 'text.secondary',
                bgcolor: selected ? 'action.selected' : 'transparent',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.5,
                lineHeight: 1,
              }}
            >
              {option.label}
            </Box>
          </IconButton>
        );
      })}
    </Stack>
  );
}
