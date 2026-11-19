import type { ThemeOptions } from '@mui/material/styles';

export const brandedComponents: ThemeOptions['components'] = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius:
          typeof theme.shape.borderRadius === 'number'
            ? theme.shape.borderRadius * 1.5
            : `calc(${theme.shape.borderRadius} * 1.5)`,
      }),
    },
  },
};
