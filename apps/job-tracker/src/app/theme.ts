import { createBrandedTheme, type ThemeMode } from '@career-hub/ui/theme';
import type { createTheme } from '@mui/material/styles';

export const appThemes: Record<ThemeMode, ReturnType<typeof createTheme>> = {
  light: createBrandedTheme('light'),
  dark: createBrandedTheme('dark'),
};
