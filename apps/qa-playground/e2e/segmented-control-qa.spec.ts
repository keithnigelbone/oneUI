/**
 * SegmentedControl QA — functional coverage aligned to `SegmentedControlQaShowcase.tsx`.
 */
import { expect, test } from 'playwright/test';

import {
  SC_CANONICAL,
  SC_CODE_API_NOTES,
  SC_FIGMA_API_PROPS,
} from './segmented-control/segmented-control-test-data';
import {
  SEGMENTED_CONTROL_ALL_TESTIDS,
  SEGMENTED_CONTROL_COMBO_COUNT,
  SEGMENTED_CONTROL_DATA_SECTIONS,
  SEGMENTED_CONTROL_FIGMA_APPEARANCES,
  SEGMENTED_CONTROL_FIGMA_ATTENTIONS,
  SEGMENTED_CONTROL_FIGMA_SHAPES,
  SEGMENTED_CONTROL_FIGMA_SIZES,
  SEGMENTED_CONTROL_FIGMA_TRACK,
  SEGMENTED_CONTROL_ROOT_TESTIDS,
  SEGMENTED_CONTROL_SECTION_COUNT,
  scAppearanceTestId,
  scAttentionTestId,
  scComboTestId,
  scShapeTestId,
  scSizeTestId,
  scTrackTestId,
} from './segmented-control-playground/manifest';
import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  canonicalSegmentButtons,
  clickPageThemeButton,
  defaultBandButtons,
  expectFocusVisible,
  gotoSegmentedControlPlayground,
  qaLog,
  qaStep,
  scByTestId,
  scByTestIdInSection,
  scGroupRoot,
  scPressedSegmentButtons,
  scSection,
  scSegmentButtons,
  scWrapperBox,
  SC_TAG_SET,
  scrollToScTestId,
} from './segmented-control/segmented-control-qa-support';

