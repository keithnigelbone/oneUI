/**
 * Input Dynamic Text QA playground — functional Playwright tests.
 * Selectors mirror `InputDynamicTextQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **interactive** (helper row — leading copy + optional trailing Button; not a native `<input>`).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` InputDynamicText defects.
 *
 * **Raised defect (tests must fail until fixed — do not soften):**
 * - BUG-IDT-001 — disabled row (`idt-disabled`) colour contrast below WCAG AA (see a11y spec).
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `IDT_DATA_SECTIONS` (5 bands)
 * - data-testid: `IDT_ALL_TESTIDS` (19 rendered rows; `idt-slot-none` renders null — excluded)
 */
import { expect, test } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  computedContentColor,
  computedContentFontSize,
  dynamicTextByTestId,
  dynamicTextContent,
  dynamicTextEndButton,
  expectDynamicTextVisible,
  expectFocusRingVisible,
  expectNoErrorText,
  expectSectionVisible,
  IDT_SHOWCASE_AXE_SCOPE,
  IDT_TAG_SET,
  IdtTags,
  idtSection,
  openIdtTestScenarios,
  qaLog,
  qaStep,
  scrollToSection,
  switchPlaygroundToDarkTheme,
} from './input-dynamic-text/input-dynamic-text-qa-support';
import {
  IDT_ALL_TESTIDS,
  IDT_COMBO_KEYS,
  IDT_CONTENT_END_PRESETS,
  IDT_DATA_SECTIONS,
  IDT_FIGMA_SIZES,
  IDT_ROOT_TESTIDS,
  IDT_SECTION_COUNT,
  idtComboTestId,
  idtSizeTestId,
  idtSlotTestId,
} from './input-dynamic-text-playground/manifest';

const D = IDT_ROOT_TESTIDS.default;

test.beforeAll(async ({ request, baseURL }) => {
  const origin = baseURL ?? 'http://localhost:5180';
  const res = await request.get(`${origin}/c/input-dynamic-text`);
  expect(res.ok(), `Input Dynamic Text playground reachable at ${origin}/c/input-dynamic-text`).toBeTruthy();
});

