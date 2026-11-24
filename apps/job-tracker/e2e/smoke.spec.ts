import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { publicRoutePaths } from '../src/app/routePaths';
import { LOCALE_STORAGE_KEY } from '../src/i18n/localeStorageKey';

const LOCALES = ['en', 'pt-BR'] as const;
const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'desktop-1280', width: 1280, height: 800 },
] as const;
async function setLocale(page: Page, locale: string) {
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: LOCALE_STORAGE_KEY, value: locale },
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('job-tracker smoke matrix', () => {
  for (const locale of LOCALES) {
    for (const viewport of VIEWPORTS) {
      test(`${locale} @ ${viewport.name}: dashboard renders without overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await setLocale(page, locale);
        await page.goto('/');
        await expect(page.locator('h1, h2').first()).toBeVisible();
        await expectNoHorizontalOverflow(page);
      });
    }
  }

  test('all primary routes render in pt-BR @ 360px without overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await setLocale(page, 'pt-BR');
    for (const route of publicRoutePaths) {
      await page.goto(route);
      await expect(
        page.locator('h1, h2, [role="alert"]').first(),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('WCAG 2.2 AA audit on dashboard (en + pt-BR)', async ({ page }) => {
    for (const locale of LOCALES) {
      await setLocale(page, locale);
      await page.goto('/');
      await expect(page.locator('h1, h2').first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });

  test('interactive elements meet 24px target size and 12px font floor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const violations = await page.evaluate(() => {
      const smallTargets: string[] = [];
      const tinyText: string[] = [];

      for (const el of Array.from(
        document.querySelectorAll('a[href], button, [role="button"]'),
      )) {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (
          style.visibility === 'hidden' ||
          style.display === 'none' ||
          rect.width === 0 ||
          rect.height === 0
        ) {
          continue;
        }
        if (rect.width < 24 || rect.height < 24) {
          const ariaLabel = el.getAttribute('aria-label');
          smallTargets.push(
            `${el.tagName.toLowerCase()}${ariaLabel ? ` "${ariaLabel}"` : ''} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
          );
        }
      }

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        const text = node.textContent?.trim() ?? '';
        if (parent && text && parent.checkVisibility()) {
          const size = parseFloat(getComputedStyle(parent).fontSize);
          if (size < 12) {
            const parentLabel = parent.getAttribute('aria-label');
            tinyText.push(
              `${parent.tagName.toLowerCase()}${parentLabel ? ` "${parentLabel}"` : ''} ${size}px "${text.slice(0, 30)}"`,
            );
          }
        }
        node = walker.nextNode();
      }
      return { smallTargets, tinyText };
    });

    expect(violations.smallTargets).toEqual([]);
    expect(violations.tinyText).toEqual([]);
  });
});
