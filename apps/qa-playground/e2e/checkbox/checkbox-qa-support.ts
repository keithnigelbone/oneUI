/**
 * Shared helpers for Checkbox Playwright automation.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import { expect, test, type Locator, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  CHECKBOX_PLAYGROUND_ROUTE,
  CHECKBOX_SHOWCASE_AXE_SCOPE,
  type CHECKBOX_DATA_SECTIONS,
} from '../checkbox-playground/manifest';

export { CHECKBOX_PLAYGROUND_ROUTE, CHECKBOX_SHOWCASE_AXE_SCOPE };

export const CheckboxTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const CHECKBOX_TAG_SET = {
  functional: [CheckboxTags.functional],
  accessibility: [CheckboxTags.accessibility],
  smoke: [CheckboxTags.functional, CheckboxTags.smoke],
  functionalAndSmoke: [CheckboxTags.functional, CheckboxTags.smoke],
  accessibilitySmoke: [CheckboxTags.accessibility, CheckboxTags.smoke],
} as const;

const LOG_PREFIX = '[Checkbox QA]';

/** QA shell / Storybook chrome — not Checkbox defects. */
export const CHECKBOX_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
  /** Base UI checkbox uses role=checkbox; axe toggle-field rule is for role=switch. */
  'aria-toggle-field-name',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const CHECKBOX_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'checkbox-axe-violations.json',
);

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openCheckboxTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Checkbox playground', async () => {
    await page.goto(CHECKBOX_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Checkbox', level: 1 }),
      'Checkbox page heading should be visible',
    ).toBeVisible();
    await page
      .getByTestId('checkbox-default')
      .waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Checkbox scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function expectSectionVisible(
  page: Page,
  sectionId: (typeof CHECKBOX_DATA_SECTIONS)[number],
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
}

export function formatAxeViolations(violations: Result[]): string {
  if (!violations.length) return 'No axe violations reported.';
  return violations
    .map(
      (v) =>
        `[${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n` +
        `  ${v.description}\n` +
        `  Help: ${v.helpUrl ?? 'n/a'}\n` +
        `  Nodes: ${v.nodes?.length ?? 0}`,
    )
    .join('\n\n');
}

export function blockingAxeViolations(violations: Result[]): Result[] {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

export function writeAxeArtifact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    CHECKBOX_AXE_ARTIFACT_JSON,
    JSON.stringify(
      {
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? 'unknown',
          description: v.description,
          helpUrl: v.helpUrl,
          nodes: v.nodes?.length ?? 0,
        })),
      },
      null,
      2,
    ),
    'utf8',
  );
}

export function writeAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'checkbox-accessibility-axe-report.html',
      projectKey: 'Checkbox QA Playground',
      customSummary: `Checkbox QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/checkbox-summary.json.`,
    },
  });
}

export type ConfigureCheckboxAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
  relaxColorContrast?: boolean;
};

export function configureCheckboxAxeBuilder(
  page: Page,
  options: ConfigureCheckboxAxeOptions,
): AxeBuilder {
  const disable = [...CHECKBOX_AXE_SHELL_DISABLE];
  if (options.relaxColorContrast) disable.push('color-contrast');

  let builder = new AxeBuilder({ page }).disableRules([...disable]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: ConfigureCheckboxAxeOptions): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureCheckboxAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
