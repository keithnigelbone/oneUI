/**
 * Icon QA playground — functional Playwright tests.
 * Selectors mirror `IconQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (non-interactive glyph — not tabbable).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Icon defects.
 *
* **Raised defects (tests must fail until fixed — do not soften):**
 * - Appearance `high` emphasis for primary/secondary/negative/positive all resolve to `rgb(0, 0, 0)` in
 *   the QA fixture brand — icons are visually indistinguishable (Group 2.3).
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `e2e/icon-playground/manifest.ts` → `ICON_DATA_SECTIONS` (9 bands)
 * - data-testid: `ICON_ALL_TESTIDS` (120 — 114 icon roots + 6 surface containers)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  ICON_SHOWCASE_AXE_SCOPE,
  ICON_TAG_SET,
  iconRoot,
  IconTags,
  expectSectionVisible,
  openIconTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './icon/icon-qa-support';
import {
  expectSquareIcon,
  iconBox,
  iconColorRgb,
  iconSection,
  isTransparentRgb,
} from './icon-playground/iconHelpers';
import {
  allIconSurfaceContainerTestIds,
  ICON_ALL_ROOT_TESTIDS,
  ICON_ALL_TESTIDS,
  ICON_APPEARANCE_SPOT_CHECK,
  ICON_COMBO_COUNT,
  ICON_DATA_SECTIONS,
  ICON_FIGMA_APPEARANCES,
  ICON_FIGMA_EMPHASIS,
  ICON_FIGMA_SIZES,
  ICON_ROOT_TESTIDS,
  ICON_SECTION_COUNT,
  ICON_SEMANTIC_NAMES,
  ICON_SIZE_SPOT_CHECK,
  iconAppearanceTestId,
  iconComboTestId,
  iconEmphasisTestId,
  iconNameTestId,
  iconSizeTestId,
  iconSurfaceContainerTestId,
  iconSurfaceIconTestId,
} from './icon-playground/manifest';

test.describe('Functional', { tag: ICON_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openIconTestScenarios(page);
  });

  test('[fn] shows Icon page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Icon', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
  });

  test('[fn] Default story icon is visible', async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.default)).toBeVisible();
  });

  test('[fn] Default icon — data attributes match defaults', async ({ page }) => {
    const root = iconRoot(page, ICON_ROOT_TESTIDS.default);
    await expect(root).toHaveAttribute('data-size', '5');
    await expect(root).toHaveAttribute('data-appearance', 'neutral');
    await expect(root).toHaveAttribute('data-emphasis', 'high');
  });

  test('[fn] Size band — representative sizes visible', async ({ page }) => {
    for (const size of ICON_SIZE_SPOT_CHECK) {
      await expect(iconRoot(page, iconSizeTestId(size))).toBeVisible();
    }
  });

  test('[fn] Size band — size 8 emits data-size', async ({ page }) => {
    await expect(iconRoot(page, iconSizeTestId('8'))).toHaveAttribute('data-size', '8');
  });

  test('[fn] Appearance band — primary × high visible', async ({ page }) => {
    const band = iconSection(page, 'icon-qa-appearance');
    await expect(band.getByTestId('icon-appearance-primary-high')).toBeVisible();
  });

  test('[fn] Appearance band — each Figma role at high emphasis', async ({ page }) => {
    for (const appearance of ICON_APPEARANCE_SPOT_CHECK) {
      await expect(iconRoot(page, iconAppearanceTestId(appearance, 'high'))).toBeVisible();
    }
  });

  test('[fn] Emphasis band — all five Figma levels visible', async ({ page }) => {
    for (const emphasis of ICON_FIGMA_EMPHASIS) {
      await expect(iconRoot(page, iconEmphasisTestId(emphasis))).toBeVisible();
    }
  });

  test('[fn] A11y band — labelled, decorative, aria-hidden override', async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yLabelled)).toBeVisible();
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yDecorative)).toBeVisible();
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yAriaHiddenFalse)).toBeVisible();
  });

  test('[fn] ReactElement band — custom SVG icon visible', async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.reactElement)).toBeVisible();
  });

  test('[fn] Surface context band — bold surface cell visible', async ({ page }) => {
    await expect(page.getByTestId(iconSurfaceContainerTestId('bold'))).toBeVisible();
    await expect(iconRoot(page, iconSurfaceIconTestId('bold', 'high'))).toBeVisible();
  });

  test('[fn] Semantic icon names band — all six names visible', async ({ page }) => {
    for (const name of ICON_SEMANTIC_NAMES) {
      await expect(iconRoot(page, iconNameTestId(name))).toBeVisible();
    }
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < ICON_COMBO_COUNT; i++) {
      await expect(iconRoot(page, iconComboTestId(i))).toBeVisible();
    }
  });

  test('[fn] Labelled default icon exposes accessible name', async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.default)).toHaveAccessibleName('Heart');
  });

  test('[fn] Labelled a11y demo icon exposes accessible name', async ({ page }) => {
    await expect(iconRoot(page, ICON_ROOT_TESTIDS.a11yLabelled)).toHaveAccessibleName('Favourited');
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [IconTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default icon mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openIconTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(iconRoot(page, ICON_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(240_000);
      const surfaceContainers = new Set(allIconSurfaceContainerTestIds());
      for (const testId of ICON_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator = surfaceContainers.has(testId)
            ? page.getByTestId(testId)
            : iconRoot(page, testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
          const text = (await locator.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of ICON_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="icon-qa-"]')).toHaveCount(ICON_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [IconTags.functional] }, () => {
    test('2.1 — Default props: size 5, neutral, high emphasis', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.default);
      await expect(root).toHaveAttribute('data-size', '5');
      await expect(root).toHaveAttribute('data-appearance', 'neutral');
      await expect(root).toHaveAttribute('data-emphasis', 'high');
      await expect(root).toHaveRole('img');
    });

    test('2.1 — Each size cell emits matching data-size', async ({ page }) => {
      for (const size of ICON_FIGMA_SIZES) {
        const root = iconRoot(page, iconSizeTestId(size));
        await expect(root, `size ${size}`).toHaveAttribute('data-size', size);
        await expect(root).toHaveAttribute('data-appearance', 'primary');
        await expect(root).toHaveAttribute('data-emphasis', 'high');
      }
    });

    test('2.1 — Appearance × emphasis matrix emits data attributes', async ({ page }) => {
      for (const appearance of ICON_FIGMA_APPEARANCES) {
        for (const emphasis of ICON_FIGMA_EMPHASIS) {
          const root = iconRoot(page, iconAppearanceTestId(appearance, emphasis));
          await expect(root, `${appearance}/${emphasis}`).toHaveAttribute('data-appearance', appearance);
          await expect(root).toHaveAttribute('data-emphasis', emphasis);
          await expect(root).toHaveAttribute('data-size', '8');
        }
      }
    });

  });

  // ── GROUP 3 — Click (N/A) ──────────────────────────────────────────────────
  test.describe('Group 3 — Click interaction (N/A)', { tag: [IconTags.functional] }, () => {
    test('3.x — Icon is not clickable', async () => {
      qaLog('Skipped — display component; Icon has no click handler in Test Scenarios');
    });
  });

  // ── GROUP 4 — Keyboard (N/A) ───────────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation (N/A)', { tag: [IconTags.functional] }, () => {
    test('4.x — Icon is not in Tab order', async () => {
      qaLog('Skipped — Icon is display-only; keyboard tests apply to page chrome in a11y spec');
    });
  });

  // ── GROUP 5 — Focus (N/A) ──────────────────────────────────────────────────
  test.describe('Group 5 — Focus management (N/A)', { tag: [IconTags.functional] }, () => {
    test('5.x — Icon does not receive focus on click', async () => {
      qaLog('Skipped — Icon root is not focusable');
    });
  });

  // ── GROUP 6 — Semantic vs decorative state ─────────────────────────────────
  test.describe('Group 6 — Accessibility state props', { tag: [IconTags.functional] }, () => {
    test('6.1 — Default labelled icon: role img + accessible name', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.default);
      await expect(root).toHaveRole('img');
      await expect(root).toHaveAccessibleName('Heart');
    });

    test('6.2 — Decorative icon: aria-hidden true, no role img', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.a11yDecorative);
      await expect(root).toHaveAttribute('aria-hidden', 'true');
      await expect(root).not.toHaveRole('img');
    });

    test('6.3 — aria-hidden=false without aria-label: not semantic img, no aria-label', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.a11yAriaHiddenFalse);
      await expect(root).toHaveAttribute('aria-hidden', 'false');
      await expect(root.locator('svg')).toHaveCount(1);
      await expect(root).not.toHaveRole('img');
      await expect(root).not.toHaveAttribute('aria-label');
    });

    test('6.4 — Combo decorative row (no aria-label) is aria-hidden', async ({ page }) => {
      const root = iconRoot(page, iconComboTestId(7));
      await expect(root).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── GROUP 7 — Slots (N/A) ──────────────────────────────────────────────────
  test.describe('Group 7 — Start/end slots (N/A)', { tag: [IconTags.functional] }, () => {
    test('7.x — Icon has no start/end slot API', async () => {
      qaLog('Skipped — Icon uses icon prop / ReactElement, not start/end slots');
    });
  });

  // ── GROUP 8–9 — N/A ────────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [IconTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — Icon is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [IconTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Icon is not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules (aria-label ↔ semantic) ────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [IconTags.functional] }, () => {
    test('10.1 — aria-label present → role img and not aria-hidden', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.a11yLabelled);
      await expect(root).toHaveRole('img');
      await expect(root).toHaveAttribute('aria-hidden', 'false');
    });

    test('10.2 — No aria-label → decorative default (aria-hidden true)', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.a11yDecorative);
      await expect(root).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [IconTags.functional] }, () => {
    test('11.2 — Semantic icons render SVG glyph', async ({ page }) => {
      for (const name of ICON_SEMANTIC_NAMES) {
        const root = iconRoot(page, iconNameTestId(name));
        await root.scrollIntoViewIfNeeded();
        await expect(root.locator('svg'), name).toHaveCount(1);
      }
    });

    test('11.2 — Inner semantic SVG is aria-hidden (name on wrapper)', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.default);
      const svg = root.locator('svg').first();
      await expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    test('11.2 — ReactElement icon band renders custom SVG', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.reactElement);
      await expect(root.locator('svg')).toHaveCount(1);
      await expect(root).toHaveAccessibleName('Custom circle icon');
    });


    for (let i = 0; i < ICON_COMBO_COUNT; i++) {
      test(`11.1 — combo ${i} icon is square and in layout`, async ({ page }) => {
        const root = iconRoot(page, iconComboTestId(i));
        await root.scrollIntoViewIfNeeded();
        await expectSquareIcon(root, `icon-combo-${i}`);
      });
    }
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [IconTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — Icon has no fullWidth prop');
    });

    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openIconTestScenarios(page);
      for (const sectionId of ICON_DATA_SECTIONS) {
        const band = iconSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default icon visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openIconTestScenarios(page);
      await expect(iconRoot(page, ICON_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Size band icons laid out in horizontal flex row', async ({ page }) => {
      const band = iconSection(page, 'icon-qa-size');
      const first = await iconBox(page, iconSizeTestId('2'));
      const last = await iconBox(page, iconSizeTestId('40'));
      expect(first!.x, 'smaller size should appear before larger in row').toBeLessThan(last!.x);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [IconTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of ICON_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: ICON_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Icon”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Icon', level: 1 })).toBeVisible();
    });

    test('Smoke — Default icon visible with role img', async ({ page }) => {
      const root = iconRoot(page, ICON_ROOT_TESTIDS.default);
      await expect(root).toBeVisible();
      await expect(root).toHaveRole('img');
    });

    test('Smoke — All icon root testids count matches manifest', async ({ page }) => {
      await expect(
        page.locator(ICON_SHOWCASE_AXE_SCOPE).locator('[data-testid^="icon-"][data-size]'),
      ).toHaveCount(ICON_ALL_ROOT_TESTIDS.length);
    });
  });
});
