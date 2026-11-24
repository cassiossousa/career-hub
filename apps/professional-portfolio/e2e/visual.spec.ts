import { expect, test } from '@playwright/test';

import { routePaths } from '../src/app/routePaths';

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-360', width: 360, height: 800 },
] as const;

// `/projects` is intentionally excluded: its content is synced from GitHub and
// changes upstream, which would make the baseline churn on unrelated PRs.
const routes = [
  { path: routePaths.home, name: 'home' },
  { path: routePaths.workExperience, name: 'work-experience' },
] as const;

test.describe('visual regression', () => {
  // Freeze the clock so year-dependent copy (e.g. `yearsSince(2016)` on the
  // home page) renders identically on every run — otherwise baselines go stale
  // every Jan 1.
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-01T00:00:00Z') });
  });

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
