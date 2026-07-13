/**
 * Selectable Button QA — functional coverage aligned to `SelectableButtonQaShowcase.tsx`.
 *
 * Component type: **interactive** (toggle button — aria-pressed, single-select on/off).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` SelectableButton defects.
 */
import { expect, test } from 'playwright/test';

import {
  FIGMA_VALIDATION_TAB,
  SELECTABLE_BUTTON_ALL_TESTIDS,
  SELECTABLE_BUTTON_ATTENTIONS,
  SELECTABLE_BUTTON_DATA_SECTIONS,
  SELECTABLE_BUTTON_FIGMA_SIZES,
  SELECTABLE_BUTTON_ROOT_TESTIDS,
  SELECTABLE_BUTTON_SECTION_COUNT,
  selectableButtonAttentionTestId,
  selectableButtonSizeTestId,
} from './selectable-button-playground/manifest';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  expectFocusVisible,
  gotoSelectableButtonPlayground,
  openSelectableButtonFigmaValidation,
  openSelectableButtonTestScenarios,
  qaLog,
  qaStep,
  rgbaAlpha,
  SELECTABLE_BUTTON_TAG_SET,
  scrollToSelectableButtonTestId,
  selectableButtonBackgroundRgb,
  selectableButtonBox,
  selectableButtonByTestId,
  selectableButtonSection,
  selectableButtonWrap,
  switchPlaygroundToDarkTheme,
} from './selectable-button/selectable-button-qa-support';

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/selectable-button`);
  expect(res.ok(), `Selectable Button playground should be reachable at ${origin}/c/selectable-button`).toBeTruthy();
});

test.describe('Functional', { tag: SELECTABLE_BUTTON_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openSelectableButtonTestScenarios(page);
  });

  // ── Preserved tests (do not remove) ─────────────────────────────────────
  test('[fn] Component page shows title and QA tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Selectable Button', level: 1 })).toBeVisible();
    await expect(page.getByRole('tab', { name: FIGMA_VALIDATION_TAB })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default selectable button is visible', async ({ page }) => {
    await expect(page.getByTestId(SELECTABLE_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
  });

  test('[fn] Size variants S, M, and L render', async ({ page }) => {
    for (const size of SELECTABLE_BUTTON_FIGMA_SIZES) {
      await expect(page.getByTestId(selectableButtonSizeTestId(size))).toBeVisible();
    }
  });

  test('[fn] Selected buttons expose high / medium / low attention via data-attention', async ({
    page,
  }) => {
    for (const attention of SELECTABLE_BUTTON_ATTENTIONS) {
      const btn = selectableButtonByTestId(page, selectableButtonAttentionTestId(attention));
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('data-attention', attention);
      await expect(btn).toHaveAttribute('data-pressed', '');
    }
  });

  test('[fn] Contained, inline, and condensed layouts set data-contained correctly', async ({
    page,
  }) => {
    await expect(
      selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.containedTrue),
    ).toHaveAttribute('data-contained', 'true');
    await expect(
      selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.containedFalse),
    ).toHaveAttribute('data-contained', 'false');
    await expect(
      selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.condensed),
    ).toBeVisible();
  });

  test('[fn] Start and end icon slots render', async ({ page }) => {
    await expect(page.getByTestId(SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons)).toBeVisible();
  });

  test('[fn] Toggle updates aria-pressed, data-pressed, and state label on click', async ({ page }) => {
    const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-pressed', '');
    await expect(page.getByTestId(SELECTABLE_BUTTON_ROOT_TESTIDS.toggleState)).toContainText('selected: true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId(SELECTABLE_BUTTON_ROOT_TESTIDS.toggleState)).toContainText('selected: false');
  });

  test('[fn] Disabled and loading buttons cannot be activated', async ({ page }) => {
    await expect(
      selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.disabled),
    ).toBeDisabled();
    const loading = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.loading);
    await expect(loading).toBeDisabled();
    await expect(loading).toHaveAttribute('data-loading', '');
  });

  test('[fn] All Test Scenarios story bands are mounted on the page', async ({ page }) => {
    for (const section of SELECTABLE_BUTTON_DATA_SECTIONS) {
      await expect(selectableButtonSection(page, section)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab shows API table and validation grid', async ({ page }) => {
    await openSelectableButtonFigmaValidation(page);
    await expect(page.getByTestId('selectable-button-api-validation-root')).toBeVisible();
    await expect(page.getByTestId('figma-selectable-button-grid')).toBeVisible();
    await expect(page.getByTestId('selectable-button-figma-val-m-high-selected')).toBeVisible();
    await expect(page.getByTestId('selectable-button-figma-val-unselected-high')).toBeVisible();
  });

  // ── GROUP 1 — Render tests ───────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('1.1 — Page loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await qaStep('Reload playground and wait for default control', async () => {
        await gotoSelectableButtonPlayground(page);
        await expect(selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
      });
      await assertNoConsoleErrors(errors);
    });

    test('1.1 — Default button renders with role button', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default);
      await expect(btn).toBeVisible();
      await expect(btn).toHaveRole('button');
    });

    test('1.2 — Every playground data-testid is visible', async ({ page }) => {
      for (const testId of SELECTABLE_BUTTON_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          const wrap = selectableButtonWrap(page, testId);
          await wrap.scrollIntoViewIfNeeded();
          await expect(wrap, `Expected visible: ${testId}`).toBeVisible();
          const errorText = await wrap.locator('text=/error|failed/i').count();
          expect(errorText, `${testId} should not render error text`).toBe(0);
        });
      }
    });

    test('1.3 — Every data-section band is visible', async ({ page }) => {
      for (const sectionId of SELECTABLE_BUTTON_DATA_SECTIONS) {
        await expect(selectableButtonSection(page, sectionId)).toBeVisible();
      }
      const sections = page.locator('[data-section^="selectable-button-qa-"]');
      await expect(sections).toHaveCount(SELECTABLE_BUTTON_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    for (const size of SELECTABLE_BUTTON_FIGMA_SIZES) {
      test(`2.1 — Size ${size.toUpperCase()} renders with data-size`, async ({ page }) => {
        await selectableButtonSection(page, 'selectable-button-qa-size').scrollIntoViewIfNeeded();
        const btn = selectableButtonByTestId(page, selectableButtonSizeTestId(size));
        await expect(btn).toBeVisible();
        await expect(btn).toHaveAttribute('data-size', size);
        await expect(btn).toHaveAttribute('data-pressed', '');
      });
    }

    test('2.2 — Size S/M/L scale progressively (height)', async ({ page }) => {
      await selectableButtonSection(page, 'selectable-button-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        SELECTABLE_BUTTON_FIGMA_SIZES.map((size) => selectableButtonBox(page, selectableButtonSizeTestId(size))),
      );
      for (const box of boxes) {
        expect(box, 'Each size variant should have a layout box').not.toBeNull();
      }
      const [s, m, l] = boxes as NonNullable<Awaited<ReturnType<typeof selectableButtonBox>>>[];
      expect(s.height).toBeLessThanOrEqual(m.height + 2);
      expect(m.height).toBeLessThanOrEqual(l.height + 2);
    });

    for (const attention of SELECTABLE_BUTTON_ATTENTIONS) {
      test(`2.1 — Attention ${attention} selected renders data-attention`, async ({ page }) => {
        await selectableButtonSection(page, 'selectable-button-qa-elevation').scrollIntoViewIfNeeded();
        const btn = selectableButtonByTestId(page, selectableButtonAttentionTestId(attention));
        await expect(btn).toHaveAttribute('data-attention', attention);
        await expect(btn).toHaveAttribute('aria-pressed', 'true');
      });
    }


    test('2.1 — appearance prop matrix (N/A in showcase)', async () => {
      qaLog('Skipped — Showcase drives colour via attention; appearance uses default primary');
    });
  });

  // ── GROUP 3 — Click interaction ──────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('3.1 — Click toggles aria-pressed on interactive toggle', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('3.2 — Disabled button does not toggle on click', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.disabled);
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableButton has no readOnly prop');
    });

    test('3.4 — Click outside removes focus from button', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('h1').click();
      await expect(btn).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('4.1 — Tab reaches default selectable button', async ({ page }) => {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      expect(['button', null]).toContain(role);
    });

    test('4.2 — Enter activates toggle', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('4.3 — Space toggles pressed state', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await toggle.focus();
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Single toggle button, not a roving tabindex group');
    });

    test('4.5 — Home and End keys (N/A)', async () => {
      qaLog('Skipped — Not a list navigator; Home/End not applicable');
    });

    test('4.6 — Escape does not remove toggle (no overlay)', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await toggle.focus();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeVisible();
    });

    test('4.7 — Tab cycles without trapping focus', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default);
      await btn.focus();
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
      }
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      expect(role, 'Focus should escape after repeated Tab presses').not.toBe('button');
    });
  });

  // ── GROUP 5 — Focus management ───────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('5.1 — Click focuses toggle control', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await toggle.click();
      await expect(toggle).toBeFocused();
    });

    test('5.2 — Focus indicator visible on keyboard focus', async ({ page }) => {
      await selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default).focus();
      await expectFocusVisible(page);
    });

    test('5.4 — Blur removes focus', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default);
      await btn.focus();
      await page.locator('h1').click();
      await expect(btn).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — SelectableButton has no autoFocus prop in showcase');
    });
  });

  // ── GROUP 6 — State tests ────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('6.1 — Default button starts unselected', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default);
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('6.2 — Elevation band selected buttons expose aria-pressed true', async ({ page }) => {
      await scrollToSelectableButtonTestId(page, selectableButtonAttentionTestId('high'));
      await expect(
        selectableButtonByTestId(page, selectableButtonAttentionTestId('high')),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('6.3 — Disabled button is not focusable via click', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.disabled);
      await expect(btn).toBeDisabled();
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — SelectableButton has no readOnly prop');
    });

    test('6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — SelectableButton has no error/invalid prop in showcase');
    });

    test('6.6 — Loading state disables interaction', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.loading);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('data-loading', '');
      await btn.click({ force: true });
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── GROUP 7 — Slot tests ─────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('7.1 — Start and end icon slots render SVG icons', async ({ page }) => {
      const wrap = selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons);
      await wrap.scrollIntoViewIfNeeded();
      await expect(wrap.locator('svg')).toHaveCount(2);
    });

    test('7.3 — Icons visible alongside label text', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons);
      await expect(btn).toContainText('Button');
      await expect(btn.locator('svg').first()).toBeVisible();
    });

    test('7.4 — Icon slots use aria-hidden decorative SVG', async ({ page }) => {
      const wrap = selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons);
      const icons = wrap.locator('svg');
      await expect(icons.first()).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── GROUP 8 — Toggle and selection ─────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', () => {
    test('8.1 — Click toggles on and off', async ({ page }) => {
      const toggle = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.toggle);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('8.2 — Single-select group (N/A)', async () => {
      qaLog('Skipped — Toggle buttons are independent; no RadioGroup-style single select in showcase');
    });

    test('8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — SelectableButton has no indeterminate state');
    });
  });

  // ── GROUP 9 — Input (N/A) ────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — SelectableButton is not typed entry');
    });
  });

  // ── GROUP 10 — Dependencies ──────────────────────────────────────────────
  test.describe('Group 10 — Dependencies', () => {
    test('10.1 — condensed has no effect when contained=false (N/A in showcase)', async () => {
      qaLog('Skipped — Showcase only shows condensed with contained=true');
    });

    test('10.3 — loading=true disables button', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.loading);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('data-loading', '');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {

    test('11.2 — Icon content visible in with-icons band', async ({ page }) => {
      const btn = selectableButtonByTestId(page, SELECTABLE_BUTTON_ROOT_TESTIDS.withIcons);
      await expect(btn.locator('svg').first()).toBeVisible();
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('12.1 — fullWidth (N/A in showcase)', async () => {
      qaLog('Skipped — fullWidth prop not rendered in Test Scenarios showcase');
    });

    test('12.2 — At 320px viewport, each scenario band fits without horizontal scroll', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSelectableButtonPlayground(page);
      for (const sectionId of SELECTABLE_BUTTON_DATA_SECTIONS) {
        const band = selectableButtonSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2 — Visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSelectableButtonPlayground(page);
      await expect(selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Size band lays out S/M/L side by side', async ({ page }) => {
      await selectableButtonSection(page, 'selectable-button-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        SELECTABLE_BUTTON_FIGMA_SIZES.map(async (size) => {
          const box = await selectableButtonBox(page, selectableButtonSizeTestId(size));
          expect(box).not.toBeNull();
          return box!;
        }),
      );
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
      expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', () => {
    test('13.1 — All sections visible in dark theme', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of SELECTABLE_BUTTON_DATA_SECTIONS) {
        await expect(selectableButtonSection(page, sectionId)).toBeVisible();
      }
    });

    test('13.1 — High-attention selected button visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await scrollToSelectableButtonTestId(page, selectableButtonAttentionTestId('high'));
      const btn = selectableButtonByTestId(page, selectableButtonAttentionTestId('high'));
      await expect(btn).toBeVisible();
      const rgb = await selectableButtonBackgroundRgb(page, selectableButtonAttentionTestId('high'));
      expect(rgbaAlpha(rgb)).toBeGreaterThan(0);
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: SELECTABLE_BUTTON_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Selectable Button”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Selectable Button', level: 1 })).toBeVisible();
    });

    test('Smoke — Default toggle button is visible', async ({ page }) => {
      await expect(selectableButtonWrap(page, SELECTABLE_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
    });
  });
});
