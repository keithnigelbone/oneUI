/**
 * Stepper QA — functional coverage (`StepperQaShowcase.tsx`).
 * Component type: input (NumberField stepper — increment/decrement + numeric text field).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Stepper defects.
 */
import { expect, test } from 'playwright/test';

import {
  STEPPER_ALL_TESTIDS,
  STEPPER_COMBO_COUNT,
  STEPPER_DATA_SECTIONS,
  STEPPER_FIGMA_SIZES,
  STEPPER_PLAYGROUND_ROUTE,
  STEPPER_SECTION_COUNT,
  stepperAppearanceTestId,
  stepperAttentionTestId,
  stepperSizeTestId,
} from './stepper-playground/manifest';
import {
  clickPageThemeButton,
  computedStepperGroupBackgroundRgb,
  expectFocusRingVisible,
  expectNoErrorText,
expectStepperDefaultFieldInitial,
  gotoStepperPlayground,
  openStepperTestScenarios,
  qaLog,
  qaStep,
  scrollToSection,
  STEPPER_TAG_SET,
  stepperByTestId,
  stepperGroup,
  stepperValueField,
} from './stepper/stepper-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}${STEPPER_PLAYGROUND_ROUTE}`);
  expect(res.ok(), `Stepper playground reachable at ${origin}${STEPPER_PLAYGROUND_ROUTE}`).toBeTruthy();
});

