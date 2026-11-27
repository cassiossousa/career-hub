import { expectSkipLinkFocusesMain, test } from '@career-hub/ui/e2e';
import { expect } from '@playwright/test';
import { routePaths } from '../src/app/routePaths';
import { FILTERS_STORAGE_KEY } from '../src/store/filterStore';

test.describe('url-synced filters and navigation', () => {
  test('deep link with filter params hydrates state and survives reload', async ({
    page,
  }) => {
    await page.goto('/jobs?level=senior&remote=1');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/level=senior/);

    await expect
      .poll(
        () =>
          page.evaluate(
            (key) => window.localStorage.getItem(key),
            FILTERS_STORAGE_KEY,
          ),
        { timeout: 15_000 },
      )
      .toContain('senior');

    await page.reload();
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/level=senior/);
  });

  test('back/forward navigation restores the filtered URL', async ({
    page,
  }) => {
    await page.goto('/jobs?level=senior');
    await expect(page.locator('main')).toBeVisible();

    await page.goto(routePaths.applications);
    await expect(page.locator('main')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/jobs\?.*level=senior/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('invalid filter params are normalized away without crashing', async ({
    page,
  }) => {
    await page.goto('/jobs?level=not-a-level&age=999');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).not.toHaveURL(/level=not-a-level/);
    await expect(page).not.toHaveURL(/age=999/);
  });

  test('skip link moves focus to the main landmark', async ({ page }) => {
    await expectSkipLinkFocusesMain(page, '/');
  });
});
