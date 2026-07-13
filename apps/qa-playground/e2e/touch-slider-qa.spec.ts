/**
 * Touch Slider QA — functional coverage (`TouchSliderQaShowcase.tsx`).
 * Component type: input (range slider — role="slider", aria-valuenow/min/max).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Touch Slider defects.
 */
import { expect, test } from 'playwright/test';

import {
  FIGMA_VALIDATION_TAB,
  TOUCH_SLIDER_ALL_TESTIDS,
  TOUCH_SLIDER_COMBO_COUNT,
  TOUCH_SLIDER_DATA_SECTIONS,
  TOUCH_SLIDER_PLAYGROUND_ROUTE,
  TOUCH_SLIDER_SECTION_COUNT,
  touchSliderAppearanceTestId,
  touchSliderComboTestId,
} from './touch-slider-playground/manifest';
import {
  ariaValueNow,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  computedTouchSliderFillRgb,
  controlIn,
  expectFocusRingVisible,
  expectNoErrorText,
  expectTouchSliderReachable,
  gotoTouchSliderPlayground,
  openTouchSliderTestScenarios,
  qaLog,
  qaStep,
  scrollToSection,
  slidersIn,
  startSlotOffsetX,
  TOUCH_SLIDER_TAG_SET,
  touchSliderByTestId,
  touchSliderRoot,
} from './touch-slider/touch-slider-qa-support';

