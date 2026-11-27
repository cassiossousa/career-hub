import { test as base, expect, type Page } from '@playwright/test';

// Fails the test when the page throws an uncaught exception at any point —
// React render errors, failed dynamic imports, and unhandled rejections all
// surface as pageerror and would otherwise only show up as a broken screenshot.
export const test = base.extend({
  page: async ({ page }, use) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    // eslint-disable-next-line @eslint-react/rules-of-hooks, react-hooks/rules-of-hooks -- `use` is the Playwright fixture callback, not a React hook
    await use(page);
    expect(pageErrors, 'uncaught page errors').toEqual([]);
  },
});

/** Shared landmark contract: exactly one visible main region. */
export async function expectMainLandmarks(page: Page): Promise<void> {
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
}

/** Shared overflow contract: content never scrolls horizontally. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/**
 * Shared skip-link contract: first Tab stop is the "Skip to content" link
 * and activating it moves focus to the main landmark.
 */
export async function expectSkipLinkFocusesMain(
  page: Page,
  url: string,
): Promise<void> {
  await page.goto(url);
  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  // Wait for hydration before pressing Tab — an early Tab is consumed by the
  // not-yet-mounted link and focus never lands on it.
  await expect(skipLink).toBeAttached();
  await page.keyboard.press('Tab');

  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('main')).toBeFocused();
}
