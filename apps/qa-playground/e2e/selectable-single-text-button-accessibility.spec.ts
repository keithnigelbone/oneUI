/**
 * SelectableSingleTextButton QA — WCAG 2.1 AA axe + a11y checks.
 *
 * Failures are not suppressed — surface `@oneui/ui` SelectableSingleTextButton defects via QA.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  SSTB_A11Y_BANDS,
  SSTB_ARIA_VALIDITY_TEST,
SSTB_PAGE_LANG_TEST,
  SSTB_ROUTE_TEST,
  SSTB_WCAG_PAGE_TEST
} from './qa-component-test-labels';
import {
  formatAxeViolations,
  openSelectableSingleTextButtonTestScenarios,
  qaStep,
  runSstbAxePageScan,
  seriousOrCritical,
  SSTB_TAG_SET,
  WCAG_AA_TAGS,
  writeSstbAxeArtefact,
writeSstbAxeHtmlReport,
} from './selectable-single-text-button/selectable-single-text-button-qa-support';
import {
  SSTB_AXE_TARGET_TESTIDS,
  SSTB_FIGMA_SIZES,
  SSTB_PLAYGROUND_ROUTE,
  SSTB_PREFIX,
  SSTB_SHOWCASE_AXE_SCOPE,
sstbSizeTestId,
} from './selectable-single-text-button-playground/manifest';
import { scrollToSection, sstbByTestId } from './selectable-single-text-button-playground/selectableSingleTextButtonHelpers';

test.beforeEach(async ({ page }) => {
  await openSelectableSingleTextButtonTestScenarios(page);
});

test.describe('Accessibility', { tag: SSTB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SSTB_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runSstbAxePageScan(page, SSTB_SHOWCASE_AXE_SCOPE),
    );
    writeSstbAxeArtefact(results);
    writeSstbAxeHtmlReport(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const { id, title } of SSTB_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }) => {
      await page.locator(`[data-section="${id}"]`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `Section "${id}":\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const testId of SSTB_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await sstbByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const figma of SSTB_FIGMA_SIZES) {
    test(`[a11y] size ${figma} control visible`, async ({ page }) => {
      await scrollToSection(page, 'size');
      await expect(sstbByTestId(page, sstbSizeTestId(figma))).toBeVisible();
    });
  }

  test('[a11y] toggle exposes aria-pressed', async ({ page }) => {
    await expect(sstbByTestId(page, `${SSTB_PREFIX}-default`)).toHaveAttribute('aria-pressed', 'false');
  });

  test('[a11y] loading control has aria-busy', async ({ page }) => {
    await scrollToSection(page, 'loading');
    await expect(sstbByTestId(page, `${SSTB_PREFIX}-loading-true`)).toHaveAttribute('aria-busy', 'true');
  });

  test(`[a11y] ${SSTB_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SSTB_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${SSTB_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] focused default shows focus indicator', async ({ page }) => {
    const el = sstbByTestId(page, `${SSTB_PREFIX}-default`);
    await el.focus();
    const style = await el.evaluate((node) => {
      const s = getComputedStyle(node);
      return { outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
    });
    const hasVisibleFocus = style.outlineWidth !== '0px' || style.boxShadow !== 'none';
    expect(hasVisibleFocus).toBe(true);
  });
});

test.describe('Accessibility — route', { tag: SSTB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SSTB_ROUTE_TEST}`, async ({ request, baseURL }) => {
    const origin = baseURL ?? 'http://localhost:5180';
    const res = await request.get(`${origin}${SSTB_PLAYGROUND_ROUTE}`);
    expect(res.ok()).toBeTruthy();
  });
});
