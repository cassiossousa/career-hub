import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-360', width: 360, height: 800 },
] as const;

// `/projects` is intentionally excluded: its content is synced from GitHub and
// changes upstream, which would make the baseline churn on unrelated PRs.
const routes = [
  { path: '/', name: 'home' },
  { path: '/work-experience', name: 'work-experience' },
] as const;

test.describe('visual regression', () => {
  // Baselines are only generated for win32 (local) and linux (CI container).
  // macOS font rasterization differs and has no committed baseline.
  test.skip(
    process.platform === 'darwin',
    'No darwin baselines are committed; run visual tests in CI or the Playwright container.',
  );

  for (const route of routes) {
    for (const viewport of viewports) {
      test(`${route.name} ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route.path);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(
          `${route.name}-${viewport.name}.png`,
          {
            fullPage: true,
            animations: 'disabled',
            caret: 'hide',
            maxDiffPixels: 100,
          },
        );
      });
    }
  }
});