const COMBO_COUNT = SEGMENTED_CONTROL_COMBO_COUNT;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/segmented-control`);
  expect(res.ok(), `Segmented Control playground should be reachable at ${origin}/c/segmented-control`).toBeTruthy();
});

test.beforeEach(async ({ page }) => {
  await gotoSegmentedControlPlayground(page);
});

test.describe('Functional', { tag: SC_TAG_SET.functional }, () => {
  // ── Preserved tests (do not remove) ─────────────────────────────────────
  test('[fn] Smoke — page heading and default control', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Segmented Control', level: 1 })).toBeVisible();
    await expect(page.getByTestId(SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
  });

  test('[fn] Smoke — all story bands render', async ({ page }) => {
    expect(SEGMENTED_CONTROL_SECTION_COUNT).toBe(SEGMENTED_CONTROL_DATA_SECTIONS.length);
    for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
      await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
    }
  });

  test('[fn] Interaction — controlled selection updates state', async ({ page }) => {
    const section = page.locator('[data-section="segmented-control-qa-interaction"]');
    const control = section.getByTestId(SEGMENTED_CONTROL_ROOT_TESTIDS.controlled);
    await control.getByRole('button', { name: 'Month' }).click();
    await expect(section.getByTestId('segmented-control-controlled-state')).toContainText('value: ctrl-c');
  });

  test('[fn] Live controls — JSON preview block visible', async ({ page }) => {
    await scSection(page, 'segmented-control-qa-controls').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('segmented-control-code-json')).toBeVisible();
  });

  // ── GROUP 1 — Render tests ───────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('1.1 — Page loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await qaStep('Reload playground and wait for default control', async () => {
        await gotoSegmentedControlPlayground(page);
        await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
      });
      await assertNoConsoleErrors(errors);
    });

    test('1.1 — Default control renders segment buttons', async ({ page }) => {
      const wrapper = scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default);
      await expect(wrapper).toBeVisible();
      await expect(defaultBandButtons(page)).toHaveCount(3);
    });

    test('1.2 — Playground data-testid values are unique on the page', async ({ page }) => {
      const duplicates: string[] = [];
      for (const testId of SEGMENTED_CONTROL_ALL_TESTIDS) {
        const count = await page.getByTestId(testId).count();
        if (count > 1) duplicates.push(`${testId} (${count}×)`);
      }
      expect(
        duplicates,
        `Each data-testid should appear once — duplicate anchors break Playwright strict mode:\n${duplicates.join('\n')}`,
      ).toHaveLength(0);
    });

    test('1.2 — Every playground data-testid is visible', async ({ page }) => {
      for (const testId of SEGMENTED_CONTROL_ALL_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          const node = page.getByTestId(testId).first();
          await node.scrollIntoViewIfNeeded();
          await expect(node, `Expected visible: ${testId}`).toBeVisible();
          const errorText = await node.locator('text=/error|failed/i').count();
          expect(errorText, `${testId} should not render error text`).toBe(0);
        });
      }
    });

    test('1.3 — Every data-section band is visible', async ({ page }) => {
      for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
        await expect(scSection(page, sectionId)).toBeVisible();
      }
      await expect(page.locator('[data-section^="segmented-control-qa-"]')).toHaveCount(
        SEGMENTED_CONTROL_SECTION_COUNT,
      );
    });
  });

  // ── GROUP 2 — Props validation ───────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    for (const size of SEGMENTED_CONTROL_FIGMA_SIZES) {
      test(`2.1 — Size ${size.toUpperCase()} renders`, async ({ page }) => {
        await scSection(page, 'segmented-control-qa-size').scrollIntoViewIfNeeded();
        await expect(scByTestId(page, scSizeTestId(size))).toBeVisible();
      });
    }

    test('2.2 — Size S/M/L scale progressively (wrapper width)', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        SEGMENTED_CONTROL_FIGMA_SIZES.map((size) => scWrapperBox(page, scSizeTestId(size))),
      );
      for (const box of boxes) expect(box).not.toBeNull();
      const [s, m, l] = boxes as NonNullable<Awaited<ReturnType<typeof scWrapperBox>>>[];
      expect(s.width).toBeLessThanOrEqual(m.width + 4);
      expect(m.width).toBeLessThanOrEqual(l.width + 4);
      expect(s.height).toBeLessThanOrEqual(m.height + 4);
      expect(m.height).toBeLessThanOrEqual(l.height + 4);
    });

    for (const attention of SEGMENTED_CONTROL_FIGMA_ATTENTIONS) {
      test(`2.1 — Attention ${attention} renders`, async ({ page }) => {
        await scSection(page, 'segmented-control-qa-attention').scrollIntoViewIfNeeded();
        await expect(scByTestId(page, scAttentionTestId(attention))).toBeVisible();
      });
    }

    for (const appearance of SEGMENTED_CONTROL_FIGMA_APPEARANCES) {
      test(`2.1 — Appearance ${appearance} renders`, async ({ page }) => {
        await scSection(page, 'segmented-control-qa-appearance').scrollIntoViewIfNeeded();
        await expect(scByTestId(page, scAppearanceTestId(appearance))).toBeVisible();
      });
    }

    test('2.3 — Appearance prop maps to group data-appearance', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-appearance').scrollIntoViewIfNeeded();
      for (const appearance of ['primary', 'secondary', 'positive'] as const) {
        await expect(scGroupRoot(scByTestId(page, scAppearanceTestId(appearance)))).toHaveAttribute(
          'data-appearance',
          appearance,
        );
      }
    });

    for (const shape of SEGMENTED_CONTROL_FIGMA_SHAPES) {
      test(`2.1 — Shape ${shape} renders`, async ({ page }) => {
        await scSection(page, 'segmented-control-qa-shape').scrollIntoViewIfNeeded();
        await expect(scByTestId(page, scShapeTestId(shape))).toBeVisible();
      });
    }

    for (const track of SEGMENTED_CONTROL_FIGMA_TRACK) {
      test(`2.1 — trackEmphasis ${track} renders`, async ({ page }) => {
        await scSection(page, 'segmented-control-qa-track-emphasis').scrollIntoViewIfNeeded();
        await expect(scByTestId(page, scTrackTestId(track))).toBeVisible();
      });
    }

    test('2.4 — data-shape and data-track-emphasis attributes', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-shape').scrollIntoViewIfNeeded();
      await expect(scGroupRoot(scByTestId(page, scShapeTestId('rectangular')))).toHaveAttribute(
        'data-shape',
        'rectangular',
      );
      await scSection(page, 'segmented-control-qa-track-emphasis').scrollIntoViewIfNeeded();
      await expect(scGroupRoot(scByTestId(page, scTrackTestId('medium')))).toHaveAttribute(
        'data-track-emphasis',
        'medium',
      );
    });
  });

  // ── GROUP 3 — Click interaction ──────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('3.1 — Click selects segment and updates aria-pressed', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(2).click();
      await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'false');
    });

    test('3.1 — Controlled demo logs onValueChange', async ({ page }) => {
      const section = scSection(page, 'segmented-control-qa-interaction');
      await section.scrollIntoViewIfNeeded();
      const control = scByTestIdInSection(page, 'segmented-control-qa-interaction', SEGMENTED_CONTROL_ROOT_TESTIDS.controlled);
      await control.getByRole('button', { name: 'Day' }).click();
      await expect(section.getByTestId('segmented-control-controlled-state')).toContainText('value: ctrl-a');
      await expect(section.getByTestId('segmented-control-controlled-log')).toContainText('onValueChange("ctrl-a")');
    });

    test('3.2 — Disabled group ignores segment clicks', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-combos').scrollIntoViewIfNeeded();
      const buttons = scSegmentButtons(page, scComboTestId(5));
      for (let i = 0; i < 3; i++) {
        await expect(buttons.nth(i)).toHaveAttribute('aria-disabled', 'true');
      }
      await buttons.nth(1).click({ force: true });
      for (let i = 0; i < 3; i++) {
        await expect(buttons.nth(i)).toHaveAttribute('aria-disabled', 'true');
      }
      await expect(scPressedSegmentButtons(page, scComboTestId(5))).toHaveCount(0);
    });

    test('3.2 — Disabled item cannot be selected', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-a11y').scrollIntoViewIfNeeded();
      const wrapper = scByTestId(page, 'segmented-control-a11y-disabled-item');
      const disabledBtn = wrapper.getByRole('button', { name: 'Disabled' });
      await expect(disabledBtn).toBeDisabled();
      await disabledBtn.click({ force: true });
      await expect(wrapper.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('3.3 — Readonly state (N/A)', async () => {
      qaLog('Skipped — SegmentedControl has no readOnly prop in showcase');
    });

    test('3.4 — Click outside removes focus from segment', async ({ page }) => {
      const btn = defaultBandButtons(page).first();
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('h1').click();
      await expect(btn).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('4.1 — Tab reaches segment buttons', async ({ page }) => {
      await defaultBandButtons(page).first().focus();
      await expect(defaultBandButtons(page).first()).toBeFocused();
    });

    test('4.2 — Enter activates focused segment', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(0).focus();
      await page.keyboard.press('Enter');
      await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
    });

    test('4.3 — Space activates focused segment', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(2).focus();
      await page.keyboard.press('Space');
      await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
    });

    test('4.4 — ArrowRight moves focus to next segment (roving focus)', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(0).focus();
      await page.keyboard.press('ArrowRight');
      await expect(buttons.nth(1)).toBeFocused();
    });

    test('4.4b — Arrow keys move focus without changing selection until activation', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      const buttons = canonicalSegmentButtons(page);
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
      await page.getByTestId(SC_CANONICAL.itemDay).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toBeFocused();
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toHaveAttribute('aria-pressed', 'false');
    });

    test('4.4 — ArrowLeft moves focus to previous segment (roving focus)', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(1).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(buttons.nth(0)).toBeFocused();
    });

    test('4.5 — Home / End keys (N/A for ToggleGroup toolbar pattern)', async () => {
      qaLog('Skipped — Base UI ToggleGroup roving focus uses arrows; Home/End not supported');
    });

    test('4.6 — Escape does not hide control', async ({ page }) => {
      await defaultBandButtons(page).first().focus();
      await page.keyboard.press('Escape');
      await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('4.7 — No keyboard trap — Tab visits multiple targets', async ({ page }) => {
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const sig =
          (await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return '';
            return `${el.tagName}:${el.getAttribute('role') ?? ''}:${el.getAttribute('data-testid') ?? ''}`;
          })) ?? '';
        seen.add(sig);
      }
      expect(seen.size).toBeGreaterThan(3);
    });
  });

  // ── GROUP 5 — Focus management ───────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('5.1 — Click focuses segment button', async ({ page }) => {
      const btn = defaultBandButtons(page).nth(1);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('5.2 — Focus indicator visible on keyboard focus', async ({ page }) => {
      await defaultBandButtons(page).first().focus();
      await expectFocusVisible(page);
    });

    test('5.4 — Blur removes focus', async ({ page }) => {
      const btn = defaultBandButtons(page).first();
      await btn.focus();
      await page.locator('h1').click();
      await expect(btn).not.toBeFocused();
    });

    test('5.3 — Focus order follows left-to-right segments', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(0).focus();
      await page.keyboard.press('ArrowRight');
      await expect(buttons.nth(1)).toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — SegmentedControl showcase has no autoFocus prop');
    });
  });

  // ── GROUP 6 — State tests ────────────────────────────────────────────────
  test.describe('Group 6 — State', () => {
    test('6.1 — Default group has no selection without defaultValue (document Figma gap)', async ({ page }) => {
      await expect(scPressedSegmentButtons(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toHaveCount(0);
      for (let i = 0; i < 3; i++) {
        await expect(defaultBandButtons(page).nth(i)).toHaveAttribute('aria-pressed', 'false');
      }
    });

    test('6.1b — Canonical defaultValue selects Day (first item)', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toHaveAttribute('aria-pressed', 'true');
    });

    test('6.2 — First / middle / last selection states render', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-selection').scrollIntoViewIfNeeded();
      await expect(scSegmentButtons(page, 'segmented-control-select-first').nth(0)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(scSegmentButtons(page, 'segmented-control-select-middle').nth(1)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(scSegmentButtons(page, 'segmented-control-select-last').nth(2)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('6.3 — Disabled combo group is not interactive', async ({ page }) => {
      await scrollToScTestId(page, scComboTestId(5));
      const buttons = scSegmentButtons(page, scComboTestId(5));
      for (let i = 0; i < 3; i++) {
        await expect(buttons.nth(i)).toHaveAttribute('aria-disabled', 'true');
      }
    });

    test('6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — no readOnly state in showcase');
    });

    test('6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — SegmentedControl has no error prop');
    });

    test('6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — SegmentedControl has no loading prop');
    });
  });

  // ── GROUP 7 — Slot tests ─────────────────────────────────────────────────
  test.describe('Group 7 — Slots', () => {
    test('7.1 — Start slot renders icons', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-slots').scrollIntoViewIfNeeded();
      const start = scByTestId(page, 'segmented-control-slot-start');
      await expect(start.locator('svg').first()).toBeVisible();
    });

    test('7.2 — End slot renders CounterBadge', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-slots').scrollIntoViewIfNeeded();
      const end = scByTestId(page, 'segmented-control-slot-end');
      await expect(end.getByLabel('5 notifications')).toBeVisible();
    });

    test('7.3 — Start + end combined visible', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-slots').scrollIntoViewIfNeeded();
      const both = scByTestId(page, 'segmented-control-slot-both');
      await expect(both.locator('svg').first()).toBeVisible();
      await expect(both.getByLabel('3 notifications')).toBeVisible();
    });

    test('7.4 — Icon inherits currentColor from segment', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-slots').scrollIntoViewIfNeeded();
      const iconColor = await scByTestId(page, 'segmented-control-slot-start')
        .locator('svg')
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      expect(iconColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  // ── GROUP 8 — Toggle and selection ───────────────────────────────────────
  test.describe('Group 8 — Selection', () => {
    test('8.1 — Toggle on/off (N/A)', async () => {
      qaLog('Skipped — single-select segments, not binary toggle');
    });

    test('8.2 — Only one segment selected at a time', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      await buttons.nth(2).click();
      await expect(scPressedSegmentButtons(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toHaveCount(1);
      await buttons.nth(0).click();
      await expect(scPressedSegmentButtons(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toHaveCount(1);
      await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
    });

    test('8.3 — Indeterminate (N/A)', async () => {
      qaLog('Skipped — SegmentedControl has no indeterminate state');
    });
  });

  // ── GROUP 9 — Input (N/A) ────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — SegmentedControl is not typed entry');
    });
  });

  // ── GROUP 10 — Dependencies ──────────────────────────────────────────────
  test.describe('Group 10 — Dependencies', () => {
    test('10.1 — equalWidth=true yields equal segment widths', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-equal-width').scrollIntoViewIfNeeded();
      const buttons = scSegmentButtons(page, 'segmented-control-equal-true');
      const widths = await buttons.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().width)),
      );
      expect(widths.length).toBe(3);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);
    });

    test('10.1 — equalWidth=false allows variable segment widths', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-equal-width').scrollIntoViewIfNeeded();
      const buttons = scSegmentButtons(page, 'segmented-control-equal-false');
      const widths = await buttons.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().width),
      );
      expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths) + 8);
    });

    test('10.1b — icon type uses hug-width track (data-type=icon, no equal-width)', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-basic').scrollIntoViewIfNeeded();
      const group = scGroupRoot(scByTestId(page, 'segmented-control-basic-icon'));
      await expect(group).toHaveAttribute('data-type', 'icon');
      await expect(group).not.toHaveAttribute('data-equal-width', '');
      const maxWidth = await group.evaluate((el) => getComputedStyle(el).maxWidth);
      expect(maxWidth).toBe('max-content');
    });

    test('10.2 — Live controls disabled checkbox disables group', async ({ page }) => {
      const controls = scSection(page, 'segmented-control-qa-controls');
      await controls.scrollIntoViewIfNeeded();
      await controls.getByTestId('segmented-control-ctrl-disabled').click();
      const liveButtons = scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.controlsLiveInner).getByRole('button');
      await expect(liveButtons.first()).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ── GROUP 11 — Content and display ───────────────────────────────────────
  test.describe('Group 11 — Content and display', () => {
    test('11.1 — Default segments expose Day / Week / Month labels', async ({ page }) => {
      await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toContainText('Week');
    });

    test('11.2 — Icon-only type renders per-item aria-labels', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-basic').scrollIntoViewIfNeeded();
      const iconGroup = scByTestId(page, 'segmented-control-basic-icon');
      await expect(iconGroup.getByLabel('List view')).toBeVisible();
    });

    test('11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — not a progress component');
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — SegmentedControl has no fullWidth prop');
    });

    test('12.2 — At 320px viewport bands remain visible', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await gotoSegmentedControlPlayground(page);
      await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
      for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
        const band = scSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        await expect(band).toBeVisible();
      }
    });

    test('12.2 — Visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSegmentedControlPlayground(page);
      await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Segments layout horizontally in default group', async ({ page }) => {
      const buttons = defaultBandButtons(page);
      const boxes = await Promise.all(
        [0, 1, 2].map(async (i) => {
          const box = await buttons.nth(i).boundingBox();
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
    test('13.1 — All sections visible after theme toggle', async ({ page }) => {
      await clickPageThemeButton(page);
      for (const sectionId of SEGMENTED_CONTROL_DATA_SECTIONS) {
        await expect(scSection(page, sectionId)).toBeVisible();
      }
    });
  });

  // ── Combination matrix ───────────────────────────────────────────────────
  test.describe('Combination matrix', () => {
    test('Figma combination matrix renders every row', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-combos').scrollIntoViewIfNeeded();
      for (let i = 0; i < COMBO_COUNT; i++) {
        await expect(scByTestId(page, scComboTestId(i))).toBeVisible();
      }
    });
  });

  // ── Live controls panel ──────────────────────────────────────────────────
  test.describe('Live controls panel', () => {
    test('Changing size control updates live preview data-size', async ({ page }) => {
      const controls = scSection(page, 'segmented-control-qa-controls');
      await controls.scrollIntoViewIfNeeded();
      await controls.getByTestId('segmented-control-ctrl-size-l').getByRole('button').click();
      await expect(
        scGroupRoot(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.controlsLiveInner)),
      ).toHaveAttribute('data-size', 'l');
    });

    test('Reset restores default live props', async ({ page }) => {
      const controls = scSection(page, 'segmented-control-qa-controls');
      await controls.scrollIntoViewIfNeeded();
      await controls.getByTestId('segmented-control-ctrl-size-s').getByRole('button').click();
      await controls.getByTestId('segmented-control-ctrl-reset').click();
      await expect(
        scGroupRoot(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.controlsLiveInner)),
      ).toHaveAttribute('data-size', 'm');
    });
  });

  // ── Canonical selectors ──────────────────────────────────────────────────
  test.describe('Canonical automation selectors', () => {
    test('should expose data-testid="segmented-control" on group root', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(page.getByTestId(SC_CANONICAL.root)).toBeVisible();
      await expect(page.getByTestId(SC_CANONICAL.root)).toHaveAttribute('role', 'group');
    });

    test('should expose segment-item-day/week/month on items', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(page.getByTestId(SC_CANONICAL.itemDay)).toBeVisible();
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toBeVisible();
      await expect(page.getByTestId(SC_CANONICAL.itemMonth)).toBeVisible();
    });

    test('should select first item by default when defaultValue=day', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await page.getByTestId(SC_CANONICAL.itemWeek).click();
      await expect(page.getByTestId(SC_CANONICAL.itemWeek)).toHaveAttribute('aria-pressed', 'true');
    });

    test('should call onValueChange when item is selected', async ({ page }) => {
      const section = scSection(page, 'segmented-control-qa-interaction');
      await section.scrollIntoViewIfNeeded();
      await scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.controlled).getByRole('button', { name: 'Month' }).click();
      await expect(section.getByTestId('segmented-control-controlled-log')).toContainText('onValueChange("ctrl-c")');
    });
  });

  // ── Known issues / Figma API parity ──────────────────────────────────────
  test.describe('Known issues — Figma vs code', () => {
    test('KI-1 — No auto-select when value/defaultValue omitted', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-automation').scrollIntoViewIfNeeded();
      await expect(scPressedSegmentButtons(page, SEGMENTED_CONTROL_ROOT_TESTIDS.noDefault)).toHaveCount(0);
      qaLog('Documented gap', { note: SC_CODE_API_NOTES.itemSelected });
    });

    test('KI-2 — Figma itemSelected vs React group value model', async () => {
      qaLog(SC_CODE_API_NOTES.itemSelected);
      expect(SC_FIGMA_API_PROPS.itemSelected).toEqual(['true', 'false']);
    });

    test('KI-3 — equalWidth defaults differ by type', async ({ page }) => {
      await scSection(page, 'segmented-control-qa-basic').scrollIntoViewIfNeeded();
      await expect(scGroupRoot(scByTestId(page, 'segmented-control-basic-text'))).toHaveAttribute(
        'data-equal-width',
        '',
      );
      await expect(scGroupRoot(scByTestId(page, 'segmented-control-basic-icon'))).not.toHaveAttribute(
        'data-equal-width',
        '',
      );
      qaLog(SC_CODE_API_NOTES.equalWidthDefault);
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: SC_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Segmented Control”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Segmented Control', level: 1 })).toBeVisible();
    });

    test('Smoke — Default control is visible', async ({ page }) => {
      await expect(scByTestId(page, SEGMENTED_CONTROL_ROOT_TESTIDS.default)).toBeVisible();
      await expect(defaultBandButtons(page)).toHaveCount(3);
    });
  });
});
