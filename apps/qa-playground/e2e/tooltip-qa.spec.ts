/**
 * Tooltip QA — functional coverage (`TooltipQaShowcase.tsx`).
 * Component type: display (informational overlay; trigger is an interactive child).
 *
 * **QA rule:** Do not weaken assertions to green-wash `@oneui/ui` Tooltip defects.
 */
import { type Page, expect, test } from 'playwright/test';
import {
  TOOLTIP_FIGMA_POSITIONS,
  TOOLTIP_PUBLIC_PROPS,
  TOOLTIP_QA_BANDS,
  TOOLTIP_QA_CONTROL_MOUNTS,
  TOOLTIP_RUNTIME_DEFAULTS,
  figmaPositionTestId,
  tooltipQaCoveredProps,
} from './tooltip-qa-shared';
import {
  FIGMA_GRID_TESTID,
  TOOLTIP_ALL_WRAPPER_TESTIDS,
  TOOLTIP_DATA_SECTIONS,
  TOOLTIP_PLAYGROUND_ROUTE,
  TOOLTIP_SECTION_COUNT,
  TOOLTIP_SMOKE_TESTID,
} from './tooltip-playground/manifest';
import {
  TOOLTIP_TAG_SET,
  clickPageThemeButton,
  clickTooltipWrap,
  expectNoErrorText,
  expectTooltipNotOpen,
  expectTooltipOpen,
  hoverTooltipWrap,
  openTooltipTestScenarios,
  pressButton,
  qaLog,
  qaStep,
  resetPointer,
  scrollToSection,
  scrollToTestId,
  tooltipVisibleArrowSvgs,
  wrapByTestId,
} from './tooltip/tooltip-qa-support';

/** Scroll the story band into view, then assert the showcase control wrapper is visible. */
async function expectShowcaseControl(
  page: Page,
  bandId: string,
  testId: string,
): Promise<void> {
  const band = page.locator(`#${bandId}`);
  await band.scrollIntoViewIfNeeded();
  await expect(page.getByTestId(testId)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openTooltipTestScenarios(page);
await resetPointer(page);
});

