/**
 * Touch Slider QA — WCAG 2.1 AA axe + a11y checks.
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Touch Slider defects.
* BUG-TOUCHSLIDER-001: native `<input type="range">` lacks accessible name — label tests must fail until fixed.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

import { qaAnnotate } from './qa-a11y-test-meta';
import {
  TOUCH_SLIDER_A11Y_BANDS,
  TOUCH_SLIDER_BUG_BAND,
  TOUCH_SLIDER_BUG_ID,
  TOUCH_SLIDER_DEFAULT_RANGE_TEST,
  TOUCH_SLIDER_DISABLED_KEYBOARD_TEST,
  TOUCH_SLIDER_FIGMA_CELL_TEST,
  TOUCH_SLIDER_FIGMA_GRID_AXE_TEST,
  TOUCH_SLIDER_FOCUS_TRAP_TEST,
  TOUCH_SLIDER_INPUT_NAME_TEST,
  TOUCH_SLIDER_KEYBOARD_ARROWS_TEST,
  TOUCH_SLIDER_KEYBOARD_HOME_END_TEST,
  TOUCH_SLIDER_KEYBOARD_TAB_TEST,
TOUCH_SLIDER_LABEL_RULE_TEST,
  TOUCH_SLIDER_PAGE_LANG_TEST,
  TOUCH_SLIDER_REFLOW_320_TEST,
  TOUCH_SLIDER_ROOT_LABELS_TEST,
  TOUCH_SLIDER_SLOT_ARIA_HIDDEN_TEST,
  TOUCH_SLIDER_VERTICAL_ORIENTATION_TEST,
  TOUCH_SLIDER_WCAG_PAGE_TEST
} from './qa-component-test-labels';
import { expectA11yClean } from './qa-axe-helpers';
import {
  FIGMA_GRID_TESTID,
  FIGMA_VALIDATION_TAB,
  TOUCH_SLIDER_AXE_INPUT_EXCLUDE,
  TOUCH_SLIDER_AXE_TARGET_TESTIDS,
  TOUCH_SLIDER_PLAYGROUND_ROUTE,
  TOUCH_SLIDER_SHOWCASE_AXE_SCOPE,
} from './touch-slider-playground/manifest';
import { slidersIn, touchSliderByTestId } from './touch-slider-playground/touchSliderHelpers';
import {
  expectTouchSliderRootLabeled,
  openTouchSliderTestScenarios,
  qaStep,
  runTouchSliderAxePageScan,
  seriousOrCritical,
  TOUCH_SLIDER_TAG_SET,
  writeTouchSliderAxeArtefact,
  writeTouchSliderAxeHtmlReport
} from './touch-slider/touch-slider-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${TOUCH_SLIDER_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Touch Slider playground reachable at ${origin}${TOUCH_SLIDER_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await openTouchSliderTestScenarios(page);
});

test.describe('Accessibility', { tag: TOUCH_SLIDER_TAG_SET.accessibility }, () => {
  test(`[a11y] ${TOUCH_SLIDER_WCAG_PAGE_TEST}`, async ({ page }) => {
    const results = await qaStep('Run scoped WCAG 2.1 AA axe scan on Test Scenarios bands', () =>
runTouchSliderAxePageScan(page, TOUCH_SLIDER_SHOWCASE_AXE_SCOPE),
    );
    writeTouchSliderAxeArtefact(results);
    writeTouchSliderAxeHtmlReport(results);
    expectA11yClean(results, TOUCH_SLIDER_WCAG_PAGE_TEST);
});

  test(`[a11y] ${TOUCH_SLIDER_LABEL_RULE_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: TOUCH_SLIDER_BUG_BAND, bugId: TOUCH_SLIDER_BUG_ID });
    const results = await qaStep('Run axe label rule on default instance', () =>
      new AxeBuilder({ page })
        .include('[data-testid="touch-slider-default"]')
        .withRules(['label'])
        .analyze(),
    );
    expectA11yClean(results, TOUCH_SLIDER_LABEL_RULE_TEST);
  });

  test(`[a11y] ${TOUCH_SLIDER_INPUT_NAME_TEST}`, async ({ page }, testInfo) => {
    qaAnnotate(testInfo, { band: TOUCH_SLIDER_BUG_BAND, bugId: TOUCH_SLIDER_BUG_ID });
    const wrap = touchSliderByTestId(page, 'touch-slider-default');
await qaStep('Root exposes aria-label', () => expectTouchSliderRootLabeled(wrap, /Default touch slider/i));
    await qaStep('Native range input exposes accessible name (component bug if fails)', () =>
      expect(slidersIn(wrap).first()).toHaveAccessibleName(/Default touch slider/i),
    );
  });

  for (const { id, title } of TOUCH_SLIDER_A11Y_BANDS) {
    test(`[a11y] ${title}`, async ({ page }, testInfo) => {
      qaAnnotate(testInfo, { band: id });
      await page.locator(`[data-section="${id}"]`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-section="${id}"]`)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expectA11yClean(results, title);
    });
  }

  for (const testId of TOUCH_SLIDER_AXE_TARGET_TESTIDS) {
    test(`[a11y] data-testid="${testId}" — zero serious/critical`, async ({ page }) => {
      await touchSliderByTestId(page, testId).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`[data-testid="${testId}"]`)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
const blocking = seriousOrCritical(results.violations);
      expect(blocking, `${testId}: ${blocking.length} serious/critical violation(s)`).toHaveLength(0);
    });
  }

  test(`[a11y] ${TOUCH_SLIDER_SLOT_ARIA_HIDDEN_TEST}`, async ({ page }) => {
    const slots = page.locator('[data-slider-slot]');
    const count = await slots.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(slots.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

test(`[a11y] ${TOUCH_SLIDER_ROOT_LABELS_TEST}`, async ({ page }) => {
    const roots = page.locator('[data-testid^="touch-slider-"] [data-progress-style]');
    const count = await roots.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const label = await roots.nth(i).getAttribute('aria-label');
      expect(label?.trim(), `root index ${i} should have aria-label`).not.toBe('');
    }
  });
  test(`[a11y] ${TOUCH_SLIDER_DEFAULT_RANGE_TEST}`, async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  test(`[a11y] ${TOUCH_SLIDER_VERTICAL_ORIENTATION_TEST}`, async ({ page }) => {
    await expect(
      slidersIn(touchSliderByTestId(page, 'touch-slider-orientation-vertical')).first(),
    ).toHaveAttribute('aria-orientation', 'vertical');
  });

  test(`[a11y] ${TOUCH_SLIDER_KEYBOARD_ARROWS_TEST}`, async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '51');
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  test(`[a11y] ${TOUCH_SLIDER_KEYBOARD_HOME_END_TEST}`, async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  test(`[a11y] ${TOUCH_SLIDER_DISABLED_KEYBOARD_TEST}`, async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-disabled')).first();
    await expect(slider).toBeDisabled();
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test(`[a11y] ${TOUCH_SLIDER_FIGMA_CELL_TEST}`, async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const cell = touchSliderByTestId(page, 'ts-figma-val-50-ori-horizontal-prog-rounded');
await expectTouchSliderRootLabeled(cell, /Touch slider 50 horizontal rounded/i);
    await expect(slidersIn(cell).first()).toHaveAttribute('aria-valuenow', '50');
  });

  test(`[a11y] ${TOUCH_SLIDER_FIGMA_GRID_AXE_TEST}`, async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    await touchSliderByTestId(page, FIGMA_GRID_TESTID).waitFor({ state: 'visible' });
    const results = await new AxeBuilder({ page })
      .include(`[data-testid="${FIGMA_GRID_TESTID}"]`)
.exclude(TOUCH_SLIDER_AXE_INPUT_EXCLUDE)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expectA11yClean(results, TOUCH_SLIDER_FIGMA_GRID_AXE_TEST);
  });

  test(`[a11y] ${TOUCH_SLIDER_PAGE_LANG_TEST}`, async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  });

  test(`[a11y] ${TOUCH_SLIDER_KEYBOARD_TAB_TEST}`, async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await slider.focus();
    await expect(slider).toBeFocused();
  });

  test(`[a11y] ${TOUCH_SLIDER_FOCUS_TRAP_TEST}`, async ({ page }) => {
    await slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first().focus();
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
    }
    const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(activeTag.length).toBeGreaterThan(0);
  });

  test(`[a11y] ${TOUCH_SLIDER_REFLOW_320_TEST}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openTouchSliderTestScenarios(page);
    for (const { id } of TOUCH_SLIDER_A11Y_BANDS) {
      const band = page.locator(`[data-section="${id}"]`);
      await band.scrollIntoViewIfNeeded();
      const overflow = await band.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.right > window.innerWidth + 1;
      });
      expect(overflow, `Band ${id} should not overflow horizontally at 320px`).toBe(false);
    }
  });
});
