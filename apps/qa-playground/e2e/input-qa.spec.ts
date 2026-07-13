/**
 * Input QA playground — functional Playwright tests.
 * Selectors mirror `InputQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **input** (native `<input>` — interactive, tabbable, typing).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Input defects.
 *
 * **Raised defect (tests must fail until fixed — do not soften):**
 * - BUG-INPUT-001 — feedback/error state (`input-error`) must expose `aria-invalid="true"`
 *   on the control (Group 6.5, a11y). Shell uses `data-invalid` only today.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/input-playground/manifest.ts` → `INPUT_DATA_SECTIONS` (14 bands)
 * - data-testid: `INPUT_ALL_TESTIDS` (inputs + password visibility toggle)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  expectSectionVisible,
  INPUT_SHOWCASE_AXE_SCOPE,
  INPUT_TAG_SET,
  InputTags,
  inputByTestId,
  openInputTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './input/input-qa-support';
import {
  expectFocusVisible,
  inputSection,
  inputShellBackgroundRgb,
  inputShellByTestId,
  moveInputCaretToEnd,
  moveInputCaretToStart,
} from './input-playground/inputHelpers';
import {
  INPUT_ALL_TESTIDS,
  INPUT_COMBO_COUNT,
  INPUT_DATA_SECTIONS,
  INPUT_FIGMA_APPEARANCES,
  INPUT_FIGMA_ATTENTIONS,
  INPUT_FIGMA_SHAPES,
  INPUT_FIGMA_SIZES,
  INPUT_FIGMA_STATES,
  INPUT_HTML_TYPES,
  INPUT_ROOT_TESTIDS,
  INPUT_SECTION_COUNT,
  INPUT_SLOT_END,
  INPUT_SLOT_END2,
  INPUT_SLOT_START,
  INPUT_SLOT_START2,
  inputAppearanceTestId,
  inputAttentionTestId,
  inputShapeTestId,
  inputSizeAliasTestId,
  inputSizeTestId,
  inputSlotEnd2TestId,
  inputSlotEndTestId,
  inputSlotStart2TestId,
  inputSlotStartTestId,
  inputStateTestId,
} from './input-playground/manifest';

const D = INPUT_ROOT_TESTIDS.default;

function isTransparentRgb(rgb: string): boolean {
  return rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)';
}

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/input`);
  expect(res.ok(), `Input playground should be reachable at ${origin}/c/input`).toBeTruthy();
});

test.describe('Functional', { tag: INPUT_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openInputTestScenarios(page);
  });

  test('[fn] Shows Input page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Input', exact: true, level: 1 })).toBeVisible();
  });

  test('[fn] All showcase sections render without error', async ({ page }) => {
    const sections = page.locator('[data-section^="input-qa-"]');
    const count = await sections.count();
    expect(count).toBe(INPUT_SECTION_COUNT);
    for (let i = 0; i < count; i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('[fn] Default input renders and accepts typing', async ({ page }) => {
    const input = inputByTestId(page, D);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.fill('Hello World');
    await expect(input).toHaveValue('Hello World');
  });

  for (const figma of INPUT_FIGMA_SIZES) {
    test(`[fn] Size ${figma} renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSizeTestId(figma))).toBeVisible();
    });
  }

  test('[fn] Size S height is less than or equal to size M', async ({ page }) => {
    await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
    const small = inputByTestId(page, inputSizeTestId('S'));
    const medium = inputByTestId(page, inputSizeTestId('M'));
    const smallBox = await small.boundingBox();
    const mediumBox = await medium.boundingBox();
    expect(smallBox).not.toBeNull();
    expect(mediumBox).not.toBeNull();
    expect(smallBox!.height).toBeLessThanOrEqual(mediumBox!.height + 2);
  });

  for (const alias of ['small', 'medium', 'large'] as const) {
    test(`[fn] Legacy size alias "${alias}" renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSizeAliasTestId(alias))).toBeVisible();
    });
  }

  for (const attention of INPUT_FIGMA_ATTENTIONS) {
    test(`[fn] Attention ${attention} renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-attention"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputAttentionTestId(attention))).toBeVisible();
    });
  }

  for (const appearance of INPUT_FIGMA_APPEARANCES) {
    test(`[fn] Appearance ${appearance} renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-appearance"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputAppearanceTestId(appearance))).toBeVisible();
    });
  }

  for (const shape of INPUT_FIGMA_SHAPES) {
    test(`[fn] Shape ${shape} renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-shape"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputShapeTestId(shape))).toBeVisible();
    });
  }

  for (const state of INPUT_FIGMA_STATES) {
    test(`[fn] State ${state} renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputStateTestId(state))).toBeVisible();
    });
  }

  test('[fn] Filled state shows preset value', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, inputStateTestId('filled'))).toHaveValue('Filled value');
  });

  test('[fn] Disabled state rejects focus and typing', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, inputStateTestId('disabled'));
    await expect(input).toBeDisabled();
    await input.click({ force: true });
    await expect(input).not.toBeFocused();
  });

  test('[fn] Read-only state keeps value when typing', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, inputStateTestId('readonly'));
    const before = await input.inputValue();
    await input.focus();
    await page.keyboard.type('xyz');
    await expect(input).toHaveValue(before);
  });

  test('[fn] Feedback state marks shell invalid and exposes aria-invalid on control', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const testId = inputStateTestId('feedback');
    await expect(inputShellByTestId(page, testId)).toHaveAttribute('data-invalid', 'true');
    await expect(
      inputByTestId(page, testId),
      'BUG-INPUT-001: errorHighlight must set aria-invalid on the control',
    ).toHaveAttribute('aria-invalid', 'true');
  });

  test('[fn] Required input exposes the required attribute', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.required)).toHaveAttribute('required', '');
  });

  for (const kind of INPUT_SLOT_START) {
    test(`[fn] Start slot (${kind}) renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotStartTestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_START2) {
    test(`[fn] Second start slot (${kind}) renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotStart2TestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_END) {
    test(`[fn] End slot (${kind}) renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotEndTestId(kind))).toBeVisible();
    });
  }

  for (const kind of INPUT_SLOT_END2) {
    test(`[fn] Second end slot (${kind}) renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputSlotEnd2TestId(kind))).toBeVisible();
    });
  }

  test('[fn] Password type masks value and visibility toggle works', async ({ page }) => {
    await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.typePassword);
    const toggle = page.getByTestId(INPUT_ROOT_TESTIDS.passwordToggle);
    await expect(input).toHaveAttribute('type', 'password');
    await input.fill('secret');
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'text');
  });

  for (const { type, testId } of INPUT_HTML_TYPES) {
    if (type === 'password') continue;
    test(`[fn] HTML input type "${type}" renders`, async ({ page }) => {
      await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, testId);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', type);
    });
  }

  test('[fn] Email type accepts a valid email string', async ({ page }) => {
    await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.typeEmail);
    await input.fill('test@example.com');
    await expect(input).toHaveValue('test@example.com');
  });

  test('[fn] Number type accepts numeric values', async ({ page }) => {
    await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.typeNumber);
    await input.fill('12345');
    await expect(input).toHaveValue('12345');
  });

  test('[fn] Placeholder text is present when the field is empty', async ({ page }) => {
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.placeholder);
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder?.trim()).not.toBe('');
  });

  test('[fn] Input accepts special characters', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.fill('Hello@World#123!');
    await expect(input).toHaveValue('Hello@World#123!');
  });

  test('[fn] Input can be cleared', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.fill('Some text');
    await input.clear();
    await expect(input).toHaveValue('');
  });

  test('[fn] Keyboard typing fills the field character by character', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.click();
    await page.keyboard.type('Test Input');
    await expect(input).toHaveValue('Test Input');
  });

  test('[fn] Max length demo truncates input to ten characters', async ({ page }) => {
    await page.locator('[data-section="input-qa-validation"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.maxlength);
    await input.fill('A'.repeat(20));
    expect((await input.inputValue()).length).toBeLessThanOrEqual(10);
  });

  test('[fn] Pattern validation demo input renders', async ({ page }) => {
    await page.locator('[data-section="input-qa-validation"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.pattern)).toBeVisible();
  });

  test('[fn] Start adornment example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-adornments"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.startAdornment)).toBeVisible();
  });

  test('[fn] End adornment example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-adornments"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.endAdornment)).toBeVisible();
  });

  test('[fn] Full-width layout example is visible', async ({ page }) => {
    await page.locator('[data-section="input-qa-layout"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.fullwidth)).toBeVisible();
  });

  test('[fn] Auto-focus example receives focus when focused explicitly', async ({ page }) => {
    await page.locator('[data-section="input-qa-layout"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.autofocus);
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('[fn] Clicking the visible label moves focus to the associated input', async ({ page }) => {
    await page.locator('[data-section="input-qa-labeled"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, INPUT_ROOT_TESTIDS.labeled);
    await page.getByLabel('Email', { exact: true }).click();
    await expect(input).toBeFocused();
  });

  test('[fn] Clicking the input focuses it', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.click();
    await expect(input).toBeFocused();
  });

  test('[fn] Tabbing away blurs the input', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.focus();
    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();
  });

  test('[fn] Read-only input can receive focus', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, inputStateTestId('readonly'));
    await input.click();
    await expect(input).toBeFocused();
  });

  test('[fn] Read-only input exposes the readonly attribute', async ({ page }) => {
    await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
    await expect(inputByTestId(page, inputStateTestId('readonly'))).toHaveAttribute('readonly', '');
  });

  test('[fn] Default input shows a visible focus indicator when focused', async ({ page }) => {
    await inputByTestId(page, D).focus();
    await expect(inputByTestId(page, D)).toBeFocused();
    await expectFocusVisible(page);
  });

  test('[fn] Backspace removes the last character', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.fill('Hello');
    await moveInputCaretToEnd(input);
    await page.keyboard.press('Backspace');
    await expect(input).toHaveValue('Hell');
  });

  test('[fn] Enter key does not hide or break the input', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.focus();
    await input.fill('test value');
    await page.keyboard.press('Enter');
    await expect(input).toBeVisible();
  });

  test('[fn] Escape key does not remove the input', async ({ page }) => {
    const input = inputByTestId(page, D);
    await input.focus();
    await input.fill('some text');
    await page.keyboard.press('Escape');
    await expect(input).toBeVisible();
  });

  test('[fn] Many input variants with data-testid are visible on the page', async ({ page }) => {
    const inputs = page.locator('[data-testid^="input-"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(20);
  });

  test('[fn] Figma combination matrix renders every row', async ({ page }) => {
    await page.locator('[data-section="input-qa-combos"]').scrollIntoViewIfNeeded();
    for (let i = 0; i < INPUT_COMBO_COUNT; i++) {
      await expect(page.getByTestId(`input-combo-${i}`)).toBeVisible();
    }
  });

  test('[fn] Figma XS size coerces to small and renders', async ({ page }) => {
    await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
    const input = inputByTestId(page, 'input-size-XS');
    await expect(input).toBeVisible();
    await expect(inputShellByTestId(page, 'input-size-XS')).toHaveAttribute('data-size', '8');
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [InputTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default input mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openInputTestScenarios(page);
      await qaStep('Assert no unexpected console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(inputByTestId(page, D)).toBeVisible();
      await expect(inputByTestId(page, D)).toBeEnabled();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      for (const testId of INPUT_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator = page.getByTestId(testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of INPUT_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="input-qa-"]')).toHaveCount(INPUT_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [InputTags.functional] }, () => {
    test('2.1 — Default input is enabled text control', async ({ page }) => {
      const input = inputByTestId(page, D);
      await expect(input).toHaveAttribute('type', 'text');
      await expect(input).toBeEnabled();
    });

    test('2.1 — Each HTML type exposes matching type attribute', async ({ page }) => {
      await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
      for (const { type, testId } of INPUT_HTML_TYPES) {
        await expect(inputByTestId(page, testId), testId).toHaveAttribute('type', type);
      }
    });

    test('2.1 — Pill shape shell differs from default shape border-radius', async ({ page }) => {
      await page.locator('[data-section="input-qa-shape"]').scrollIntoViewIfNeeded();
      const defaultShell = inputShellByTestId(page, inputShapeTestId('default'));
      const pillShell = inputShellByTestId(page, inputShapeTestId('pill'));
      const defaultRadius = await defaultShell.evaluate((el) => getComputedStyle(el).borderRadius);
      const pillRadius = await pillShell.evaluate((el) => getComputedStyle(el).borderRadius);
      expect(defaultRadius, 'default shape border-radius').not.toBe(pillRadius);
    });

    test('2.2 — Size S ≤ M ≤ L shell heights scale progressively', async ({ page }) => {
      await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
      const sBox = await inputShellByTestId(page, inputSizeTestId('S')).boundingBox();
      const mBox = await inputShellByTestId(page, inputSizeTestId('M')).boundingBox();
      const lBox = await inputShellByTestId(page, inputSizeTestId('L')).boundingBox();
      expect(sBox).not.toBeNull();
      expect(mBox).not.toBeNull();
      expect(lBox).not.toBeNull();
      expect(sBox!.height, 'S height ≤ M').toBeLessThanOrEqual(mBox!.height + 2);
      expect(mBox!.height, 'M height ≤ L').toBeLessThanOrEqual(lBox!.height + 2);
    });


  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [InputTags.functional] }, () => {
    test('3.1 — Click focuses default input and accepts typing', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.click();
      await expect(input).toBeFocused();
      await input.fill('clicked');
      await expect(input).toHaveValue('clicked');
    });

    test('3.2 — Disabled input does not receive focus on click', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputStateTestId('disabled'));
      await input.click({ force: true });
      await expect(input).not.toBeFocused();
      await expect(input).toBeDisabled();
    });

    test('3.3 — Readonly input keeps value after click and typing attempt', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputStateTestId('readonly'));
      const before = await input.inputValue();
      await input.click();
      await page.keyboard.type('abc');
      await expect(input).toHaveValue(before);
    });

    test('3.4 — Click outside blurs focused input', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.focus();
      await expect(input).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(input).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [InputTags.functional] }, () => {
    test('4.1 — Tab reaches default input from page chrome', async ({ page }) => {
      await inputByTestId(page, D).scrollIntoViewIfNeeded();
      await page.locator('body').click({ position: { x: 4, y: 4 } });
      let found = false;
      for (let i = 0; i < 50; i++) {
        const testId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        if (testId === D) {
          found = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(found, 'Default input should be reachable via Tab').toBe(true);
    });

    test('4.1 — Disabled input is not focused when tabbing through states band', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const disabled = inputByTestId(page, inputStateTestId('disabled'));
      await disabled.focus();
      await expect(disabled).not.toBeFocused();
    });

    test('4.2 — Enter key keeps input visible with value intact', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.focus();
      await input.fill('enter test');
      await page.keyboard.press('Enter');
      await expect(input).toBeVisible();
      await expect(input).toHaveValue('enter test');
    });

    test('4.3 — Space key inserts a space character while focused', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('hello');
      await input.focus();
      await input.press('End');
      await page.keyboard.press('Space');
      await expect(input).toHaveValue('hello ');
    });

    test('4.4 — ArrowLeft and ArrowRight move text cursor', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('abc');
      await input.focus();
      await input.press('End');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('X');
      await expect(input).toHaveValue('abXc');
    });

    test('4.5 — Home and End keys move cursor to start and end', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('navigate');
      await input.focus();
      await moveInputCaretToStart(input);
      await page.keyboard.type('!');
      await expect(input).toHaveValue('!navigate');
      await moveInputCaretToEnd(input);
      await page.keyboard.type('?');
      await expect(input).toHaveValue('!navigate?');
    });

    test('4.6 — Escape does not remove input from DOM', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.focus();
      await page.keyboard.press('Escape');
      await expect(input).toBeVisible();
    });

    test('4.7 — Tab through page does not trap focus inside default input', async ({ page }) => {
      await inputByTestId(page, D).focus();
      for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
      await expect(inputByTestId(page, D)).not.toBeFocused();
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [InputTags.functional] }, () => {
    test('5.1 — Click focuses default input', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.click();
      await expect(input).toBeFocused();
    });

    test('5.2 — Focused default input shows visible focus indicator', async ({ page }) => {
      await inputByTestId(page, D).focus();
      await expectFocusVisible(page);
    });

    test('5.3 — Label click moves focus to associated input (logical order)', async ({ page }) => {
      await page.locator('[data-section="input-qa-labeled"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, INPUT_ROOT_TESTIDS.labeled);
      await page.getByLabel('Email', { exact: true }).click();
      await expect(input).toBeFocused();
    });

    test('5.4 — Blur removes focus from input after Tab away', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.focus();
      await expect(input).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(input).not.toBeFocused();
    });

    test('5.5 — autoFocus input receives focus on page load', async ({ page }) => {
      await page.goto('/c/input');
      await inputByTestId(page, INPUT_ROOT_TESTIDS.autofocus).waitFor({ state: 'visible', timeout: 90_000 });
      await expect(
        inputByTestId(page, INPUT_ROOT_TESTIDS.autofocus),
        'autoFocus prop must focus the control on mount without user interaction',
      ).toBeFocused();
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [InputTags.functional] }, () => {
    test('6.1 — Idle state renders empty enabled input', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputStateTestId('idle'));
      await expect(input).toBeEnabled();
      await expect(input).toHaveValue('');
    });

    test('6.2 — Filled state shows preset value', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, inputStateTestId('filled'))).toHaveValue('Filled value');
    });

    test('6.3 — Disabled state is not editable and not focusable', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputStateTestId('disabled'));
      await expect(input).toBeDisabled();
      await input.focus();
      await expect(input).not.toBeFocused();
    });

    test('6.4 — Readonly state can focus but rejects edits', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, inputStateTestId('readonly'));
      await expect(input).toHaveAttribute('readonly', '');
      await input.click();
      await expect(input).toBeFocused();
    });

    test('6.5 — BUG-INPUT-001: feedback/error state exposes aria-invalid on control', async ({
      page,
    }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      const testId = inputStateTestId('feedback');
      await expect(inputShellByTestId(page, testId)).toHaveAttribute('data-invalid', 'true');
      await expect(
        inputByTestId(page, testId),
        'errorHighlight must set aria-invalid="true" for assistive tech (WCAG 4.1.2)',
      ).toHaveAttribute('aria-invalid', 'true');
    });

    test('6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Input showcase has no loading prop example');
    });
  });

  // ── GROUP 7 — Slots ────────────────────────────────────────────────────────
  test.describe('Group 7 — Start/end slots', { tag: [InputTags.functional] }, () => {
    test('7.1 — Each start slot variant renders visible input', async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      for (const kind of INPUT_SLOT_START) {
        await expect(inputByTestId(page, inputSlotStartTestId(kind)), `start-${kind}`).toBeVisible();
      }
    });

    test('7.2 — Each end slot variant renders visible input', async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      for (const kind of INPUT_SLOT_END) {
        await expect(inputByTestId(page, inputSlotEndTestId(kind)), `end-${kind}`).toBeVisible();
      }
    });

    test('7.3 — Dual start and dual end slot rows render', async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      for (const kind of INPUT_SLOT_START2) {
        await expect(inputByTestId(page, inputSlotStart2TestId(kind))).toBeVisible();
      }
      for (const kind of INPUT_SLOT_END2) {
        await expect(inputByTestId(page, inputSlotEnd2TestId(kind))).toBeVisible();
      }
    });

    test('7.4 — Start icon slot row includes visible SVG icon', async ({ page }) => {
      await page.locator('[data-section="input-qa-slots"]').scrollIntoViewIfNeeded();
      const band = inputSection(page, 'input-qa-slots');
      const iconRow = band.locator(`[data-testid="${inputSlotStartTestId('icon')}"]`).locator('xpath=..');
      await expect(iconRow.locator('svg').first()).toBeVisible();
    });
  });

  // ── GROUP 8 — Toggle and selection ─────────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [InputTags.functional] }, () => {
    test('8.1 — Password visibility toggle switches input type password ↔ text', async ({ page }) => {
      await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, INPUT_ROOT_TESTIDS.typePassword);
      const toggle = page.getByTestId(INPUT_ROOT_TESTIDS.passwordToggle);
      await expect(input).toHaveAttribute('type', 'password');
      await toggle.click();
      await expect(input).toHaveAttribute('type', 'text');
      await toggle.click();
      await expect(input).toHaveAttribute('type', 'password');
    });

    test('8.2 — Single select (N/A)', async () => {
      qaLog('Skipped — Input is not a single-select list');
    });

    test('8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — Input has no indeterminate state');
    });
  });

  // ── GROUP 9 — Input and typing ─────────────────────────────────────────────
  test.describe('Group 9 — Input and typing', { tag: [InputTags.functional] }, () => {
    test('9.1 — Type, special characters, and clear', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('Hello@World#123!');
      await expect(input).toHaveValue('Hello@World#123!');
      await input.clear();
      await expect(input).toHaveValue('');
    });

    test('9.2 — Backspace, Delete, and arrow cursor movement', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('abcd');
      await input.focus();
      await moveInputCaretToStart(input);
      await page.keyboard.press('Delete');
      await expect(input).toHaveValue('bcd');
      await moveInputCaretToEnd(input);
      await page.keyboard.press('Backspace');
      await expect(input).toHaveValue('bc');
    });

    test('9.3 — Max length demo enforces ten characters in showcase handler', async ({ page }) => {
      await page.locator('[data-section="input-qa-validation"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, INPUT_ROOT_TESTIDS.maxlength);
      await input.fill('123456789012345');
      expect((await input.inputValue()).length).toBeLessThanOrEqual(10);
    });

    test('9.3 — Number input accepts digits', async ({ page }) => {
      await page.locator('[data-section="input-qa-types"]').scrollIntoViewIfNeeded();
      const input = inputByTestId(page, INPUT_ROOT_TESTIDS.typeNumber);
      await input.fill('42');
      await expect(input).toHaveValue('42');
    });

    test('9.4 — Copy and paste via keyboard', async ({ page }) => {
      const input = inputByTestId(page, D);
      await input.fill('copypaste');
      await input.selectText();
      await page.keyboard.press('ControlOrMeta+C');
      await input.fill('');
      await page.keyboard.press('ControlOrMeta+V');
      await expect(input).toHaveValue('copypaste');
    });
  });

  // ── GROUP 10 — Dependency rules ─────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [InputTags.functional] }, () => {
    test('10.1 — errorHighlight without invalid shell does not set data-invalid', async ({ page }) => {
      await expect(inputShellByTestId(page, D)).not.toHaveAttribute('data-invalid', 'true');
    });

    test('10.2 — errorHighlight with feedback state sets shell data-invalid', async ({ page }) => {
      await page.locator('[data-section="input-qa-states"]').scrollIntoViewIfNeeded();
      await expect(inputShellByTestId(page, inputStateTestId('feedback'))).toHaveAttribute(
        'data-invalid',
        'true',
      );
    });

    test('10.3 — Loading overrides (N/A)', async () => {
      qaLog('Skipped — Input showcase has no loading example');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [InputTags.functional] }, () => {
    test('11.1 — Placeholder text is non-empty on placeholder example', async ({ page }) => {
      const placeholder = await inputByTestId(page, INPUT_ROOT_TESTIDS.placeholder).getAttribute(
        'placeholder',
      );
      expect(placeholder?.trim(), 'placeholder attribute').not.toBe('');
    });

    test('11.1 — Labeled input associates visible “Email” label text', async ({ page }) => {
      await page.locator('[data-section="input-qa-labeled"]').scrollIntoViewIfNeeded();
      await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    });

    test('11.2 — Start adornment band renders prefix text', async ({ page }) => {
      await page.locator('[data-section="input-qa-adornments"]').scrollIntoViewIfNeeded();
      await expect(inputByTestId(page, INPUT_ROOT_TESTIDS.startAdornment)).toBeVisible();
    });

    test('11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — Input is not a progress indicator');
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [InputTags.functional] }, () => {
    test('12.1 — Full-width input spans its layout band', async ({ page }) => {
      await page.locator('[data-section="input-qa-layout"]').scrollIntoViewIfNeeded();
      const band = inputSection(page, 'input-qa-layout');
      const input = inputByTestId(page, INPUT_ROOT_TESTIDS.fullwidth);
      const bandBox = await band.boundingBox();
      const inputBox = await inputShellByTestId(page, INPUT_ROOT_TESTIDS.fullwidth).boundingBox();
      expect(bandBox).not.toBeNull();
      expect(inputBox).not.toBeNull();
      expect(inputBox!.width, 'fullWidth shell width').toBeGreaterThan(bandBox!.width * 0.7);
    });

    test('12.2 — At 320px viewport, story bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openInputTestScenarios(page);
      for (const sectionId of INPUT_DATA_SECTIONS) {
        const band = inputSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default input visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openInputTestScenarios(page);
      await expect(inputByTestId(page, D)).toBeVisible();
    });

    test('12.3 — Size band lays out S, M, L horizontally in DOM order', async ({ page }) => {
      await page.locator('[data-section="input-qa-size"]').scrollIntoViewIfNeeded();
      const sBox = await inputByTestId(page, inputSizeTestId('S')).boundingBox();
      const lBox = await inputByTestId(page, inputSizeTestId('L')).boundingBox();
      expect(sBox!.x, 'S appears left of L in flex row').toBeLessThan(lBox!.x);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [InputTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await inputByTestId(page, D).waitFor({ state: 'visible', timeout: 90_000 });
      for (const sectionId of INPUT_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default input remains visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(inputByTestId(page, D)).toBeVisible();
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: INPUT_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Input”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input', level: 1 })).toBeVisible();
    });

    test('Smoke — Default input visible and accepts text', async ({ page }) => {
      const input = inputByTestId(page, D);
      await expect(input).toBeVisible();
      await input.fill('smoke');
      await expect(input).toHaveValue('smoke');
    });

    test('Smoke — Manifest testid count in showcase scope', async ({ page }) => {
      await expect(
        page.locator(`${INPUT_SHOWCASE_AXE_SCOPE} [data-testid^="input-"]`),
      ).toHaveCount(INPUT_ALL_TESTIDS.length);
    });
  });
});
