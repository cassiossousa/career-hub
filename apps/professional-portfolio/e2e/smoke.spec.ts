import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/work-experience', '/projects', '/resume'];

for (const route of publicRoutes) {
  test(`${route} renders and passes WCAG AA accessibility`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect(page.locator('main')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}

test('project details route renders a real project', async ({ page }) => {
  await page.goto('/projects/sudoku-next');

  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveURL(/\/projects\/sudoku-next/);
});

test('keyboard tab order only lands on visible focusable elements', async ({
  page,
}) => {
  await page.goto('/');

  const focusedTags = new Set<string>();

  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');

    const focusState = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return null;
      const rect = active.getBoundingClientRect();
      const style = window.getComputedStyle(active);
      return {
        tag: active.tagName,
        isVisible:
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none',
      };
    });

    if (focusState) {
      focusedTags.add(focusState.tag);
      expect(focusState.isVisible).toBe(true);
    }
  }

  expect(focusedTags.size).toBeGreaterThan(1);
});

test('projects list navigates to project details', async ({ page }) => {
  await page.goto('/projects');

  const firstProjectLink = page.locator('main a[href^="/projects/"]').first();
  await expect(firstProjectLink).toBeVisible();
  await firstProjectLink.click();

  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+/);
  await expect(page.locator('main')).toBeVisible();
});
