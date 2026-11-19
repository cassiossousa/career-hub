import { appTheme } from './theme';

describe('appTheme', () => {
  it('uses the dark palette mode', () => {
    expect(appTheme.palette.mode).toBe('dark');
  });

  it('defines readable text and background colors', () => {
    expect(appTheme.palette.background.default).toBeTruthy();
    expect(appTheme.palette.text.primary).toBeTruthy();
  });
});
