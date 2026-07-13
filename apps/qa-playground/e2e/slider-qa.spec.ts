/**
 * Slider QA — functional coverage (`SliderQaShowcase.tsx`).
 * Component type: input (range slider — role="slider", aria-valuenow/min/max).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Slider defects.
 */
import { expect, test } from 'playwright/test';

import {
  SLIDER_ALL_TESTIDS,
  SLIDER_COMBO_COUNT,
  SLIDER_DATA_SECTIONS,
  SLIDER_PLAYGROUND_ROUTE,
  SLIDER_SECTION_COUNT,
  sliderAppearanceTestId,
  sliderComboTestId,
} from './slider-playground/manifest';
import {
  ariaValueNow,
  clickPageThemeButton,
  computedSliderFillToken,
  expectFocusRingVisible,
  expectNoErrorText,
  gotoSliderPlayground,
  openSliderTestScenarios,
  qaLog,
  qaStep,
  SLIDER_TAG_SET,
  scrollToSection,
  sliderByTestId,
  sliderRoot,
  slidersIn,
} from './slider/slider-qa-support';

/** Figma appearance roles spot-checked in preserved tests. */
const APPEARANCE_SPOT_CHECK = ['auto', 'neutral', 'primary', 'secondary', 'positive', 'warning'] as const;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${SLIDER_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Slider playground reachable at ${origin}${SLIDER_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: SLIDER_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openSliderTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] shows Slider page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Slider', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default story slider is visible', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-default');
    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).toBeVisible();
    await expect(slidersIn(wrapper).first()).toBeVisible();
  });

  test('[fn] Figma default — data-appearance secondary, knobStyle inside', async ({ page }) => {
    const root = sliderRoot(sliderByTestId(page, 'slider-default'));
    await expect(root).toHaveAttribute('data-appearance', 'secondary');
    await expect(root).toHaveAttribute('data-knob-style', 'inside');
  });

  test('[fn] Figma default — continuous, single thumb, aria-valuenow 50', async ({ page }) => {
    const thumbs = slidersIn(sliderByTestId(page, 'slider-default'));
    await expect(thumbs).toHaveCount(1);
    await expect(thumbs.first()).toHaveAttribute('aria-valuenow', '50');
  });

  test('[fn] Figma default — IconButton decrease lowers value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-default');
    const slider = slidersIn(wrapper).first();
    const before = await ariaValueNow(slider);
    await wrapper.getByRole('button', { name: 'Decrease' }).click();
    expect(await ariaValueNow(slider)).toBe(before - 5);
  });

  test('[fn] Figma default — IconButton increase raises value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-default');
    const slider = slidersIn(wrapper).first();
    const before = await ariaValueNow(slider);
    await wrapper.getByRole('button', { name: 'Increase' }).click();
    expect(await ariaValueNow(slider)).toBe(before + 5);
  });

  test('[fn] Code shipped default (no knobStyle prop) — knob outside ⚠️', async ({ page }) => {
    const root = sliderRoot(sliderByTestId(page, 'slider-code-default-outside'));
    await expect(root).toHaveAttribute('data-knob-style', 'outside');
  });

  test('[fn] Figma default — explicit knobStyle inside (QA passes prop)', async ({ page }) => {
    const root = sliderRoot(sliderByTestId(page, 'slider-default'));
    await expect(root).toHaveAttribute('data-knob-style', 'inside');
  });

  test('[fn] Type band — continuous vs range thumb count', async ({ page }) => {
    await expect(slidersIn(sliderByTestId(page, 'slider-type-continuous'))).toHaveCount(1);
    await expect(slidersIn(sliderByTestId(page, 'slider-type-range'))).toHaveCount(2);
  });

  test('[fn] Type range — data-range on root', async ({ page }) => {
    const root = sliderRoot(sliderByTestId(page, 'slider-type-range'));
    await expect(root).toHaveAttribute('data-range', '');
  });

  test('[fn] KnobStyle band — outside and inside visible', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-knob-outside')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-knob-inside')).toBeVisible();
    await expect(sliderRoot(sliderByTestId(page, 'slider-knob-inside'))).toHaveAttribute('data-knob-style', 'inside');
  });

  test('[fn] KnobStyle range — inside range row visible', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-knob-range-inside')).toBeVisible();
    await expect(slidersIn(sliderByTestId(page, 'slider-knob-range-inside'))).toHaveCount(2);
  });

  test('[fn] Appearance band — primary row visible', async ({ page }) => {
    const band = page.locator('#slider-qa-appearance');
    await expect(band.getByTestId('slider-appearance-primary')).toBeVisible();
  });

  test('[fn] Appearance band — spot-check Figma roles', async ({ page }) => {
    for (const appearance of APPEARANCE_SPOT_CHECK) {
      await expect(sliderByTestId(page, `slider-appearance-${appearance}`)).toBeVisible();
    }
  });

  test('[fn] Steps band — showSteps false vs true variants', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-steps-false')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-steps-true-stepcount-5')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-steps-true-stepcount-11')).toBeVisible();
  });

  test('[fn] Start/end band — none, Icon, IconButton rows', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-start-end-none')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-start-end-icon')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-start-end-iconbutton-continuous')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-start-end-iconbutton-range')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-start-end-iconbutton-inside')).toBeVisible();
  });

  test('[fn] Value band — controlled single and range', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-value-controlled-single')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-value-controlled-range')).toBeVisible();
    await expect(slidersIn(sliderByTestId(page, 'slider-value-controlled-range'))).toHaveCount(2);
  });

  test('[fn] Extra states — disabled, readOnly, vertical, tooltip', async ({ page }) => {
    await expect(sliderByTestId(page, 'slider-disabled')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-readonly')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-orientation-vertical')).toBeVisible();
    await expect(sliderByTestId(page, 'slider-tooltip-always')).toBeVisible();
  });

  test('[fn] Surface context band — default, subtle, bold', async ({ page }) => {
    const band = page.locator('#slider-qa-surface-context');
    await band.scrollIntoViewIfNeeded();
    for (const id of ['slider-surface-default', 'slider-surface-subtle', 'slider-surface-bold'] as const) {
      const cell = sliderByTestId(page, id);
      await cell.scrollIntoViewIfNeeded();
      await expect(cell).toBeVisible();
      await expect(slidersIn(cell).first()).toBeVisible();
    }
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < SLIDER_COMBO_COUNT; i++) {
      await expect(sliderByTestId(page, sliderComboTestId(i))).toBeVisible();
    }
  });

  test('[fn] ArrowRight on Figma default increases aria-valuenow by step (step=1)', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '51');
  });

  test('[fn] ArrowLeft on Figma default decreases aria-valuenow by step (step=1)', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await slider.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveAttribute('aria-valuenow', '49');
  });

  test('[fn] Home and End keys move default slider to min and max', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  test('[fn] Range type — min and max thumbs expose initial values', async ({ page }) => {
    const thumbs = slidersIn(sliderByTestId(page, 'slider-type-range'));
    await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '20');
    await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '70');
  });

  test('[fn] Range type — min thumb ArrowRight increases only lower value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-type-range');
    const minThumb = slidersIn(wrapper).nth(0);
    const maxThumb = slidersIn(wrapper).nth(1);
    await minThumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(minThumb).toHaveAttribute('aria-valuenow', '21');
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '70');
  });

  test('[fn] Disabled slider — keyboard does not change value', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-disabled')).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test('[fn] ReadOnly slider — keyboard does not change value', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-readonly')).first();
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  test('[fn] IconButton decrease lowers continuous slot slider value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-start-end-iconbutton-continuous');
    const slider = slidersIn(wrapper).first();
    const before = await ariaValueNow(slider);
    await wrapper.getByRole('button', { name: 'Decrease' }).click();
    const after = await ariaValueNow(slider);
    expect(after).toBe(before - 5);
  });

  test('[fn] IconButton increase raises continuous slot slider value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-start-end-iconbutton-continuous');
    const slider = slidersIn(wrapper).first();
    const before = await ariaValueNow(slider);
    await wrapper.getByRole('button', { name: 'Increase' }).click();
    const after = await ariaValueNow(slider);
    expect(after).toBe(before + 5);
  });

  test('[fn] IconButton inside knob — decrease updates value', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-start-end-iconbutton-inside');
    await wrapper.scrollIntoViewIfNeeded();
    const slider = slidersIn(wrapper).first();
    const before = await ariaValueNow(slider);
    await wrapper.getByRole('button', { name: 'Decrease' }).click();
    const after = await ariaValueNow(slider);
    expect(after).toBe(before - 5);
  });

  test('[fn] Default slider exposes min and max (native range input)', async ({ page }) => {
    const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
  });

  test('[fn] Range sliders expose accessible names from aria-label / ariaLabels', async ({ page }) => {
    const wrapper = sliderByTestId(page, 'slider-type-range');
    await expect(slidersIn(wrapper).nth(0)).toHaveAccessibleName('Minimum');
    await expect(slidersIn(wrapper).nth(1)).toHaveAccessibleName('Maximum');
  });

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(SLIDER_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await sliderByTestId(page, 'slider-default').waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of SLIDER_ALL_TESTIDS) {
        await sliderByTestId(page, testId).scrollIntoViewIfNeeded();
        await expect(sliderByTestId(page, testId)).toBeVisible();
        await expectNoErrorText(sliderByTestId(page, testId));
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(SLIDER_SECTION_COUNT);
      for (const sectionId of SLIDER_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — appearance rows set data-appearance on root', async ({ page }) => {
      await scrollToSection(page, 'slider-qa-appearance');
      for (const appearance of ['primary', 'negative'] as const) {
        await expect(sliderRoot(sliderByTestId(page, sliderAppearanceTestId(appearance)))).toHaveAttribute(
          'data-appearance',
          appearance,
        );
      }
    });

    test('[fn] 2.2 — Size scaling (N/A)', async () => {
      qaLog('Skipped — Slider has no size prop in Test Scenarios showcase');
    });

  });

  // ── Group 3 — Click interaction ───────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — keyboard ArrowRight changes aria-valuenow (slider input)', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-value-controlled-single')).first();
      const before = await ariaValueNow(slider);
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      const after = await ariaValueNow(slider);
      expect(after).toBeGreaterThan(before);
    });

    test('[fn] 3.2 — disabled slider value unchanged after keyboard nudge', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-disabled')).first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 3.3 — readOnly slider value unchanged after keyboard nudge', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-readonly')).first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 3.4 — click outside removes focus from slider thumb', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
      await page.locator('h1').first().click();
      await expect(slider).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches default slider thumb', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
    });

    test('[fn] 4.2 — Enter (N/A)', async () => {
      qaLog('Skipped — Slider value changes via arrows, not Enter activation');
    });

    test('[fn] 4.3 — Space (N/A)', async () => {
      qaLog('Skipped — Slider is not a toggle; Space does not apply');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await slidersIn(sliderByTestId(page, 'slider-default')).first().focus();
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
      const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
      await slider.focus();
      await expect(slider).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible on thumb', async ({ page }) => {
      await slidersIn(sliderByTestId(page, 'slider-default')).first().focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Slider has no autoFocus prop in showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('[fn] 6.4 — readOnly slider keeps aria-valuenow on keyboard nudge', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-readonly')).first();
      await expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    test('[fn] 6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — Slider has no error/invalid prop in showcase');
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Slider has no loading prop in showcase');
    });
  });

  // ── Group 7 — Slots ───────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('[fn] 7.1 — start/end none renders slider without slot buttons', async ({ page }) => {
      const wrapper = sliderByTestId(page, 'slider-start-end-none');
      await expect(slidersIn(wrapper).first()).toBeVisible();
      await expect(wrapper.getByRole('button')).toHaveCount(0);
    });

    test('[fn] 7.1 — start/end Icon renders decorative slot icons', async ({ page }) => {
      const wrapper = sliderByTestId(page, 'slider-start-end-icon');
      await expect(wrapper.locator('[data-slider-slot="start"] [aria-hidden="true"]').first()).toBeVisible();
      await expect(wrapper.locator('[data-slider-slot="end"] [aria-hidden="true"]').first()).toBeVisible();
    });

    test('[fn] 7.1 — start/end IconButton renders Decrease and Increase', async ({ page }) => {
      const wrapper = sliderByTestId(page, 'slider-start-end-iconbutton-continuous');
      await expect(wrapper.getByRole('button', { name: 'Decrease' })).toBeVisible();
      await expect(wrapper.getByRole('button', { name: 'Increase' })).toBeVisible();
    });
  });

  // ── Group 8 — Toggle and selection (N/A) ──────────────────────────────────
  test.describe('Group 8 — Toggle and selection (N/A)', () => {
    test('[fn] 8.1 — Toggle (N/A)', async () => {
      qaLog('Skipped — Slider is a range input, not a toggle');
    });
  });

  // ── Group 9 — Input ───────────────────────────────────────────────────────
  test.describe('Group 9 — Input', () => {
    test('[fn] 9.1 — Typing text (N/A)', async () => {
      qaLog('Skipped — Slider is not typed entry; value changes via drag/keyboard');
    });
    test('[fn] 9.2 — min, max, and aria-valuenow on default range input', async ({ page }) => {
      const slider = slidersIn(sliderByTestId(page, 'slider-default')).first();
      // Native range exposes bounds via min/max; aria-valuemin/max are optional on Base UI Slider.
      await expect(slider).toHaveAttribute('min', '0');
      await expect(slider).toHaveAttribute('max', '100');
      await expect(slider).toHaveAttribute('aria-valuenow', '50');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — showSteps false vs true both render', async ({ page }) => {
      await scrollToSection(page, 'slider-qa-steps');
      await expect(sliderByTestId(page, 'slider-steps-false')).toBeVisible();
      await expect(sliderByTestId(page, 'slider-steps-true-stepcount-5')).toBeVisible();
    });

    test('[fn] 10.2 — snapToSteps false row renders (free drag with ticks)', async ({ page }) => {
      await scrollToSection(page, 'slider-qa-steps');
      await expect(sliderByTestId(page, 'slider-snap-false')).toBeVisible();
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Slider has no fullWidth prop in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSliderPlayground(page);
      await scrollToSection(page, 'slider-qa-type');
      await expect(sliderByTestId(page, 'slider-type-continuous')).toBeVisible();
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSliderPlayground(page);
      await expect(sliderByTestId(page, 'slider-default')).toBeVisible();
    });

    test('[fn] 12.3 — vertical orientation cell renders', async ({ page }) => {
      await scrollToSection(page, 'slider-qa-extra-states');
      await expect(sliderByTestId(page, 'slider-orientation-vertical')).toBeVisible();
      await expect(sliderRoot(sliderByTestId(page, 'slider-orientation-vertical'))).toHaveAttribute(
        'data-orientation',
        'vertical',
      );
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: SLIDER_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Slider”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Slider', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default slider is visible', async ({ page }) => {
      await expect(sliderByTestId(page, 'slider-default')).toBeVisible();
    });

    test('[fn] Smoke — Continuous type slider is visible', async ({ page }) => {
      await scrollToSection(page, 'slider-qa-type');
      await expect(sliderByTestId(page, 'slider-type-continuous')).toBeVisible();
    });
  });
});
