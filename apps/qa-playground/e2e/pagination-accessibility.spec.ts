/**
 * Pagination QA — WCAG 2.1 AA axe automation + ARIA / keyboard a11y checks.
 *
 * Component type: **navigation** — scoped axe on `pagination-qa-*` story bands.
 *
 * **QA rule:** Fail on Pagination defects; do not disable axe rules to hide violations.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  formatAxeViolations,
  openPaginationTestScenarios,
  PAGINATION_SHOWCASE_AXE_SCOPE,
  PAGINATION_TAG_SET,
  paginationRoot,
  qaStep,
  runPaginationAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writePaginationAxeArtefact,
  writePaginationAxeHtmlReport,
  clickNav,
  expectCurrentPage,
  expectFocusVisible,
  expectNavEnabled,
  navButton,
  pageButton,
  readLiveRegion,
tabbablePageButton,
} from './pagination/pagination-qa-support';
import { PAGINATION_DATA_SECTIONS, PAGINATION_ROOT_TESTIDS } from './pagination-playground/manifest';
import {
  PAGINATION_ARIA_VALIDITY_TEST,
  PAGINATION_BUTTON_NAME_TEST,
PAGINATION_LIVE_REGION_TEST,
  PAGINATION_NAV_LANDMARK_TEST,
  PAGINATION_REFLOW_320_TEST
} from './qa-component-test-labels';

test.beforeEach(async ({ page }) => {
  await openPaginationTestScenarios(page);
});

test.describe('Accessibility', { tag: PAGINATION_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA axe scan — zero serious/critical + HTML report', async ({ page }) => {
    await qaStep('Full showcase axe with WCAG tags', async () => {
      const results = await runPaginationAxePageScan(page, PAGINATION_SHOWCASE_AXE_SCOPE);
      writePaginationAxeArtefact(results);
      writePaginationAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const section of PAGINATION_DATA_SECTIONS) {
    test(`[a11y] data-section="${section}" — zero serious/critical`, async ({ page }) => {
      await qaStep(`Scoped axe: ${section}`, async () => {
        const results = await new AxeBuilder({ page })
          .include(`[data-section="${section}"]`)
          .withTags([...WCAG_AA_TAGS])
          .analyze();
        const blocking = seriousOrCritical(results.violations);
        expect(blocking, `Section "${section}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
      });
    });
  }

  test(`[a11y] ${PAGINATION_NAV_LANDMARK_TEST}`, async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
    await qaStep('aria-label on <nav>', async () => {
      await expect(root).toHaveAttribute('aria-label', 'Pagination QA default');
    });
  });

  test('[a11y] selected page exposes aria-current="page"', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await qaStep('Current page marker', async () => {
      await expectCurrentPage(root, 5, tid);
      const current = root.locator('button[aria-current="page"]');
      await expect(current).toHaveCount(1);
    });
  });

  test('[a11y] navigation buttons have accessible names', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.firstLastOn);
    await qaStep('First / previous / next / last names', async () => {
      for (const name of [
        'Go to first page',
        'Go to previous page',
        'Go to next page',
        'Go to last page',
      ] as const) {
        await expect(root.getByRole('button', { name })).toHaveAccessibleName(name);
      }
    });
  });

  test('[a11y] numbered page buttons have Go to page N names', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await qaStep('Visible chips expose exact aria-labels', async () => {
      for (const p of [1, 5, 10] as const) {
        await expect(pageButton(root, p, tid)).toHaveAccessibleName(`Go to page ${p}`);
      }
    });
  });

  test(`[a11y] ${PAGINATION_LIVE_REGION_TEST}`, async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.default);
    await qaStep('Live region text updates', async () => {
      await expect(await readLiveRegion(root)).toMatch(/Page 5 of 10/);
      await clickNav(root, 'next');
      await expect(await readLiveRegion(root)).toMatch(/Page 6 of 10/);
    });
  });

  test('[a11y] disabled previous on first page', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.edgeFirst);
    await qaStep('Previous button disabled', async () => {
      await expectNavEnabled(root, 'previous', false);
    });
  });

  test('[a11y] disabled next on last page', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.edgeLast);
    await qaStep('Next button disabled', async () => {
      await expectNavEnabled(root, 'next', false);
    });
  });

  test('[a11y] tab order reaches multiple distinct targets', async ({ page }) => {
    await qaStep('Tab cycle diversity', async () => {
      const seen = new Set<string>();
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return `${el.tagName}:${el.getAttribute('aria-label') ?? el.textContent?.slice(0, 24) ?? ''}`;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size).toBeGreaterThan(3);
    });
  });

  test('[a11y] keyboard-only — ArrowRight changes page from focused chip', async ({ page }) => {
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await qaStep('ArrowRight without mouse', async () => {
      await tabbablePageButton(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[a11y] focus visible on Tab', async ({ page }) => {
    await qaStep('Focus ring', async () => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
    });
  });

  test('[a11y] disabled pagination — page buttons are disabled', async ({ page }) => {
    const root = paginationRoot(page, PAGINATION_ROOT_TESTIDS.disabled);
    await qaStep('disabled attribute', async () => {
      await expect(pageButton(root, 4, PAGINATION_ROOT_TESTIDS.disabled)).toBeDisabled();
    });
  });

  test(`[a11y] ${PAGINATION_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(PAGINATION_SHOWCASE_AXE_SCOPE)
      .withRules([
        'aria-roles',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-command-name',
      ])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${PAGINATION_BUTTON_NAME_TEST}`, async ({ page }) => {
const results = await new AxeBuilder({ page })
      .include(PAGINATION_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${PAGINATION_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openPaginationTestScenarios(page);
    const tid = PAGINATION_ROOT_TESTIDS.default;
    const root = paginationRoot(page, tid);
    await qaStep('Landmark and current page still exposed at 320px', async () => {
      await expect(root).toBeVisible();
      await expectCurrentPage(root, 5, tid);
      await clickNav(root, 'next');
      await expectCurrentPage(root, 6, tid);
    });
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });
});
