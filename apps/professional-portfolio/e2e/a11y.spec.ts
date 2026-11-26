import {
  expectMainLandmarks,
  expectNoHorizontalOverflow,
  expectSkipLinkFocusesMain,
  test,
} from '@career-hub/ui/e2e';
import { expect } from '@playwright/test';
import { publicRoutePaths, routePaths } from '../src/app/routePaths';

test.describe('deep accessibility', () => {
  test('every public route exposes landmarks and exactly one h1', async ({
    page,
  }) => {
    for (const route of publicRoutePaths) {
      await page.goto(route);
      await expectMainLandmarks(page);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.getByRole('navigation').count()).toBeGreaterThan(0);
    }
  });

  test('heading levels never skip on the home page', async ({ page }) => {
    await page.goto(routePaths.home);
    await expect(page.locator('main')).toBeVisible();

    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((elements) =>
        elements.map((element) => Number(element.tagName.slice(1))),
      );

    expect(levels.length).toBeGreaterThan(0);
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      const previous = levels[index - 1];
      const current = levels[index];
      if (previous === undefined || current === undefined) {
        throw new Error('unexpected empty heading level');
      }
      expect(current).toBeLessThanOrEqual(previous + 1);
    }
  });

  test('skip link is the first tab stop and moves focus to main', async ({
    page,
  }) => {
    await expectSkipLinkFocusesMain(page, routePaths.home);
  });

  test('content remains usable under reduced-motion and forced-colors', async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: 'reduce',
      forcedColors: 'active',
    });
    await page.goto(routePaths.home);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('WCAG 1.4.12 text-spacing overrides cause no horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(routePaths.home);
    await page.addStyleTag({
      content:
        '*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }',
    });

    await expectNoHorizontalOverflow(page);
  });

  test('content remains usable at 200% zoom', async ({ page }) => {
    await page.goto(routePaths.home);
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    await expectNoHorizontalOverflow(page);
  });
});
