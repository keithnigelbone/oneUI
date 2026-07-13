/**
 * Shared helpers for CheckboxField Playwright automation.
 *
 * Mirrors the structure of `checkbox/checkbox-qa-support.ts` — tag sets,
 * axe configuration, logging, navigation, and artifact writing.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import { expect, test, type Page } from 'playwright/test';
import {
  clickPageThemeButton as clickPageThemeButtonCore,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  CHECKBOX_FIELD_FIGMA_VALIDATION_TAB,
  CHECKBOX_FIELD_PLAYGROUND_ROUTE,
  CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE,
  type CheckboxFieldSection,
} from '../checkbox-field-playground/manifest';

export {
  CHECKBOX_FIELD_FIGMA_VALIDATION_TAB,
  CHECKBOX_FIELD_PLAYGROUND_ROUTE,
  CHECKBOX_FIELD_SHOWCASE_AXE_SCOPE,
};

/* ─── Tags ───────────────────────────────────────────────────── */

export const CheckboxFieldTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const CHECKBOX_FIELD_TAG_SET = {
  functional: [CheckboxFieldTags.functional] as string[],
  accessibility: [CheckboxFieldTags.accessibility] as string[],
  smoke: [CheckboxFieldTags.functional, CheckboxFieldTags.smoke] as string[],
  functionalAndSmoke: [CheckboxFieldTags.functional, CheckboxFieldTags.smoke] as string[],
  accessibilitySmoke: [CheckboxFieldTags.accessibility, CheckboxFieldTags.smoke] as string[],
};

/* ─── Axe configuration ──────────────────────────────────────── */

/**
 * Shell / QA chrome rules that are not CheckboxField-specific defects.
 * Mirrors the disable list in `checkbox/checkbox-qa-support.ts`.
 */
export const CHECKBOX_FIELD_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
  /**
   * Base UI Checkbox uses `role="checkbox"` and axe's `aria-toggle-field-name`
   * only fires for `role="switch"` — disable to avoid false positives.
   */
  'aria-toggle-field-name',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const CHECKBOX_FIELD_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'checkbox-field-axe-violations.json',
);

/* ─── Logging ────────────────────────────────────────────────── */

const LOG_PREFIX = '[CheckboxField QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

/* ─── Navigation ──────────────────────────────────────────────── */

export async function openCheckboxFieldTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to CheckboxField playground', async () => {
    await page.goto(CHECKBOX_FIELD_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab must be visible',
    ).toBeVisible({ timeout: 15_000 });
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    const tab = page.getByRole('tab', { name: 'Test Scenarios' });
    if ((await tab.getAttribute('aria-selected')) !== 'true') {
      await tab.click();
    }
    await expect(
      page.getByRole('heading', { name: 'Checkbox Field', level: 1 }),
      'Checkbox Field page heading must be visible',
    ).toBeVisible({ timeout: 15_000 });
    /* Wait for the first story band to paint before proceeding. */
    await page
      .locator('[data-section="checkboxfield-qa-default"]')
      .waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function openCheckboxFieldFigmaValidation(page: Page): Promise<void> {
  await qaStep('Navigate to CheckboxField playground (Figma Validation)', async () => {
    await page.goto(CHECKBOX_FIELD_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: CHECKBOX_FIELD_FIGMA_VALIDATION_TAB }),
      'Figma Validation tab must be visible',
    ).toBeVisible({ timeout: 15_000 });
  });

  await qaStep('Select the Figma Validation tab', async () => {
    await page.getByRole('tab', { name: CHECKBOX_FIELD_FIGMA_VALIDATION_TAB }).click();
    await expect(
      page.getByTestId('checkboxfield-figma-validation-root'),
      'Figma validation root must mount',
    ).toBeVisible({ timeout: 90_000 });
  });
}

/* ─── Console error collection ───────────────────────────────── */

export function attachConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

export async function assertNoConsoleErrors(errors: string[]): Promise<void> {
  expect(
    errors,
    `Browser console must have no errors during CheckboxField load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

/* ─── Theme helpers ──────────────────────────────────────────── */

/* ─── Section helpers ────────────────────────────────────────── */

export async function expectSectionVisible(
  page: Page,
  sectionId: CheckboxFieldSection,
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" must be visible`).toBeVisible();
}

/* ─── axe helpers ────────────────────────────────────────────── */

export type ConfigureAxeOptions = {
  scopeLabel: string;
  include?: string;
  tags?: readonly string[];
  rules?: string[];
  relaxColorContrast?: boolean;
};

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
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

export function configureCheckboxFieldAxeBuilder(
  page: Page,
  options: ConfigureAxeOptions,
): AxeBuilder {
  const disable: string[] = [...CHECKBOX_FIELD_AXE_SHELL_DISABLE];
  if (options.relaxColorContrast) disable.push('color-contrast');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let builder = new AxeBuilder({ page: page as any }).disableRules(disable);
  if (options.include) builder = builder.include(options.include);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureCheckboxFieldAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have zero serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}

/* ─── Artifact writers ───────────────────────────────────────── */

export function writeAxeArtifact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    CHECKBOX_FIELD_AXE_ARTIFACT_JSON,
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
      reportFileName: 'checkbox-field-accessibility-axe-report.html',
      projectKey: 'CheckboxField QA Playground',
      customSummary: `CheckboxField QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/checkbox-field-summary.json.`,
    },
  });
}