test.describe('Functional', { tag: TOOLTIP_TAG_SET.functional }, () => {
  test('[fn] page · Tooltip heading visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tooltip', level: 1 })).toBeVisible();
  });

  test('[fn] page · scenario and report tabs present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  for (const band of TOOLTIP_QA_BANDS) {
    test(`[fn] showcase · band · ${band.label}`, async ({ page }) => {
      await page.locator(`#${band.id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${band.id}`)).toBeVisible();
    });
  }

  for (const { bandId, testId, label } of TOOLTIP_QA_CONTROL_MOUNTS) {
    test(`[fn] showcase · ${label} · control visible`, async ({ page }) => {
      await expectShowcaseControl(page, bandId, testId);
    });
  }

  test.describe('API alignment', () => {
    test('[fn] API · every public Tooltip prop has QA band or Figma grid coverage', () => {
      const covered = tooltipQaCoveredProps();
      const missing = TOOLTIP_PUBLIC_PROPS.filter((prop) => !covered.has(prop));
      expect(missing, `uncovered props: ${missing.join(', ')}`).toEqual([]);
    });

    test('[fn] API · each showcase band documents valid registry props', () => {
      for (const band of TOOLTIP_QA_BANDS) {
        expect(band.props.length, `${band.id} must exercise at least one prop`).toBeGreaterThan(0);
        for (const prop of band.props) {
          expect(
            TOOLTIP_PUBLIC_PROPS.includes(prop),
            `${band.id}: unknown prop "${prop}"`,
          ).toBe(true);
        }
      }
    });

    test('[fn] API · runtime default snapshot (Tooltip.tsx destructuring)', () => {
      expect(TOOLTIP_RUNTIME_DEFAULTS).toMatchObject({
        trigger: 'hover',
        arrow: true,
        hoverable: true,
        sideOffset: 8,
        defaultOpen: false,
        disabled: false,
        side: 'top',
        align: 'center',
        position: 'bottom',
      });
    });

    test('[fn] behavior · defaults · arrow=true open tooltip includes SVG tip', async ({ page }) => {
      const band = page.locator('#tooltip-figma-tip-true');
      await band.scrollIntoViewIfNeeded();
      await expect(band.getByTestId('tt-figma-tip-true')).toBeVisible();
      const tooltip = page.getByRole('tooltip', { name: 'With tip' });
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText('With tip');
      await expect(tooltipVisibleArrowSvgs(tooltip)).toHaveCount(1);
    });

    test('[fn] behavior · defaults · trigger=hover opens on pointerenter', async ({ page }) => {
      await page.locator('#tooltip-trigger-hover').scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await hoverTooltipWrap(page, page.getByTestId('tt-figma-trigger-hover'));
      await expect(page.getByRole('tooltip', { name: 'Hover tooltip' })).toBeVisible();
    });
  });

  test('[fn] behavior · arrow=false · open tooltip has no arrow svg', async ({ page }) => {
    await page.locator('#tooltip-figma-tip-false').scrollIntoViewIfNeeded();
    const tooltip = page.getByRole('tooltip', { name: 'No tip' });
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('No tip');
    await expect(tooltip.locator('svg')).toHaveCount(0);
  });

  test('[fn] behavior · disabled=true · hover does not open tooltip', async ({ page }) => {
    await page.locator('#tooltip-figma-disabled-true').scrollIntoViewIfNeeded();
    // Short wait so floating-ui repositions after the scroll before we take coordinates.
    await page.waitForTimeout(150);

    // Use the native <button> instead of [data-base-ui-tooltip-trigger].
    // When disabled=true, Base UI may omit the data-base-ui-tooltip-trigger attribute
    // on the span, making that locator return null → boundingBox() throws.
    // The native button is always in the DOM regardless of the disabled prop.
    const triggerButton = page
      .getByTestId('tt-figma-disabled-true-trigger')
      .locator('button')
      .first();

    const box = await triggerButton.boundingBox();
    if (!box) throw new Error('trigger button not found — element may not be in DOM');

    // Physically move the virtual mouse so the browser fires a real trusted pointerenter.
    // disabled=true must block the tooltip from opening even under a genuine hover.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Wait longer than the default tooltip open delay to confirm it never appears.
    await page.waitForTimeout(600);
    await expectTooltipNotOpen(page, 'Hidden');
  });

  test('[fn] behavior · trigger=click · toggles open on click', async ({ page }) => {
    await page.locator('#tooltip-trigger-click').scrollIntoViewIfNeeded();
    const wrap = page.getByTestId('tt-figma-trigger-click');

    await clickTooltipWrap(page, wrap);
    await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toBeVisible();

    await clickTooltipWrap(page, wrap);
    await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toHaveCount(0);
  });

  test('[fn] behavior · trigger=focus · opens on keyboard Tab focus', async ({ page }) => {
    // Scroll the click-trigger section into view — it immediately precedes the focus-trigger
    // section in DOM order, so both sections are in (or near) the viewport together.
    await page.locator('#tooltip-trigger-click').scrollIntoViewIfNeeded();

    // Focus the native <button> inside the click-trigger wrapper.
    // The Tooltip Trigger <span> has no natural tabindex and is skipped by the browser's
    // Tab order, so focusing the span and pressing Tab may not land in the right place.
    // The native <button> IS a natural tab stop (tabIndex=0 by default).
    const clickButton = page
      .getByTestId('tt-figma-trigger-click')
      .locator('button')
      .first();
    await clickButton.focus();

    // Tab once: the next natural tab stop is inside the focus-trigger section.
    // React's onFocus fires on the focused descendant and bubbles up to the Tooltip Trigger
    // span, calling handleTriggerFocus → setInternalOpen(true) → tooltip opens.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip', { name: 'Focus tooltip' })).toBeVisible();
  });

  test('[fn] behavior · open + trigger=manual · external toggle controls tooltip', async ({ page }) => {
    await page.locator('#tooltip-controlled-manual').scrollIntoViewIfNeeded();
    const toggle = page.getByTestId('tt-figma-manual-toggle').locator('button').first();

    // Base UI's Button activates on pointerdown+pointerup (press semantics), NOT on a bare
    // 'click' event.  Dispatching only 'click' bypasses the press handler so setManualOpen
    // never runs → 30 s timeout.  Fix: dispatch the full pointer sequence Base UI expects.
    const pressToggle = async () => {
      await toggle.dispatchEvent('pointerdown', { button: 0, buttons: 1, isPrimary: true, bubbles: true });
      await toggle.dispatchEvent('pointerup',   { button: 0, buttons: 0, isPrimary: true, bubbles: true });
      await toggle.dispatchEvent('click',        { button: 0, bubbles: true });
    };

    await pressToggle();
    await expect(page.getByRole('tooltip', { name: 'Controlled manual' })).toBeVisible();

    await pressToggle();
    await expect(page.getByRole('tooltip', { name: 'Controlled manual' })).toHaveCount(0);
  });

  test('[fn] behavior · defaultOpen=true · tooltip visible on load', async ({ page }) => {
    const band = page.locator('#tooltip-default-open');
    await band.scrollIntoViewIfNeeded();
    await expect(page.getByRole('tooltip', { name: 'Initially visible' })).toBeVisible();
  });

  test('[fn] behavior · side=right align=start · positioner data-side=right', async ({ page }) => {
    const band = page.locator('#tooltip-side-align');
    await band.scrollIntoViewIfNeeded();
    const tooltip = page.getByRole('tooltip', { name: 'side=right align=start' });
    await expect(tooltip).toBeVisible();
    const positioner = tooltip.locator('..');
    await expect(positioner).toHaveAttribute('data-side', 'right');
  });

  test('[fn] behavior · sideOffset=32 · tooltip visible with custom gap', async ({ page }) => {
    const band = page.locator('#tooltip-sideOffset');
    await band.scrollIntoViewIfNeeded();
    await expect(page.getByRole('tooltip', { name: 'sideOffset=32' })).toBeVisible();
  });

  test('[fn] behavior · delay=800ms · hidden before delay elapses, visible after', async ({ page }) => {
    await page.locator('#tooltip-delay').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150); // let floating-ui reposition after scroll

    // dispatchEvent('pointerenter') is untrusted → Base UI ignores it → timer never starts.
    // Fix: physically move the virtual mouse to the trigger button so the browser fires a
    // real trusted pointerenter on the trigger span, starting the 800ms delay timer.
    const triggerButton = page.getByTestId('tt-delay-trigger').locator('button').first();
    const box = await triggerButton.boundingBox();
    if (!box) throw new Error('delay trigger button not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // ① At 200ms the tooltip must NOT be visible — delay has not elapsed yet.
    await page.waitForTimeout(200);
    await expectTooltipNotOpen(page, 'Delayed show');

    // ② After the full 800ms delay the tooltip MUST appear.
    // Wait another 700ms (total ≈ 900ms > 800ms delay).
    await page.waitForTimeout(700);
    await expectTooltipOpen(page, 'Delayed show');
  });

  test('[fn] behavior · closeDelay=800ms · stays open right after pointerleave', async ({ page }) => {
    await page.locator('#tooltip-closeDelay').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150); // let floating-ui reposition after scroll

    // dispatchEvent is untrusted → Base UI ignores it.
    // Fix: use real trusted mouse moves for both enter and leave.
    const triggerButton = page.getByTestId('tt-closeDelay-trigger').locator('button').first();
    const box = await triggerButton.boundingBox();
    if (!box) throw new Error('closeDelay trigger button not found');

    // Move into trigger → tooltip opens (no open delay configured).
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.getByRole('tooltip', { name: 'Slow close' })).toBeVisible();

    // Move away from trigger → starts the 800ms close-delay timer.
    // tooltip must still be visible immediately (close-delay has not elapsed yet).
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip', { name: 'Slow close' })).toBeVisible();
  });

  test('[fn] behavior · hoverable=false · closes when pointer leaves trigger', async ({ page }) => {
    await page.locator('#tooltip-hoverable-false').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150); // let floating-ui reposition after scroll

    const triggerButton = page
      .getByTestId('tt-hoverable-false-trigger')
      .locator('button')
      .first();
    const triggerBox = await triggerButton.boundingBox();
    if (!triggerBox) throw new Error('hoverable-false trigger button not found');

    // ① Hover trigger → tooltip opens.
    await page.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
    const tooltip = page.getByRole('tooltip', { name: 'Not hoverable' });
    await expect(tooltip).toBeVisible();

    // ② Move pointer off the trigger (not onto the popup).
    // hoverable=false → tooltip closes when the cursor leaves the trigger;
    // hoverable=true → user can move onto the popup and keep it open.
    await page.mouse.move(0, 0);

    await expectTooltipNotOpen(page, 'Not hoverable');
  });

  test('[fn] behavior · zIndex=9999 · positioner inline z-index', async ({ page }) => {
    const band = page.locator('#tooltip-zIndex');
    await band.scrollIntoViewIfNeeded();
    const tooltip = page.getByRole('tooltip', { name: 'Custom z-index' });
    await expect(tooltip).toBeVisible();
    const positioner = tooltip.locator('..');
    const zIndex = await positioner.evaluate((el) => (el as HTMLElement).style.zIndex);
    expect(zIndex).toBe('9999');
  });

  test('[fn] behavior · maxWidth=120 · popup sets --Tooltip-maxWidth', async ({ page }) => {
    const band = page.locator('#tooltip-maxWidth');
    await band.scrollIntoViewIfNeeded();
    const tooltip = page.getByRole('tooltip', { name: 'Max width constrained tooltip text' });
    await expect(tooltip).toBeVisible();
    const maxWidthVar = await tooltip.evaluate((el) =>
      (el as HTMLElement).style.getPropertyValue('--Tooltip-maxWidth').trim(),
    );
    expect(maxWidthVar).toBe('120px');
  });

  test('[fn] figma · validation tab mounts 4×3 position grid', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    const grid = page.getByTestId('figma-tooltip-grid');
    await expect(grid).toBeVisible();
    await expect(grid.getByRole('caption')).toContainText(/Tooltip/i);
    await expect(grid.locator('[data-testrow="position: bottom"]')).toBeVisible();
    await expect(grid.locator('[data-testrow="position: right"]')).toBeVisible();
  });

  for (const position of TOOLTIP_FIGMA_POSITIONS) {
    test(`[fn] figma · grid cell · position=${position} · trigger open`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      const cell = page.getByTestId(figmaPositionTestId(position));
      await cell.scrollIntoViewIfNeeded();
      await expect(cell).toBeVisible();

      // Grid cells use defaultOpen — popup is portaled to document.body, not inside the cell wrapper.
      const tooltip = page.getByRole('tooltip', { name: 'Tooltip' }).first();
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText('Tooltip');
      await expect(tooltipVisibleArrowSvgs(tooltip)).toHaveCount(1);
    });
  }

  // ── Group 1 — Render ──────────────────────────────────────────────────────
  test.describe('Group 1 — Render', () => {
    test('[fn] 1.1 — no console errors on playground load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(TOOLTIP_PLAYGROUND_ROUTE);
      await page.getByRole('tab', { name: 'Test Scenarios' }).click();
      await wrapByTestId(page, TOOLTIP_SMOKE_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
      expect(errors, 'No console errors on playground load').toEqual([]);
    });

    test('[fn] 1.2 — every playground data-testid is visible', async ({ page }) => {
      for (const testId of TOOLTIP_ALL_WRAPPER_TESTIDS) {
        await qaStep(`Assert visible: ${testId}`, async () => {
          await scrollToTestId(page, testId);
          await expect(wrapByTestId(page, testId), `${testId} should be visible`).toBeVisible();
          await expectNoErrorText(wrapByTestId(page, testId));
        });
      }
    });

    test('[fn] 1.3 — every data-section is visible', async ({ page }) => {
      const count = await page.locator('[data-section]').count();
      expect(count).toBeGreaterThanOrEqual(TOOLTIP_SECTION_COUNT);
      for (const sectionId of TOOLTIP_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${sectionId}"]`),
          `Section ${sectionId} should be visible`,
        ).toBeVisible();
      }
    });
  });

  // ── Group 2 — Props validation ────────────────────────────────────────────
  test.describe('Group 2 — Props validation', () => {
    test('[fn] 2.1 — defaultOpen tooltip is visible on load', async ({ page }) => {
      await scrollToSection(page, 'tooltip-default-open');
      await expect(page.getByRole('tooltip', { name: 'Initially visible' })).toBeVisible();
    });

    test('[fn] 2.2 — size scaling — N/A (Tooltip has no size prop)', async () => {
      qaLog('N/A — Tooltip has no size prop');
    });

    test('[fn] 2.3 — appearance colour — N/A (Tooltip has no appearance prop)', async () => {
      qaLog('N/A — Tooltip has no appearance prop');
    });
  });

  // ── Group 3 — Click interaction ─────────────────────────────────────────
  test.describe('Group 3 — Click interaction', () => {
    test('[fn] 3.4 — Escape closes click-triggered tooltip', async ({ page }) => {
      await scrollToSection(page, 'tooltip-trigger-click');
const wrap = wrapByTestId(page, 'tt-figma-trigger-click');
      await clickTooltipWrap(page, wrap);
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toHaveCount(0);
    });

    test('[fn] 3.4 — click outside closes click-triggered tooltip', async ({ page }) => {
      await scrollToSection(page, 'tooltip-trigger-click');
const wrap = wrapByTestId(page, 'tt-figma-trigger-click');
      await clickTooltipWrap(page, wrap);
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toBeVisible();
      await page.locator('body').click({ position: { x: 8, y: 8 } });
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toHaveCount(0);
    });
  });

  // ── Group 4 — Keyboard navigation ─────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', () => {
    test('[fn] 4.6 — Escape dismisses open click tooltip', async ({ page }) => {
      await scrollToSection(page, 'tooltip-trigger-click');
const wrap = wrapByTestId(page, 'tt-figma-trigger-click');
      await clickTooltipWrap(page, wrap);
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip', { name: 'Click tooltip' })).toHaveCount(0);
    });

    test('[fn] 4.7 — Tab moves focus through triggers without trap', async ({ page }) => {
      await scrollToSection(page, 'tooltip-trigger-click');
      const btn = wrapByTestId(page, 'tt-figma-trigger-click').locator('button').first();
      await btn.focus();
await expect(btn).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(btn, 'Focus should advance after Tab').not.toBeFocused();
    });
  });

  // ── Group 5 — Focus management ────────────────────────────────────────────
  test.describe('Group 5 — Focus management', () => {
    test('[fn] 5.1 — focus trigger opens focus-mode tooltip', async ({ page }) => {
      await scrollToSection(page, 'tooltip-trigger-focus');
      const btn = wrapByTestId(page, 'tt-figma-trigger-focus').locator('button').first();
      await btn.focus();
      await expect(page.getByRole('tooltip', { name: 'Focus tooltip' })).toBeVisible();
    });
  });

  // ── Groups 6–12 — N/A stubs ───────────────────────────────────────────────
  test.describe('Group 6 — State tests', () => {
    test('[fn] 6.4 — readonly — N/A (Tooltip has no readOnly prop)', async () => {
      qaLog('N/A — Tooltip has no readOnly prop');
    });
  });

  test.describe('Group 7 — Slot tests', () => {
    test('[fn] 7.x — slots — N/A (Tooltip has no start/end slots)', async () => {
      qaLog('N/A — Tooltip has no start/end slots');
    });
  });

  test.describe('Group 8 — Toggle and selection', () => {
    test('[fn] 8.x — N/A (Tooltip is not a selection control)', async () => {
      qaLog('N/A — Tooltip is not a toggle/selection control');
    });
  });

  test.describe('Group 9 — Input and typing', () => {
    test('[fn] 9.x — N/A (Tooltip is not an input)', async () => {
      qaLog('N/A — Tooltip is not an input');
    });
  });

  test.describe('Group 11 — Content and display', () => {
    test('[fn] 11.1 — open tooltip text content is non-empty', async ({ page }) => {
      await scrollToTestId(page, 'tt-figma-tip-true');
      const tooltip = page.getByRole('tooltip', { name: 'With tip' });
      await expect(tooltip).toBeVisible();
      const text = (await tooltip.textContent())?.trim() ?? '';
      expect(text.length, 'Tooltip label text should not be empty').toBeGreaterThan(0);
    });

    test('[fn] 11.2 — arrow=true renders SVG tip inside bubble', async ({ page }) => {
      await scrollToTestId(page, 'tt-figma-tip-true');
      const tooltip = page.getByRole('tooltip', { name: 'With tip' });
      await expect(tooltipVisibleArrowSvgs(tooltip)).toHaveCount(1);
    });
  });

  test.describe('Group 12 — Layout and responsive', () => {
    test('[fn] 12.1 — fullWidth — N/A (Tooltip has no fullWidth prop)', async () => {
      qaLog('N/A — Tooltip has no fullWidth prop');
    });

    test('[fn] 12.2 — component visible at 320px and 1440px viewports', async ({ page }) => {
      for (const width of [320, 1440] as const) {
        await qaStep(`Viewport ${width}px`, async () => {
          await page.setViewportSize({ width, height: 800 });
          await scrollToTestId(page, TOOLTIP_SMOKE_TESTID);
          await expect(wrapByTestId(page, TOOLTIP_SMOKE_TESTID)).toBeVisible();
        });
      }
    });

    test('[fn] 12.3 — orientation — N/A (Tooltip uses position side, not layout orientation)', async () => {
      qaLog('N/A — Tooltip has no orientation layout prop');
    });
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: TOOLTIP_TAG_SET.smoke }, () => {
    test('[fn] smoke — default open tooltip band renders', async ({ page }) => {
      await expect(wrapByTestId(page, TOOLTIP_SMOKE_TESTID)).toBeVisible();
      await expect(page.getByRole('tooltip', { name: 'With tip' })).toBeVisible();
    });

    test('[fn] smoke — theme toggle updates label', async ({ page }) => {
      const { before, after } = await clickPageThemeButton(page);
      expect(before).not.toEqual(after);
    });

    test('[fn] smoke — figma grid mounts on validation tab', async ({ page }) => {
      await page.getByRole('tab', { name: 'Figma Validation' }).click();
      await expect(page.getByTestId(FIGMA_GRID_TESTID)).toBeVisible();
    });
  });

});
