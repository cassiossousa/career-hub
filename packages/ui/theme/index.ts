import { createTheme } from '@mui/material/styles';
import { brandedComponents } from './components';
import { brandedTokens, brandedTokensDark } from './tokens';

export type ThemeMode = 'light' | 'dark';

export function parseThemeMode(value: string | null): ThemeMode | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function systemThemeMode(): ThemeMode {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function createBrandedTheme(
  mode: ThemeMode = 'light',
): ReturnType<typeof createTheme> {
  const tokens = mode === 'dark' ? brandedTokensDark : brandedTokens;
  return createTheme({
    ...tokens,
    components: brandedComponents,
  });
}