test.describe('Functional', { tag: IDT_TAG_SET.functional }, () => {
  test.beforeEach(async ({ page }) => {
    await openIdtTestScenarios(page);
  });

  test.describe('Rendering', () => {
    test('[fn] Page heading is visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input Dynamic Text', exact: true, level: 1 })).toBeVisible();
    });

    test('[fn] Playground loads without console errors', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openIdtTestScenarios(page);
      await assertNoConsoleErrors(errors);
    });

    test('[fn] Default row shows counter text and helper button', async ({ page }) => {
      await expectDynamicTextVisible(page, D);
      await expect(dynamicTextContent(page, D)).toContainText('0 / 280');
      await expect(dynamicTextEndButton(page, D)).toHaveText('Helper Button');
      await expectNoErrorText(dynamicTextByTestId(page, D));
    });

    test('[fn] Every showcase row is visible without error text', async ({ page }) => {
      for (const testId of IDT_ALL_TESTIDS) {
        await expectDynamicTextVisible(page, testId);
        await expectNoErrorText(dynamicTextByTestId(page, testId));
      }
    });

    test('[fn] Every showcase section is visible', async ({ page }) => {
      const sections = page.locator('[data-section^="idt-qa-"]');
      expect(await sections.count()).toBe(IDT_SECTION_COUNT);
      for (const sectionId of IDT_DATA_SECTIONS) {
        await expect(page.locator(`[data-section="${sectionId}"]`)).toBeVisible();
      }
    });
  });

  test.describe('Props and sizing', () => {
    test('[fn] Default row uses medium size', async ({ page }) => {
      await expect(dynamicTextByTestId(page, D)).toHaveAttribute('data-size', 'm');
    });

    for (const figma of IDT_FIGMA_SIZES) {
      const codeSize = figma === 'S' ? 's' : figma === 'M' ? 'm' : 'l';
      test(`[fn] Size ${figma} maps to data-size "${codeSize}"`, async ({ page }) => {
        await scrollToSection(page, 'idt-qa-size');
        const testId = idtSizeTestId(figma);
        await expect(dynamicTextByTestId(page, testId)).toHaveAttribute('data-size', codeSize);
      });
    }

    for (const preset of IDT_CONTENT_END_PRESETS) {
      test(`[fn] Slot preset "${preset}" shows the expected regions`, async ({ page }) => {
        await scrollToSection(page, 'idt-qa-content-end');
        const testId = idtSlotTestId(preset);
        if (preset === 'none') {
          await expect(page.getByTestId(testId)).toHaveCount(0);
          return;
        }
        await expectDynamicTextVisible(page, testId);
        if (preset === 'content' || preset === 'both') {
          await expect(dynamicTextContent(page, testId)).toBeVisible();
        } else {
          await expect(dynamicTextContent(page, testId)).toHaveCount(0);
        }
        if (preset === 'end' || preset === 'both') {
          await expect(dynamicTextEndButton(page, testId)).toBeVisible();
        } else {
          await expect(dynamicTextEndButton(page, testId)).toHaveCount(0);
        }
      });
    }
  });

  test.describe('Click interaction', () => {
    test('[fn] Clicking the end button updates the live copy', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 0');
      await dynamicTextEndButton(page, testId).click();
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 1');
    });

    test('[fn] Default end button stays visible after click', async ({ page }) => {
      await dynamicTextEndButton(page, D).click();
      await expect(dynamicTextEndButton(page, D)).toBeVisible();
    });

    test('[fn] Disabled end button does not change content when clicked', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.disabled;
      const before = await dynamicTextContent(page, testId).textContent();
      await dynamicTextEndButton(page, testId).click({ force: true });
      await expect(dynamicTextContent(page, testId)).toHaveText(before ?? '');
    });

    test('[fn] Clicking outside the row blurs the end button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('h1').first().click();
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('Keyboard navigation', () => {
    test('[fn] Tab reaches the trailing button on the default row', async ({ page }) => {
      await page.locator('body').click({ position: { x: 4, y: 4 } });
      let focused = false;
      for (let i = 0; i < 50; i++) {
        const testId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        if (testId === D && (await dynamicTextEndButton(page, D).evaluate((el) => el === document.activeElement))) {
          focused = true;
          break;
        }
        const onBtn = await dynamicTextEndButton(page, D).evaluate((el) => el === document.activeElement);
        if (onBtn) {
          focused = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(focused, 'Trailing button should be reachable via Tab').toBe(true);
    });

    test('[fn] Disabled end button is not focused when force-clicked', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const btn = dynamicTextEndButton(page, IDT_ROOT_TESTIDS.disabled);
      await btn.click({ force: true });
      await expect(btn).not.toBeFocused();
    });

    test('[fn] Enter on the focused end button runs the click handler', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      const btn = dynamicTextEndButton(page, testId);
      await btn.focus();
      await page.keyboard.press('Enter');
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 1');
    });

    test('[fn] Space on the focused end button runs the click handler', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      const btn = dynamicTextEndButton(page, testId);
      await btn.focus();
      const before = await dynamicTextContent(page, testId).textContent();
      await page.keyboard.press('Space');
      const after = await dynamicTextContent(page, testId).textContent();
      expect(after).not.toBe(before);
    });

    test('[fn] Tab can move focus away from the end button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.focus();
      await page.keyboard.press('Tab');
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('Focus management', () => {
    test('[fn] Clicking the end button focuses it', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('[fn] Focused end button shows a visible focus ring', async ({ page }) => {
      await dynamicTextEndButton(page, D).focus();
      await expectFocusRingVisible(page);
    });

    test('[fn] Blur moves focus off the end button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.focus();
      await page.locator('h1').first().click();
      await expect(btn).not.toBeFocused();
    });
  });

  test.describe('State', () => {
    test('[fn] Default row is not marked data-disabled', async ({ page }) => {
      await expect(dynamicTextByTestId(page, D)).not.toHaveAttribute('data-disabled', 'true');
    });

    test('[fn] Disabled row sets data-disabled and disables the button', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.disabled;
      await expect(dynamicTextByTestId(page, testId)).toHaveAttribute('data-disabled', 'true');
      await expect(dynamicTextEndButton(page, testId)).toBeDisabled();
    });


    test('[fn] Polite aria-live is set on the live region example', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      await expect(dynamicTextContent(page, IDT_ROOT_TESTIDS.ariaLivePolite)).toHaveAttribute(
        'aria-live',
        'polite',
      );
    });
  });

  test.describe('Content and end slots', () => {
    test('[fn] Content-only slot shows counter without an end button', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('content');
      await expect(dynamicTextContent(page, testId)).toContainText('0 / 100');
      await expect(dynamicTextEndButton(page, testId)).toHaveCount(0);
    });

    test('[fn] End-only slot shows the button without inline content', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('end');
      await expect(dynamicTextContent(page, testId)).toHaveCount(0);
      await expect(dynamicTextEndButton(page, testId)).toHaveText('Helper Button');
    });

    test('[fn] Both slots show content and end button together', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('both');
      await expect(dynamicTextContent(page, testId)).toBeVisible();
      await expect(dynamicTextEndButton(page, testId)).toBeVisible();
    });
  });

  test.describe('Dependency rules', () => {
    test('[fn] Empty content and end renders nothing for the none preset', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      await expect(page.getByTestId(idtSlotTestId('none'))).toHaveCount(0);
    });

    test('[fn] endAriaLabel overrides the visible button accessible name', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      await expect(dynamicTextEndButton(page, IDT_ROOT_TESTIDS.endAriaLabel)).toHaveAccessibleName(
        'Submit helper action',
      );
    });
  });

  test.describe('Content and display', () => {
    test('[fn] Default content text is non-empty', async ({ page }) => {
      const text = await dynamicTextContent(page, D).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('[fn] Content stays within the row width', async ({ page }) => {
      const root = dynamicTextByTestId(page, D);
      const rootBox = await root.boundingBox();
      const contentBox = await dynamicTextContent(page, D).boundingBox();
      expect(rootBox).not.toBeNull();
      expect(contentBox).not.toBeNull();
      expect(contentBox!.width).toBeLessThanOrEqual((rootBox!.width ?? 0) + 2);
    });

    test('[fn] End button has an accessible name', async ({ page }) => {
      await expect(dynamicTextEndButton(page, D)).toHaveAccessibleName(/Helper Button/i);
    });
  });

  test.describe('Layout and responsive', () => {
    test('[fn] Default section fits at a 320px wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await openIdtTestScenarios(page);
      await expectDynamicTextVisible(page, D);
      const sectionOverflow = await page.locator('[data-section="idt-qa-default"]').evaluate((el) => {
        return el.scrollWidth > el.clientWidth + 1;
      });
      expect(sectionOverflow, 'Default band should not overflow horizontally at 320px').toBe(false);
    });

    test('[fn] Default row is visible at a 1440px wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openIdtTestScenarios(page);
      await expectDynamicTextVisible(page, D);
    });

    test('[fn] Content and end button sit on one horizontal row', async ({ page }) => {
      const contentBox = await dynamicTextContent(page, D).boundingBox();
      const buttonBox = await dynamicTextEndButton(page, D).boundingBox();
      expect(contentBox).not.toBeNull();
      expect(buttonBox).not.toBeNull();
      const rowDelta = Math.abs((contentBox!.y ?? 0) - (buttonBox!.y ?? 0));
      expect(rowDelta).toBeLessThan(24);
    });
  });

  test.describe('Theme', () => {
    test('[fn] Dark theme still renders the default row and samples', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expectDynamicTextVisible(page, D);
      for (const testId of [idtSizeTestId('M'), idtComboTestId('m', 'both')]) {
        await expectDynamicTextVisible(page, testId);
      }
    });
  });

  test.describe('Combination matrix', () => {
    for (const { size, preset, testId } of IDT_COMBO_KEYS) {
      test(`[fn] Combination size ${size} with ${preset} slots`, async ({ page }) => {
        await scrollToSection(page, 'idt-qa-combos');
        await expectDynamicTextVisible(page, testId);
        if (preset === 'content' || preset === 'both') {
          await expect(dynamicTextContent(page, testId)).toBeVisible();
        }
        if (preset === 'end' || preset === 'both') {
          await expect(dynamicTextEndButton(page, testId)).toBeVisible();
        }
      });
    }
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [IdtTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default row mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openIdtTestScenarios(page);
      await qaStep('Assert no unexpected console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expectDynamicTextVisible(page, D);
    });

    test('1.2 — Every Test Scenarios `data-testid` is visible', async ({ page }) => {
      for (const testId of IDT_ALL_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator = dynamicTextByTestId(page, testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
          await expectNoErrorText(locator);
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of IDT_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="idt-qa-"]')).toHaveCount(IDT_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [IdtTags.functional] }, () => {
    test('2.1 — Default row exposes data-size m with content and end button', async ({ page }) => {
      await expect(dynamicTextByTestId(page, D)).toHaveAttribute('data-size', 'm');
      await expect(dynamicTextContent(page, D)).toContainText('0 / 280');
      await expect(dynamicTextEndButton(page, D)).toHaveText('Helper Button');
    });

    for (const figma of IDT_FIGMA_SIZES) {
      const codeSize = figma === 'S' ? 's' : figma === 'M' ? 'm' : 'l';
      test(`2.1 — Size ${figma} maps to data-size "${codeSize}"`, async ({ page }) => {
        await scrollToSection(page, 'idt-qa-size');
        await expect(dynamicTextByTestId(page, idtSizeTestId(figma))).toHaveAttribute('data-size', codeSize);
      });
    }

    test('2.3 — Appearance colour (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no appearance prop');
    });
  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [IdtTags.functional] }, () => {
    test('3.1 — End button click increments onEndClick counter', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      await dynamicTextEndButton(page, testId).click();
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 1');
    });

    test('3.2 — Disabled end button does not change content on click', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.disabled;
      const before = await dynamicTextContent(page, testId).textContent();
      await dynamicTextEndButton(page, testId).click({ force: true });
      await expect(dynamicTextContent(page, testId)).toHaveText(before ?? '');
      await expect(dynamicTextEndButton(page, testId)).toBeDisabled();
    });

    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no readonly prop');
    });

    test('3.4 — Click outside blurs focused end button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.focus();
      await expect(btn).toBeFocused();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(btn).not.toBeFocused();
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [IdtTags.functional] }, () => {
    test('4.1 — Tab reaches default row trailing button', async ({ page }) => {
      await page.locator('body').click({ position: { x: 4, y: 4 } });
      let found = false;
      for (let i = 0; i < 50; i++) {
        const onBtn = await dynamicTextEndButton(page, D).evaluate((el) => el === document.activeElement);
        if (onBtn) {
          found = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(found, 'Default trailing button should be reachable via Tab').toBe(true);
    });

    test('4.1 — Disabled trailing button is not focused after force click', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const btn = dynamicTextEndButton(page, IDT_ROOT_TESTIDS.disabled);
      await btn.click({ force: true });
      await expect(btn).not.toBeFocused();
    });

    test('4.2 — Enter activates onEndClick handler', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      await dynamicTextEndButton(page, testId).focus();
      await page.keyboard.press('Enter');
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 1');
    });

    test('4.3 — Space activates onEndClick handler', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.endClick;
      await dynamicTextEndButton(page, testId).focus();
      await page.keyboard.press('Space');
      await expect(dynamicTextContent(page, testId)).toContainText('Clicked 1');
    });

    test('4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — single helper row; no arrow-key list');
    });

    test('4.5 — Home/End (N/A)', async () => {
      qaLog('Skipped — not a text input control');
    });

    test('4.6 — Escape (N/A)', async () => {
      qaLog('Skipped — no overlay to dismiss');
    });

    test('4.7 — Tab escapes end button without trap', async ({ page }) => {
      await dynamicTextEndButton(page, D).focus();
      for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
      await expect(dynamicTextEndButton(page, D)).not.toBeFocused();
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [IdtTags.functional] }, () => {
    test('5.1 — Click focuses trailing button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.click();
      await expect(btn).toBeFocused();
    });

    test('5.2 — Focused button shows visible focus ring', async ({ page }) => {
      await dynamicTextEndButton(page, D).focus();
      await expectFocusRingVisible(page);
    });

    test('5.3 — Tab order reaches end button after page chrome', async ({ page }) => {
      await page.locator('body').click({ position: { x: 4, y: 4 } });
      let found = false;
      for (let i = 0; i < 50; i++) {
        if (await dynamicTextEndButton(page, D).evaluate((el) => el === document.activeElement)) {
          found = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(found).toBe(true);
    });

    test('5.4 — Blur removes focus from end button', async ({ page }) => {
      const btn = dynamicTextEndButton(page, D);
      await btn.focus();
      await page.locator('h1').first().click();
      await expect(btn).not.toBeFocused();
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — InputDynamicText showcase has no autoFocus example');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [IdtTags.functional] }, () => {
    test('6.1 — Default row is enabled without data-disabled', async ({ page }) => {
      await expect(dynamicTextByTestId(page, D)).not.toHaveAttribute('data-disabled', 'true');
    });

    test('6.2 — Selected/checked (N/A)', async () => {
      qaLog('Skipped — not a selectable control');
    });

    test('6.3 — Disabled row sets data-disabled and disables button', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      const testId = IDT_ROOT_TESTIDS.disabled;
      await expect(dynamicTextByTestId(page, testId)).toHaveAttribute('data-disabled', 'true');
      await expect(dynamicTextEndButton(page, testId)).toBeDisabled();
    });

    test('6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no readonly prop');
    });

    test('6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no errorHighlight prop in showcase');
    });

    test('6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no loading prop');
    });
  });

  // ── GROUP 7 — Content/end slots ────────────────────────────────────────────
  test.describe('Group 7 — Content and end slots', { tag: [IdtTags.functional] }, () => {
    test('7.1 — content-only preset shows copy without end button', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('content');
      await expect(dynamicTextContent(page, testId)).toBeVisible();
      await expect(dynamicTextEndButton(page, testId)).toHaveCount(0);
    });

    test('7.2 — end-only preset shows button without content paragraph', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('end');
      await expect(dynamicTextContent(page, testId)).toHaveCount(0);
      await expect(dynamicTextEndButton(page, testId)).toBeVisible();
    });

    test('7.3 — both preset shows content and end together', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      const testId = idtSlotTestId('both');
      await expect(dynamicTextContent(page, testId)).toBeVisible();
      await expect(dynamicTextEndButton(page, testId)).toBeVisible();
    });

    test('7.4 — Icon colour inheritance (N/A)', async () => {
      qaLog('Skipped — slots use text/button, not icon slots');
    });
  });

  // ── GROUP 8 — Toggle (N/A) ─────────────────────────────────────────────────
  test.describe('Group 8 — Toggle and selection', { tag: [IdtTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — end button fires onEndClick; not aria-checked toggle');
    });
  });

  // ── GROUP 9 — Input and typing (N/A) ───────────────────────────────────────
  test.describe('Group 9 — Input and typing', { tag: [IdtTags.functional] }, () => {
    test('9.x — Not a native text input', async () => {
      qaLog('Skipped — display/helper row only');
    });
  });

  // ── GROUP 10 — Dependency rules ────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [IdtTags.functional] }, () => {
    test('10.1 — none preset with empty content+end renders null (no testid in DOM)', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-content-end');
      await expect(page.getByTestId(idtSlotTestId('none'))).toHaveCount(0);
    });

    test('10.2 — endAriaLabel overrides default button accessible name', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      await expect(dynamicTextEndButton(page, IDT_ROOT_TESTIDS.endAriaLabel)).toHaveAccessibleName(
        'Submit helper action',
      );
    });

    test('10.3 — Loading overrides (N/A)', async () => {
      qaLog('Skipped — no loading prop');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [IdtTags.functional] }, () => {
    test('11.1 — Default content copy is non-empty', async ({ page }) => {
      const text = await dynamicTextContent(page, D).textContent();
      expect(text?.trim().length, 'content text length').toBeGreaterThan(0);
    });

    test('11.1 — aria-live polite is on content region', async ({ page }) => {
      await scrollToSection(page, 'idt-qa-states');
      await expect(dynamicTextContent(page, IDT_ROOT_TESTIDS.ariaLivePolite)).toHaveAttribute(
        'aria-live',
        'polite',
      );
    });

    test('11.2 — End button exposes accessible name from visible label', async ({ page }) => {
      await expect(dynamicTextEndButton(page, D)).toHaveAccessibleName(/Helper Button/i);
    });

    test('11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — not a progress indicator');
    });
  });

  // ── GROUP 12 — Layout and responsive ─────────────────────────────────────────
  test.describe('Group 12 — Layout and responsive', { tag: [IdtTags.functional] }, () => {
    test('12.1 — fullWidth (N/A)', async () => {
      qaLog('Skipped — InputDynamicText has no fullWidth prop');
    });

    test('12.2 — At 320px viewport, story bands fit without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await openIdtTestScenarios(page);
      for (const sectionId of IDT_DATA_SECTIONS) {
        const band = idtSection(page, sectionId);
        await band.scrollIntoViewIfNeeded();
        const overflows = await band.evaluate(
          (el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth,
        );
        expect(overflows, `Horizontal overflow inside ${sectionId}`).toBe(false);
      }
    });

    test('12.2b — Default row visible at 1440px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openIdtTestScenarios(page);
      await expectDynamicTextVisible(page, D);
    });

    test('12.3 — Content and end button share one horizontal row', async ({ page }) => {
      const contentBox = await dynamicTextContent(page, D).boundingBox();
      const buttonBox = await dynamicTextEndButton(page, D).boundingBox();
      const rowDelta = Math.abs((contentBox!.y ?? 0) - (buttonBox!.y ?? 0));
      expect(rowDelta, 'content vs button vertical alignment').toBeLessThan(24);
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [IdtTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await openIdtTestScenarios(page);
      for (const sectionId of IDT_DATA_SECTIONS) {
        await expectSectionVisible(page, sectionId);
      }
    });

    test('13.1 — Default row remains visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expectDynamicTextVisible(page, D);
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: IDT_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Input Dynamic Text”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Input Dynamic Text', level: 1 })).toBeVisible();
    });

    test('Smoke — Default row visible with counter and helper button', async ({ page }) => {
      await expectDynamicTextVisible(page, D);
      await expect(dynamicTextContent(page, D)).toContainText('0 / 280');
      await expect(dynamicTextEndButton(page, D)).toBeVisible();
    });

    test('Smoke — Manifest testid count in showcase scope', async ({ page }) => {
      await expect(
        page.locator(`${IDT_SHOWCASE_AXE_SCOPE} [data-testid^="idt-"]`),
      ).toHaveCount(IDT_ALL_TESTIDS.length);
    });
  });
});
