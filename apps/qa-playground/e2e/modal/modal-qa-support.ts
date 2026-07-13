/**
 * Shared helpers for Modal Playwright automation.
 */
export {
  formatAxeViolations,
  runModalAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeModalAxeArtefact,
  writeModalAxeHtmlReport,
} from '../modal-playground/axeModalPlayground';
export { gotoModalPlayground } from '../modal-playground/gotoModalPlayground';
export {
  clickModalTrigger,
  closeModalViaEscape,
  dialogBackgroundRgb,
  expectFocusRingVisible,
  isTransparentRgb,
  modalDialog,
  modalSection,
  openModalViaTrigger,
  scrollToSection,
} from '../modal-playground/modalHelpers';

import { expect, test, type Locator, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import { MODAL_PLAYGROUND_ROUTE, MODAL_SHOWCASE_AXE_SCOPE } from '../modal-playground/manifest';
import { modalDialog } from '../modal-playground/modalHelpers';

export { MODAL_PLAYGROUND_ROUTE, MODAL_SHOWCASE_AXE_SCOPE };

/** Fail fast when asserting missing UI (component bugs) — avoids 30s action/test timeouts. */
export const MODAL_ASSERT_FAIL_FAST_MS = 4_000;

export function modalFooterButton(page: Page, name: RegExp | string): Locator {
  return modalDialog(page).getByRole('button', { name });
}

export async function expectModalFooterButtonVisible(
  page: Page,
  name: RegExp | string,
  message: string,
): Promise<void> {
  await expect(modalFooterButton(page, name), message).toBeVisible({
    timeout: MODAL_ASSERT_FAIL_FAST_MS,
  });
}

export async function clickModalFooterButton(
  page: Page,
  name: RegExp | string,
  message: string,
): Promise<void> {
  const btn = modalFooterButton(page, name);
  await expect(btn, message).toBeVisible({ timeout: MODAL_ASSERT_FAIL_FAST_MS });
  await btn.click({ timeout: MODAL_ASSERT_FAIL_FAST_MS });
}

export async function focusModalFooterButton(
  page: Page,
  name: RegExp | string,
  message: string,
): Promise<void> {
  const btn = modalFooterButton(page, name);
  await expect(btn, message).toBeVisible({ timeout: MODAL_ASSERT_FAIL_FAST_MS });
  await btn.focus({ timeout: MODAL_ASSERT_FAIL_FAST_MS });
}

export async function expectDialogHasAttribute(
  page: Page,
  attr: string,
  value: string,
  message: string,
): Promise<void> {
  await expect(modalDialog(page), message).toHaveAttribute(attr, value, {
    timeout: MODAL_ASSERT_FAIL_FAST_MS,
  });
}

export async function expectDialogClosed(page: Page, message: string): Promise<void> {
  await expect(modalDialog(page), message).toHaveCount(0, {
    timeout: MODAL_ASSERT_FAIL_FAST_MS,
  });
}

/** Teardown only — closes via header Close or Escape; does not assert footer actions. */
export async function dismissOpenModal(page: Page): Promise<void> {
  const dialog = modalDialog(page);
  if ((await dialog.count()) === 0) return;

  const close = dialog.locator('button[aria-label="Close"]');
  if ((await close.count()) > 0) {
    await close.click({ timeout: MODAL_ASSERT_FAIL_FAST_MS }).catch(() => undefined);
  }
  if ((await dialog.count()) > 0) {
    await page.keyboard.press('Escape');
  }
  await expect(dialog).toHaveCount(0, { timeout: MODAL_ASSERT_FAIL_FAST_MS }).catch(() => undefined);
}

export const ModalTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const MODAL_TAG_SET = {
  functional: [ModalTags.functional],
  accessibility: [ModalTags.accessibility],
  smoke: [ModalTags.functional, ModalTags.smoke],
} as const;

const LOG_PREFIX = '[Modal QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openModalTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Modal playground', async () => {
    await page.goto(MODAL_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Modal', level: 1 })).toBeVisible();
  });
}

export function attachConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

export async function assertNoConsoleErrors(errors: string[]): Promise<void> {
  expect(
    errors,
    `Browser console should have no errors during Modal scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}

