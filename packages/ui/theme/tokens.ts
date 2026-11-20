import type { ThemeOptions } from '@mui/material/styles';
import { darkSemantic, lightSemantic, type SemanticColors } from './semantic';

// Soft, layered shadows (shadcn/Tailwind-style) instead of MUI's default
// heavy black elevation. Index 0 is always 'none'; the rest scale with
// elevation so Cards, Menus, Dialogs and Drawers share one depth language.
// Dark mode relies on surface steps + borders instead — shadows barely read.
const softShadows: NonNullable<ThemeOptions['shadows']> = [
  'none',
  '0 1px 2px rgba(15, 23, 42, 0.06)',
  '0 1px 2px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.06)',
  '0 1px 3px rgba(15, 23, 42, 0.07), 0 4px 14px rgba(15, 23, 42, 0.07)',
  '0 2px 4px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
  '0 4px 8px rgba(15, 23, 42, 0.07), 0 12px 32px rgba(15, 23, 42, 0.1)',
  '0 6px 12px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(15, 23, 42, 0.12)',
  '0 8px 16px rgba(15, 23, 42, 0.09), 0 20px 48px rgba(15, 23, 42, 0.14)',
  '0 10px 20px rgba(15, 23, 42, 0.1), 0 24px 56px rgba(15, 23, 42, 0.16)',
  '0 12px 24px rgba(15, 23, 42, 0.11), 0 28px 64px rgba(15, 23, 42, 0.18)',
  '0 14px 28px rgba(15, 23, 42, 0.12), 0 32px 72px rgba(15, 23, 42, 0.2)',
  '0 16px 32px rgba(15, 23, 42, 0.13), 0 36px 80px rgba(15, 23, 42, 0.22)',
  '0 18px 36px rgba(15, 23, 42, 0.14), 0 40px 88px rgba(15, 23, 42, 0.24)',
  '0 20px 40px rgba(15, 23, 42, 0.15), 0 44px 96px rgba(15, 23, 42, 0.26)',
  '0 22px 44px rgba(15, 23, 42, 0.16), 0 48px 104px rgba(15, 23, 42, 0.28)',
  '0 24px 48px rgba(15, 23, 42, 0.17), 0 52px 112px rgba(15, 23, 42, 0.3)',
  '0 26px 52px rgba(15, 23, 42, 0.18), 0 56px 120px rgba(15, 23, 42, 0.32)',
  '0 28px 56px rgba(15, 23, 42, 0.19), 0 60px 128px rgba(15, 23, 42, 0.34)',
  '0 30px 60px rgba(15, 23, 42, 0.2), 0 64px 136px rgba(15, 23, 42, 0.36)',
  '0 32px 64px rgba(15, 23, 42, 0.21), 0 68px 144px rgba(15, 23, 42, 0.38)',
  '0 34px 68px rgba(15, 23, 42, 0.22), 0 72px 152px rgba(15, 23, 42, 0.4)',
  '0 36px 72px rgba(15, 23, 42, 0.23), 0 76px 160px rgba(15, 23, 42, 0.42)',
  '0 38px 76px rgba(15, 23, 42, 0.24), 0 80px 168px rgba(15, 23, 42, 0.44)',
  '0 40px 80px rgba(15, 23, 42, 0.25), 0 84px 176px rgba(15, 23, 42, 0.46)',
  '0 42px 84px rgba(15, 23, 42, 0.26), 0 88px 184px rgba(15, 23, 42, 0.48)',
];

export const CHIP_COLOR_NAMES = [
  'default',
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
] as const;

export type ChipColorName = (typeof CHIP_COLOR_NAMES)[number];

// Chip label colors sit on a translucent tint of the palette color composited
// over the paper surface — every entry keeps >= 4.5:1, verified by
// apps/job-tracker/src/app/theme.spec.ts.
export const lightChipLabelColors: Record<ChipColorName, string> = {
  default: '#475569',
  primary: '#4338ca',
  secondary: '#6d28d9',
  error: '#b91c1c',
  warning: '#92400e',
  info: '#075985',
  success: '#166534',
};

export const darkChipLabelColors: Record<ChipColorName, string> = {
  default: '#cbd5e1',
  primary: '#c7d2fe',
  secondary: '#ddd6fe',
  error: '#fca5a5',
  warning: '#fde68a',
  info: '#bae6fd',
  success: '#86efac',
};

function statusPalette(
  status: SemanticColors['status'][keyof SemanticColors['status']],
) {
  return {
    main: status.solid,
    light: status.light,
    dark: status.dark,
    contrastText: status.onSolid,
  };
}

// Projects the semantic roles onto every MUI palette key a component can
// touch — nothing falls back to MUI defaults (Primer/Carbon lesson: assign
// the whole palette per mode, don't patch a few keys).
function paletteFrom(mode: 'light' | 'dark'): ThemeOptions['palette'] {
  const pick = <T>(dark: T, light: T): T => (mode === 'dark' ? dark : light);
  const s = pick(darkSemantic, lightSemantic);
  return {
    mode,
    primary: {
      main: s.accent.default,
      light: s.accent.hover,
      dark: s.accent.pressed,
      contrastText: s.accent.onAccent,
    },
    secondary: {
      main: s.secondaryAccent.default,
      light: s.secondaryAccent.hover,
      dark: s.secondaryAccent.pressed,
      contrastText: s.secondaryAccent.onAccent,
    },
    error: statusPalette(s.status.error),
    warning: statusPalette(s.status.warning),
    info: statusPalette(s.status.info),
    success: statusPalette(s.status.success),
    background: {
      default: s.surfaces.canvas,
      paper: s.surfaces.surface,
    },
    text: {
      primary: s.text.primary,
      secondary: s.text.secondary,
      disabled: s.text.disabled,
    },
    divider: s.border.default,
    action: {
      // The rgba strings already carry their alpha; the *Opacity fields must
      // mirror it because some MUI components multiply them via alpha().
      hover: s.action.hover,
      hoverOpacity: pick(0.08, 0.06),
      selected: s.action.selected,
      selectedOpacity: pick(0.14, 0.1),
      focus: s.action.focus,
      focusOpacity: pick(0.2, 0.16),
      active: s.action.active,
      activatedOpacity: pick(0.16, 0.12),
      disabled: s.action.disabled,
      disabledOpacity: 0.38,
      disabledBackground: s.action.disabledBackground,
    },
    grey: {
      50: pick('#0b1120', '#f8fafc'),
      100: pick('#111a2e', '#f1f5f9'),
      200: pick('#1a2547', '#e2e8f0'),
      300: pick('#33436b', '#cbd5e1'),
      400: pick('#5d7099', '#94a3b8'),
      500: pick('#7c8aa5', '#64748b'),
      600: pick('#9aa7c7', '#475569'),
      700: pick('#cbd5e1', '#334155'),
      800: pick('#e6ebf5', '#1e293b'),
      900: pick('#f1f5f9', '#0f172a'),
    },
  };
}

export const brandedTokens: ThemeOptions = {
  palette: paletteFrom('light'),
  shape: { borderRadius: 8 },
  shadows: softShadows,
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontSize: '1.875rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    body1: { lineHeight: 1.75 },
  },
};

export const brandedTokensDark: ThemeOptions = {
  ...brandedTokens,
  palette: paletteFrom('dark'),
};
