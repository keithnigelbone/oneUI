/**
 * Shared helpers for Input Playwright automation.
 */
export {
  formatAxeViolations,
  runInputAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeInputAxeArtefact,
  writeInputAxeHtmlReport,
} from '../input-playground/axeInputPlayground';
export { gotoInputPlayground } from '../input-playground/gotoInputPlayground';
export {
  expectFocusVisible,
  inputByTestId,
  inputSection,
  inputShellBackgroundRgb,
  inputShellByTestId,
  moveInputCaretToEnd,
  moveInputCaretToStart,
} from '../input-playground/inputHelpers';

import { expect, test, type Page } from 'playwright/test';
import { switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore } from '../shared/playgroundTheme';

import { INPUT_PLAYGROUND_ROUTE, INPUT_ROOT_TESTIDS, INPUT_SHOWCASE_AXE_SCOPE } from '../input-playground/manifest';
import { inputByTestId } from '../input-playground/inputHelpers';

export { INPUT_PLAYGROUND_ROUTE, INPUT_SHOWCASE_AXE_SCOPE };

export const InputTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const INPUT_TAG_SET = {
  functional: [InputTags.functional],
  accessibility: [InputTags.accessibility],
  smoke: [InputTags.functional, InputTags.smoke],
} as const;

const LOG_PREFIX = '[Input QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openInputTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Input playground', async () => {
    await page.goto(INPUT_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Input', exact: true, level: 1 })).toBeVisible();
    await inputByTestId(page, INPUT_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Input scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  await expect(async () => {
    const band = page.locator(`[data-section="${sectionId}"]`);
    await band.scrollIntoViewIfNeeded();
    await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
  }).toPass({ timeout: 15_000 });
}
