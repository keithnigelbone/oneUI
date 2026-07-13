/**
 * Counter Badge QA playground — functional Playwright tests.
 * Selectors mirror `CounterBadgeQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **display** (count badge — `role="status"`, not tabbable / not clickable).
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents behaviour and `@oneui/ui` CounterBadge is wrong, the test must fail.
 *
 * **Raised defects (tests must fail until fixed — do not soften):**
 * - XS + high: Figma art shows dot-only without numerals; `@oneui/ui` still renders `displayValue` (size band, combo 5, Figma matrix cell).
 * - Page shell: `role="status"` report-load row may lack accessible name — see unscoped a11y test (playground shell, not CounterBadge).
 *
 * **Page chrome (not CounterBadge — use `clickPageThemeButton`, not stale `/Theme:/` selector):**
 * - Theme toggle test validates page header/toolbar control, not `@oneui/ui` CounterBadge.
 *
 * Playground inventory (exact values):
 * - data-section: see `e2e/counter-badge-playground/manifest.ts` → `COUNTER_BADGE_DATA_SECTIONS`
 * - data-testid: see `COUNTER_BADGE_ALL_TESTIDS` (49 roots in Test Scenarios)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickPageThemeButton,
  CounterBadgeTags,
  COUNTER_BADGE_TAG_SET,
  expectSectionVisible,
  openCounterBadgeTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './counter-badge/counter-badge-qa-support';
import {
  badgeFillRgb,
  counterBadgeBox,
  counterBadgeRoot,
  counterBadgeSection,
  expectCircularBadge,
  expectFigmaXsHighDotOnly,
} from './counter-badge-playground/counterBadgeHelpers';
import {
  ATTENTION_TO_VARIANT,
  COUNTER_BADGE_ALL_TESTIDS,
  COUNTER_BADGE_ATTENTIONS,
  COUNTER_BADGE_COMBO_COUNT,
  COUNTER_BADGE_DATA_SECTIONS,
  COUNTER_BADGE_FIGMA_APPEARANCES,
  COUNTER_BADGE_FIGMA_SIZES,
  COUNTER_BADGE_ROOT_TESTIDS,
  COUNTER_BADGE_SECTION_COUNT,
  COUNTER_BADGE_VARIANTS,
  counterBadgeAppearanceTestId,
  counterBadgeAttentionTestId,
  counterBadgeComboTestId,
  counterBadgeSizeTestId,
  counterBadgeVariantTestId,
  FIGMA_TO_SIZE_TOKEN,
} from './counter-badge-playground/manifest';

test.describe('Functional', { tag: COUNTER_BADGE_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openCounterBadgeTestScenarios(page);
  });

  test('[fn] shows Counter Badge page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Counter Badge', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario tabs are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  test('[fn] Default counter badge is visible', async ({ page }) => {
    await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default)).toBeVisible();
    await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default)).toHaveText('5');
  });

  test('[fn] Size row — M / S / L badges visible with value 8', async ({ page }) => {
    for (const figma of ['M', 'S', 'L'] as const) {
      const el = counterBadgeRoot(page, counterBadgeSizeTestId(figma));
      await expect(el).toBeVisible();
      await expect(el).toHaveText('8');
    }
  });


  test('[fn] Attention row — high / medium / low visible', async ({ page }) => {
    for (const att of COUNTER_BADGE_ATTENTIONS) {
      await expect(counterBadgeRoot(page, counterBadgeAttentionTestId(att))).toBeVisible();
    }
  });

  test('[fn] Appearance matrix — primary row triplet visible', async ({ page }) => {
    const band = counterBadgeSection(page, 'counter-qa-appearance');
    await expect(band.getByTestId('counter-badge-appearance-primary-high')).toBeVisible();
    await expect(band.getByTestId('counter-badge-appearance-primary-medium')).toBeVisible();
    await expect(band.getByTestId('counter-badge-appearance-primary-low')).toBeVisible();
  });

  test('[fn] Variant band — bold / subtle / ghost visible', async ({ page }) => {
    const band = counterBadgeSection(page, 'counter-qa-variant');
    await expect(band.getByTestId('counter-badge-variant-bold')).toBeVisible();
    await expect(band.getByTestId('counter-badge-variant-subtle')).toBeVisible();
    await expect(band.getByTestId('counter-badge-variant-ghost')).toBeVisible();
  });

  test('[fn] showZero and max overflow badges', async ({ page }) => {
    await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.valueZeroShowZero)).toHaveText('0');
    await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.maxOverflow)).toHaveText('9+');
  });

  test('[fn] Combination matrix renders all combo rows', async ({ page }) => {
    for (let i = 0; i < COUNTER_BADGE_COMBO_COUNT; i++) {
      await expect(counterBadgeRoot(page, counterBadgeComboTestId(i))).toBeVisible();
    }
  });

  test('[fn] Figma Validation tab renders matrix root', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('counter-badge-figma-validation-root')).toBeVisible();
    await expect(page.getByTestId('counter-badge-figma-sz-M-att-high')).toBeVisible();
  });


  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [CounterBadgeTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default badge mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openCounterBadgeTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(180_000);
      for (const testId of COUNTER_BADGE_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const root = counterBadgeRoot(page, testId);
          await root.scrollIntoViewIfNeeded();
          await expect(root, `Expected visible: ${testId}`).toBeVisible();
          const text = (await root.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of COUNTER_BADGE_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="counter-qa"]')).toHaveCount(COUNTER_BADGE_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [CounterBadgeTags.functional] }, () => {
    test('2.1 — Default exposes data-size m, data-variant bold, data-appearance primary', async ({ page }) => {
      const root = counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default);
      await expect(root).toHaveAttribute('data-size', 'm');
      await expect(root).toHaveAttribute('data-variant', 'bold');
      await expect(root).toHaveAttribute('data-appearance', 'primary');
    });

    test('2.1 — Each Figma size maps to correct data-size token', async ({ page }) => {
      for (const figma of COUNTER_BADGE_FIGMA_SIZES) {
        const root = counterBadgeRoot(page, counterBadgeSizeTestId(figma));
        await expect(root, `size ${figma}`).toHaveAttribute('data-size', FIGMA_TO_SIZE_TOKEN[figma]);
      }
    });

    test('2.1 — Attention maps to data-variant when variant prop omitted', async ({ page }) => {
      for (const attention of COUNTER_BADGE_ATTENTIONS) {
        const root = counterBadgeRoot(page, counterBadgeAttentionTestId(attention));
        await expect(root, `attention ${attention}`).toHaveAttribute('data-variant', ATTENTION_TO_VARIANT[attention]);
      }
    });

    test('2.1 — Explicit variant wins over attention (variant=bold, attention=low)', async ({ page }) => {
      const root = counterBadgeRoot(page, counterBadgeVariantTestId('bold'));
      await expect(root).toHaveAttribute('data-variant', 'bold');
    });

    test('2.1 — auto appearance resolves to primary on data-appearance', async ({ page }) => {
      const root = counterBadgeRoot(page, counterBadgeAppearanceTestId('auto', 'high'));
      await expect(root).toHaveAttribute('data-appearance', 'primary');
    });


    test('2.2 — Size xs → s → m → l bounding boxes scale progressively and stay circular', async ({ page }) => {
      const order = ['xs', 's', 'm', 'l'] as const;
      const figmaByToken: Record<(typeof order)[number], (typeof COUNTER_BADGE_FIGMA_SIZES)[number]> = {
        xs: 'XS',
        s: 'S',
        m: 'M',
        l: 'L',
      };
      const boxes = await Promise.all(
        order.map((token) => counterBadgeBox(page, counterBadgeSizeTestId(figmaByToken[token]))),
      );
      expect(boxes.every(Boolean)).toBe(true);
      const widths = boxes.map((b) => b!.width);
      for (let i = 1; i < widths.length; i++) {
        expect(
          widths[i],
          `${order[i]} width should be ≥ ${order[i - 1]}`,
        ).toBeGreaterThanOrEqual(widths[i - 1]);
      }
      for (const token of order) {
        await expectCircularBadge(page, counterBadgeSizeTestId(figmaByToken[token]));
      }
    });


  });

  // ── GROUP 3 — Click (N/A) ──────────────────────────────────────────────────
  test.describe('Group 3 — Click interaction (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('3.x — CounterBadge is not clickable', async () => {
      qaLog('Skipped — display component; status badge is not an interactive control');
    });
  });

  // ── GROUP 4 — Keyboard (N/A for component) ───────────────────────────────
  test.describe('Group 4 — Keyboard navigation (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('4.x — Counter badge is not in Tab order', async () => {
      qaLog('Skipped — CounterBadge is display-only; keyboard tests apply to page chrome in a11y spec');
    });
  });

  // ── GROUP 5 — Focus (N/A) ──────────────────────────────────────────────────
  test.describe('Group 5 — Focus management (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('5.x — CounterBadge does not receive focus on click', async () => {
      qaLog('Skipped — status span is not focusable');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [CounterBadgeTags.functional] }, () => {
    test('6.1 — Default state shows value 5 with role status', async ({ page }) => {
      const root = counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default);
      await expect(root).toHaveRole('status');
      await expect(root).toHaveText('5');
    });

    test('6.1 — showZero renders zero when value is 0', async ({ page }) => {
      await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.valueZeroShowZero)).toHaveText('0');
    });

    test('6.1 — max overflow renders capped label', async ({ page }) => {
      await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.maxOverflow)).toHaveText('9+');
    });

    for (const variant of COUNTER_BADGE_VARIANTS) {
      test(`6.1 — variant=${variant} exposes data-variant on root`, async ({ page }) => {
        const root = counterBadgeRoot(page, counterBadgeVariantTestId(variant));
        await expect(root).toHaveAttribute('data-variant', variant);
      });
    }
  });

  test.describe('Group 6 — Disabled / error / loading (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('6.3 — Disabled state is not in showcase', async () => {
      qaLog('Skipped — CounterBadge has no disabled prop in Test Scenarios');
    });
  });

  // ── GROUP 7 — Slots (N/A) ──────────────────────────────────────────────────
  test.describe('Group 7 — Slot tests (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('7.x — CounterBadge has no start/end slots', async () => {
      qaLog('Skipped — CounterBadge is text-only display; no slot API');
    });
  });

  // ── GROUP 8–10 — N/A ─────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — CounterBadge is not selectable');
    });
  });

  test.describe('Group 9 — Input (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — CounterBadge is not typed entry');
    });
  });

  test.describe('Group 10 — Dependency rules', { tag: [CounterBadgeTags.functional] }, () => {
    test('10.1 — variant prop has no effect when both variant and attention set — variant wins', async ({ page }) => {
      for (const variant of COUNTER_BADGE_VARIANTS) {
        const root = counterBadgeRoot(page, counterBadgeVariantTestId(variant));
        await expect(root, `variant ${variant} should win over attention=low`).toHaveAttribute('data-variant', variant);
      }
    });

    test('10.2 — showZero applies when value is 0 — badge renders instead of null', async ({ page }) => {
      await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.valueZeroShowZero)).toBeVisible();
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [CounterBadgeTags.functional] }, () => {

    test('11.1 — Combo matrix text matches expected overflow and values (non-XS rows)', async ({ page }) => {
      const expected: { index: number; text: string }[] = [
        { index: 0, text: '5' },
        { index: 1, text: '12' },
        { index: 2, text: '3' },
        { index: 3, text: '99' },
        { index: 4, text: '99+' },
      ];
      for (const { index, text } of expected) {
        await expect(counterBadgeRoot(page, counterBadgeComboTestId(index)), `combo ${index}`).toHaveText(text);
      }
    });


    for (let i = 0; i < COUNTER_BADGE_COMBO_COUNT; i++) {
      test(`11.1 — combo ${i} has accessible name via aria-label`, async ({ page }) => {
        const root = counterBadgeRoot(page, counterBadgeComboTestId(i));
        await root.scrollIntoViewIfNeeded();
        await expect(root).toHaveAccessibleName(/.+/);
      });
    }
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [CounterBadgeTags.functional] }, () => {
    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openCounterBadgeTestScenarios(page);
      for (const sectionId of COUNTER_BADGE_DATA_SECTIONS) {
        const band = counterBadgeSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default badge visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openCounterBadgeTestScenarios(page);
      await expect(counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default)).toBeVisible();
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [CounterBadgeTags.functional] }, () => {
    test('12.1 — fullWidth is not a CounterBadge prop', async () => {
      qaLog('Skipped — CounterBadge has no fullWidth prop');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [CounterBadgeTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      for (const sectionId of COUNTER_BADGE_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: COUNTER_BADGE_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Counter Badge”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Counter Badge', level: 1 })).toBeVisible();
    });

    test('Smoke — Default status badge visible with value 5', async ({ page }) => {
      const root = counterBadgeRoot(page, COUNTER_BADGE_ROOT_TESTIDS.default);
      await expect(root).toBeVisible();
      await expect(root).toHaveText('5');
      await expect(root).toHaveRole('status');
    });
  });
});
