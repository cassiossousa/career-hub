import { createBrandedTheme } from '@career-hub/ui/theme';
import { createTheme } from '@mui/material/styles';

const brandedTheme = createBrandedTheme();

export const appTheme = createTheme({
  ...brandedTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    secondary: { main: '#94a3b8' },
    background: { default: '#0b1120', paper: '#111a2e' },
    text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    divider: '#26324a',
    success: { main: '#22c55e' },
    warning: { main: '#f97316' },
    error: { main: '#ef4444' },
    info: { main: '#38bdf8' },
  },
});
