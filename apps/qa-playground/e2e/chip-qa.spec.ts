/**
 * Chip component functional QA — validates every property in the Figma API table:
 *
 *  Property   | Values
 *  -----------|------------------------------------------------------
 *  size        | S · M · L
 *  selected    | true · false
 *  attention   | high · medium · low
 *  appearance  | auto · neutral · primary · secondary · sparkle ·
 *              | negative · positive · warning · informative
 *              | (brand-bg: valid in code, Figma table pending)
 *  disabled    | true · false  ×  selected true · false
 *  start       | none · Icon · Avatar · CounterBadge · IndicatorBadge
 *  end         | none · Icon · Avatar · CounterBadge · IndicatorBadge
 *
 * Relevant Chip events (web / Base UI Toggle):
 *  selectedChange    onSelectedChange(selected)     click or keyboard (Space)
 *  aria-pressed      DOM                            mirrors selected
 *  disabled guard    disabled prop                  no toggle / no event
 *  data-variant      DOM data attr                  bold|subtle|ghost (= attention → variant)
 *  data-appearance   DOM data attr                  resolved appearance role
 *  data-size         DOM data attr                  resolved size
 *
 * Console contract: `[chip-qa] selectedChange {"testId":"…","selected":true|false}`
 *
 * NOTE: Chip does not forward data-testid to the DOM root element (no ...rest spread).
 * All testids are on wrapper <div> or <td> elements in ChipQaShowcase / ChipSizeFigmaMatrix.
 * chipEl() navigates wrapper → inner button so attribute assertions target the right element.
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents behaviour and `@oneui/ui` Chip is wrong, the test must fail.
 *
 * **Raised component defects (tests must fail until fixed in `Chip.tsx` / tokens):**
 * - `attention="low"` (ghost) selected chip: button root fill reads transparent/page-colour (2.3).
 * - High-attention unselected chip: `aria-pressed` toggles on click but computed fill unchanged (8.1).
 *
 */
import { expect, test, type Page } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  CHIP_TAG_SET,
  ChipTags,
  collectChipTabFocusSignatures,
  expectSectionVisible,
  openChipTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './chip/chip-qa-support';
import {
  chipButton,
  chipButtonBox,
  chipButtonFillRgb,
  chipEl,
  chipSection,
  expectChipButtonFocusRing,
} from './chip-playground/chipHelpers';
import {
  CHIP_ALL_TESTIDS,
  CHIP_ATTENTIONS,
  CHIP_DATA_SECTIONS,
  CHIP_FIGMA_SIZES,
  CHIP_ROOT_TESTIDS,
  CHIP_SECTION_COUNT,
  chipAppearanceTestId,
  chipAttentionTestId,
  chipSizeCellTestId,
  chipVariantTestId,
} from './chip-playground/manifest';

// ─── helpers ──────────────────────────────────────────────────────────────────

function attachConsoleCollector(page: Page) {
  const lines: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'log' && msg.text().includes('[chip-qa]')) lines.push(msg.text());
  });
  return lines;
}

function parseSelectedFromLog(line: string): boolean | undefined {
  try {
    const json = line.slice(line.indexOf('{'));
    return (JSON.parse(json) as { selected?: boolean }).selected;
  } catch {
    return undefined;
  }
}

// ─── setup ────────────────────────────────────────────────────────────────────

test.describe('Functional', { tag: CHIP_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openChipTestScenarios(page);
  });

// ─── 0. default ───────────────────────────────────────────────────────────────

