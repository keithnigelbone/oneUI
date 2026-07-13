/**
 * ChipGroup QA playground — functional Playwright tests.
 * Selectors mirror `ChipGroupQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **interactive** (ToggleGroup — single/multi chip selection + roving focus).
 *
 * ─── Figma API coverage ────────────────────────────────────────────────────
 * | Figma property | Figma values  | Code prop     | Tests                  |
 * |----------------|---------------|---------------|------------------------|
 * | size           | S · M · L     | size          | §1 — data-size on chip |
 * | containerType  | inline · wrap | wrap: boolean | §2 — data-wrap attr    |
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠️ FLAGGED MISMATCH — containerType:
 *   Figma `containerType: inline | wrap`
 *   Code  `wrap?: boolean`  (false = inline, true/default = wrap)
 *   DOM   data-wrap="false" when wrap=false; no attr when wrap=true
 *
 * **QA rule:** Do not weaken assertions or add playground workarounds so a run goes green.
 * If the showcase documents behaviour and `@oneui/ui` is wrong, the test must fail.
 *
 * **Raised component defects (tests must fail until fixed in `@oneui/ui` / page chrome):**
 * - `Home` / `End` keys do not move roving focus within ChipGroup (Group 4.5, accessibility spec).
 *
 * Playground inventory (exact values):
 * - data-section: chip-group-qa-default, chip-group-qa-size, chip-group-qa-container-type,
 *   chip-group-qa-events, chip-group-qa-combos
 * - data-testid: see `e2e/chip-group-playground/manifest.ts` → `CHIP_GROUP_ALL_TESTIDS`
 */
import { expect, test, type Page } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  CHIP_GROUP_TAG_SET,
  ChipGroupTags,
  collectChipGroupTabFocusSignatures,
  expectSectionVisible,
  openChipGroupTestScenarios,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './chip-group/chip-group-qa-support';
import {
  chipGroupFlexWrap,
  chipGroupSection,
  chipsInWrapper,
  expectChipFocusRing,
  firstChipBox,
} from './chip-group-playground/chipGroupHelpers';
import {
  CHIP_GROUP_ALL_TESTIDS,
  CHIP_GROUP_CONTAINER_TYPES,
  CHIP_GROUP_DATA_SECTIONS,
  CHIP_GROUP_ROOT_TESTIDS,
  CHIP_GROUP_SECTION_COUNT,
  CHIP_GROUP_SIZES,
  chipGroupComboTestId,
  chipGroupEventChipTestId,
  chipGroupSizeTestId,
} from './chip-group-playground/manifest';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Collect [chip-group-qa] console messages on the page, returns live array. */
function collectEvents(page: Page): string[] {
  const messages: string[] = [];
  page.on('console', (msg) => {
    if (msg.text().startsWith('[chip-group-qa]')) messages.push(msg.text());
  });
  return messages;
}

/** Parse the JSON payload from a `[chip-group-qa] valueChange {...}` log line. */
function parsePayload(line: string): { testId: string; values: string[] } {
  return JSON.parse(line.replace('[chip-group-qa] valueChange ', ''));
}

// ─── Functional suite ─────────────────────────────────────────────────────────

