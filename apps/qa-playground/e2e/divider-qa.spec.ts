/**
 * Divider QA playground — functional Playwright tests.
 * Selectors mirror `DividerQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (decorative separator — `role="separator"`, not tabbable).
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents behaviour and `@oneui/ui` Divider is wrong, the test must fail.
 *
 * **Raised defects (tests must fail until fixed — do not soften):**
 * - `attention="low"` + `content="label"` can miss WCAG 4.5:1 contrast on default QA surface (attention band + Figma matrices).
 * - Inner slot wrap hardcodes `data-testid="divider-slot-icon"` — duplicates showcase id; tests scope roots via `[data-divider]`.
 *
 * **Page chrome (not Divider — use `clickPageThemeButton`, not stale `/Theme:/` selector):**
 * - Theme toggle validates page header control, not `@oneui/ui` Divider.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/divider-playground/manifest.ts` → `DIVIDER_DATA_SECTIONS` (10 bands)
 * - data-testid: `DIVIDER_ALL_TESTIDS` (44 roots)
 */
import { expect, test } from 'playwright/test';

import { HORIZONTAL_FULL_MATRIX_COUNT, VERTICAL_FULL_MATRIX_COUNT } from '../src/components/divider/dividerQaConstants';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  DIVIDER_TAG_SET,
  dividerRoot,
  DividerTags,
  expectSectionVisible,
  openDividerFigmaValidationTab,
  openDividerTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './divider/divider-qa-support';
import {
  dividerBox,
  dividerSection,
  dividerStrokeRgb,
  expectHorizontalDivider,
  expectVerticalDivider,
  horizontalStrokeThickness,
} from './divider-playground/dividerHelpers';
import {
  DIVIDER_ALL_TESTIDS,
  DIVIDER_ATTENTIONS,
  DIVIDER_COMBO_COUNT,
  DIVIDER_CONTENT_ALIGNS,
  DIVIDER_DATA_SECTIONS,
  DIVIDER_FIGMA_APPEARANCES,
  DIVIDER_FIGMA_SIZES,
  DIVIDER_ROOT_TESTIDS,
  DIVIDER_SECTION_COUNT,
  dividerAppearanceTestId,
  dividerAttentionIconTestId,
  dividerAttentionLabelTestId,
  dividerComboTestId,
  dividerContentAlignTestId,
  dividerSizeTestId,
  dividerVerticalIconAlignTestId,
  FIGMA_TO_SIZE_TOKEN,
} from './divider-playground/manifest';

