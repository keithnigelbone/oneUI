/**
 * Selectable Button QA — WCAG 2.1 AA automation (axe-core).
 *
 * Failures are not suppressed — surface `@oneui/ui` SelectableButton defects via QA.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  SELECTABLE_BUTTON_A11Y_BANDS,
  SELECTABLE_BUTTON_BUTTON_NAME_TEST,
  SELECTABLE_BUTTON_FIGMA_WCAG_TEST,
  SELECTABLE_BUTTON_TOGGLE_KEYBOARD_TEST,
SELECTABLE_BUTTON_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import {
  formatAxeViolations,
  openSelectableButtonFigmaValidation,
  openSelectableButtonTestScenarios,
  qaStep,
  runSelectableButtonAxePageScan,
  SELECTABLE_BUTTON_SHOWCASE_AXE_SCOPE,
  SELECTABLE_BUTTON_TAG_SET,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeSelectableButtonAxeArtefact,
writeSelectableButtonAxeHtmlReport,
} from './selectable-button/selectable-button-qa-support';
import { SELECTABLE_BUTTON_ROOT_TESTIDS } from './selectable-button-playground/manifest';
import { selectableButtonByTestId } from './selectable-button-playground/selectableButtonHelpers';
import { expectA11yClean } from './qa-axe-helpers';

test.beforeEach(async ({ page }) => {
  await openSelectableButtonTestScenarios(page);
});

test.describe('Accessibility', { tag: SELECTABLE_BUTTON_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SELECTABLE_BUTTON_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runSelectableButtonAxePageScan(page, SELECTABLE_BUTTON_SHOWCASE_AXE_SCOPE),
    );
    writeSelectableButtonAxeArtefact(results);
    writeSelectableButtonAxeHtmlReport(results);
    const blocking = seriousOrCritical(results.violations);
    expect(blocking, formatAxeViolations(blocking)).toHaveLength(0);
  });

  for (const { id, title } of SELECTABLE_BUTTON_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, title);
    });
  }

  test(`[a11y] ${SELECTABLE_BUTTON_BUTTON_NAME_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['button-name']).analyze();
    expectA11yClean(results, SELECTABLE_BUTTON_BUTTON_NAME_TEST);
  });

  test(`[a11y] ${SELECTABLE_BUTTON_TOGGLE_KEYBOARD_TEST}`, async ({ page }) => {
    const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
    await expect(btn).toHaveAccessibleName('Toggle favourite');
    await btn.focus();
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Accessibility — Figma Validation', { tag: SELECTABLE_BUTTON_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await openSelectableButtonFigmaValidation(page);
  });

  test(`[a11y] ${SELECTABLE_BUTTON_FIGMA_WCAG_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="figma-selectable-button-grid"]')
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    writeSelectableButtonAxeArtefact(results);
    writeSelectableButtonAxeHtmlReport(results);
    expectA11yClean(results, SELECTABLE_BUTTON_FIGMA_WCAG_TEST);
  });
});
