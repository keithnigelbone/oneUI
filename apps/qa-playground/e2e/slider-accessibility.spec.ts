/**
 * Slider QA — WCAG 2.1 AA axe + a11y checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Slider defects.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  SLIDER_A11Y_BANDS,
  SLIDER_ALL_THUMBS_NAMED_TEST,
SLIDER_ARIA_VALIDITY_TEST,
  SLIDER_DEFAULT_RANGE_ATTRS_TEST,
  SLIDER_DISABLED_KEYBOARD_TEST,
  SLIDER_KEYBOARD_DEFAULT_TEST,
  SLIDER_KEYBOARD_HOME_END_TEST,
  SLIDER_PAGE_LANG_TEST,
  SLIDER_RANGE_TYPE_THUMBS_TEST,
  SLIDER_REFLOW_320_TEST,
  SLIDER_ROUTE_TEST,
  SLIDER_SLOT_BUTTON_NAMES_TEST,
SLIDER_WCAG_PAGE_TEST,
} from './qa-component-test-labels';
import { expectA11yClean, WCAG_AA_TAGS } from './qa-axe-helpers';
import {
  openSliderTestScenarios,
  qaStep,
  runSliderAxePageScan,
  seriousOrCritical,
  SLIDER_TAG_SET,
  writeSliderAxeArtefact,
writeSliderAxeHtmlReport,
} from './slider/slider-qa-support';
import {
  SLIDER_AXE_TARGET_TESTIDS,
  SLIDER_PLAYGROUND_ROUTE,
SLIDER_SHOWCASE_AXE_SCOPE,
} from './slider-playground/manifest';
import { sliderByTestId, slidersIn } from './slider-playground/sliderHelpers';

test.beforeEach(async ({ page }) => {
  await openSliderTestScenarios(page);
});

test.describe('Accessibility', { tag: SLIDER_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SLIDER_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
      runSliderAxePageScan(page, SLIDER_SHOWCASE_AXE_SCOPE),
    );
    writeSliderAxeArtefact(results);
    writeSliderAxeHtmlReport(results);
    expectA11yClean(results, SLIDER_WCAG_PAGE_TEST);
  });

  for (const { id, title } of SLIDER_A11Y_BANDS) {
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

  for (const testId of SLIDER_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await sliderByTestId(page, testId).scrollIntoViewIfNeeded();
const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags([...WCAG_AA_TAGS])
        .analyze();
      const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test(`[a11y] ${SLIDER_ALL_THUMBS_NAMED_TEST}`, async ({ page }) => {
    const sliders = page.locator('[data-testid^="slider-"]').getByRole('slider');
    const count = await sliders.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(sliders.nth(i)).toHaveAccessibleName(/.+/);
    }
  });

  test(`[a11y] ${SLIDER_DEFAULT_RANGE_ATTRS_TEST}`, async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  test(`[a11y] ${SLIDER_RANGE_TYPE_THUMBS_TEST}`, async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-type-range');
    const thumbs = slidersIn(wrapper);
    await expect(thumbs).toHaveCount(2);
    await expect(thumbs.nth(0)).toHaveAccessibleName('Minimum');
    await expect(thumbs.nth(1)).toHaveAccessibleName('Maximum');
    await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '20');
    await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '70');
  });

  test(`[a11y] ${SLIDER_KEYBOARD_DEFAULT_TEST}`, async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await slider.focus();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '51');
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  test(`[a11y] ${SLIDER_KEYBOARD_HOME_END_TEST}`, async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  test(`[a11y] ${SLIDER_DISABLED_KEYBOARD_TEST}`, async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-disabled')).first();
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test(`[a11y] ${SLIDER_SLOT_BUTTON_NAMES_TEST}`, async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-start-end-iconbutton-continuous');
    await expect(wrapper.getByRole('button', { name: 'Decrease' })).toBeVisible();
    await expect(wrapper.getByRole('button', { name: 'Increase' })).toBeVisible();
  });

  test(`[a11y] ${SLIDER_ARIA_VALIDITY_TEST}`, async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include(SLIDER_SHOWCASE_AXE_SCOPE)
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();
    expectA11yClean(results, SLIDER_ARIA_VALIDITY_TEST);
  });

  test(`[a11y] ${SLIDER_PAGE_LANG_TEST}`, async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang?.trim()).not.toBe('');
  });

  test(`[a11y] ${SLIDER_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(SLIDER_PLAYGROUND_ROUTE);
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    const REFLOW_SKIP = new Set(['slider-qa-default']);
    for (const { id } of SLIDER_A11Y_BANDS) {
      if (REFLOW_SKIP.has(id)) continue;
      const band = page.locator(`[data-section="${id}"]`);
      await band.scrollIntoViewIfNeeded();
      const overflows = await band.evaluate(
        (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
      );
      expect(overflows, id).toBe(false);
    }
  });
});

test.describe('Accessibility — route', { tag: SLIDER_TAG_SET.accessibility }, () => {
  test(`[a11y] ${SLIDER_ROUTE_TEST}`, async ({ request, baseURL }) => {
    const origin = baseURL ?? 'http://localhost:5180';
    const res = await request.get(`${origin}${SLIDER_PLAYGROUND_ROUTE}`);
    expect(res.ok()).toBeTruthy();
  });
});
