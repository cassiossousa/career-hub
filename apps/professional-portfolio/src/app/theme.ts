import {
  createBrandedTheme,
  parseThemeMode,
  systemThemeMode,
  type ThemeMode,
} from '@career-hub/ui/theme';
import type { createTheme } from '@mui/material/styles';
import { storageGetItem } from './storage';

export const THEME_STORAGE_KEY = 'portfolio-theme';

export const appThemes: Record<ThemeMode, ReturnType<typeof createTheme>> = {
  light: createBrandedTheme('light'),
  dark: createBrandedTheme('dark'),
};

export function initialThemeMode(): ThemeMode {
  return parseThemeMode(storageGetItem(THEME_STORAGE_KEY)) ?? systemThemeMode();
}