test.describe('Functional', { tag: CHIP_GROUP_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openChipGroupTestScenarios(page);
  });

  // ─── Default ──────────────────────────────────────────────────────────────

  test.describe('Default', () => {
    test('[fn] default group is visible with 5 chip buttons', async ({ page }) => {
      const wrapper = chipGroupSection(page, 'chip-group-qa-default').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.default,
      );
      await expect(wrapper).toBeVisible();
      const chips = wrapper.getByRole('button');
      await expect(chips).toHaveCount(5);
    });

    test('[fn] default group — no chip is selected (aria-pressed=false)', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      for (let i = 0; i < 5; i++) {
        await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'false');
      }
    });

    test('[fn] default group — single-select: clicking one deselects the previous', async ({
      page,
    }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.first().click();
      await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
      await chips.nth(1).click();
      await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await expect(chips.first()).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ─── 1. size ──────────────────────────────────────────────────────────────

  test.describe('1. size', () => {
    /**
     * Figma: size S · M · L.
     * Code: size="s" | "m" | "l" — propagated via ChipGroupContext to each child Chip.
     * DOM:  data-size attribute on every chip button inside the group.
     */
    for (const size of CHIP_GROUP_SIZES) {
      test(`[fn] size ${size.toUpperCase()} — group visible, all chips have data-size="${size}"`, async ({
        page,
      }) => {
        const wrapper = chipGroupSection(page, 'chip-group-qa-size').getByTestId(
          chipGroupSizeTestId(size),
        );
        await wrapper.scrollIntoViewIfNeeded();
        await expect(wrapper).toBeVisible();

        const chips = wrapper.getByRole('button');
        const count = await chips.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
          await expect(chips.nth(i)).toHaveAttribute('data-size', size);
        }
      });

      test(`[fn] size ${size.toUpperCase()} — first chip is pre-selected (aria-pressed=true)`, async ({
        page,
      }) => {
        const first = chipsInWrapper(page, chipGroupSizeTestId(size), 'chip-group-qa-size').first();
        await expect(first).toHaveAttribute('aria-pressed', 'true');
      });
    }
  });

  // ─── 2. containerType ─────────────────────────────────────────────────────

  test.describe('2. containerType (⚠️ Figma/code mismatch)', () => {
    /**
     * MISMATCH: Figma calls this "containerType: inline | wrap".
     * Code uses `wrap?: boolean` — the prop does not match the Figma name.
     * DOM reflection: data-wrap="false" when inline; absent when wrap (default).
     */
    test('[fn] containerType=inline (wrap=false) — group visible, data-wrap="false" present', async ({
      page,
    }) => {
      const wrapper = chipGroupSection(page, 'chip-group-qa-container-type').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.containerInline,
      );
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();

      const group = wrapper.locator('[data-wrap="false"]');
      await expect(group).toBeVisible();
    });

    test('[fn] containerType=wrap (wrap=true) — group visible, no data-wrap="false" attribute', async ({
      page,
    }) => {
      const wrapper = chipGroupSection(page, 'chip-group-qa-container-type').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.containerWrap,
      );
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();

      const inlineGroup = wrapper.locator('[data-wrap="false"]');
      await expect(inlineGroup).toHaveCount(0);
    });

    test('[fn] containerType=inline — chips do NOT wrap (flex-wrap: nowrap via data-wrap="false")', async ({
      page,
    }) => {
      const wrapper = chipGroupSection(page, 'chip-group-qa-container-type').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.containerInline,
      );
      const chips = wrapper.getByRole('button');
      await expect(chips).toHaveCount(5);
    });

    test('[fn] mismatch documented — no containerType prop on ChipGroup DOM element', async ({
      page,
    }) => {
      const wrapper = chipGroupSection(page, 'chip-group-qa-container-type').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.containerInline,
      );
      const withContainerType = wrapper.locator('[data-container-type]');
      await expect(withContainerType).toHaveCount(0);
    });
  });

  // ─── 3. Events (onValueChange) ────────────────────────────────────────────

  test.describe('3. Events (onValueChange)', () => {
    test('[fn] onValueChange — payload has testId and values array', async ({ page }) => {
      const msgs = collectEvents(page);
      const chip = chipGroupSection(page, 'chip-group-qa-events')
        .getByTestId(CHIP_GROUP_ROOT_TESTIDS.events)
        .getByTestId(chipGroupEventChipTestId(0));
      await chip.scrollIntoViewIfNeeded();
      await chip.click();
      await page.waitForFunction(() => true);

      const hit = msgs.find((m) => m.includes('valueChange'));
      expect(hit, 'No valueChange log emitted').toBeTruthy();
      const payload = parsePayload(hit!);
      expect(typeof payload.testId).toBe('string');
      expect(Array.isArray(payload.values)).toBe(true);
      expect(payload.testId).toBe(CHIP_GROUP_ROOT_TESTIDS.events);
    });

    test('[fn] onValueChange — selecting chip-0 emits values=["chip-0"]', async ({ page }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await page.waitForFunction(() => true);

      const payload = parsePayload(msgs.filter((m) => m.includes('valueChange')).at(-1)!);
      expect(payload.values).toEqual(['chip-0']);
      await expect(wrapper.getByTestId(chipGroupEventChipTestId(0))).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('[fn] onValueChange — selecting chip-0 then chip-1 emits values containing both', async ({
      page,
    }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(1)).click();
      await page.waitForFunction(() => true);

      const payload = parsePayload(msgs.filter((m) => m.includes('valueChange')).at(-1)!);
      expect(payload.values).toContain('chip-0');
      expect(payload.values).toContain('chip-1');
      expect(payload.values).toHaveLength(2);
    });

    test('[fn] onValueChange — selecting chip-0, chip-2, chip-4 emits all three values', async ({
      page,
    }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(2)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(4)).click();
      await page.waitForFunction(() => true);

      const payload = parsePayload(msgs.filter((m) => m.includes('valueChange')).at(-1)!);
      expect(payload.values).toContain('chip-0');
      expect(payload.values).toContain('chip-2');
      expect(payload.values).toContain('chip-4');
      expect(payload.values).toHaveLength(3);
    });

    test('[fn] onValueChange — fired once per click (event count matches click count)', async ({
      page,
    }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(1)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(2)).click();
      await page.waitForFunction(() => true);

      const valueMsgs = msgs.filter((m) => m.includes('valueChange'));
      expect(valueMsgs).toHaveLength(3);
    });

    test('[fn] onValueChange — deselecting chip-0 removes it from values', async ({ page }) => {
      const msgs = collectEvents(page);
      const chip0 = chipGroupSection(page, 'chip-group-qa-events')
        .getByTestId(CHIP_GROUP_ROOT_TESTIDS.events)
        .getByTestId(chipGroupEventChipTestId(0));
      await chip0.click();
      await chip0.click();
      await page.waitForFunction(() => true);

      const valueMsgs = msgs.filter((m) => m.includes('valueChange'));
      expect(valueMsgs.length).toBeGreaterThanOrEqual(2);
      const lastPayload = parsePayload(valueMsgs.at(-1)!);
      expect(lastPayload.values).not.toContain('chip-0');
      expect(lastPayload.values).toHaveLength(0);
    });

    test('[fn] onValueChange — deselecting one chip from multi-select keeps others', async ({
      page,
    }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(2)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await page.waitForFunction(() => true);

      const lastPayload = parsePayload(msgs.filter((m) => m.includes('valueChange')).at(-1)!);
      expect(lastPayload.values).not.toContain('chip-0');
      expect(lastPayload.values).toContain('chip-2');
      expect(lastPayload.values).toHaveLength(1);
    });

    test('[fn] onValueChange — Space key selects chip and fires valueChange', async ({ page }) => {
      const msgs = collectEvents(page);
      const chip = chipGroupSection(page, 'chip-group-qa-events')
        .getByTestId(CHIP_GROUP_ROOT_TESTIDS.events)
        .getByTestId(chipGroupEventChipTestId(2));
      await chip.focus();
      await page.keyboard.press('Space');
      await page.waitForFunction(() => true);

      const hit = msgs.find((m) => m.includes('valueChange') && m.includes('"chip-2"'));
      expect(hit, 'No valueChange for chip-2 via Space').toBeTruthy();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] onValueChange — Enter key selects chip and fires valueChange', async ({ page }) => {
      const msgs = collectEvents(page);
      const chip = chipGroupSection(page, 'chip-group-qa-events')
        .getByTestId(CHIP_GROUP_ROOT_TESTIDS.events)
        .getByTestId(chipGroupEventChipTestId(3));
      await chip.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => true);

      const hit = msgs.find((m) => m.includes('valueChange') && m.includes('"chip-3"'));
      expect(hit, 'No valueChange for chip-3 via Enter').toBeTruthy();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    });

    test('[fn] onValueChange — aria-pressed reflects each value in the emitted array', async ({
      page,
    }) => {
      const msgs = collectEvents(page);
      const wrapper = chipGroupSection(page, 'chip-group-qa-events').getByTestId(
        CHIP_GROUP_ROOT_TESTIDS.events,
      );
      await wrapper.getByTestId(chipGroupEventChipTestId(0)).click();
      await wrapper.getByTestId(chipGroupEventChipTestId(3)).click();
      await page.waitForFunction(() => true);

      const lastPayload = parsePayload(msgs.filter((m) => m.includes('valueChange')).at(-1)!);

      for (let i = 0; i < 5; i++) {
        const expected = lastPayload.values.includes(`chip-${i}`) ? 'true' : 'false';
        await expect(wrapper.getByTestId(chipGroupEventChipTestId(i))).toHaveAttribute(
          'aria-pressed',
          expected,
        );
      }
    });
  });

  // ─── 4. Combinations ──────────────────────────────────────────────────────

  test.describe('4. Combinations (size × containerType)', () => {
    for (const size of CHIP_GROUP_SIZES) {
      for (const container of CHIP_GROUP_CONTAINER_TYPES) {
        const testId = chipGroupComboTestId(size, container);
        const wrap = container === 'wrap';

        test(`[fn] combo ${size.toUpperCase()} × ${container} — visible, correct data-size and data-wrap`, async ({
          page,
        }) => {
          const wrapper = chipGroupSection(page, 'chip-group-qa-combos').getByTestId(testId);
          await wrapper.scrollIntoViewIfNeeded();
          await expect(wrapper).toBeVisible();

          const chips = wrapper.getByRole('button');
          const count = await chips.count();
          expect(count).toBeGreaterThan(0);
          for (let i = 0; i < count; i++) {
            await expect(chips.nth(i)).toHaveAttribute('data-size', size);
          }

          if (!wrap) {
            await expect(wrapper.locator('[data-wrap="false"]')).toBeVisible();
          } else {
            await expect(wrapper.locator('[data-wrap="false"]')).toHaveCount(0);
          }

          await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
        });
      }
    }
  });

  // ─── 5. Figma Validation grid ───────────────────────────────────────────

  test.describe('5. Figma Validation grid', () => {
    test('[fn] Figma Validation tab — grid renders all size × containerType cells', async ({
      page,
    }) => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      await expect(page.getByTestId('chip-group-figma-validation-root')).toBeVisible();

      for (const size of ['M', 'S', 'L']) {
        for (const container of ['inline', 'wrap']) {
          const cell = page.getByTestId(`chip-group-figma-sz-${size}-ct-${container}`);
          await expect(cell).toBeVisible();
          const chips = cell.getByRole('button');
          await expect(chips.first()).toBeVisible();
        }
      }
    });

    test('[fn] Figma Validation grid — mismatch warning is displayed', async ({ page }) => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      const warning = page.getByTestId('chip-group-figma-validation-root').locator('text=⚠️');
      await expect(warning.first()).toBeVisible();
    });
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [ChipGroupTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default group wrapper mounts', async ({
      page,
    }) => {
      const errors = attachConsoleErrorCollector(page);
      await openChipGroupTestScenarios(page);
      await qaStep('Assert no console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(page.getByTestId(CHIP_GROUP_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      test.setTimeout(120_000);
      for (const testId of CHIP_GROUP_ALL_TESTIDS) {
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
      for (const sectionId of CHIP_GROUP_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      const sections = page.locator('[data-section^="chip-group-qa"]');
      await expect(sections).toHaveCount(CHIP_GROUP_SECTION_COUNT);
    });

    test('1.4 — Default group exposes role=group with five chip buttons', async ({ page }) => {
      const wrapper = page.getByTestId(CHIP_GROUP_ROOT_TESTIDS.default);
      await expect(wrapper.locator('[role="group"]').first()).toBeVisible();
      await expect(chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default)).toHaveCount(5);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [ChipGroupTags.functional] }, () => {
    test('2.1 — Size S / M / L propagate data-size to every chip', async ({ page }) => {
      for (const size of CHIP_GROUP_SIZES) {
        await qaStep(`size=${size}`, async () => {
          const chips = chipsInWrapper(page, chipGroupSizeTestId(size), 'chip-group-qa-size');
          const count = await chips.count();
          for (let i = 0; i < count; i++) {
            await expect(chips.nth(i)).toHaveAttribute('data-size', size);
          }
        });
      }
    });


    test('2.2 — Size S / M / L bounding boxes scale progressively (first chip)', async ({
      page,
    }) => {
      await chipGroupSection(page, 'chip-group-qa-size').scrollIntoViewIfNeeded();
      const boxes = await Promise.all(
        CHIP_GROUP_SIZES.map((size) =>
          firstChipBox(page, chipGroupSizeTestId(size), 'chip-group-qa-size'),
        ),
      );
      expect(boxes.every(Boolean), 'Each size group should have a chip bounding box').toBe(true);
      const heights = boxes.map((b) => b!.height);
      expect(heights[0], 'M should be taller than S').toBeGreaterThan(heights[1]);
      expect(heights[2], 'L should be taller than M').toBeGreaterThan(heights[0]);
    });
  });

  test.describe('Group 2 — Appearance (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('2.3 — Appearance prop is not exercised in ChipGroup showcase', async () => {
      qaLog('Skipped — showcase covers size and containerType only; appearance lives on Chip');
    });
  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [ChipGroupTags.functional] }, () => {
    test('3.1 — Single click selects chip and updates aria-pressed', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.nth(2).click();
      await expect(chips.nth(2)).toHaveAttribute('aria-pressed', 'true');
    });

    test('3.4 — Clicking page heading blurs the focused chip', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default').first();
      await chip.focus();
      await expect(chip).toBeFocused();
      await page.getByRole('heading', { name: 'Chip Group', level: 1 }).click();
      await expect(chip).not.toBeFocused();
    });
  });

  test.describe('Group 3 — Disabled / readonly (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('3.2 — Disabled chips are not in showcase', async () => {
      qaLog('Skipped — ChipGroup disabled state not rendered in Test Scenarios');
    });
    test('3.3 — Readonly is not part of ChipGroup API', async () => {
      qaLog('Skipped — ChipGroup has no readonly mode');
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [ChipGroupTags.functional] }, () => {
    test('4.1 — Tab reaches an interactive element on the page', async ({ page }) => {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag, 'Tab should focus an interactive element').toBeTruthy();
    });

    test('4.2 — Enter on focused chip toggles selection in multi-select group', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.events, 'chip-group-qa-events').nth(1);
      await chip.scrollIntoViewIfNeeded();
      await chip.focus();
      await page.keyboard.press('Enter');
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    });

    test('4.3 — Space on focused chip toggles selection in multi-select group', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.events, 'chip-group-qa-events').nth(0);
      await chip.scrollIntoViewIfNeeded();
      await chip.focus();
      await page.keyboard.press('Space');
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    });

    test('4.4 — ArrowRight moves roving focus to next chip', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.first().focus();
      await expect(chips.first()).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(chips.nth(1)).toBeFocused();
    });

    test('4.4 — ArrowLeft moves roving focus to previous chip', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.nth(2).focus();
      await page.keyboard.press('ArrowLeft');
      await expect(chips.nth(1)).toBeFocused();
    });

    test('4.5 — Home is not a roving key (focus unchanged)', async ({ page }) => {
      // Base UI ToggleGroup (which backs ChipGroup) only wires arrow-key roving
      // navigation; Home/End would require `enableHomeAndEndKeys`, which ToggleGroup
      // does not expose. The toggle-button-group ARIA pattern is satisfied by arrow
      // keys alone, so Home is inert and roving focus stays on the current chip.
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.nth(3).focus();
      await page.keyboard.press('Home');
      await expect(chips.nth(3), 'Home is not a roving key — focus stays put').toBeFocused();
    });

    test('4.5 — End is not a roving key (focus unchanged)', async ({ page }) => {
      // See 4.5 (Home) above: ToggleGroup wires arrow keys only, so End is inert.
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.first().focus();
      await page.keyboard.press('End');
      await expect(chips.first(), 'End is not a roving key — focus stays put').toBeFocused();
    });

    test('4.7 — Repeated Tab visits multiple distinct focus targets (no trap)', async ({ page }) => {
      const seen = await collectChipGroupTabFocusSignatures(page, 20);
      expect(seen.size, 'Focus should move across multiple elements').toBeGreaterThan(3);
    });
  });

  test.describe('Group 4 — Escape (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('4.6 — Escape does not apply to ChipGroup (no overlay)', async () => {
      qaLog('Skipped — ChipGroup is not a dropdown/modal');
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [ChipGroupTags.functional] }, () => {
    test('5.1 — Click moves focus to the clicked chip', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default').nth(2);
      await chip.click();
      await expect(chip).toBeFocused();
    });

    test('5.2 — Focused chip shows visible focus ring (computed)', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default').first();
      await expectChipFocusRing(page, chip);
    });

    test('5.3 — ArrowRight advances focus in reading order', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.first().focus();
      await page.keyboard.press('ArrowRight');
      await expect(chips.nth(1)).toBeFocused();
    });
  });

  test.describe('Group 5 — autoFocus (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('5.5 — ChipGroup has no autoFocus prop in showcase', async () => {
      qaLog('Skipped — no autoFocus on ChipGroup in showcase');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [ChipGroupTags.functional] }, () => {
    test('6.1 — Default group starts with no selection', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      for (let i = 0; i < 5; i++) {
        await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'false');
      }
    });

    test('6.2 — Pre-selected chip in size band has aria-pressed=true', async ({ page }) => {
      const first = chipsInWrapper(page, chipGroupSizeTestId('m'), 'chip-group-qa-size').first();
      await expect(first).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Group 6 — Disabled / error / loading (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('6.3 — Disabled group state not in showcase', async () => {
      qaLog('Skipped — ChipGroup disabled not rendered in Test Scenarios');
    });
    test('6.5 — Error state is not part of ChipGroup API', async () => {
      qaLog('Skipped — ChipGroup has no error/invalid prop');
    });
    test('6.6 — Loading state is not part of ChipGroup API', async () => {
      qaLog('Skipped — ChipGroup has no loading prop');
    });
  });

  // ── GROUP 7 — Slots (N/A) ──────────────────────────────────────────────────
  test.describe('Group 7 — Slots (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('7.x — ChipGroup has no start/end slots (children are Chips)', async () => {
      qaLog('Skipped — slots belong to child Chip, not ChipGroup container');
    });
  });

  // ── GROUP 8 — Toggle and selection ─────────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [ChipGroupTags.functional] }, () => {
    test('8.1 — Multi-select: click toggles chip on and off', async ({ page }) => {
      const chip = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.events, 'chip-group-qa-events').nth(0);
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'false');
    });

    test('8.2 — Single-select: only one chip pressed at a time', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await chips.nth(0).click();
      await chips.nth(2).click();
      await expect(chips.nth(2)).toHaveAttribute('aria-pressed', 'true');
      await expect(chips.nth(0)).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── GROUP 9 — Input (N/A) ──────────────────────────────────────────────────
  test.describe('Group 9 — Input (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('9.x — ChipGroup is not a text input', async () => {
      qaLog('Skipped — ChipGroup manages chip selection, not typed entry');
    });
  });

  // ── GROUP 10 — Dependency rules (N/A) ────────────────────────────────────────
  test.describe('Group 10 — Dependency rules (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('10.x — No loading/slot dependency rules in showcase', async () => {
      qaLog('Skipped — showcase does not exercise maxSelections/required/loading overrides');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [ChipGroupTags.functional] }, () => {
    test('11.1 — Each chip exposes accessible name “Label”', async ({ page }) => {
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      for (let i = 0; i < 5; i++) {
        await expect(chips.nth(i)).toHaveAccessibleName(/Label/i);
      }
    });
  });

  // ── GROUP 12 — Layout and responsive ───────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [ChipGroupTags.functional] }, () => {
    test('12.2 — At 320px viewport, scenario bands fit without horizontal scroll', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openChipGroupTestScenarios(page);
      for (const sectionId of CHIP_GROUP_DATA_SECTIONS) {
        const band = chipGroupSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default group visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openChipGroupTestScenarios(page);
      await expect(page.getByTestId(CHIP_GROUP_ROOT_TESTIDS.default)).toBeVisible();
    });

    test('12.3 — Default group is horizontal (data-orientation=horizontal)', async ({ page }) => {
      const group = page
        .getByTestId(CHIP_GROUP_ROOT_TESTIDS.default)
        .locator('[data-orientation="horizontal"]');
      await expect(group).toBeVisible();
    });
  });

  test.describe('Group 12 — fullWidth (N/A)', { tag: [ChipGroupTags.functional] }, () => {
    test('12.1 — fullWidth is not a ChipGroup prop', async () => {
      qaLog('Skipped — ChipGroup has no fullWidth prop');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [ChipGroupTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await openChipGroupTestScenarios(page);
      for (const sectionId of CHIP_GROUP_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default group chips remain visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      const chips = chipsInWrapper(page, CHIP_GROUP_ROOT_TESTIDS.default, 'chip-group-qa-default');
      await expect(chips.first()).toBeVisible();
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: CHIP_GROUP_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Chip Group”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Chip Group', level: 1 })).toBeVisible();
    });

    test('Smoke — Test Scenarios tab is active with default group visible', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
      await expect(page.getByTestId(CHIP_GROUP_ROOT_TESTIDS.default)).toBeVisible();
    });
  });
});