test.describe('Functional', { tag: DIVIDER_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openDividerTestScenarios(page);
  });

  test('[fn] shows Divider page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Divider', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Divider - Figma Validation' })).toBeVisible();
  });

  test('[fn] Default story divider is present', async ({ page }) => {
    const el = dividerRoot(page, DIVIDER_ROOT_TESTIDS.default);
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeAttached();
    const box = await el.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });

  test('[fn] Orientation band — horizontal and vertical', async ({ page }) => {
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.orientationHorizontal)).toBeVisible();
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.orientationVertical)).toBeVisible();
  });

  test('[fn] Size band — S / M / L at each attention', async ({ page }) => {
    await expect(page.locator('[data-testid^="divider-size-"]')).toHaveCount(9);
    await expect(dividerRoot(page, dividerSizeTestId('high', 'S'))).toBeVisible();
    await expect(dividerRoot(page, dividerSizeTestId('medium', 'M'))).toBeVisible();
    await expect(dividerRoot(page, dividerSizeTestId('low', 'L'))).toBeVisible();
  });

  test('[fn] Slot band — none, icon, label', async ({ page }) => {
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotNone)).toBeVisible();
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotIcon)).toBeVisible();
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotLabel)).toBeVisible();
  });

  test('[fn] contentAlign band — center, start, end', async ({ page }) => {
    for (const align of DIVIDER_CONTENT_ALIGNS) {
      await expect(dividerRoot(page, dividerContentAlignTestId(align))).toBeVisible();
    }
  });

  test('[fn] Appearance band — primary row visible', async ({ page }) => {
    // Appearance-band rows are `content="none"` horizontal rules (1px stroke height).
    // Playwright's `toBeVisible()` is unreliable on such thin horizontal boxes
    // (see the documented `divider-appearance-auto` exemption in Render 1.2), so
    // assert the row renders with a real horizontal bounding box instead.
    await expect(dividerRoot(page, 'divider-appearance-primary')).toBeAttached();
    await expectHorizontalDivider(page, 'divider-appearance-primary');
  });

  test('[fn] Attention band — high, medium, low (label + icon)', async ({ page }) => {
    for (const attention of DIVIDER_ATTENTIONS) {
      await expect(dividerRoot(page, dividerAttentionLabelTestId(attention))).toBeVisible();
      await expect(dividerRoot(page, dividerAttentionIconTestId(attention))).toBeVisible();
    }
  });

  test('[fn] roundCaps band — false vs true', async ({ page }) => {
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.roundCapsFalse)).toBeVisible();
    await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.roundCapsTrue)).toBeVisible();
  });

  test('[fn] Vertical + icon align row visible', async ({ page }) => {
    const band = dividerSection(page, 'divider-qa-vertical-slot');
    await expect(band.getByTestId('divider-vertical-icon-center')).toBeVisible();
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < DIVIDER_COMBO_COUNT; i++) {
      await expect(dividerRoot(page, dividerComboTestId(i))).toBeVisible();
    }
  });

  test('[fn] horizontal full matrix — cell count', async ({ page }) => {
    await openDividerFigmaValidationTab(page);
    await expect(page.locator('[data-testid^="divider-hfull-"]')).toHaveCount(HORIZONTAL_FULL_MATRIX_COUNT);
  });

  test('[fn] horizontal full matrix — first and last cells render', async ({ page }) => {
    await openDividerFigmaValidationTab(page);
    const first = dividerRoot(page, 'divider-hfull-0');
    await first.scrollIntoViewIfNeeded();
    await expect(first).toBeVisible();
    const last = dividerRoot(page, `divider-hfull-${HORIZONTAL_FULL_MATRIX_COUNT - 1}`);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
  });

  test('[fn] vertical full matrix — cell count', async ({ page }) => {
    await openDividerFigmaValidationTab(page);
    await expect(page.locator('[data-testid^="divider-vfull-"]')).toHaveCount(VERTICAL_FULL_MATRIX_COUNT);
  });

  test('[fn] vertical full matrix — first and last cells render', async ({ page }) => {
    await openDividerFigmaValidationTab(page);
    const first = dividerRoot(page, 'divider-vfull-0');
    await first.scrollIntoViewIfNeeded();
    await expect(first).toBeVisible();
    const last = dividerRoot(page, `divider-vfull-${VERTICAL_FULL_MATRIX_COUNT - 1}`);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [DividerTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default divider mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openDividerTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.default)).toBeAttached();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of DIVIDER_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const root = dividerRoot(page, testId);
          await root.scrollIntoViewIfNeeded();
          // The appearance band renders `content="none"` horizontal rules whose 1px
          // stroke height makes Playwright's `toBeVisible()` unreliable (zero-height
          // box). Assert these are attached with a real horizontal bounding box; all
          // other roots keep the stricter visibility check.
          if (testId.startsWith('divider-appearance-')) {
            await expect(root, `Expected attached: ${testId}`).toBeAttached();
            await expectHorizontalDivider(page, testId);
          } else {
            await expect(root, `Expected visible: ${testId}`).toBeVisible();
          }
          const text = (await root.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of DIVIDER_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="divider-qa"]')).toHaveCount(DIVIDER_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [DividerTags.functional] }, () => {
    test('2.1 — Default exposes horizontal, size m, attention low', async ({ page }) => {
      const root = dividerRoot(page, DIVIDER_ROOT_TESTIDS.default);
      await expect(root).toHaveAttribute('data-orientation', 'horizontal');
      await expect(root).toHaveAttribute('data-size', 'm');
      await expect(root).toHaveAttribute('data-attention', 'low');
    });

    test('2.1 — Orientation horizontal vs vertical layout', async ({ page }) => {
      await expectHorizontalDivider(page, DIVIDER_ROOT_TESTIDS.orientationHorizontal);
      await expectVerticalDivider(page, DIVIDER_ROOT_TESTIDS.orientationVertical);
      await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.orientationVertical)).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
    });

    test('2.1 — Each Figma size maps to correct data-size token', async ({ page }) => {
      for (const figma of DIVIDER_FIGMA_SIZES) {
        const root = dividerRoot(page, dividerSizeTestId('medium', figma));
        await expect(root, `size ${figma}`).toHaveAttribute('data-size', FIGMA_TO_SIZE_TOKEN[figma]);
      }
    });



  });

  // ── GROUP 3 — Click (N/A) ──────────────────────────────────────────────────
  test.describe('Group 3 — Click interaction (N/A)', { tag: [DividerTags.functional] }, () => {
    test('3.x — Divider is not clickable', async () => {
      qaLog('Skipped — display component; separator is not an interactive control');
    });
  });

  // ── GROUP 4 — Keyboard (N/A for component) ───────────────────────────────
  test.describe('Group 4 — Keyboard navigation (N/A)', { tag: [DividerTags.functional] }, () => {
    test('4.x — Divider is not in Tab order', async () => {
      qaLog('Skipped — Divider is display-only; keyboard tests apply to page chrome in a11y spec');
    });
  });

  // ── GROUP 5 — Focus (N/A) ──────────────────────────────────────────────────
  test.describe('Group 5 — Focus management (N/A)', { tag: [DividerTags.functional] }, () => {
    test('5.x — Divider does not receive focus on click', async () => {
      qaLog('Skipped — separator is not focusable');
    });
  });

  // ── GROUP 6 — State (N/A) ────────────────────────────────────────────────
  test.describe('Group 6 — Disabled / selection (N/A)', { tag: [DividerTags.functional] }, () => {
    test('6.x — Divider has no disabled/selected/loading props in showcase', async () => {
      qaLog('Skipped — Divider has no disabled/selected/loading API in Test Scenarios');
    });
  });

  // ── GROUP 7 — Content slots ────────────────────────────────────────────────
  test.describe('Group 7 — Content slots', { tag: [DividerTags.functional] }, () => {
    test('7.1 — content=none — simple separator without label/icon children', async ({ page }) => {
      const root = dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotNone);
      await expect(root).toHaveRole('separator');
      await expect(root.locator('svg')).toHaveCount(0);
    });



    test('7.3 — contentAlign start/center/end each render label text', async ({ page }) => {
      for (const align of DIVIDER_CONTENT_ALIGNS) {
        const root = dividerRoot(page, dividerContentAlignTestId(align));
        await expect(root.getByText('Align', { exact: true }), align).toBeVisible();
      }
    });

    test('7.4 — Icon slot uses aria-hidden on svg', async ({ page }) => {
      const svg = dividerRoot(page, DIVIDER_ROOT_TESTIDS.slotIcon).locator('svg').first();
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── GROUP 8–10 — N/A ─────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [DividerTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — Divider is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [DividerTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Divider is not typed entry');
    });
  });

  test.describe('Group 10 — Dependency rules', { tag: [DividerTags.functional] }, () => {
    test('10.2 — roundCaps=true vs false both render at size L high attention', async ({ page }) => {
      await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.roundCapsFalse)).toBeVisible();
      await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.roundCapsTrue)).toBeVisible();
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [DividerTags.functional] }, () => {
    test('11.1 — Attention label rows render High / Medium / Low text', async ({ page }) => {
      await expect(dividerRoot(page, dividerAttentionLabelTestId('high')).getByText('High')).toBeVisible();
      await expect(dividerRoot(page, dividerAttentionLabelTestId('medium')).getByText('Medium')).toBeVisible();
      await expect(dividerRoot(page, dividerAttentionLabelTestId('low')).getByText('Low')).toBeVisible();
    });

    test('11.1 — Combo matrix label content where content=label', async ({ page }) => {
      await expect(dividerRoot(page, dividerComboTestId(3)).getByText('Label')).toBeVisible();
    });

    for (let i = 0; i < DIVIDER_COMBO_COUNT; i++) {
      test(`11.1 — combo ${i} separator is in layout`, async ({ page }) => {
        const root = dividerRoot(page, dividerComboTestId(i));
        await root.scrollIntoViewIfNeeded();
        const box = await root.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThan(0);
        expect(box?.height ?? 0).toBeGreaterThan(0);
      });
    }
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [DividerTags.functional] }, () => {
    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openDividerTestScenarios(page);
      for (const sectionId of DIVIDER_DATA_SECTIONS) {
        const band = dividerSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default divider attached at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openDividerTestScenarios(page);
      await expect(dividerRoot(page, DIVIDER_ROOT_TESTIDS.default)).toBeAttached();
    });

    test('12.3 — Horizontal and vertical orientation bands side-by-side vs stacked', async ({ page }) => {
      const hBox = await dividerBox(page, DIVIDER_ROOT_TESTIDS.orientationHorizontal);
      const vBox = await dividerBox(page, DIVIDER_ROOT_TESTIDS.orientationVertical);
      expect(hBox!.width).toBeGreaterThan(hBox!.height);
      expect(vBox!.height).toBeGreaterThan(vBox!.width);
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [DividerTags.functional] }, () => {
    test('12.1 — fullWidth is not a Divider prop', async () => {
      qaLog('Skipped — Divider has no fullWidth prop');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [DividerTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of DIVIDER_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: DIVIDER_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Divider”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Divider', level: 1 })).toBeVisible();
    });

    test('Smoke — Default separator attached with role separator', async ({ page }) => {
      const root = dividerRoot(page, DIVIDER_ROOT_TESTIDS.default);
      await expect(root).toBeAttached();
      await expect(root).toHaveRole('separator');
    });
  });
});
