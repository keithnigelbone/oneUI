/**
 * Icon Contained QA playground — functional Playwright tests.
 * Selectors mirror `IconContainedQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (non-interactive circular icon container — not tabbable).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` IconContained defects.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/icon-contained-playground/manifest.ts` → `ICON_CONTAINED_DATA_SECTIONS` (8 bands)
 * - data-testid: `ICON_CONTAINED_ALL_TESTIDS` (20 wrapper spans)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  ICON_CONTAINED_SHOWCASE_AXE_SCOPE,
  ICON_CONTAINED_TAG_SET,
  iconContainedRoot,
  IconContainedTags,
  openIconContainedFigmaValidationTab,
  openIconContainedTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
  expectSectionVisible,
} from './icon-contained/icon-contained-qa-support';
import {
  expectCircularIconContained,
  iconContainedBackgroundRgb,
  iconContainedBox,
  iconContainedDecorativeRoot,
  iconContainedIconColorRgb,
  iconContainedInnerRoot,
  iconContainedSection,
  isTransparentRgb,
} from './icon-contained-playground/iconContainedHelpers';
import {
  ICON_CONTAINED_ALL_TESTIDS,
  ICON_CONTAINED_DATA_SECTIONS,
  ICON_CONTAINED_FIGMA_APPEARANCES,
  ICON_CONTAINED_FIGMA_ATTENTION,
  ICON_CONTAINED_FIGMA_SIZES,
  ICON_CONTAINED_ROOT_TESTIDS,
  ICON_CONTAINED_SECTION_COUNT,
  iconContainedAppearanceTestId,
  iconContainedAttentionTestId,
  iconContainedSizeTestId,
} from './icon-contained-playground/manifest';
import { ICON_CONTAINED_DECORATIVE_A11Y_TEST } from './qa-component-test-labels';

test.describe('Functional', { tag: ICON_CONTAINED_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openIconContainedTestScenarios(page);
  });

  test('[fn] Component page shows title and all QA tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Icon Contained', level: 1 })).toBeVisible();
    for (const tab of ['Test Scenarios', 'Figma Validation', 'Accessibility', 'Functional Tests']) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });

  test('[fn] Default icon is named “Heart”, size M, medium attention, secondary appearance', async ({
    page,
  }) => {
    const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
    await expect(root).toBeVisible();
    await expect(root).toHaveAccessibleName('Heart');
    await expect(root).toHaveAttribute('data-size', 'm');
    await expect(root).toHaveAttribute('data-attention', 'medium');
    await expect(root).toHaveAttribute('data-appearance', 'secondary');
  });

  test('[fn] Figma sizes XS–XL set data-size and share high / secondary styling', async ({ page }) => {
    for (const size of ICON_CONTAINED_FIGMA_SIZES) {
      const root = iconContainedRoot(page, iconContainedSizeTestId(size));
      await expect(root).toBeVisible();
      await expect(root).toHaveAttribute('data-size', size);
      await expect(root).toHaveAttribute('data-attention', 'high');
      await expect(root).toHaveAttribute('data-appearance', 'secondary');
    }
  });

  test('[fn] Medium and high attention levels set data-attention correctly', async ({ page }) => {
    await expect(iconContainedRoot(page, iconContainedAttentionTestId('medium'))).toHaveAttribute(
      'data-attention',
      'medium',
    );
    await expect(iconContainedRoot(page, iconContainedAttentionTestId('high'))).toHaveAttribute(
      'data-attention',
      'high',
    );
  });

  test('[fn] All eight Figma colour roles set data-appearance correctly', async ({ page }) => {
    for (const appearance of ICON_CONTAINED_FIGMA_APPEARANCES) {
      await expect(
        iconContainedRoot(page, iconContainedAppearanceTestId(appearance)),
      ).toHaveAttribute('data-appearance', appearance);
    }
  });

  test('[fn] Accessible name readout — labelled icon in accessibility band', async ({ page }) => {
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.a11yLabelled)).toHaveAccessibleName(
      'Favourited',
    );
  });

  test('[fn] DOM inspection — decorative icon without aria-label (aria-hidden, no role=img)', async ({
    page,
  }) => {
    const repro = iconContainedDecorativeRoot(page, ICON_CONTAINED_ROOT_TESTIDS.bugDecorative);
    await expect(repro).toBeVisible();
    await expect(repro).toHaveAttribute('aria-hidden', 'true');
    await expect(repro).not.toHaveAttribute('role', 'img');
    await expect(repro).not.toHaveAttribute('aria-label', /.+/);
  });

  test('[fn] Disabled icon remains visible and keeps accessible name “Disabled”', async ({ page }) => {
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.disabled)).toBeVisible();
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.disabled)).toHaveAccessibleName(
      'Disabled',
    );
  });

  test('[fn] Icon on a subtle surface band renders with accessible name', async ({ page }) => {
    await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.surfaceSubtle)).toHaveAccessibleName(
      'On subtle surface',
    );
  });

  test('[fn] All Test Scenarios story bands are mounted on the page', async ({ page }) => {
    for (const section of ICON_CONTAINED_DATA_SECTIONS) {
      await expect(page.locator(`[data-section="${section}"]`)).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab shows API table and size×attention grid', async ({ page }) => {
    await openIconContainedFigmaValidationTab(page);
    await expect(page.getByTestId('icon-contained-api-validation-root')).toBeVisible();
    await expect(page.getByTestId('figma-icon-contained-grid')).toBeVisible();
    await expect(page.getByTestId('icon-contained-figma-val-m-high')).toBeVisible();
    await expect(page.getByTestId('icon-contained-figma-val-xs-medium')).toBeVisible();
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [IconContainedTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default icon mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openIconContainedTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      for (const testId of ICON_CONTAINED_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const wrapper = page.getByTestId(testId);
          await wrapper.scrollIntoViewIfNeeded();
          await expect(wrapper, `Expected visible: ${testId}`).toBeVisible();
          await expect(iconContainedInnerRoot(page, testId), `${testId} inner IconContained root`).toBeVisible();
          const text = (await wrapper.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of ICON_CONTAINED_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="icon-contained-qa-"]')).toHaveCount(
        ICON_CONTAINED_SECTION_COUNT,
      );
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [IconContainedTags.functional] }, () => {
    test('2.1 — Default props: size m, medium attention, secondary appearance', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
      await expect(root).toHaveAttribute('data-size', 'm');
      await expect(root).toHaveAttribute('data-attention', 'medium');
      await expect(root).toHaveAttribute('data-appearance', 'secondary');
      await expect(root).toHaveRole('img');
    });

    test('2.1 — Each size cell emits matching data-size', async ({ page }) => {
      for (const size of ICON_CONTAINED_FIGMA_SIZES) {
        const root = iconContainedRoot(page, iconContainedSizeTestId(size));
        await expect(root, `size ${size}`).toHaveAttribute('data-size', size);
        await expect(root).toHaveAttribute('data-attention', 'high');
        await expect(root).toHaveAttribute('data-appearance', 'secondary');
      }
    });

    test('2.1 — Attention medium vs high emit data-attention', async ({ page }) => {
      for (const attention of ICON_CONTAINED_FIGMA_ATTENTION) {
        const root = iconContainedRoot(page, iconContainedAttentionTestId(attention));
        await expect(root, attention).toHaveAttribute('data-attention', attention);
        await expect(root).toHaveAttribute('data-size', 'm');
        await expect(root).toHaveAttribute('data-appearance', 'secondary');
      }
    });

    test('2.1 — Each appearance role emits data-appearance at high attention', async ({ page }) => {
      for (const appearance of ICON_CONTAINED_FIGMA_APPEARANCES) {
        const root = iconContainedRoot(page, iconContainedAppearanceTestId(appearance));
        await expect(root, appearance).toHaveAttribute('data-appearance', appearance);
        await expect(root).toHaveAttribute('data-attention', 'high');
        await expect(root).toHaveAttribute('data-size', 'm');
      }
    });

    test('2.2 — Size scaling: bounding boxes grow from xs → xl (circular)', async ({ page }) => {
      const widths: number[] = [];
      for (const size of ICON_CONTAINED_FIGMA_SIZES) {
        const root = iconContainedRoot(page, iconContainedSizeTestId(size));
        await root.scrollIntoViewIfNeeded();
        await expectCircularIconContained(root, `icon-contained-size-${size}`);
        const box = await root.boundingBox();
        widths.push(box!.width);
      }
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i]!,
          `icon-contained-size-${ICON_CONTAINED_FIGMA_SIZES[i]} width should exceed icon-contained-size-${ICON_CONTAINED_FIGMA_SIZES[i - 1]}`,
        ).toBeGreaterThan(widths[i - 1]!);
      }
    });

    test('2.2 — High attention icons are equal width and height (circular pill)', async ({ page }) => {
      await expectCircularIconContained(
        iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default),
        'icon-contained-default',
      );
    });



    test('2.1 — Medium vs high attention produce different background colours', async ({ page }) => {
      const medium = iconContainedRoot(page, iconContainedAttentionTestId('medium'));
      const high = iconContainedRoot(page, iconContainedAttentionTestId('high'));
      const mediumBg = await iconContainedBackgroundRgb(medium);
      const highBg = await iconContainedBackgroundRgb(high);
      expect(mediumBg, 'medium attention background').not.toBe(highBg);
    });
  });

  // ── GROUP 3 — Click (N/A) ──────────────────────────────────────────────────
  test.describe('Group 3 — Click interaction (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('3.x — IconContained is not clickable', async () => {
      qaLog('Skipped — display component; IconContained has no click handler in Test Scenarios');
    });
  });

  // ── GROUP 4 — Keyboard (N/A) ─────────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('4.x — IconContained is not in Tab order', async () => {
      qaLog('Skipped — IconContained is display-only; keyboard tests apply to page chrome in a11y spec');
    });
  });

  // ── GROUP 5 — Focus (N/A) ──────────────────────────────────────────────────
  test.describe('Group 5 — Focus management (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('5.x — IconContained root is not focusable', async () => {
      qaLog('Skipped — IconContained span is not tabbable');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [IconContainedTags.functional] }, () => {
    test('6.1 — Default state: role img and accessible name', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
      await expect(root).toHaveRole('img');
      await expect(root).toHaveAccessibleName('Heart');
    });

    test('6.3 — Disabled IconContained is not in Tab order', async ({ page }) => {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).not.toHaveAttribute('data-testid', ICON_CONTAINED_ROOT_TESTIDS.disabled);
    });

    test(`6.5 — ${ICON_CONTAINED_DECORATIVE_A11Y_TEST}`, async ({ page }) => {
      const wrapper = page.getByTestId(ICON_CONTAINED_ROOT_TESTIDS.bugDecorative);
      const repro = iconContainedDecorativeRoot(page, ICON_CONTAINED_ROOT_TESTIDS.bugDecorative);
      await expect(repro).toBeVisible();
      await expect(repro).toHaveAttribute('aria-hidden', 'true');
      await expect(wrapper.getByRole('img')).toHaveCount(0);
    });
  });

  // ── GROUP 7 — Slots (N/A) ──────────────────────────────────────────────────
  test.describe('Group 7 — Start/end slots (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('7.x — IconContained has no start/end slot API', async () => {
      qaLog('Skipped — IconContained uses icon prop only');
    });
  });

  // ── GROUP 8–9 — N/A ────────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — IconContained is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [IconContainedTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — IconContained is not typed entry');
    });
  });

  // ── GROUP 10 — aria-label dependency ───────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [IconContainedTags.functional] }, () => {
    test('10.1 — aria-label present → role img and accessible name', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.a11yLabelled);
      await expect(root).toHaveRole('img');
      await expect(root).toHaveAccessibleName('Favourited');
    });

    test('10.2 — No aria-label → decorative (aria-hidden, not exposed as role=img)', async ({
      page,
    }) => {
      const root = iconContainedDecorativeRoot(page, ICON_CONTAINED_ROOT_TESTIDS.bugDecorative);
      await expect(root).toHaveAttribute('aria-hidden', 'true');
      await expect(root).not.toHaveAttribute('role', 'img');
      await expect(root).not.toHaveAttribute('aria-label', /.+/);
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [IconContainedTags.functional] }, () => {
    test('11.2 — Default icon renders SVG glyph', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
      await expect(root.locator('svg')).toHaveCount(1);
    });

    test('11.2 — Inner semantic SVG is aria-hidden (name on role=img wrapper)', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
      const svg = root.locator('svg').first();
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
    });


    test('11.2 — Labelled icons expose accessible name via aria-label', async ({ page }) => {
      await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default)).toHaveAccessibleName(
        'Heart',
      );
      await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.surfaceSubtle)).toHaveAccessibleName(
        'On subtle surface',
      );
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [IconContainedTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — IconContained has no fullWidth prop');
    });

    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openIconContainedTestScenarios(page);
      for (const sectionId of ICON_CONTAINED_DATA_SECTIONS) {
        const band = iconContainedSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default icon visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openIconContainedTestScenarios(page);
      await expect(iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Size band icons laid out in horizontal flex row', async ({ page }) => {
      const first = await iconContainedBox(page, iconContainedSizeTestId('xs'));
      const last = await iconContainedBox(page, iconContainedSizeTestId('xl'));
      expect(first!.x, 'xs should appear before xl in row').toBeLessThan(last!.x);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [IconContainedTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of ICON_CONTAINED_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: ICON_CONTAINED_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Icon Contained”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Icon Contained', level: 1 })).toBeVisible();
    });

    test('Smoke — Default icon visible with role img', async ({ page }) => {
      const root = iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default);
      await expect(root).toBeVisible();
      await expect(root).toHaveRole('img');
    });

    test('Smoke — Every manifest testid wrapper is present in showcase', async ({ page }) => {
      for (const testId of ICON_CONTAINED_ALL_TESTIDS) {
        await expect(page.getByTestId(testId), testId).toBeVisible();
      }
    });
  });
});

test.describe('Functional — page chrome', { tag: ICON_CONTAINED_TAG_SET.functional }, () => {
  test('[fn] theme toggle updates label', async ({ page }) => {
    await openIconContainedTestScenarios(page);
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });
});
