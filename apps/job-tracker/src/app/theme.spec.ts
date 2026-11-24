import {
  CHIP_COLOR_NAMES,
  CHIP_TINT_ALPHA,
  darkChipLabelColors,
  lightChipLabelColors,
} from '@career-hub/ui/theme';
import { appThemes } from './theme';

type Rgba = readonly [number, number, number, number];

function parseColor(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1] ?? '';
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : raw;
    const int = Number.parseInt(full, 16);
    return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff, 1];
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = (rgb[1] ?? '').split(',').map((p) => Number.parseFloat(p));
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
  }
  throw new Error(`Unsupported color format: ${value}`);
}

// Filled chips paint contrastText (often translucent black in dark mode)
// over the palette main color, so the effective foreground must be
// composited before measuring contrast.
function compositeOver(fg: string, bg: string): Rgba {
  const [fr, fgc, fb, fa] = parseColor(fg);
  const [br, bgc, bb] = parseColor(bg);
  return [
    fr * fa + br * (1 - fa),
    fgc * fa + bgc * (1 - fa),
    fb * fa + bb * (1 - fa),
    1,
  ];
}

function linearChannel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgba): number {
  return (
    0.2126 * linearChannel(r) +
    0.7152 * linearChannel(g) +
    0.0722 * linearChannel(b)
  );
}

function contrastRatio(fg: string, bg: string): number {
  const f = luminance(compositeOver(fg, bg));
  const b = luminance(parseColor(bg));
  return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
}

const FILLED_COLORS = [
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
] as const;

type AppTheme = (typeof appThemes)[keyof typeof appThemes];
type ChipColorName = (typeof CHIP_COLOR_NAMES)[number];

const themeSurfaces = () =>
  Object.values(appThemes).flatMap((theme) =>
    [theme.palette.background.default, theme.palette.background.paper].map(
      (surface) => ({ palette: theme.palette, surface }),
    ),
  );

const expectContrast = (fg: string, bg: string, min: number) => {
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
};

const expectChipLabelContrast = (theme: AppTheme, color: ChipColorName) => {
  const isDark = theme.palette.mode === 'dark';
  const paper = theme.palette.background.paper;
  const tint =
    color === 'default'
      ? theme.palette.text.secondary
      : theme.palette[color].main;
  const [r, g, b] = parseColor(tint);
  const alpha = CHIP_TINT_ALPHA[isDark ? 'dark' : 'light'];
  const tintedSurface = compositeOver(
    `rgba(${r}, ${g}, ${b}, ${alpha})`,
    paper,
  );
  const labels = isDark ? darkChipLabelColors : lightChipLabelColors;
  const labelLuminance = luminance(parseColor(labels[color]));
  // Filled chips: label over the tint composited on paper.
  const filledRatio =
    (Math.max(labelLuminance, luminance(tintedSurface)) + 0.05) /
    (Math.min(labelLuminance, luminance(tintedSurface)) + 0.05);
  expect(filledRatio).toBeGreaterThanOrEqual(4.5);
  // Outlined chips: label sits directly on the surface.
  const surfaceRatio =
    (Math.max(labelLuminance, luminance(parseColor(paper))) + 0.05) /
    (Math.min(labelLuminance, luminance(parseColor(paper))) + 0.05);
  expect(surfaceRatio).toBeGreaterThanOrEqual(4.5);
};

describe('appThemes', () => {
  it('provides light and dark themes with matching palette modes', () => {
    expect(appThemes.light.palette.mode).toBe('light');
    expect(appThemes.dark.palette.mode).toBe('dark');
  });

  it('keeps body text at WCAG AA (4.5:1) on every surface, both modes', () => {
    for (const { palette, surface } of themeSurfaces()) {
      expectContrast(palette.text.primary, surface, 4.5);
      expectContrast(palette.text.secondary, surface, 4.5);
    }
  });

  it('keeps functional borders at WCAG non-text contrast (3:1), both modes', () => {
    // palette.divider backs card/accordion/input/entry-box boundaries —
    // #e2e8f0 previously measured ~1.2:1 and was nearly invisible.
    for (const { palette, surface } of themeSurfaces()) {
      expectContrast(palette.divider, surface, 3);
    }
  });

  it('keeps accent and status contrastText at WCAG AA on their mains', () => {
    for (const theme of Object.values(appThemes)) {
      for (const color of FILLED_COLORS) {
        const { main, contrastText } = theme.palette[color];
        expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps filled-chip label contrast at WCAG AA (4.5:1) in both modes', () => {
    for (const theme of Object.values(appThemes)) {
      for (const color of CHIP_COLOR_NAMES) {
        expectChipLabelContrast(theme, color);
      }
    }
  });
});
