import type {
  CSSInterpolation,
  Theme,
  ThemeOptions,
} from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  CHIP_COLOR_NAMES,
  CHIP_TINT_ALPHA,
  type ChipColorName,
  darkChipLabelColors,
  lightChipLabelColors,
} from './tokens';

// Chips get a soft tonal treatment in BOTH modes (Primer/Linear-style):
// a translucent tint of the palette color behind a high-contrast label,
// plus a hairline ring (filled) or tinted border (outlined). Label colors
// are chosen for WCAG AA over the composited tint — verified by
// apps/job-tracker/src/app/theme.spec.ts.
function chipTintColor(theme: Theme, color: ChipColorName): string {
  return color === 'default'
    ? theme.palette.text.secondary
    : theme.palette[color].main;
}

function chipLabelColor(theme: Theme, color: ChipColorName): string {
  const labels =
    theme.palette.mode === 'dark' ? darkChipLabelColors : lightChipLabelColors;
  return labels[color];
}

function chipOverrides(theme: Theme): CSSInterpolation {
  const isDark = theme.palette.mode === 'dark';
  const tintAlpha = CHIP_TINT_ALPHA[isDark ? 'dark' : 'light'];
  const hoverAlpha = isDark ? 0.22 : 0.2;
  const ringAlpha = isDark ? 0.35 : 0.28;
  const borderAlpha = isDark ? 0.5 : 0.45;
  const borderHoverAlpha = isDark ? 0.8 : 0.7;
  const subtleBgAlpha = isDark ? 0.08 : 0.06;

  const styles: Record<string, CSSInterpolation> = {};
  for (const color of CHIP_COLOR_NAMES) {
    const tint = chipTintColor(theme, color);
    const label = chipLabelColor(theme, color);
    const cls = color.charAt(0).toUpperCase() + color.slice(1);
    styles[`&.MuiChip-filled.MuiChip-color${cls}`] = {
      color: label,
      backgroundColor: alpha(tint, tintAlpha),
      boxShadow: `inset 0 0 0 1px ${alpha(tint, ringAlpha)}`,
      '&:hover': { backgroundColor: alpha(tint, hoverAlpha) },
      '&.Mui-disabled': { opacity: theme.palette.action.disabledOpacity },
    };
    styles[`&.MuiChip-outlined.MuiChip-color${cls}`] = {
      color: label,
      borderColor: alpha(tint, borderAlpha),
      '&:hover': {
        borderColor: alpha(tint, borderHoverAlpha),
        backgroundColor: alpha(tint, subtleBgAlpha),
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
      root: ({ theme }) => chipOverrides(theme),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Border colors come from the semantic border roles via palette.divider
        // (>= 3:1 in both modes) — never MUI's faint default outline.
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.text.secondary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
        },
      }),
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
