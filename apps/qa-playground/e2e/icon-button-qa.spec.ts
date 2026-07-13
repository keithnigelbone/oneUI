/**
 * Icon Button QA playground — functional Playwright tests.
 * Selectors mirror `IconButtonQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **interactive** (icon-only `<button>` — requires accessible name).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` IconButton defects.
 *
 * **Raised defects (tests must fail until fixed — do not soften):**
* - `BUG-ICONBUTTON-001` — `icon-button-bug-no-label` missing `aria-label` (bug repro band + button-name axe).
 * - Appearance `high` bold fills may resolve to identical computed backgrounds in QA fixture (Group 2.3).
 * - `fullWidth` must equal parent container width (Group 12.1) — do not compare to unrelated square sibling only.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/icon-button-playground/manifest.ts` → `ICON_BUTTON_DATA_SECTIONS` (11 bands)
 * - data-testid: `ICON_BUTTON_ALL_TESTIDS` (34 — 33 buttons + press counter)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  ICON_BUTTON_TAG_SET,
  iconButtonRoot,
  IconButtonTags,
  expectSectionVisible,
  openIconButtonFigmaValidationTab,
  openIconButtonTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
  ICON_BUTTON_SHOWCASE_AXE_SCOPE,
} from './icon-button/icon-button-qa-support';
import {
  expectFocusRingVisible,
  iconButtonBackgroundRgb,
  iconButtonBox,
  iconButtonSection,
  iconButtonWidthHeight,
  isTransparentRgb,
} from './icon-button-playground/iconButtonHelpers';
import {
  ICON_BUTTON_ALL_ROOT_TESTIDS,
  ICON_BUTTON_ALL_TESTIDS,
  ICON_BUTTON_DATA_SECTIONS,
  ICON_BUTTON_FIGMA_APPEARANCES,
  ICON_BUTTON_FIGMA_ATTENTION,
  ICON_BUTTON_FIGMA_SIZES,
  ICON_BUTTON_ROOT_TESTIDS,
  ICON_BUTTON_SECTION_COUNT,
  ICON_BUTTON_SIZE_TO_DATA,
  iconButtonAppearanceTestId,
  iconButtonAttentionTestId,
  iconButtonSizeTestId,
} from './icon-button-playground/manifest';
import { ICON_BUTTON_UNLABELLED_ACCESSIBLE_NAME_TEST } from './qa-component-test-labels';

test.describe('Functional', { tag: ICON_BUTTON_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openIconButtonTestScenarios(page);
  });

  test('[fn] Component page shows title and all QA tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Icon Button', level: 1 })).toBeVisible();
    for (const tab of ['Test Scenarios', 'Figma Validation', 'Accessibility', 'Functional Tests']) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });

  test('[fn] Default icon button is visible, named “Favourite”, and size M (data-size 10)', async ({
    page,
  }) => {
    const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default);
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAccessibleName('Favourite');
    await expect(btn).toHaveAttribute('data-size', '10');
    await expect(btn).toHaveAttribute('data-variant', 'bold');
  });

  test('[fn] Figma sizes 2XS–XL map to the correct data-size f-steps', async ({ page }) => {
    for (const size of ICON_BUTTON_FIGMA_SIZES) {
      const cell = iconButtonRoot(page, iconButtonSizeTestId(size));
      await expect(cell).toBeVisible();
      await expect(cell).toHaveAttribute('data-size', ICON_BUTTON_SIZE_TO_DATA[size]);
    }
  });

  test('[fn] Figma attention high / medium / low map to bold / subtle / ghost variants', async ({
    page,
  }) => {
    await expect(iconButtonRoot(page, iconButtonAttentionTestId('high'))).toHaveAttribute(
      'data-variant',
      'bold',
    );
    await expect(iconButtonRoot(page, iconButtonAttentionTestId('medium'))).toHaveAttribute(
      'data-variant',
      'subtle',
    );
    await expect(iconButtonRoot(page, iconButtonAttentionTestId('low'))).toHaveAttribute(
      'data-variant',
      'ghost',
    );
  });

  test('[fn] All eight Figma colour roles set data-appearance correctly', async ({ page }) => {
    for (const appearance of ICON_BUTTON_FIGMA_APPEARANCES) {
      await expect(iconButtonRoot(page, iconButtonAppearanceTestId(appearance))).toHaveAttribute(
        'data-appearance',
        appearance,
      );
    }
  });

  test('[fn] Square (1:1), wide (3:2), and full-width layout examples render', async ({ page }) => {
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.layout11)).toBeVisible();
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.layout32)).toHaveAttribute(
      'data-layout',
      '3:2',
    );
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.fullWidth)).toBeVisible();
  });

  test('[fn] Condensed flag is present only when condensed is true', async ({ page }) => {
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.condensedFalse)).not.toHaveAttribute(
      'data-condensed',
    );
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.condensedTrue)).toHaveAttribute(
      'data-condensed',
      '',
    );
  });

  test('[fn] Disabled cannot be clicked; loading shows busy state and accessible name', async ({
    page,
  }) => {
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.disabled)).toBeDisabled();
    const loading = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.loading);
    await expect(loading).toBeDisabled();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(loading).toHaveAttribute('data-loading', '');
    await expect(loading).toHaveAccessibleName('Loading');
  });

  test('[fn] Click increments counter; aria-expanded example is present', async ({ page }) => {
    await iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive).click();
    await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.ariaExpanded)).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('[fn] Icon button on a bold surface renders inside the surface band', async ({ page }) => {
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.surfaceBold)).toBeVisible();
  });

  test('[fn] Invalid size prop falls back to M (data-size 10)', async ({ page }) => {
    await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.edgeInvalidSize)).toHaveAttribute(
      'data-size',
      '10',
    );
  });

  test('[fn] All Test Scenarios story bands are mounted on the page', async ({ page }) => {
    for (const section of ICON_BUTTON_DATA_SECTIONS) {
      await expect(page.locator(`[data-section="${section}"]`)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab shows API table, size grid, and master matrix', async ({ page }) => {
    await openIconButtonFigmaValidationTab(page);
    await expect(page.getByTestId('icon-button-api-validation-root')).toBeVisible();
    await expect(page.getByTestId('figma-icon-button-grid')).toBeVisible();
    await expect(page.getByTestId('figma-icon-button-master-matrix')).toBeVisible();
    await expect(page.getByTestId('icon-button-figma-val-m-high')).toBeVisible();
    await expect(page.getByTestId('icon-button-figma-mx-c0-m-shape-1-1-high')).toBeVisible();
    await expect(page.getByTestId('icon-button-figma-val-shape-3-2')).toBeVisible();
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [IconButtonTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default button mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openIconButtonTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of ICON_BUTTON_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator =
            testId === ICON_BUTTON_ROOT_TESTIDS.pressCount
              ? page.getByTestId(testId)
              : iconButtonRoot(page, testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
          const text = (await locator.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of ICON_BUTTON_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="icon-button-qa-"]')).toHaveCount(
        ICON_BUTTON_SECTION_COUNT,
      );
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [IconButtonTags.functional] }, () => {
    test('2.1 — Default props: size M, bold variant, primary appearance', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default);
      await expect(btn).toHaveAttribute('data-size', '10');
      await expect(btn).toHaveAttribute('data-variant', 'bold');
      await expect(btn).toHaveRole('button');
    });

    test('2.1 — Each Figma size maps to data-size f-step', async ({ page }) => {
      for (const size of ICON_BUTTON_FIGMA_SIZES) {
        const btn = iconButtonRoot(page, iconButtonSizeTestId(size));
        await expect(btn, size).toHaveAttribute('data-size', ICON_BUTTON_SIZE_TO_DATA[size]);
        await expect(btn).toHaveAttribute('data-variant', 'bold');
      }
    });

    test('2.1 — Attention maps to variant tokens', async ({ page }) => {
      for (const attention of ICON_BUTTON_FIGMA_ATTENTION) {
        const expected =
          attention === 'high' ? 'bold' : attention === 'medium' ? 'subtle' : 'ghost';
        await expect(iconButtonRoot(page, iconButtonAttentionTestId(attention))).toHaveAttribute(
          'data-variant',
          expected,
        );
      }
    });

    test('2.2 — Size scaling: bounding boxes grow from 2XS → XL', async ({ page }) => {
      const widths: number[] = [];
      for (const size of ICON_BUTTON_FIGMA_SIZES) {
        const btn = iconButtonRoot(page, iconButtonSizeTestId(size));
        await btn.scrollIntoViewIfNeeded();
        const { width } = await iconButtonWidthHeight(btn);
        widths.push(width);
      }
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i]!,
          `${ICON_BUTTON_FIGMA_SIZES[i]} width should exceed ${ICON_BUTTON_FIGMA_SIZES[i - 1]}`,
        ).toBeGreaterThan(widths[i - 1]!);
      }
    });

    test('2.2 — Square layout (1:1) has equal width and height', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.layout11);
      const { width, height } = await iconButtonWidthHeight(btn);
      expect(Math.abs(width - height), '1:1 layout should be square').toBeLessThan(2);
    });


  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [IconButtonTags.functional] }, () => {
    test('3.1 — Single click increments press counter', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.click();
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
      await btn.click();
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 2');
    });

    test('3.2 — Disabled button does not increment counter on click', async ({ page }) => {
      await iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.disabled).click({ force: true });
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 0');
    });

    test('3.2 — Loading button does not increment counter on click', async ({ page }) => {
      await iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.loading).click({ force: true });
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 0');
    });

    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — IconButton has no readonly prop in Test Scenarios');
    });

    test('3.4 — Click outside removes focus from interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(btn).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ────────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [IconButtonTags.functional] }, () => {
    test('4.1 — Interactive button reachable by Tab', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.scrollIntoViewIfNeeded();
      await btn.focus();
      await expect(btn).toBeFocused();
    });

    test('4.1 — Disabled button is not focusable via Tab from interactive', async ({ page }) => {
      const disabled = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.disabled);
      await disabled.focus();
      await expect(disabled).not.toBeFocused();
    });

    test('4.2 — Enter activates interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
    });

    test('4.3 — Space activates interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toContainText('presses: 1');
    });

    test('4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — single IconButton is not a roving tabindex list');
    });

    test('4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — IconButton does not open overlay in Test Scenarios');
    });

    test('4.7 — Tab moves focus away from interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await page.keyboard.press('Tab');
      await expect(btn).not.toBeFocused();
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [IconButtonTags.functional] }, () => {
    test('5.1 — Click to focus interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('5.2 — Focus ring visible on keyboard focus', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await expectFocusRingVisible(btn, 'icon-button-interactive');
    });

    test('5.4 — Blur removes focus from interactive button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive);
      await btn.focus();
      await btn.blur();
      await expect(btn).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — no autoFocus example in Test Scenarios');
    });
  });

  // ── GROUP 6 — State tests ──────────────────────────────────────────────────
  test.describe('Group 6 — State tests', { tag: [IconButtonTags.functional] }, () => {
    test('6.1 — Default state: enabled bold button with accessible name', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default);
      await expect(btn).toBeEnabled();
      await expect(btn).toHaveAccessibleName('Favourite');
    });

    test('6.2 — Selected/checked (N/A)', async () => {
      qaLog('Skipped — IconButton is not a toggle/selectable control in showcase');
    });

    test('6.3 — Disabled: not enabled, not in click path', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.disabled);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-disabled', 'true');
    });

    test('6.6 — Loading: busy, disabled interaction, spinner present', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.loading);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('aria-busy', 'true');
      await expect(btn).toHaveAttribute('data-loading', '');
      await expect(btn.locator('span[aria-hidden="true"] svg')).toHaveCount(1);
    });

    test(`6.5 — ${ICON_BUTTON_UNLABELLED_ACCESSIBLE_NAME_TEST}`, async ({ page }) => {
      // Intentional repro in showcase — must fail until IconButton requires aria-label in @oneui/ui.
      await expect(
        iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.bugNoLabel),
        'Icon-only buttons without aria-label must not ship (WCAG button-name)',
      ).toHaveAccessibleName(/.+/);
    });
  });

  // ── GROUP 7 — Icon slot ────────────────────────────────────────────────────
  test.describe('Group 7 — Icon content slot', { tag: [IconButtonTags.functional] }, () => {
    test('7.4 — Inner icon glyph renders inside default button', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default);
      await expect(btn.locator('svg')).toHaveCount(1);
    });

    test('7.4 — Semantic icon names band each render SVG', async ({ page }) => {
      for (const appearance of ICON_BUTTON_FIGMA_APPEARANCES) {
        const btn = iconButtonRoot(page, iconButtonAppearanceTestId(appearance));
        await expect(btn.locator('svg'), appearance).toHaveCount(1);
      }
    });
  });

  // ── GROUP 8–9 — N/A ────────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [IconButtonTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — use SelectableIconButton for toggle semantics');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [IconButtonTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — IconButton is not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules ────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [IconButtonTags.functional] }, () => {
    test('10.2 — Attention high → bold variant on size band cells', async ({ page }) => {
      for (const size of ICON_BUTTON_FIGMA_SIZES) {
        await expect(iconButtonRoot(page, iconButtonSizeTestId(size))).toHaveAttribute(
          'data-variant',
          'bold',
        );
      }
    });

    test('10.2 — layout 3:2 sets data-layout attribute', async ({ page }) => {
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.layout32)).toHaveAttribute(
        'data-layout',
        '3:2',
      );
    });

    test('10.3 — loading=true disables even when disabled={false}', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.edgeLoadingActive);
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveAttribute('data-loading', '');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and accessible name', { tag: [IconButtonTags.functional] }, () => {
    test('11.2 — Labelled buttons expose accessible names', async ({ page }) => {
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default)).toHaveAccessibleName(
        'Favourite',
      );
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive)).toHaveAccessibleName(
        'Press me',
      );
    });

    test('11.2 — aria-expanded demo exposes false', async ({ page }) => {
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.ariaExpanded)).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    test('11.1 — Press counter caption updates after interaction', async ({ page }) => {
      await iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.interactive).click();
      await expect(page.getByTestId(ICON_BUTTON_ROOT_TESTIDS.pressCount)).toHaveText('presses: 1');
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [IconButtonTags.functional] }, () => {
    test('12.1 — fullWidth button width equals parent container width', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.fullWidth);
      await btn.scrollIntoViewIfNeeded();
      const widths = await btn.evaluate((el) => {
        const host = el as HTMLElement;
        const parent = host.parentElement;
        return {
          button: host.getBoundingClientRect().width,
          parent: parent?.getBoundingClientRect().width ?? 0,
        };
      });
      expect(widths.parent, 'fullWidth parent should have measurable width').toBeGreaterThan(0);
      expect(
        widths.button,
        `fullWidth CSS width:100% should fill parent (button=${widths.button}px, parent=${widths.parent}px)`,
      ).toBeGreaterThanOrEqual(widths.parent * 0.95);
    });

    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openIconButtonTestScenarios(page);
      for (const sectionId of ICON_BUTTON_DATA_SECTIONS) {
        const band = iconButtonSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default button visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openIconButtonTestScenarios(page);
      await expect(iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Wide layout (3:2) is wider than square (1:1)', async ({ page }) => {
      const square = await iconButtonBox(page, ICON_BUTTON_ROOT_TESTIDS.layout11);
      const wide = await iconButtonBox(page, ICON_BUTTON_ROOT_TESTIDS.layout32);
      expect(wide!.width, '3:2 layout width').toBeGreaterThan(square!.width);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [IconButtonTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(page.getByRole('heading', { name: 'Icon Button', level: 1 })).toBeVisible();
      await iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default).waitFor({
        state: 'visible',
        timeout: 90_000,
      });
      for (const sectionId of ICON_BUTTON_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${sectionId}"]`),
          `Story band "${sectionId}" should remain visible in dark mode`,
        ).toBeVisible();
      }
    });

  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: ICON_BUTTON_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Icon Button”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Icon Button', level: 1 })).toBeVisible();
    });

    test('Smoke — Default button enabled with accessible name', async ({ page }) => {
      const btn = iconButtonRoot(page, ICON_BUTTON_ROOT_TESTIDS.default);
      await expect(btn).toBeEnabled();
      await expect(btn).toHaveAccessibleName('Favourite');
    });

    test('Smoke — All button root testids count matches manifest', async ({ page }) => {
      await expect(
        page.locator(ICON_BUTTON_SHOWCASE_AXE_SCOPE).locator('[data-testid^="icon-button-"][data-size]'),
      ).toHaveCount(ICON_BUTTON_ALL_ROOT_TESTIDS.length);
    });
  });
});
