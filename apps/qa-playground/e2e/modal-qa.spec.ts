/**
 * Modal QA playground — functional Playwright tests.
 * Selectors mirror `ModalQaShowcase.tsx` (`data-section` === band `id`).
 *
 * Component type: **interactive** (dialog overlay — open/close, focus trap, Escape dismiss).
 *
 * **QA rule:** Assert playground / Figma intent. Fail red on `@oneui/ui` or showcase defects.
 * Never use `test.fail()`, never skip to hide failures, never swap selectors to work around missing UI.
 *
 * **Component contract (aligned with `@oneui/ui` Modal as of API v2):**
 * - Footer actions use `footerEnd` / `footerStart` slots — popup is role-neutral (no `data-appearance`).
 * - `dismissible={false}` blocks backdrop, Escape, and focus-out dismiss (explicit close still works).
 * - Divider scroll-position data attrs reflect prop defaults (`middle`), not live scroll state.
 *
 * Playground inventory (Test Scenarios tab):
 * - data-section: `MODAL_DATA_SECTIONS` (13 bands)
 * - data-testid: `MODAL_TRIGGER_TESTIDS` (32 trigger wrappers, always visible)
 */
import { expect, test, type Page } from 'playwright/test';

import {
  assertNoConsoleErrors,
  attachConsoleErrorCollector,
  clickModalTrigger,
  clickPageThemeButton,
  closeModalViaEscape,
  dismissOpenModal,
  expectFocusRingVisible,
  expectSectionVisible,
  modalDialog,
  MODAL_ASSERT_FAIL_FAST_MS,
  MODAL_SHOWCASE_AXE_SCOPE,
  MODAL_TAG_SET,
  ModalTags,
  openModalTestScenarios,
  openModalViaTrigger,
  qaLog,
  qaStep,
  switchPlaygroundToDarkTheme,
} from './modal/modal-qa-support';
import {
  MODAL_DATA_SECTIONS,
  MODAL_SECTION_COUNT,
  MODAL_TRIGGER_TESTIDS,
} from './modal-playground/manifest';

function modalHeaderCloseButton(page: Page) {
  return modalDialog(page).locator('button[aria-label="Close"]');
}

test.beforeEach(async ({ page }) => {
  await openModalTestScenarios(page);
});

test.afterEach(async ({ page }) => {
  await dismissOpenModal(page);
});

// ═══════════════════════════════════════════════════════════════
// Functional
// ═══════════════════════════════════════════════════════════════

