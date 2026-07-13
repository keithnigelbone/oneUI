/**
 * SingleTextButton QA — WCAG 2.1 AA axe + a11y checks.
 *
 * **QA rule:** Do not weaken assertions — BUG-SINGLETEXT-001 must fail until fixed in `@oneui/ui`.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  SINGLE_TEXT_BUTTON_A11Y_BANDS,
  SINGLE_TEXT_BUTTON_BUG_AXE_TEST,
  SINGLE_TEXT_BUTTON_BUG_BAND,
  SINGLE_TEXT_BUTTON_BUG_ID,
  SINGLE_TEXT_BUTTON_BUTTON_NAME_TEST,
  SINGLE_TEXT_BUTTON_FIGMA_WCAG_TEST,
  SINGLE_TEXT_BUTTON_KEYBOARD_SPACE_TEST,
  SINGLE_TEXT_BUTTON_LOADING_NAME_TEST,
  STB_ARIA_VALIDITY_TEST,
STB_PAGE_LANG_TEST,
  STB_ROUTE_TEST,
  STB_WCAG_PAGE_TEST
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS, writeAxeJson } from './qa-axe-helpers';
import {
  formatAxeViolations,
  openSingleTextButtonTestScenarios,
  qaStep,
  runStbAxePageScan,
  seriousOrCritical,
  STB_TAG_SET,
  writeStbAxeArtefact,
writeStbAxeHtmlReport,
} from './single-text-button/single-text-button-qa-support';
import {
  STB_AXE_TARGET_TESTIDS,
  STB_PLAYGROUND_ROUTE,
  STB_PREFIX,
STB_SHOWCASE_AXE_SCOPE,
} from './single-text-button-playground/manifest';
import { stbButton } from './single-text-button-playground/singleTextButtonHelpers';

test.beforeEach(async ({ page }) => {
  await openSingleTextButtonTestScenarios(page);
});

test.describe('Accessibility', { tag: STB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${STB_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runStbAxePageScan(page, STB_SHOWCASE_AXE_SCOPE),
    );
    writeStbAxeArtefact(results);
    writeStbAxeHtmlReport(results);
    expectA11yClean(results, STB_WCAG_PAGE_TEST);
  });

  for (const { id, title } of SINGLE_TEXT_BUTTON_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await page.locator(`[data-section="${id}"]`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      expectA11yClean(results, title);
    });
  }

  for (const testId of STB_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await page.getByTestId(testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}:\n${formatAxeViolations(blocking)}`).toHaveLength(0);
    });
  }

  test(`[a11y] ${SINGLE_TEXT_BUTTON_BUTTON_NAME_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .exclude(`[data-section="${SINGLE_TEXT_BUTTON_BUG_BAND}"]`)
      .withRules(['button-name'])
      .analyze();
    expectA11yClean(results, SINGLE_TEXT_BUTTON_BUTTON_NAME_TEST);
  });

  test(`[a11y] ${SINGLE_TEXT_BUTTON_LOADING_NAME_TEST}`, async ({ page }) => {
    await expect(stbButton(page, `${STB_PREFIX}-loading`)).toHaveAccessibleName('Loading');
  });

  test(`[a11y] ${SINGLE_TEXT_BUTTON_KEYBOARD_SPACE_TEST}`, async ({ page }) => {
    const btn = stbButton(page, `${STB_PREFIX}-interactive`);
    await btn.focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId(`${STB_PREFIX}-press-count`)).toContainText('presses: 1');
  });

  test(`[a11y] ${STB_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(STB_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    expectA11yClean(results, STB_ARIA_VALIDITY_TEST);
  });

  test(`[a11y] ${STB_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });

  test('[a11y] focused default shows focus indicator', async ({ page }) => {
    const el = stbButton(page, `${STB_PREFIX}-default`);
    await el.focus();
    const style = await el.evaluate((node) => {
      const s = getComputedStyle(node);
      return { outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
    });
    const hasVisibleFocus = style.outlineWidth !== '0px' || style.boxShadow !== 'none';
    expect(hasVisibleFocus).toBe(true);
  });

  test(`[a11y] ${SINGLE_TEXT_BUTTON_BUG_AXE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: SINGLE_TEXT_BUTTON_BUG_BAND, bugId: SINGLE_TEXT_BUTTON_BUG_ID });
    const results = await new AxeBuilder({ page })
      .include(`[data-section="${SINGLE_TEXT_BUTTON_BUG_BAND}"]`)
      .withRules(['button-name'])
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    writeAxeJson('single-text-button-axe-violations.json', results);
    expectA11yClean(results, SINGLE_TEXT_BUTTON_BUG_AXE_TEST);
  });
});

test.describe('Accessibility — Figma Validation', { tag: STB_TAG_SET.accessibility }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STB_PLAYGROUND_ROUTE);
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('figma-single-text-button-grid')).toBeVisible();
  });

  test(`[a11y] ${SINGLE_TEXT_BUTTON_FIGMA_WCAG_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(
        '[data-testid="figma-single-text-button-grid"], [data-testid="figma-single-text-button-condensed-grid"]',
      )
      .withTags([...WCAG_AA_TAGS])
      .analyze();
    expectA11yClean(results, SINGLE_TEXT_BUTTON_FIGMA_WCAG_TEST);
  });
});

test.describe('Accessibility — route', { tag: STB_TAG_SET.accessibility }, () => {
  test(`[a11y] ${STB_ROUTE_TEST}`, async ({ request, baseURL }) => {
    const origin = baseURL ?? 'http://localhost:5180';
    const res = await request.get(`${origin}${STB_PLAYGROUND_ROUTE}`);
    expect(res.ok()).toBeTruthy();
  });
});
