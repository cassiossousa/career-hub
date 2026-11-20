import type { ThemeOptions } from '@mui/material/styles';

// Soft, layered shadows (shadcn/Tailwind-style) instead of MUI's default
// heavy black elevation. Index 0 is always 'none'; the rest scale with
// elevation so Cards, Menus, Dialogs and Drawers share one depth language.
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

// Dark-mode chip label colors. In dark mode colored chips are restyled as
// soft tonal chips (see components.ts): a translucent tint of the palette
// color behind light label text instead of a saturated fill. Every entry
// keeps >= 4.5:1 contrast against the composited tint over the dark paper
// surface — verified by apps/job-tracker/src/app/theme.spec.ts.
export const darkChipLabelColors: Record<ChipColorName, string> = {
  default: '#cbd5e1',
  primary: '#93c5fd',
  secondary: '#e2e8f0',
  error: '#fca5a5',
  warning: '#fdba74',
  info: '#7dd3fc',
  success: '#4ade80',
};

export const brandedTokens: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    // MUI's default info/warning mains fail WCAG AA contrast (3.86:1 / 3.11:1)
    // behind the white text of filled Chips; these darker shades pass 4.5:1.
    info: { main: '#0277bd' },
    warning: { main: '#c2410c' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    // #e2e8f0 measured ~1.2:1 on white — card/accordion/entry borders were
    // nearly invisible. #7c8aa5 keeps a muted hairline while clearing the
    // WCAG 1.4.11 non-text contrast floor (3:1) at ~3.5:1.
    divider: '#7c8aa5',
  },
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

// Dark variant is a first-class theme, not an inversion: its own surface,
// text and divider tokens (shadows barely read on dark, so borders carry
// the separation — see AGENTS.md ui-ux skill §3.4/§4.2).
export const brandedTokensDark: ThemeOptions = {
  ...brandedTokens,
  palette: {
    mode: 'dark',
    // Bright dark-mode mains need dark label text to keep filled chips and
    // contained buttons at WCAG AA contrast (white fails below 4.5:1).
    primary: { main: '#3b82f6', contrastText: 'rgba(0, 0, 0, 0.87)' },
    secondary: { main: '#94a3b8' },
    background: { default: '#0b1120', paper: '#111a2e' },
    text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    divider: '#26324a',
    success: { main: '#22c55e' },
    warning: { main: '#f97316' },
    error: { main: '#ef4444', contrastText: 'rgba(0, 0, 0, 0.87)' },
    info: { main: '#38bdf8' },
  },
};
