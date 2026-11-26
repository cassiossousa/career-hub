import { test } from '@career-hub/ui/e2e';
import { expect } from '@playwright/test';

test.describe('resilience: storage faults', () => {
  test('app renders when Web Storage reads and writes fail', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const message = 'Storage disabled';
      Object.defineProperty(Storage.prototype, 'getItem', {
        value: () => {
          throw new Error(message);
        },
      });
      Object.defineProperty(Storage.prototype, 'setItem', {
        value: () => {
          throw new Error(message);
        },
      });
    });

    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });
});
