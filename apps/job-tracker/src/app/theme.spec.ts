import { CHIP_COLOR_NAMES, darkChipLabelColors } from '@career-hub/ui/theme';
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

describe('appThemes', () => {
  it('provides light and dark themes with matching palette modes', () => {
    expect(appThemes.light.palette.mode).toBe('light');
    expect(appThemes.dark.palette.mode).toBe('dark');
  });

  it('defines readable text and background colors in both modes', () => {
    for (const theme of Object.values(appThemes)) {
      expect(theme.palette.background.default).toBeTruthy();
      expect(theme.palette.text.primary).toBeTruthy();
    }
  });

  it('keeps filled-chip label contrast at WCAG AA (4.5:1) in both modes', () => {
    const colors = [
      'primary',
      'secondary',
      'error',
      'warning',
      'info',
      'success',
    ] as const;
    for (const theme of Object.values(appThemes)) {
      for (const color of colors) {
        const { main, contrastText } = theme.palette[color];
        expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps dark-mode chip label contrast at WCAG AA over tint and paper', () => {
    const dark = appThemes.dark;
    const paper = dark.palette.background.paper;
    for (const color of CHIP_COLOR_NAMES) {
      const tint =
        color === 'default'
          ? dark.palette.text.secondary
          : dark.palette[color].main;
      const [r, g, b] = parseColor(tint);
      const tintedSurface = compositeOver(
        `rgba(${r}, ${g}, ${b}, 0.14)`,
        paper,
      );
      const labelLuminance = luminance(parseColor(darkChipLabelColors[color]));
      // Filled chips: label over the 14% tint composited on paper.
      const filledRatio =
        (Math.max(labelLuminance, luminance(tintedSurface)) + 0.05) /
        (Math.min(labelLuminance, luminance(tintedSurface)) + 0.05);
      expect(filledRatio).toBeGreaterThanOrEqual(4.5);
      // Outlined chips: label sits directly on the surface.
      const surfaceRatio =
        (Math.max(labelLuminance, luminance(parseColor(paper))) + 0.05) /
        (Math.min(labelLuminance, luminance(parseColor(paper))) + 0.05);
      expect(surfaceRatio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
