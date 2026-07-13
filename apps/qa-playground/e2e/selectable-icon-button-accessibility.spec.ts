/**
 * SelectableIconButton QA — WCAG 2.1 AA axe + a11y checks.
 *
 * Failures are not suppressed — surface `@oneui/ui` SelectableIconButton defects via QA.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import {
  SIB_A11Y_BANDS,
  SIB_ARIA_VALIDITY_TEST,
SIB_PAGE_LANG_TEST,
  SIB_ROUTE_TEST,
  SIB_WCAG_PAGE_TEST
} from './qa-component-test-labels';
import {
  formatAxeViolations,
  openSelectableIconButtonTestScenarios,
  qaStep,
  runSibAxePageScan,
  SIB_TAG_SET,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSibAxeArtefact,
writeSibAxeHtmlReport,
} from './selectable-icon-button/selectable-icon-button-qa-support';
import {
  SIB_AXE_TARGET_TESTIDS,
  SIB_DATA_SECTIONS,
  SIB_FIGMA_SIZES,
  SIB_PLAYGROUND_ROUTE,
  SIB_PREFIX,
  SIB_SHOWCASE_AXE_SCOPE,
sibSizeTestId,
} from './selectable-icon-button-playground/manifest';
import { scrollToSection, sibByTestId } from './selectable-icon-button-playground/selectableIconButtonHelpers';

test.beforeEach(async ({ page }) => {
  await openSelectableIconButtonTestScenarios(page);
});

test.describe('Accessibility', { tag: SIB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SIB_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runSibAxePageScan(page, SIB_SHOWCASE_AXE_SCOPE),
    );
    writeSibAxeArtefact(results);
    writeSibAxeHtmlReport(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const { id, title } of SIB_A11Y_BANDS) {
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

  for (const testId of SIB_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await sibByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  for (const figma of SIB_FIGMA_SIZES) {
    test(`[a11y] size ${figma} control visible`, async ({ page }) => {
      await scrollToSection(page, 'size');
      await expect(sibByTestId(page, sibSizeTestId(figma))).toBeVisible();
    });
  }

  test('[a11y] toggle exposes aria-pressed', async ({ page }) => {
    const btn = sibByTestId(page, `${SIB_PREFIX}-selected-false`);
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('[a11y] loading control has aria-busy', async ({ page }) => {
    await scrollToSection(page, 'loading');
    await expect(sibByTestId(page, `${SIB_PREFIX}-loading-true`)).toHaveAttribute('aria-busy', 'true');
  });

  test(`[a11y] ${SIB_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  test(`[a11y] ${SIB_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });
});

test.describe('Accessibility — route', { tag: SIB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SIB_ROUTE_TEST}`, async ({ request, baseURL }) => {
    const origin = baseURL ?? 'http://localhost:5180';
    const res = await request.get(`${origin}${SIB_PLAYGROUND_ROUTE}`);
    expect(res.ok()).toBeTruthy();
  });
});