test.describe('0. default', () => {
  test('[fn] default chip starts selected', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-default', CHIP_ROOT_TESTIDS.default);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─── 1. size ──────────────────────────────────────────────────────────────────

test.describe('1. size', () => {
  /** Figma values: S · M · L. Matrix rows = selected true/false; columns = M · S · L. */
  for (const selected of ['true', 'false'] as const) {
    for (const size of ['M', 'S', 'L'] as const) {
      test(`[fn] size ${size} × selected ${selected} — visible + data-size attr`, async ({ page }) => {
        const chip = chipEl(page, 'chip-qa-size', `chip-size-sel-${selected}-sz-${size}`);
        await chip.scrollIntoViewIfNeeded();
        await expect(chip).toBeVisible();
        await expect(chip).toHaveAttribute('data-size', size.toLowerCase());
        await expect(chip).toHaveAttribute('aria-pressed', selected);
      });
    }
  }
});

// ─── 2. selected ──────────────────────────────────────────────────────────────

test.describe('2. selected', () => {
  test('[fn] selected true — aria-pressed="true"', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-selected', 'chip-selected-true');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('[fn] selected false — aria-pressed="false"', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-selected', 'chip-selected-false');
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  test('[fn] chip toggles selected on click (uncontrolled)', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-selected', 'chip-selected-true');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─── 3. attention ─────────────────────────────────────────────────────────────

test.describe('3. attention', () => {
  const ATTENTION_VARIANT_MAP = { high: 'bold', medium: 'subtle', low: 'ghost' } as const;

  for (const [attention, variant] of Object.entries(ATTENTION_VARIANT_MAP) as [keyof typeof ATTENTION_VARIANT_MAP, string][]) {
    test(`[fn] attention ${attention} — visible, aria-pressed true, data-variant="${variant}"`, async ({ page }) => {
      const chip = chipEl(page, 'chip-qa-attention', `chip-attention-${attention}`);
      await expect(chip).toBeVisible();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await expect(chip).toHaveAttribute('data-variant', variant);
    });
  }
});

// ─── 4. appearance ────────────────────────────────────────────────────────────

test.describe('4. appearance', () => {
  /** All 9 Figma-table roles + auto + brand-bg (valid, Figma table pending). */
  const FIGMA_APPEARANCES = [
    'auto', 'neutral', 'primary', 'secondary', 'sparkle',
    'brand-bg', 'negative', 'positive', 'warning', 'informative',
  ] as const;

  /** auto resolves to secondary; brand-bg renders as brand-bg. */
  const RESOLVED: Partial<Record<string, string>> = { auto: 'secondary' };

  for (const appearance of FIGMA_APPEARANCES) {
    test(`[fn] appearance "${appearance}" — visible, aria-pressed true, data-appearance attr`, async ({ page }) => {
      const chip = chipEl(page, 'chip-qa-appearance', `chip-appearance-${appearance}`);
      await chip.scrollIntoViewIfNeeded();
      await expect(chip).toBeVisible();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      const expected = RESOLVED[appearance] ?? appearance;
      await expect(chip).toHaveAttribute('data-appearance', expected);
    });
  }
});

// ─── 5. disabled ──────────────────────────────────────────────────────────────

test.describe('5. disabled', () => {
  test('[fn] disabled false — chip is enabled and can toggle', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-disabled', 'chip-disabled-false');
    await expect(chip).toBeEnabled();
    const before = await chip.getAttribute('aria-pressed');
    await chip.click();
    const after = await chip.getAttribute('aria-pressed');
    expect(after).not.toBe(before);
  });

  test('[fn] disabled true + selected — aria-pressed true, is disabled, stays pressed on click', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-disabled', 'chip-disabled-true-selected');
    await expect(chip).toBeDisabled();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await chip.click({ force: true });
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('[fn] disabled true + unselected — aria-pressed false, is disabled, stays unpressed on click', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-disabled', 'chip-disabled-true-unselected');
    await expect(chip).toBeDisabled();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await chip.click({ force: true });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  });
});

// ─── 6. start slot ────────────────────────────────────────────────────────────

test.describe('6. start slot', () => {
  const START_SLOTS = ['none', 'icon', 'avatar', 'counter', 'indicator'] as const;

  for (const slot of START_SLOTS) {
    test(`[fn] start="${slot}" — chip visible`, async ({ page }) => {
      const chip = chipEl(page, 'chip-qa-start', `chip-start-${slot}`);
      await chip.scrollIntoViewIfNeeded();
      await expect(chip).toBeVisible();
    });
  }

  test('[fn] start=none — chip has no start slot child', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-start', 'chip-start-none');
    // No [data-surface] start span when slot is empty
    await expect(chip.locator('[data-surface]').first()).toHaveCount(0);
  });

  test('[fn] start=Icon — chip has start slot content', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-start', 'chip-start-icon');
    await expect(chip.locator('span').first()).toBeVisible();
  });
});

// ─── 7. end slot ──────────────────────────────────────────────────────────────

test.describe('7. end slot', () => {
  const END_SLOTS = ['none', 'icon', 'avatar', 'counter', 'indicator'] as const;

  for (const slot of END_SLOTS) {
    test(`[fn] end="${slot}" — chip visible`, async ({ page }) => {
      const chip = chipEl(page, 'chip-qa-end', `chip-end-${slot}`);
      await chip.scrollIntoViewIfNeeded();
      await expect(chip).toBeVisible();
    });
  }

  test('[fn] end=none — chip has no end slot child', async ({ page }) => {
    const chip = chipEl(page, 'chip-qa-end', 'chip-end-none');
    await expect(chip.locator('[data-surface]').first()).toHaveCount(0);
  });
});

// ─── 8. combination matrix ────────────────────────────────────────────────────

test.describe('8. combination matrix', () => {
  /** Index ↔ caption from COMBO_MATRIX in ChipQaShowcase.tsx */
  const COMBOS = [
    { index: 0, label: 'S secondary high selected',      size: 's', pressed: 'true',  disabled: false },
    { index: 1, label: 'M primary medium unselected',    size: 'm', pressed: 'false', disabled: false },
    { index: 2, label: 'L sparkle low selected',         size: 'l', pressed: 'true',  disabled: false },
    { index: 3, label: 'M auto high selected',           size: 'm', pressed: 'true',  disabled: false },
    { index: 4, label: 'M warning high disabled selected', size: 'm', pressed: 'true', disabled: true },
    { index: 5, label: 'M positive low start Icon',      size: 'm', pressed: 'false', disabled: false },
    { index: 6, label: 'M informative high end IndicatorBadge', size: 'm', pressed: 'true', disabled: false },
    { index: 7, label: 'M negative medium Avatar+CounterBadge', size: 'm', pressed: 'true', disabled: false },
  ] as const;

  for (const combo of COMBOS) {
    test(`[fn] combo ${combo.index}: ${combo.label}`, async ({ page }) => {
      const chip = chipEl(page, 'chip-qa-combos', `chip-combo-${combo.index}`);
      await chip.scrollIntoViewIfNeeded();
      await expect(chip).toBeVisible();
      await expect(chip).toHaveAttribute('data-size', combo.size);
      await expect(chip).toHaveAttribute('aria-pressed', combo.pressed);
      if (combo.disabled) {
        await expect(chip).toBeDisabled();
      } else {
        await expect(chip).toBeEnabled();
      }
    });
  }
});

// ─── 9. events (console) ─────────────────────────────────────────────────────

test.describe('9. events', () => {
  test('[fn] click → selectedChange emitted with selected=true', async ({ page }) => {
    const logs = attachConsoleCollector(page);
    await page.goto('/c/chip');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();

    const chip = chipEl(page, 'chip-qa-events', 'chip-event-probe');
    await chip.scrollIntoViewIfNeeded();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await chip.click();

    await expect.poll(() => logs.some((l) => l.includes('selectedChange') && parseSelectedFromLog(l) === true)).toBe(true);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('[fn] second click → selectedChange emitted with selected=false', async ({ page }) => {
    const logs = attachConsoleCollector(page);
    await page.goto('/c/chip');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();

    const chip = chipEl(page, 'chip-qa-events', 'chip-event-probe');
    await chip.scrollIntoViewIfNeeded();
    await chip.click(); // → true
    await chip.click(); // → false

    const probeLines = logs.filter((l) => l.includes('"chip-event-probe"'));
    await expect.poll(() => probeLines.length).toBeGreaterThanOrEqual(2);
    expect(parseSelectedFromLog(probeLines.at(-1)!)).toBe(false);
  });

  test('[fn] Space key → selectedChange emitted, aria-pressed flips', async ({ page }) => {
    const logs = attachConsoleCollector(page);
    await page.goto('/c/chip');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();

    const chip = chipEl(page, 'chip-qa-events', 'chip-event-probe');
    await chip.scrollIntoViewIfNeeded();
    await chip.focus();
    await page.keyboard.press('Space');

    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => logs.some((l) => l.includes('selectedChange') && parseSelectedFromLog(l) === true)).toBe(true);
  });

  test('[fn] disabled chip → no selectedChange on click', async ({ page }) => {
    const logs = attachConsoleCollector(page);
    await page.goto('/c/chip');
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();

    const chip = chipEl(page, 'chip-qa-events', 'chip-event-disabled');
    await chip.scrollIntoViewIfNeeded();
    const before = logs.length;
    await chip.click({ force: true });
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(logs.length).toBe(before); // no new log lines
  });
});

// ─── 10. Figma Validation tab ────────────────────────────────────────────────

test.describe('10. Figma Validation grid', () => {
  test('[fn] Figma Validation tab — grid renders all attention × slot rows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    await expect(page.getByTestId('figma-chip-grid')).toBeVisible();
    await expect(page.getByTestId('figma-chip-grid').locator('button').first()).toBeVisible();
  });
});

  // ── GROUP 1 — Render (Test Scenarios tab only) ───────────────────────────────
  test.describe('Group 1 — Render', { tag: [ChipTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default chip wrapper mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openChipTestScenarios(page);
      await qaStep('Assert no console errors', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(page.getByTestId(CHIP_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(120_000);
      for (const testId of CHIP_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const wrapper = page.getByTestId(testId);
          await wrapper.scrollIntoViewIfNeeded();
          await expect(wrapper, `Expected visible: ${testId}`).toBeVisible();
          const text = (await wrapper.textContent()) ?? '';
          expect(text.toLowerCase(), `${testId} should not show error copy`).not.toContain('error');
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of CHIP_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      const sections = page.locator('[data-section^="chip-qa-"]');
      await expect(sections).toHaveCount(CHIP_SECTION_COUNT);
    });

    test('1.4 — Default chip exposes resolved size M and secondary appearance', async ({ page }) => {
      const btn = chipButton(page, CHIP_ROOT_TESTIDS.default);
      await expect(btn, 'Default uses size M').toHaveAttribute('data-size', 'm');
      await expect(btn, 'Default appearance resolves to secondary').toHaveAttribute(
        'data-appearance',
        'secondary',
      );
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [ChipTags.functional] }, () => {
    test('2.2 — Size S / M / L bounding boxes scale progressively (selected true row)', async ({
      page,
    }) => {
      await chipSection(page, 'chip-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        CHIP_FIGMA_SIZES.map(async (figma) => chipButtonBox(page, chipSizeCellTestId('true', figma), 'chip-qa-size')),
      );
      expect(boxes.every(Boolean), 'Each size cell should have a bounding box').toBe(true);
      const heights = boxes.map((b) => b!.height);
      expect(heights[0], 'M should be taller than S').toBeGreaterThan(heights[1]);
      expect(heights[2], 'L should be taller than M').toBeGreaterThan(heights[0]);
    });


    for (const attention of CHIP_ATTENTIONS) {
    }

    test('2.1 — `variant="bold"` overrides attention to data-variant bold', async ({ page }) => {
      const btn = chipButton(page, chipVariantTestId('bold'), 'chip-qa-extra');
      await expect(btn).toHaveAttribute('data-variant', 'bold');
    });
  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [ChipTags.functional] }, () => {
    test('3.4 — Clicking page heading blurs the focused chip', async ({ page }) => {
      const btn = chipButton(page, CHIP_ROOT_TESTIDS.eventProbe, 'chip-qa-events');
      await btn.scrollIntoViewIfNeeded();
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.getByRole('heading', { name: 'Chip', level: 1 }).click();
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('Group 3 — Readonly (N/A)', { tag: [ChipTags.functional] }, () => {
    test('3.3 — Chip has no readonly mode', async () => {
      qaLog('Skipped — Chip API uses disabled, not readonly');
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [ChipTags.functional] }, () => {
    test('4.1 — Tab reaches an interactive element on the page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an interactive element').toBeTruthy();
    });

    test('4.7 — Repeated Tab visits multiple distinct focus targets (no trap)', async ({ page }) => {
      const seen = await collectChipTabFocusSignatures(page);
      expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(3);
    });

    test('4.4 — Arrow keys N/A for standalone Chip', async () => {
      qaLog('Skipped — use ChipGroup for roving arrow navigation');
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [ChipTags.functional] }, () => {
    test('5.1 — Click moves focus to the event probe chip', async ({ page }) => {
      const btn = chipButton(page, CHIP_ROOT_TESTIDS.eventProbe, 'chip-qa-events');
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('5.2 — Focused chip shows visible focus ring (computed)', async ({ page }) => {
      await expectChipButtonFocusRing(page, CHIP_ROOT_TESTIDS.eventProbe, 'chip-qa-events');
    });
  });

  test.describe('Group 5 — autoFocus (N/A)', { tag: [ChipTags.functional] }, () => {
    test('5.5 — Chip has no autoFocus prop in showcase', async () => {
      qaLog('Skipped — no autoFocus on Chip in showcase');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — Error / loading (N/A)', { tag: [ChipTags.functional] }, () => {
    test('6.5 — Error state is not part of Chip API', async () => {
      qaLog('Skipped — Chip has no error/invalid prop');
    });
    test('6.6 — Loading state is not part of Chip API', async () => {
      qaLog('Skipped — Chip has no loading prop');
    });
  });

  // ── GROUP 7 — Slots ────────────────────────────────────────────────────────
  test.describe('Group 7 — Slots', { tag: [ChipTags.functional] }, () => {
    test('7.3 — Icon + IndicatorBadge combo row renders both slots', async ({ page }) => {
      const wrapper = page.getByTestId(CHIP_ROOT_TESTIDS.slotsIconDot);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper.locator('svg').first()).toBeVisible();
      await expect(wrapper.locator('[data-context-boundary]').first()).toBeVisible();
    });
  });

  // ── GROUP 8 — Toggle ───────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [ChipTags.functional] }, () => {

    test('8.2 — Single-select is N/A for standalone Chip', async () => {
      qaLog('Skipped — use ChipGroup for single-select groups');
    });
  });

  // ── GROUP 9 — Input (N/A) ──────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', { tag: [ChipTags.functional] }, () => {
    test('9.x — Chip is not a text input', async () => {
      qaLog('Skipped — Chip is a toggle button, not typed entry');
    });
  });

  // ── GROUP 11 — Content ───────────────────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [ChipTags.functional] }, () => {
    test('11.1 — Default chip exposes accessible name “Label”', async ({ page }) => {
      const btn = chipButton(page, CHIP_ROOT_TESTIDS.default);
      await expect(btn).toHaveAccessibleName(/Label/i);
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [ChipTags.functional] }, () => {
    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openChipTestScenarios(page);
      for (const sectionId of CHIP_DATA_SECTIONS) {
        const band = chipSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default chip visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openChipTestScenarios(page);
      await expect(page.getByTestId(CHIP_ROOT_TESTIDS.default)).toBeVisible();
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [ChipTags.functional] }, () => {
    test('12.1 — fullWidth is not a Chip prop', async () => {
      qaLog('Skipped — Chip has no fullWidth prop');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [ChipTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await openChipTestScenarios(page);
      for (const sectionId of CHIP_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Primary appearance chip stays visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await chipSection(page, 'chip-qa-appearance').scrollIntoViewIfNeeded();
      const btn = chipButton(page, chipAppearanceTestId('primary'), 'chip-qa-appearance');
      await expect(btn).toBeVisible();
      const fill = await chipButtonFillRgb(page, chipAppearanceTestId('primary'), 'chip-qa-appearance');
      expect(fill).not.toBe('transparent');
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: CHIP_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Chip”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Chip', level: 1 })).toBeVisible();
    });

    test('Smoke — Test Scenarios tab is active with default chip visible', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByTestId(CHIP_ROOT_TESTIDS.default)).toBeVisible();
    });
  });
});
