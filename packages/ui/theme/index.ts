import { createTheme } from '@mui/material/styles';
import { brandedComponents } from './components';
import type { ThemeMode } from './mode';
import { brandedTokens, brandedTokensDark } from './tokens';

export type { ThemeMode } from './mode';
export type { SemanticColors } from './semantic';
export { semanticColors } from './semantic';
export {
  CHIP_COLOR_NAMES,
  type ChipColorName,
  darkChipLabelColors,
  lightChipLabelColors,
} from './tokens';

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