test.describe('Functional', { tag: MODAL_TAG_SET.functional }, () => {
  test('[fn] shows Modal page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Modal', level: 1 })).toBeVisible();
  });

  test('[fn] theme toggle updates label', async ({ page }) => {
    const { before, after } = await clickPageThemeButton(page);
    expect(before, 'Theme control should have a label before toggle').not.toEqual(after);
  });

  test('[fn] scenario, figma-validation, accessibility, and functional tabs are present', async ({
    page,
  }) => {
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Figma Validation' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Functional Tests' })).toBeVisible();
  });

  // ── Trigger buttons presence ───────────────────────────────────────────────

  for (const testId of MODAL_TRIGGER_TESTIDS) {
    test(`[fn] trigger button exists: ${testId}`, async ({ page }) => {
      const container = page.getByTestId(testId);
      // Container wrapper must exist; button inside must be visible and interactive.
      await expect(container.getByRole('button')).toBeVisible();
    });
  }

  // ── Figma validation tab ───────────────────────────────────────────────────

  test('[fn] figma validation tab mounts grid', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    const grid = page.getByTestId('figma-modal-grid');
    await expect(grid).toBeVisible();
    await expect(page.getByTestId('modal-figma-val-s-360')).toBeVisible();
    await expect(page.getByTestId('modal-figma-val-fullwidth-360')).toBeVisible();
  });

  test('[fn] figma validation grid shows all 4 sizes across 5 platform rows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Figma Validation' }).click();
    for (const row of ['360', '768', '1024', '1448', '1920']) {
      for (const size of ['s', 'm', 'l', 'fullwidth']) {
        await expect(page.getByTestId(`modal-figma-val-${size}-${row}`)).toBeVisible();
      }
    }
  });

  // ── open / close ───────────────────────────────────────────────────────────

  test('[fn] default modal opens on trigger click', async ({ page }) => {
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await clickModalTrigger(page, 'modal-trigger-default');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('[fn] default modal closes via header close button', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-default');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('button[aria-label="Close"]').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('[fn] default modal closes via header Close button (Enter)', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-default');
    await modalHeaderCloseButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('[fn] default modal closes on Escape key', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-default');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  // ── size (Figma: S | M | L | FullWidth) ───────────────────────────────────

  for (const [testId, expectedSize] of [
    ['modal-trigger-size-s', 'S'],
    ['modal-trigger-size-m', 'M'],
    ['modal-trigger-size-l', 'L'],
    ['modal-trigger-size-fullwidth', 'FullWidth'],
  ] as const) {
    test(`[fn] size ${expectedSize} modal carries data-size="${expectedSize}"`, async ({ page }) => {
      await clickModalTrigger(page, testId);
      await expect(page.getByRole('dialog')).toHaveAttribute('data-size', expectedSize);
    });
  }

  // ── header (Figma: header: true | false) ──────────────────────────────────

  test('[fn] header=false modal has no header close button', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-no-header');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Header chrome only: BaseDialog.Close uses aria-label="Close".
    // Footer actions may still say "Close" (e.g. modal-trigger-no-header showcase).
    await expect(dialog.locator('button[aria-label="Close"]')).toHaveCount(0);
  });

  // ── headerAlign (Figma: left | center) ────────────────────────────────────

  test('[fn] headerAlign=center emits data-header-align="center" on dialog', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-header-align-center');
    await expect(page.getByRole('dialog')).toHaveAttribute('data-header-align', 'center');
  });

  test('[fn] headerAlign=left (default) does NOT set data-header-align on dialog', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-header-align-left');
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.getByRole('dialog').getAttribute('data-header-align')).toBeNull();
  });

  // ── footer (Figma: footer: true | false) ──────────────────────────────────

  test('[fn] footer=false modal has no footer action buttons', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-no-footer');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /cancel/i })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: /save/i })).toHaveCount(0);
  });

  // ── Title / Description (Figma: Title + Description → showTitle / showDescription)

  test('[fn] default modal renders title text', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-default');
    await expect(page.getByRole('dialog').getByText('Title')).toBeVisible();
  });

  test('[fn] showTitle=false (Figma: Title: false) hides title text', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-title-false');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Hidden Title')).toHaveCount(0);
    await expect(dialog.getByText(/title hidden/i)).toBeVisible();
  });

  test('[fn] showDescription=true (Figma: Description: true) renders description text', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-desc-true');
    await expect(page.getByRole('dialog').getByText(/additional context/i)).toBeVisible();
  });

  test('[fn] showDescription=false (Figma: Description: false) hides description', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-desc-false');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/helpful description/i)).toHaveCount(0);
  });

  // ── footerOrientation (Figma: horizontal | vertical) ─────────────────────

  test('[fn] footerOrientation=vertical emits data-footer-orientation="vertical"', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-footer-vertical');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-footer-orientation="vertical"]')).toBeVisible();
  });

  test('[fn] footerOrientation=horizontal (default) does NOT emit data-footer-orientation', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-footer-horizontal');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // horizontal is default — attribute should NOT appear on popup or footer
    expect(await dialog.getAttribute('data-footer-orientation')).toBeNull();
  });

  // ── maxHeight (Figma: code-only — number vh) ──────────────────────────────


  // ── dismissible (code-only) ────────────────────────────────────────────────

  test('[fn] dismissible modal closes on backdrop click', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-dismissible-true');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('[fn] non-dismissible modal stays open on backdrop click', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-dismissible-false');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(modalHeaderCloseButton(page)).toBeVisible();
  });

  // ── appearance bands (Modal popup is role-neutral — styling lives in slot children) ──

  for (const appearance of [
    'neutral', 'primary', 'secondary', 'sparkle',
    'positive', 'negative', 'warning', 'informative',
  ] as const) {
    test(`[fn] appearance="${appearance}" band opens dialog without data-appearance on popup`, async ({
      page,
    }) => {
      await clickModalTrigger(page, `modal-trigger-appearance-${appearance}`);
      await expect(modalDialog(page)).toBeVisible();
      expect(await modalDialog(page).getAttribute('data-appearance')).toBeNull();
      await page.keyboard.press('Escape');
    });
  }

  test('[fn] appearance="auto" band opens dialog without data-appearance on popup', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-appearance-auto');
    await expect(modalDialog(page)).toBeVisible();
    expect(await modalDialog(page).getAttribute('data-appearance')).toBeNull();
  });

  test('[fn] appearance="brand-bg" band opens dialog without data-appearance on popup', async ({
    page,
  }) => {
    await clickModalTrigger(page, 'modal-trigger-appearance-brand-bg');
    await expect(modalDialog(page)).toBeVisible();
    expect(await modalDialog(page).getAttribute('data-appearance')).toBeNull();
    await page.keyboard.press('Escape');
  });

  // ── headerStart (Figma: none | icon | badge) ──────────────────────────────

  test('[fn] headerStart="icon" renders headerStartContent', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-header-start-icon');
    await expect(page.getByTestId('modal-header-start-icon')).toBeVisible();
  });

  test('[fn] headerStart="badge" renders headerStartContent', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-header-start-badge');
    await expect(page.getByTestId('modal-header-start-badge')).toBeVisible();
  });

  // ── footerStart (Figma slot) ─────────────────────────────────────────────

  test('[fn] footerStart slot renders leading footer content', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-footer-start');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('modal-footer-start-slot')).toBeVisible();
    await expect(dialog.locator('[data-footer-orientation="horizontal"]')).toBeVisible();
  });

  // ── dividerTopScrollPosition / dividerBottomScrollPosition (data attrs) ───

  test('[fn] dialog emits default divider scroll position data attributes', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-default');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('data-divider-top-scroll-position', 'middle', {
      timeout: MODAL_ASSERT_FAIL_FAST_MS,
    });
    await expect(dialog).toHaveAttribute('data-divider-bottom-scroll-position', 'middle', {
      timeout: MODAL_ASSERT_FAIL_FAST_MS,
    });
  });

  // ── dismissible edge cases ─────────────────────────────────────────────────

  test('[fn] non-dismissible modal stays open on Escape', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-dismissible-false');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('[fn] footer=false modal still has header close button', async ({ page }) => {
    await clickModalTrigger(page, 'modal-trigger-no-footer');
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('button[aria-label="Close"]')).toBeVisible();
  });

  // ── GROUP 1 — Render ───────────────────────────────────────────────────────
  test.describe('Group 1 — Render', { tag: [ModalTags.functional] }, () => {
    test('1.1 — Page loads without console errors; default trigger mounts', async ({ page }) => {
      const errors = attachConsoleErrorCollector(page);
      await openModalTestScenarios(page);
      await qaStep('Assert no unexpected console errors on load', async () => {
        await assertNoConsoleErrors(errors);
      });
      await expect(page.getByTestId('modal-trigger-default').getByRole('button')).toBeVisible();
    });

    test('1.2 — Every trigger `data-testid` is visible on Test Scenarios', async ({ page }) => {
      for (const testId of MODAL_TRIGGER_TESTIDS) {
        await qaStep(`Visible: ${testId}`, async () => {
          const locator = page.getByTestId(testId);
          await locator.scrollIntoViewIfNeeded();
          await expect(locator, `Expected visible: ${testId}`).toBeVisible();
        });
      }
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('1.3 — Every `data-section` band is visible', async ({ page }) => {
      for (const sectionId of MODAL_DATA_SECTIONS) {
        await qaStep(`Section: ${sectionId}`, async () => {
          await expectSectionVisible(page, sectionId);
        });
      }
      await expect(page.locator('[data-section^="modal-figma-"]')).toHaveCount(MODAL_SECTION_COUNT);
    });
  });

  // ── GROUP 2 — Props validation ─────────────────────────────────────────────
  test.describe('Group 2 — Props validation', { tag: [ModalTags.functional] }, () => {
    test('2.1 — Default open dialog exposes title and footer region', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await expect(modalDialog(page).getByText('Title')).toBeVisible();
      await expect(modalDialog(page).locator('[data-footer-orientation="horizontal"]')).toBeVisible();
      await closeModalViaEscape(page);
    });

    for (const [triggerId, expectedSize] of [
      ['modal-trigger-size-s', 'S'],
      ['modal-trigger-size-m', 'M'],
      ['modal-trigger-size-l', 'L'],
      ['modal-trigger-size-fullwidth', 'FullWidth'],
    ] as const) {
      test(`2.1 — size ${expectedSize} emits data-size on dialog`, async ({ page }) => {
        await openModalViaTrigger(page, triggerId);
        await expect(modalDialog(page)).toHaveAttribute('data-size', expectedSize);
        await closeModalViaEscape(page);
      });
    }

    test('2.2 — Size S dialog width is less than FullWidth when open', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-size-s');
      const sWidth = (await modalDialog(page).boundingBox())!.width;
      await closeModalViaEscape(page);
      await openModalViaTrigger(page, 'modal-trigger-size-fullwidth');
      const fwWidth = (await modalDialog(page).boundingBox())!.width;
      expect(sWidth, 'S width < FullWidth').toBeLessThan(fwWidth);
      await closeModalViaEscape(page);
    });


  });

  // ── GROUP 3 — Click interaction ────────────────────────────────────────────
  test.describe('Group 3 — Click interaction', { tag: [ModalTags.functional] }, () => {
    test('3.1 — Trigger click opens dialog', async ({ page }) => {
      await expect(modalDialog(page)).toHaveCount(0);
      await clickModalTrigger(page, 'modal-trigger-default');
      await expect(modalDialog(page)).toBeVisible();
    });

    test('3.2 — Disabled (N/A)', async () => {
      qaLog('Skipped — Modal showcase has no disabled trigger');
    });

    test('3.3 — Readonly (N/A)', async () => {
      qaLog('Skipped — Modal has no readonly prop');
    });

    test('3.4 — Backdrop click closes dismissible modal', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-dismissible-true');
      await page.mouse.click(5, 5);
      await expect(modalDialog(page)).toHaveCount(0);
    });
  });

  // ── GROUP 4 — Keyboard navigation ──────────────────────────────────────────
  test.describe('Group 4 — Keyboard navigation', { tag: [ModalTags.functional] }, () => {
    test('4.1 — Tab keeps focus inside open dialog (focus trap)', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
      expect(focused, 'Tab should move focus within dialog').not.toBeNull();
      await closeModalViaEscape(page);
    });

    test('4.2 — Enter on focused header Close button closes modal', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await modalHeaderCloseButton(page).focus();
      await page.keyboard.press('Enter');
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('4.3 — Space on focused header Close button closes modal', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await modalHeaderCloseButton(page).focus();
      await page.keyboard.press('Space');
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('4.4 — Arrow keys (N/A)', async () => {
      qaLog('Skipped — Modal is not an arrow-key list');
    });

    test('4.5 — Home/End (N/A)', async () => {
      qaLog('Skipped — Modal is not a text field');
    });

    test('4.6 — Escape closes open modal', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await page.keyboard.press('Escape');
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('4.7 — Focus trap (modal WCAG): Tab keeps focus inside dialog', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
      const stillInDialog = await page.evaluate(
        () => document.activeElement?.closest('[role="dialog"]') !== null,
      );
      expect(stillInDialog, 'Focus should remain trapped in modal per WCAG').toBe(true);
      await closeModalViaEscape(page);
    });
  });

  // ── GROUP 5 — Focus management ─────────────────────────────────────────────
  test.describe('Group 5 — Focus management', { tag: [ModalTags.functional] }, () => {
    test('5.1 — Opening modal moves focus into dialog', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      const inDialog = await page.evaluate(
        () => document.activeElement?.closest('[role="dialog"]') !== null,
      );
      expect(inDialog).toBe(true);
      await closeModalViaEscape(page);
    });

    test('5.2 — Focused header Close shows visible focus ring', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await modalHeaderCloseButton(page).focus();
      await expectFocusRingVisible(page);
      await closeModalViaEscape(page);
    });

    test('5.3 — Header Close button is focusable in tab order', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await modalHeaderCloseButton(page).focus();
      await expect(modalHeaderCloseButton(page)).toBeFocused();
      await closeModalViaEscape(page);
    });

    test('5.4 — Closing modal removes dialog from DOM', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await closeModalViaEscape(page);
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('5.5 — autoFocus (N/A)', async () => {
      qaLog('Skipped — Modal showcase has no autoFocus example');
    });
  });

  // ── GROUP 6 — State ────────────────────────────────────────────────────────
  test.describe('Group 6 — State', { tag: [ModalTags.functional] }, () => {
    test('6.1 — Closed state has zero dialogs', async ({ page }) => {
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('6.2 — Selected/checked (N/A)', async () => {
      qaLog('Skipped — Modal is not selectable');
    });

    test('6.3 — Disabled (N/A)', async () => {
      qaLog('Skipped — Modal has no disabled prop in showcase');
    });

    test('6.4 — Readonly (N/A)', async () => {
      qaLog('Skipped — Modal has no readonly prop');
    });

    test('6.5 — Error state (N/A)', async () => {
      qaLog('Skipped — Modal has no errorHighlight in showcase');
    });

    test('6.6 — Loading state (N/A)', async () => {
      qaLog('Skipped — Modal has no loading prop');
    });
  });

  // ── GROUP 7 — Slots ──────────────────────────────────────────────────────
  test.describe('Group 7 — Start/end slots', { tag: [ModalTags.functional] }, () => {
    test('7.1 — headerStart icon slot renders when open', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-header-start-icon');
      await expect(page.getByTestId('modal-header-start-icon').first()).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('7.2 — footerStart slot renders leading footer content', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-footer-start');
      await expect(modalDialog(page).getByTestId('modal-footer-start-slot')).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('7.3 — headerStart badge renders when open', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-header-start-badge');
      await expect(page.getByTestId('modal-header-start-badge').first()).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('7.4 — Icon colour inheritance (N/A)', async () => {
      qaLog('Skipped — headerStart uses showcase span content');
    });
  });

  // ── GROUP 8–9 — N/A ──────────────────────────────────────────────────────
  test.describe('Group 8 — Toggle (N/A)', { tag: [ModalTags.functional] }, () => {
    test('8.x — Not a toggle component', async () => {
      qaLog('Skipped — Modal open state is controlled, not aria-checked');
    });
  });

  test.describe('Group 9 — Input and typing (N/A)', { tag: [ModalTags.functional] }, () => {
    test('9.x — Not a text input', async () => {
      qaLog('Skipped — Modal is dialog chrome + body content');
    });
  });

  // ── GROUP 10 — Dependency rules ────────────────────────────────────────────
  test.describe('Group 10 — Dependency rules', { tag: [ModalTags.functional] }, () => {

    test('10.2 — dismissible=false blocks backdrop dismiss and Escape', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-dismissible-false');
      await page.mouse.click(5, 5);
      await expect(modalDialog(page)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(modalDialog(page)).toBeVisible();
      await modalHeaderCloseButton(page).click();
      await expect(modalDialog(page)).toHaveCount(0);
    });

    test('10.3 — Loading overrides (N/A)', async () => {
      qaLog('Skipped — no loading prop');
    });
  });

  // ── GROUP 11 — Content and display ─────────────────────────────────────────
  test.describe('Group 11 — Content and display', { tag: [ModalTags.functional] }, () => {
    test('11.1 — Open default modal body text is non-empty', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-default');
      await expect(modalDialog(page).getByText(/modal body content/i)).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('11.2 — headerStart icon content visible when open', async ({ page }) => {
      await openModalViaTrigger(page, 'modal-trigger-header-start-icon');
      await expect(page.getByTestId('modal-header-start-icon').first()).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('11.3 — Progress value (N/A)', async () => {
      qaLog('Skipped — not a progress indicator');
    });
  });

  // ── GROUP 13 — Dark mode ─────────────────────────────────────────────────────
  test.describe('Group 13 — Dark mode', { tag: [ModalTags.functional] }, () => {
    test('13.1 — After dark theme, all scenario sections remain visible', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(page.getByRole('heading', { name: 'Modal', level: 1 })).toBeVisible();
      for (const sectionId of MODAL_DATA_SECTIONS) {
        await expect(
          page.locator(`[data-section="${sectionId}"]`),
          `Story band "${sectionId}" should remain visible in dark mode`,
        ).toBeVisible();
      }
    });

    test('13.1 — Default trigger remains visible in dark mode', async ({ page }) => {
      await switchPlaygroundToDarkTheme(page);
      await expect(page.getByTestId('modal-trigger-default')).toBeVisible();
    });
  });

  // ── Smoke ────────────────────────────────────────────────────────────────────
  test.describe('Smoke', { tag: MODAL_TAG_SET.smoke }, () => {
    test('Smoke — Page heading reads “Modal”', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Modal', level: 1 })).toBeVisible();
    });

    test('Smoke — Default trigger opens dialog with role=dialog', async ({ page }) => {
      await clickModalTrigger(page, 'modal-trigger-default');
      await expect(modalDialog(page)).toBeVisible();
      await closeModalViaEscape(page);
    });

    test('Smoke — Trigger count in showcase scope', async ({ page }) => {
      await expect(
        page.locator(`${MODAL_SHOWCASE_AXE_SCOPE} [data-testid^="modal-trigger-"]`),
      ).toHaveCount(MODAL_TRIGGER_TESTIDS.length);
    });
  });
});
