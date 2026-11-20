import type {
  CSSInterpolation,
  Theme,
  ThemeOptions,
} from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  CHIP_COLOR_NAMES,
  type ChipColorName,
  darkChipLabelColors,
} from './tokens';

// Saturated fills glare on dark surfaces, so dark mode swaps every colored
// chip for a soft tonal treatment: translucent tint + light label + hairline
// ring (filled) or tinted border (outlined). Label colors come from
// darkChipLabelColors, chosen for WCAG AA over the composited tint.
function chipTintColor(theme: Theme, color: ChipColorName): string {
  return color === 'default'
    ? theme.palette.text.secondary
    : theme.palette[color].main;
}

function darkChipOverrides(theme: Theme): CSSInterpolation {
  const styles: Record<string, CSSInterpolation> = {};
  for (const color of CHIP_COLOR_NAMES) {
    const tint = chipTintColor(theme, color);
    const label = darkChipLabelColors[color];
    const cls = color.charAt(0).toUpperCase() + color.slice(1);
    styles[`&.MuiChip-filled.MuiChip-color${cls}`] = {
      color: label,
      backgroundColor: alpha(tint, 0.14),
      boxShadow: `inset 0 0 0 1px ${alpha(tint, 0.35)}`,
      '&:hover': { backgroundColor: alpha(tint, 0.22) },
      '&.Mui-disabled': { opacity: theme.palette.action.disabledOpacity },
    };
    styles[`&.MuiChip-outlined.MuiChip-color${cls}`] = {
      color: label,
      borderColor: alpha(tint, 0.5),
      '&:hover': {
        borderColor: alpha(tint, 0.8),
        backgroundColor: alpha(tint, 0.08),
      },
    };
  }
  return styles;
}

export const brandedComponents: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: ({ theme }) =>
        theme.palette.mode === 'dark' ? darkChipOverrides(theme) : {},
    },
  },
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
