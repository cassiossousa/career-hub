import { appThemes } from './theme';

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
});
