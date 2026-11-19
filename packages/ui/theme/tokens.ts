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

export const brandedTokens: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    divider: '#e2e8f0',
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