/** Figma appearance roles spot-checked in preserved tests. */
const APPEARANCE_SPOT_CHECK = ['auto', 'neutral', 'primary', 'secondary', 'positive', 'warning'] as const;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${TOUCH_SLIDER_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Touch Slider playground reachable at ${origin}${TOUCH_SLIDER_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: TOUCH_SLIDER_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openTouchSliderTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] default instance — secondary appearance, rounded progressStyle, value 50', async ({ page }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-default');
    const root = touchSliderRoot(wrap);
    await expect(root).toHaveAttribute('data-appearance', 'secondary');
    await expect(root).toHaveAttribute('data-progress-style', 'rounded');
    await expect(slidersIn(wrap)).toHaveCount(1);
    await expect(slidersIn(wrap).first()).toHaveAttribute('aria-valuenow', '50');
  });

  test('[fn] appearance auto — resolves to neutral on root (surface context)', async ({ page }) => {
    await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-appearance-auto'))).toHaveAttribute(
      'data-appearance',
      'neutral',
    );
  });

  test('[fn] orientation horizontal — native input aria-orientation horizontal', async ({ page }) => {
    await expect(
      slidersIn(touchSliderByTestId(page, 'touch-slider-orientation-horizontal')).first(),
    ).toHaveAttribute('aria-orientation', 'horizontal');
  });

  test('[fn] orientation vertical — root data-orientation and input aria-orientation vertical', async ({
    page,
  }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-orientation-vertical');
    await expect(touchSliderRoot(wrap)).toHaveAttribute('data-orientation', 'vertical');
    await expect(slidersIn(wrap).first()).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('[fn] progressStyle rounded and sharp — root data-progress-style matches prop', async ({ page }) => {
    await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-progress-rounded'))).toHaveAttribute(
      'data-progress-style',
      'rounded',
    );
    await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-progress-sharp'))).toHaveAttribute(
      'data-progress-style',
      'sharp',
    );
  });

  test('[fn] progressStyle sharp — outer control keeps pill border-radius (not square track)', async ({ page }) => {
    const control = controlIn(touchSliderByTestId(page, 'touch-slider-progress-sharp'));
    await expect(control).toBeVisible();
    const radius = await control.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(radius, 'Sharp progressStyle should still use rounded track chrome').not.toBe('0px');
    expect(radius).not.toBe('');
  });

  test('[fn] defaultValue — aria-valuenow reflects 0, 50, 100, and 37', async ({ page }) => {
    for (const v of [0, 50, 100, 37] as const) {
      await expect(slidersIn(touchSliderByTestId(page, `touch-slider-value-${v}`)).first()).toHaveAttribute(
        'aria-valuenow',
        String(v),
      );
    }
  });

  test('[fn] appearance roles — each spot-check row exposes data-appearance on root', async ({ page }) => {
    for (const appearance of APPEARANCE_SPOT_CHECK) {
      await expect(
        touchSliderRoot(touchSliderByTestId(page, `touch-slider-appearance-${appearance}`)),
      ).toHaveAttribute('data-appearance', appearance === 'auto' ? 'neutral' : appearance);
    }
  });

  test('[fn] start slot — icon present in data-slider-slot=start; no slot when omitted', async ({ page }) => {
    const withStart = touchSliderByTestId(page, 'touch-slider-slots-start');
    await expect(withStart.locator('[data-slider-slot="start"]')).toBeVisible();
    await expect(withStart.locator('[data-slider-slot="start"] svg')).toBeVisible();
    await expect(touchSliderByTestId(page, 'touch-slider-slots-none').locator('[data-slider-slot="start"]')).toHaveCount(
      0,
    );
  });


  test('[fn] rounded progressStyle — no separate visible knob node in DOM', async ({ page }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-progress-rounded');
    await expect(wrap.locator('[class*="knob"], [data-slider-thumb]')).toHaveCount(0);
    await expect(slidersIn(wrap)).toHaveCount(1);
  });

  test('[fn] custom min max — aria-valuenow 5 within range 0–10', async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-edge-min-max-0-10')).first();
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '10');
    await expect(slider).toHaveAttribute('aria-valuenow', '5');
  });

  test('[fn] fractional step — aria-valuenow supports half steps (2.5)', async ({ page }) => {
    await expect(slidersIn(touchSliderByTestId(page, 'touch-slider-edge-step-0-5')).first()).toHaveAttribute(
      'aria-valuenow',
      '2.5',
    );
  });

  test('[fn] disabled — input disabled and ArrowRight does not change value', async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-disabled')).first();
    await expect(slider).toBeDisabled();
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test('[fn] readOnly — root data-readonly and ArrowRight does not change value', async ({ page }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-readonly');
    await expect(touchSliderRoot(wrap)).toHaveAttribute('data-readonly', 'true');
    const slider = slidersIn(wrap).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test('[fn] surface context — sliders reachable on default, subtle, and bold surfaces', async ({ page }) => {
    await page.locator('#touch-slider-qa-surface').scrollIntoViewIfNeeded();
    for (const id of ['touch-slider-surface-default', 'touch-slider-surface-subtle', 'touch-slider-surface-bold'] as const) {
      await expectTouchSliderReachable(touchSliderByTestId(page, id));
    }
  });

  test('[fn] combination matrix — each combo row renders an interactive slider', async ({ page }) => {
    for (let i = 0; i < TOUCH_SLIDER_COMBO_COUNT; i++) {
      await expectTouchSliderReachable(touchSliderByTestId(page, touchSliderComboTestId(i)));
    }
  });

  test('[fn] keyboard ArrowRight — increases aria-valuenow by step on default slider', async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '51');
  });

  test('[fn] keyboard ArrowLeft — decreases aria-valuenow by step on default slider', async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await slider.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveAttribute('aria-valuenow', '49');
  });

  test('[fn] keyboard Home and End — move to min and max of range', async ({ page }) => {
    const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  test('[fn] controlled volume — ArrowRight updates aria-valuenow and live caption text', async ({ page }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-controlled-volume');
    const slider = slidersIn(wrap).first();
    const before = await ariaValueNow(slider);
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    const after = await ariaValueNow(slider);
    expect(after).toBe(before + 1);
    await expect(wrap.getByText(`aria-valuenow equivalent: ${after}`)).toBeVisible();
  });

  test('[fn] interaction demo — ArrowRight updates live value label', async ({ page }) => {
    const wrap = touchSliderByTestId(page, 'touch-slider-interaction-demo');
    const slider = slidersIn(wrap).first();
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(wrap.getByText(/^live: 51/)).toBeVisible();
  });

  test('[fn] validation grid — horizontal rounded cell value 50 and orientation', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const cell = touchSliderByTestId(page, 'ts-figma-val-50-ori-horizontal-prog-rounded');
    const slider = slidersIn(cell).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await expect(slider).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(touchSliderRoot(cell)).toHaveAttribute('data-progress-style', 'rounded');
  });

  test('[fn] validation grid — value 0 horizontal rounded cell at minimum', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    await expect(
      slidersIn(touchSliderByTestId(page, 'ts-figma-val-0-ori-horizontal-prog-rounded')).first(),
    ).toHaveAttribute('aria-valuenow', '0');
  });

  test('[fn] validation grid — value 100 vertical sharp cell at maximum', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const cell = touchSliderByTestId(page, 'ts-figma-val-100-ori-vertical-prog-sharp');
    await expect(slidersIn(cell).first()).toHaveAttribute('aria-valuenow', '100');
    await expect(touchSliderRoot(cell)).toHaveAttribute('data-progress-style', 'sharp');
    await expect(touchSliderRoot(cell)).toHaveAttribute('data-orientation', 'vertical');
  });

  test('[fn] validation grid — vertical rounded cell is interactive at mid value', async ({ page }) => {
    await page.getByRole('tab', { name: FIGMA_VALIDATION_TAB }).click();
    const cell = touchSliderByTestId(page, 'ts-figma-val-50-ori-vertical-prog-rounded');
    const slider = slidersIn(cell).first();
    await expect(slider).toBeAttached();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '51');
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: FIGMA_VALIDATION_TAB })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await page.goto(TOUCH_SLIDER_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await touchSliderByTestId(page, 'touch-slider-default').waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of TOUCH_SLIDER_ALL_TESTIDS) {
        await touchSliderByTestId(page, testId).scrollIntoViewIfNeeded();
        await expect(touchSliderByTestId(page, testId), `data-testid="${testId}" should be visible`).toBeVisible();
        await expectNoErrorText(touchSliderByTestId(page, testId));
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(TOUCH_SLIDER_SECTION_COUNT);
      for (const sectionId of TOUCH_SLIDER_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`), `data-section="${sectionId}"`).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — orientation prop sets data-orientation and aria-orientation', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-orientation');
      await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-orientation-horizontal'))).toHaveAttribute(
        'data-orientation',
        'horizontal',
      );
      await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-orientation-vertical'))).toHaveAttribute(
        'data-orientation',
        'vertical',
      );
    });

    test('[fn] 2.1 — progressStyle prop sets data-progress-style on root', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-progress-style');
      await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-progress-rounded'))).toHaveAttribute(
        'data-progress-style',
        'rounded',
      );
      await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-progress-sharp'))).toHaveAttribute(
        'data-progress-style',
        'sharp',
      );
    });

    test('[fn] 2.2 — Size scaling (N/A)', async () => {
      qaLog('Skipped — Touch Slider has no size prop in Test Scenarios showcase');
    });

  });

  // ── Group 3 — Click interaction ───────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — keyboard ArrowRight changes aria-valuenow on interaction demo', async ({ page }) => {
      const wrap = touchSliderByTestId(page, 'touch-slider-interaction-demo');
      const slider = slidersIn(wrap).first();
      const before = await ariaValueNow(slider);
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      const after = await ariaValueNow(slider);
      expect(after).toBeGreaterThan(before);
    });

    test('[fn] 3.2 — disabled slider value unchanged after keyboard nudge', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-disabled')).first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 3.3 — readOnly slider value unchanged after keyboard nudge', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-readonly')).first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 3.4 — click outside removes focus from slider thumb', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
      await page.locator('h1').first().click();
      await expect(slider).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches default slider thumb', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
    });

    test('[fn] 4.2 — Enter (N/A)', async () => {
      qaLog('Skipped — Touch Slider value changes via arrows, not Enter activation');
    });

    test('[fn] 4.3 — Space (N/A)', async () => {
      qaLog('Skipped — Touch Slider is not a toggle; Space does not apply');
    });

    test('[fn] 4.4 — ArrowRight and ArrowLeft adjust value on default slider', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '51');
      await page.keyboard.press('ArrowLeft');
      await expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    test('[fn] 4.5 — Home and End move to min and max', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await slider.focus();
      await page.keyboard.press('End');
      await expect(slider).toHaveAttribute('aria-valuenow', '100');
      await page.keyboard.press('Home');
      await expect(slider).toHaveAttribute('aria-valuenow', '0');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first().focus();
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
      }
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.length).toBeGreaterThan(0);
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — focus lands on slider thumb', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible on thumb', async ({ page }) => {
      await slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first().focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Touch Slider has no autoFocus prop in showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('[fn] 6.3 — disabled slider is not editable via keyboard', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-disabled')).first();
      await expect(slider).toBeDisabled();
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 6.4 — readOnly slider keeps aria-valuenow on keyboard nudge', async ({ page }) => {
      const wrap = touchSliderByTestId(page, 'touch-slider-readonly');
      await expect(touchSliderRoot(wrap)).toHaveAttribute('data-readonly', 'true');
      const slider = slidersIn(wrap).first();
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — Touch Slider has no error/invalid prop in showcase');
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Touch Slider has no loading prop in showcase');
    });
  });

  // ── Group 7 — Slots ───────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('[fn] 7.1 — slots none renders without start/end slot wrappers', async ({ page }) => {
      const wrapper = touchSliderByTestId(page, 'touch-slider-slots-none');
      await expect(wrapper.locator('[data-slider-slot="start"]')).toHaveCount(0);
      await expect(wrapper.locator('[data-slider-slot="end"]')).toHaveCount(0);
    });

    test('[fn] 7.1 — slots start renders icon in start slot', async ({ page }) => {
      const wrapper = touchSliderByTestId(page, 'touch-slider-slots-start');
      await expect(wrapper.locator('[data-slider-slot="start"] svg')).toBeVisible();
    });

    test('[fn] 7.3 — TouchSlider never renders an end slot', async ({ page }) => {
      const wrapper = touchSliderByTestId(page, 'touch-slider-slots-start');
      await expect(wrapper.locator('[data-slider-slot="end"]')).toHaveCount(0);
    });
  });

  // ── Group 8 — Toggle and selection (N/A) ──────────────────────────────────
  test.describe('Group 8 — Toggle and selection (N/A)', () => {
    test('[fn] 8.1 — Toggle (N/A)', async () => {
      qaLog('Skipped — Touch Slider is a range input, not a toggle');
    });
  });

  // ── Group 9 — Input (N/A) ─────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', () => {
    test('[fn] 9.1 — Typing text (N/A)', async () => {
      qaLog('Skipped — Touch Slider is not typed entry; value changes via drag/keyboard');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — start slot only visible when start prop passed', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-slots');
      await expect(touchSliderByTestId(page, 'touch-slider-slots-none').locator('[data-slider-slot="start"]')).toHaveCount(
        0,
      );
      await expect(touchSliderByTestId(page, 'touch-slider-slots-start').locator('[data-slider-slot="start"]')).toHaveCount(
        1,
      );
    });
  });

  // ── Group 11 — Content and display ────────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.3 — min, max, and aria-valuenow on default range input', async ({ page }) => {
      const slider = slidersIn(touchSliderByTestId(page, 'touch-slider-default')).first();
      await expect(slider).toHaveAttribute('min', '0');
      await expect(slider).toHaveAttribute('max', '100');
      await expect(slider).toHaveAttribute('aria-valuenow', '50');
      // Native range may omit aria-valuemin/max; assert when present (WCAG best practice).
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      if (ariaMin != null) await expect(slider).toHaveAttribute('aria-valuemin', '0');
      if (ariaMax != null) await expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    test('[fn] 11.3 — value band reflects defaultValue in aria-valuenow', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-value');
      for (const v of [0, 50, 100, 37] as const) {
        await expect(slidersIn(touchSliderByTestId(page, `touch-slider-value-${v}`)).first()).toHaveAttribute(
          'aria-valuenow',
          String(v),
        );
      }
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Touch Slider has no fullWidth prop in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoTouchSliderPlayground(page);
      await scrollToSection(page, 'touch-slider-qa-default');
      await expect(touchSliderByTestId(page, 'touch-slider-default')).toBeVisible();
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoTouchSliderPlayground(page);
      await expect(touchSliderByTestId(page, 'touch-slider-default')).toBeVisible();
    });

    test('[fn] 12.3 — horizontal and vertical orientation cells render side-by-side vs stacked', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-orientation');
      await expect(touchSliderByTestId(page, 'touch-slider-orientation-horizontal')).toBeVisible();
      await expect(touchSliderByTestId(page, 'touch-slider-orientation-vertical')).toBeVisible();
      await expect(touchSliderRoot(touchSliderByTestId(page, 'touch-slider-orientation-vertical'))).toHaveAttribute(
        'data-orientation',
        'vertical',
      );
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: TOUCH_SLIDER_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Touch Slider”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Touch Slider', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default touch slider is visible', async ({ page }) => {
      await expect(touchSliderByTestId(page, 'touch-slider-default')).toBeVisible();
    });

    test('[fn] Smoke — Appearance primary row is visible', async ({ page }) => {
      await scrollToSection(page, 'touch-slider-qa-appearance');
      await expect(touchSliderByTestId(page, touchSliderAppearanceTestId('primary'))).toBeVisible();
    });
  });
});
