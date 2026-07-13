/**
 * PaginationDots QA — WCAG 2.1 AA axe automation + ARIA / keyboard a11y checks.
 *
 * Component type: **interactive** — scoped axe on `pagination-dots-qa-*` story bands.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  formatAxeViolations,
  openPaginationDotsFigmaValidationTab,
  openPaginationDotsTestScenarios,
  PAGINATION_DOTS_SHOWCASE_AXE_SCOPE,
  PAGINATION_DOTS_TAG_SET,
  qaStep,
  runPaginationDotsAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writePaginationDotsAxeArtefact,
  writePaginationDotsAxeHtmlReport,
  dotsStatus,
  dotsTablist,
  expectActivePage,
  expectFocusVisible,
tabbableDot,
} from './pagination-dots/pagination-dots-qa-support';
import {
  FIGMA_GRID_TESTID,
  PAGINATION_DOTS_ARIA,
  PAGINATION_DOTS_DATA_SECTIONS,
PAGINATION_DOTS_ROOT_TESTIDS,
} from './pagination-dots-playground/manifest';
import {
  PAGINATION_DOTS_ARIA_VALIDITY_TEST,
  PAGINATION_DOTS_BUTTON_NAME_TEST,
PAGINATION_DOTS_FIGMA_GRID_AXE_TEST,
  PAGINATION_DOTS_REFLOW_320_TEST,
  PAGINATION_DOTS_SELECTED_TAB_TEST,
  PAGINATION_DOTS_TABLIST_LABEL_TEST
} from './qa-component-test-labels';

test.beforeEach(async ({ page }) => {
  await openPaginationDotsTestScenarios(page);
});

test.describe('Accessibility', { tag: PAGINATION_DOTS_TAG_SET.accessibility }, () => {
  test('[a11y] WCAG 2.1 AA axe scan — zero serious/critical + HTML report', async ({ page }) => {
    await qaStep('Scoped axe on PaginationDots story bands', async () => {
      const results = await runPaginationDotsAxePageScan(page, PAGINATION_DOTS_SHOWCASE_AXE_SCOPE);
      writePaginationDotsAxeArtefact(results);
      writePaginationDotsAxeHtmlReport(results);
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
    });
  });

  for (const section of PAGINATION_DOTS_DATA_SECTIONS) {
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

  test(`[a11y] ${PAGINATION_DOTS_TABLIST_LABEL_TEST}`, async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.default,
      PAGINATION_DOTS_ROOT_TESTIDS.default,
    );
    await qaStep('aria-label on tablist', async () => {
      await expect(root).toHaveAttribute('aria-label', PAGINATION_DOTS_ARIA.default);
    });
  });

  test(`[a11y] ${PAGINATION_DOTS_SELECTED_TAB_TEST}`, async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.default,
      PAGINATION_DOTS_ROOT_TESTIDS.default,
    );
    await qaStep('Single selected tab', async () => {
      await expectActivePage(root, 1, 8);
      await expect(root.locator('button[aria-selected="true"]')).toHaveCount(1);
    });
  });

  test('[a11y] dot tabs have Page N of M accessible names', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled2,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled2,
    );
    await qaStep('Named tabs for visible window', async () => {
      await expect(root.getByRole('tab', { name: 'Page 3 of 5' })).toBeVisible();
      await expect(root.getByRole('tab', { name: 'Page 5 of 5' })).toBeVisible();
    });
  });

  test('[a11y] readOnly uses status role and aria-current on active dot', async ({ page }) => {
    const status = dotsStatus(
      page,
      PAGINATION_DOTS_ARIA.readOnly,
      PAGINATION_DOTS_ROOT_TESTIDS.readOnly,
    );
    await qaStep('status + aria-current', async () => {
      await expect(status).toHaveAttribute('aria-live', 'polite');
      await expect(status.locator('button[aria-current="true"]')).toHaveCount(1);
    });
  });

  test('[a11y] keyboard-only — ArrowRight changes selection', async ({ page }) => {
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.uncontrolled0,
      PAGINATION_DOTS_ROOT_TESTIDS.uncontrolled0,
    );
    await qaStep('ArrowRight without mouse', async () => {
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 5);
    });
  });

  test('[a11y] focus visible on Tab', async ({ page }) => {
    await qaStep('Focus ring', async () => {
      await page.keyboard.press('Tab');
      await expectFocusVisible(page);
    });
  });

  test(`[a11y] ${PAGINATION_DOTS_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(PAGINATION_DOTS_SHOWCASE_AXE_SCOPE)
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

  test(`[a11y] ${PAGINATION_DOTS_BUTTON_NAME_TEST}`, async ({ page }) => {
const results = await new AxeBuilder({ page })
      .include(PAGINATION_DOTS_SHOWCASE_AXE_SCOPE)
      .withRules(['button-name'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${PAGINATION_DOTS_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openPaginationDotsTestScenarios(page);
    const root = dotsTablist(
      page,
      PAGINATION_DOTS_ARIA.default,
      PAGINATION_DOTS_ROOT_TESTIDS.default,
    );
    await qaStep('Tablist and keyboard still work at 320px', async () => {
      await expect(root).toBeVisible();
      await tabbableDot(root).focus();
      await page.keyboard.press('ArrowRight');
      await expectActivePage(root, 2, 8);
    });
  });

  test(`[a11y] ${PAGINATION_DOTS_FIGMA_GRID_AXE_TEST}`, async ({ page }) => {
    await openPaginationDotsFigmaValidationTab(page);
    const results = await new AxeBuilder({ page })
      .include(`[data-testid="${FIGMA_GRID_TESTID}"]`)
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test('[a11y] page lang on <html>', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).not.toBeNull();
    expect(lang?.trim()).not.toBe('');
  });
});
