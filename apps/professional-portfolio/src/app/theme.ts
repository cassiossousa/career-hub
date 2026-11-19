import { createBrandedTheme } from '@career-hub/ui/theme';
import { createTheme } from '@mui/material/styles';

const brandedTheme = createBrandedTheme();

export const appTheme = createTheme({
  ...brandedTheme,
});