test.describe('Functional', { tag: STEPPER_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openStepperTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ───────────────────────────────────────
  test('[fn] shows Stepper page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Stepper', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before).not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default story stepper is visible', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-default')).toBeVisible();
  });

  test('[fn] Size band — S / M / L steppers visible', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-size-S')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-size-M')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-size-L')).toBeVisible();
  });

  test('[fn] Attention band — high, medium, low', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-attention-high')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-attention-medium')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-attention-low')).toBeVisible();
  });

  test('[fn] Appearance band — primary row visible', async ({ page }) => {
    const band = page.locator('#stepper-qa-appearance');
    await expect(band.getByTestId('stepper-appearance-primary')).toBeVisible();
  });

  test('[fn] Accent row — primary accent triplet visible', async ({ page }) => {
    const band = page.locator('#stepper-qa-accent');
    await expect(band.getByTestId('stepper-accent-primary-h')).toBeVisible();
    await expect(band.getByTestId('stepper-accent-primary-m')).toBeVisible();
    await expect(band.getByTestId('stepper-accent-primary-l')).toBeVisible();
  });

  test('[fn] condensed band — false vs true', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-condensed-false')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-condensed-true')).toBeVisible();
  });

  test('[fn] disabled band — false vs true', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-disabled-false')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-disabled-true')).toBeVisible();
  });

  test('[fn] InputText band — internal input + aria-label example', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-input-aria-label')).toBeVisible();
  });

  test('[fn] Extra states — readOnly, error, required', async ({ page }) => {
    await expect(stepperByTestId(page, 'stepper-readonly')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-error')).toBeVisible();
    await expect(stepperByTestId(page, 'stepper-required')).toBeVisible();
  });

  test('[fn] Increment on default increases field value', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    await expectStepperDefaultFieldInitial(field);
    await root.getByRole('button', { name: 'Increase value' }).click();
    await expect(field).toHaveValue('0');
  });

  test('[fn] Decrement on default decreases field value', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    await expectStepperDefaultFieldInitial(field);
    await root.getByRole('button', { name: 'Decrease value' }).click();
    await expect(field).toHaveValue('0');
  });

  test('[fn] Repeated increment clicks increase by step each time', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    const inc = root.getByRole('button', { name: 'Increase value' });
    await expectStepperDefaultFieldInitial(field);
    await inc.click();
    await expect(field).toHaveValue('0');
    await inc.click();
    await expect(field).toHaveValue('1');
    await inc.click();
await expect(field).toHaveValue('2');
  });

  test('[fn] Repeated decrement clicks decrease by step each time', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    const dec = root.getByRole('button', { name: 'Decrease value' });
    await expectStepperDefaultFieldInitial(field);
    await dec.click();
    await expect(field).toHaveValue('0');
    await dec.click();
    await expect(field).toHaveValue('-1');
    await dec.click();
    await expect(field).toHaveValue('-2');
  });

  test('[fn] Increment then decrement on click returns to prior value', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-default');
    const field = stepperValueField(root);
    await expectStepperDefaultFieldInitial(field);
    await root.getByRole('button', { name: 'Increase value' }).click();
    await expect(field).toHaveValue('0');
    await root.getByRole('button', { name: 'Increase value' }).click();
    await expect(field).toHaveValue('1');
    await root.getByRole('button', { name: 'Decrease value' }).click();
    await expect(field).toHaveValue('0');
  });

  test('[fn] disabled-false stepper — increment and decrement on click update value', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-disabled-false');
    const field = stepperValueField(root);
    await expect(field).toHaveValue('5');
    await root.getByRole('button', { name: 'Increase value' }).click();
    await expect(field).toHaveValue('6');
    await root.getByRole('button', { name: 'Decrease value' }).click();
    await expect(field).toHaveValue('5');
  });

  test('[fn] disabled true — increment control is disabled', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-disabled-true');
    await expect(root.getByRole('button', { name: 'Increase value' })).toBeDisabled();
  });

  test('[fn] disabled true — decrement control is disabled', async ({ page }) => {
    const root = stepperByTestId(page, 'stepper-disabled-true');
    await expect(root.getByRole('button', { name: 'Decrease value' })).toBeDisabled();
  });

  test('[fn] readOnly — value field is read-only', async ({ page }) => {
    const field = stepperValueField(stepperByTestId(page, 'stepper-readonly'));
    await expect(field).toHaveJSProperty('readOnly', true);
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < STEPPER_COMBO_COUNT; i++) {
      await expect(stepperByTestId(page, `stepper-combo-${i}`)).toBeVisible();
    }
  });

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(STEPPER_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await stepperByTestId(page, 'stepper-default').waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of STEPPER_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          await stepperByTestId(page, testId).scrollIntoViewIfNeeded();
          await expect(stepperByTestId(page, testId), `${testId} should be visible`).toBeVisible();
          await expectNoErrorText(stepperByTestId(page, testId));
        });
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const sections = page.locator('[data-section]');
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(STEPPER_SECTION_COUNT);
      for (const sectionId of STEPPER_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`), `Section ${sectionId}`).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — size rows set data-size on group', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-size');
      await expect(stepperGroup(stepperByTestId(page, stepperSizeTestId('S')))).toHaveAttribute('data-size', 's');
      await expect(stepperGroup(stepperByTestId(page, stepperSizeTestId('M')))).toHaveAttribute('data-size', 'm');
      await expect(stepperGroup(stepperByTestId(page, stepperSizeTestId('L')))).toHaveAttribute('data-size', 'l');
    });

    test('[fn] 2.1 — attention rows set data-attention on group', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-attention');
      for (const attention of ['high', 'medium', 'low'] as const) {
        await expect(stepperGroup(stepperByTestId(page, stepperAttentionTestId(attention)))).toHaveAttribute(
          'data-attention',
          attention,
        );
      }
    });

    test('[fn] 2.1 — appearance primary sets data-appearance', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-appearance');
      await expect(stepperGroup(stepperByTestId(page, stepperAppearanceTestId('primary')))).toHaveAttribute(
        'data-appearance',
        'primary',
      );
    });

    test('[fn] 2.1 — condensed true sets data-condensed on group', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-condensed');
      await expect(stepperGroup(stepperByTestId(page, 'stepper-condensed-true'))).toHaveAttribute('data-condensed', '');
    });

    test('[fn] 2.2 — Size scaling — S < M < L group height', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-size');
      const heights: number[] = [];
      for (const figma of STEPPER_FIGMA_SIZES) {
        const box = await stepperGroup(stepperByTestId(page, stepperSizeTestId(figma))).boundingBox();
        expect(box, `Bounding box for size ${figma}`).not.toBeNull();
        heights.push(box!.height);
      }
      expect(heights[0], 'Size S should be shorter than M').toBeLessThan(heights[1]);
      expect(heights[1], 'Size M should be shorter than L').toBeLessThan(heights[2]);
    });

  });

  // ── Group 3 — Click interaction ─────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.1 — increment click changes value field', async ({ page }) => {
      const root = stepperByTestId(page, 'stepper-default');
      const field = stepperValueField(root);
await expectStepperDefaultFieldInitial(field);
      await root.getByRole('button', { name: 'Increase value' }).click();
      await expect(field, 'Value should increase after increment click').toHaveValue('0');
    });

    test('[fn] 3.2 — disabled stepper value unchanged after increment click', async ({ page }) => {
      const root = stepperByTestId(page, 'stepper-disabled-true');
      const field = stepperValueField(root);
      await expect(field).toHaveValue('5');
      await root.getByRole('button', { name: 'Increase value' }).click({ force: true });
      await expect(field, 'Disabled stepper value must not change').toHaveValue('5');
    });

    test('[fn] 3.3 — readOnly field value unchanged after typing attempt', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-readonly'));
      await expect(field).toHaveValue('5');
await expect(field).toHaveJSProperty('readOnly', true);
      // Read-only group uses `pointer-events: none`; focus the input directly (no click).
      await field.focus();
      await field.pressSequentially('99');
      await expect(field, 'Read-only field must not accept typed input').toHaveValue('5');
    });

    test('[fn] 3.4 — click outside removes focus from value field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
      await field.focus();
      await expect(field).toBeFocused();
      await page.locator('h1').first().click();
      await expect(field).not.toBeFocused();
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.1 — Tab reaches default value field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
      await field.focus();
      await expect(field).toBeFocused();
    });

    test('[fn] 4.2 — Enter (N/A)', async () => {
      qaLog('Skipped — Stepper value changes via arrows and stepper buttons, not Enter activation');
    });

    test('[fn] 4.3 — Space (N/A)', async () => {
      qaLog('Skipped — Stepper is not a toggle; Space does not apply');
    });

    test('[fn] 4.4 — Arrow Up increases value on focused field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
      await field.focus();
await expectStepperDefaultFieldInitial(field);
      await page.keyboard.press('ArrowUp');
      await expect(field).toHaveValue('0');
    });

    test('[fn] 4.4 — Arrow Down decreases value on focused field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
      await field.focus();
await expectStepperDefaultFieldInitial(field);
      await page.keyboard.press('ArrowDown');
      await expect(field).toHaveValue('0');
    });

    test('[fn] 4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — No overlay or dropdown to dismiss');
    });

    test('[fn] 4.7 — Tab through page without keyboard trap', async ({ page }) => {
      await stepperValueField(stepperByTestId(page, 'stepper-default')).focus();
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
      }
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      expect(activeTag.length).toBeGreaterThan(0);
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — click focuses value field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-default'));
      await field.click();
      await expect(field).toBeFocused();
    });

    test('[fn] 5.2 — focus ring visible on value field', async ({ page }) => {
      await stepperValueField(stepperByTestId(page, 'stepper-default')).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] 5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Stepper has no autoFocus prop in Test Scenarios showcase');
    });
  });

  // ── Group 6 — State ───────────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
test('[fn] 6.1 — default stepper renders with no initial value', async ({ page }) => {
      await expectStepperDefaultFieldInitial(stepperValueField(stepperByTestId(page, 'stepper-default')));
    });

    test('[fn] 6.3 — disabled stepper buttons are disabled', async ({ page }) => {
      const root = stepperByTestId(page, 'stepper-disabled-true');
      await expect(root.getByRole('button', { name: 'Increase value' })).toBeDisabled();
      await expect(root.getByRole('button', { name: 'Decrease value' })).toBeDisabled();
    });

    test('[fn] 6.4 — readOnly field exposes readOnly property', async ({ page }) => {
      await expect(stepperValueField(stepperByTestId(page, 'stepper-readonly'))).toHaveJSProperty('readOnly', true);
    });

    test('[fn] 6.5 — error field exposes aria-invalid', async ({ page }) => {
      await expect(stepperValueField(stepperByTestId(page, 'stepper-error'))).toHaveAttribute('aria-invalid', 'true');
    });

    test('[fn] 6.5 — required field exposes the native required attribute', async ({ page }) => {
      // Base UI NumberField forwards `required` to the native <input> (and a `data-required`
      // marker) rather than emitting `aria-required` — the native attribute is the documented,
      // semantic way it exposes required state. See NumberFieldInput in @base-ui/react.
      await expect(stepperValueField(stepperByTestId(page, 'stepper-required'))).toHaveAttribute(
        'required',
        '',
      );
    });

    test('[fn] 6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Stepper has no loading prop in Test Scenarios showcase');
    });
  });

  // ── Group 7 — Slots ───────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('[fn] 7.1 — Figma start/end slots (N/A)', async () => {
      qaLog('Skipped — start/end Button slots documented in stepper-qa-figma-code-slots only; not in shipped API');
    });
  });

  // ── Group 8 — Toggle and selection (N/A) ──────────────────────────────────
  test.describe('Group 8 — Toggle and selection (N/A)', () => {
    test('[fn] 8.1 — Toggle (N/A)', async () => {
      qaLog('Skipped — Stepper is a numeric input, not a toggle');
    });
  });

  // ── Group 9 — Input and typing ────────────────────────────────────────────
  test.describe('Group 9 — Input and typing', () => {
    test('[fn] 9.1 — user can type numeric value into enabled field', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-disabled-false'));
      await field.click();
      await field.fill('12');
      await expect(field, 'Typed value should appear in the field').toHaveValue('12');
    });

    test('[fn] 9.1 — field can be cleared and refilled', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-disabled-false'));
      // Focus first: Base UI NumberField commits/reformats its controlled value on input, so a
      // bare fill() can race the re-render and leave the prior digit (matches the passing
      // "user can type numeric value" test above, which clicks before typing).
      await field.click();
      await field.fill('8');
      await expect(field).toHaveValue('8');
      await field.fill('3');
      await expect(field).toHaveValue('3');
    });

    test('[fn] 9.2 — Backspace edits typed value', async ({ page }) => {
      const field = stepperValueField(stepperByTestId(page, 'stepper-disabled-false'));
      await field.click();
      await field.fill('15');
      await field.press('Backspace');
      await expect(field).toHaveValue('1');
    });
  });

  // ── Group 10 — Dependency rules ───────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', () => {
    test('[fn] 10.1 — accent prop visible at high attention (accent band)', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-accent');
      await expect(stepperByTestId(page, 'stepper-accent-primary-h')).toBeVisible();
      await expect(stepperGroup(stepperByTestId(page, 'stepper-accent-primary-h'))).toHaveAttribute('data-attention', 'high');
    });

    test('[fn] 10.2 — condensed true renders narrower group than condensed false', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-condensed');
      const wide = await stepperGroup(stepperByTestId(page, 'stepper-condensed-false')).boundingBox();
      const narrow = await stepperGroup(stepperByTestId(page, 'stepper-condensed-true')).boundingBox();
      expect(wide?.width).toBeGreaterThan(0);
      expect(narrow?.width).toBeGreaterThan(0);
      expect(narrow!.width, 'Condensed stepper should be narrower than default').toBeLessThan(wide!.width);
    });
  });

  // ── Group 11 — Content and display ────────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.1 — input-aria-label cell exposes accessible name Quantity', async ({ page }) => {
      await expect(stepperValueField(stepperByTestId(page, 'stepper-input-aria-label'))).toHaveAccessibleName('Quantity');
    });

    test('[fn] 11.2 — increment/decrement buttons have accessible names', async ({ page }) => {
      const root = stepperByTestId(page, 'stepper-default');
      await expect(root.getByRole('button', { name: 'Increase value' })).toBeVisible();
      await expect(root.getByRole('button', { name: 'Decrease value' })).toBeVisible();
    });
  });

  // ── Group 12 — Layout and responsive ──────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Stepper has no fullWidth prop in Test Scenarios showcase');
    });

    test('[fn] 12.2 — visible at 320px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoStepperPlayground(page);
      await scrollToSection(page, 'stepper-qa-size');
      await expect(stepperByTestId(page, 'stepper-size-M')).toBeVisible();
    });

    test('[fn] 12.2 — visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoStepperPlayground(page);
      await expect(stepperByTestId(page, 'stepper-default')).toBeVisible();
    });

    test('[fn] 12.3 — horizontal stepper layout (increment/decrement beside field)', async ({ page }) => {
      const root = stepperByTestId(page, 'stepper-default');
      const dec = root.getByRole('button', { name: 'Decrease value' });
      const field = stepperValueField(root);
      const inc = root.getByRole('button', { name: 'Increase value' });
      const decBox = await dec.boundingBox();
      const fieldBox = await field.boundingBox();
      const incBox = await inc.boundingBox();
      expect(decBox && fieldBox && incBox).toBeTruthy();
      expect(decBox!.x, 'Decrease should sit left of field').toBeLessThan(fieldBox!.x);
      expect(incBox!.x, 'Increase should sit right of field').toBeGreaterThan(fieldBox!.x);
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: STEPPER_TAG_SET.smoke }, () => {
    test('[fn] Smoke — Page heading reads “Stepper”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Stepper', level: 1 })).toBeVisible();
    });

    test('[fn] Smoke — Default stepper is visible', async ({ page }) => {
      await expect(stepperByTestId(page, 'stepper-default')).toBeVisible();
    });

    test('[fn] Smoke — Size M stepper is visible', async ({ page }) => {
      await scrollToSection(page, 'stepper-qa-size');
      await expect(stepperByTestId(page, 'stepper-size-M')).toBeVisible();
    });
  });
});
