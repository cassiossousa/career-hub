import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/work-experience', '/projects', '/resume'];

test.describe('resilience: storage, network, and viewport faults', () => {
  test('app renders when localStorage is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Storage.prototype, 'getItem', {
        value: () => {
          throw new Error('Storage disabled');
        },
      });
      Object.defineProperty(Storage.prototype, 'setItem', {
        value: () => {
          throw new Error('Storage disabled');
        },
      });
    });

    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });

  test('invalid stored locale falls back to English', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('lang', 'klingon');
    });

    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Senior Software Engineer' }),
    ).toBeVisible();
  });

  test('client-side navigation works while offline', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();

    await context.setOffline(true);
    await page.getByRole('link', { name: 'Projects' }).first().click();

    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator('main')).toBeVisible();
  });

  for (const route of publicRoutes) {
    test(`no horizontal overflow at 360px on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(route);

      await expect(page.locator('main')).toBeVisible();

      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(hasOverflow).toBe(false);
    });
  }

  for (const route of publicRoutes) {
    test(`no horizontal overflow in pt-BR at 360px on ${route}`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('lang', 'pt-BR');
      });
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(route);

      await expect(page.locator('main')).toBeVisible();

      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(hasOverflow).toBe(false);
    });
  }
});
