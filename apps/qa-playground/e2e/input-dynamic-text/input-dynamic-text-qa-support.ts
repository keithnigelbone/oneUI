/**
 * Shared helpers for Input Dynamic Text Playwright automation.
 */
export {
  formatAxeViolations,
  runIdtAxePageScan,
  seriousOrCritical,
  WCAG_AA_TAGS,
  writeIdtAxeArtefact,
  writeIdtAxeHtmlReport,
} from '../input-dynamic-text-playground/axeInputDynamicTextPlayground';
export { gotoInputDynamicTextPlayground } from '../input-dynamic-text-playground/gotoInputDynamicTextPlayground';
export {
  computedContentColor,
  computedContentFontSize,
  computedRootBackgroundRgb,
  dynamicTextByTestId,
  dynamicTextContent,
  dynamicTextEndButton,
  expectDynamicTextVisible,
  expectFocusRingVisible,
  expectNoErrorText,
  idtSection,
  scrollToSection,
} from '../input-dynamic-text-playground/inputDynamicTextHelpers';

import { expect, test, type Page } from 'playwright/test';
import { switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore } from '../shared/playgroundTheme';

import {
  IDT_ROOT_TESTIDS,
  IDT_SHOWCASE_AXE_SCOPE,
  INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE,
} from '../input-dynamic-text-playground/manifest';
import { dynamicTextByTestId } from '../input-dynamic-text-playground/inputDynamicTextHelpers';

export { IDT_SHOWCASE_AXE_SCOPE, INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE };

export const IdtTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const IDT_TAG_SET = {
  functional: [IdtTags.functional],
  accessibility: [IdtTags.accessibility],
  smoke: [IdtTags.functional, IdtTags.smoke],
} as const;

const LOG_PREFIX = '[Input Dynamic Text QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openIdtTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Input Dynamic Text playground', async () => {
    await page.goto(INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Input Dynamic Text', exact: true, level: 1 }),
    ).toBeVisible();
    await dynamicTextByTestId(page, IDT_ROOT_TESTIDS.default).waitFor({
      state: 'visible',
      timeout: 90_000,
    });
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
    `Browser console should have no errors during Input Dynamic Text scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function expectSectionVisible(page: Page, sectionId: string): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}
