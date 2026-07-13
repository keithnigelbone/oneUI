/**
 * Shared helpers for Divider Playwright automation.
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
  DIVIDER_FIGMA_VALIDATION_TAB,
  DIVIDER_PLAYGROUND_ROUTE,
  DIVIDER_ROOT_TESTIDS,
  DIVIDER_SHOWCASE_AXE_SCOPE,
  type DIVIDER_DATA_SECTIONS,
} from '../divider-playground/manifest';

export {
  DIVIDER_FIGMA_VALIDATION_TAB,
  DIVIDER_PLAYGROUND_ROUTE,
  DIVIDER_SHOWCASE_AXE_SCOPE,
};

export const DividerTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const DIVIDER_TAG_SET = {
  functional: [DividerTags.functional],
  accessibility: [DividerTags.accessibility],
  smoke: [DividerTags.functional, DividerTags.smoke],
} as const;

const LOG_PREFIX = '[Divider QA]';

export const DIVIDER_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const DIVIDER_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'divider-axe-violations.json');

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openDividerTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Divider playground', async () => {
    await page.goto(DIVIDER_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Divider', level: 1 }),
      'Divider page heading should be visible',
    ).toBeVisible();
    await dividerRoot(page, DIVIDER_ROOT_TESTIDS.default).waitFor({ state: 'attached', timeout: 90_000 });
  });
}

export async function openDividerFigmaValidationTab(page: Page): Promise<void> {
  await qaStep('Open Divider Figma Validation tab', async () => {
    await page.getByRole('tab', { name: DIVIDER_FIGMA_VALIDATION_TAB }).click();
    await expect(page.locator('[data-section="divider-qa-horizontal-full-matrix"]')).toBeVisible({
      timeout: 90_000,
    });
  });
}

export function dividerRoot(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"][data-divider]`).first();
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
    `Browser console should have no errors during Divider scenario load.\n${errors.join('\n')}`,
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
  sectionId: (typeof DIVIDER_DATA_SECTIONS)[number],
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
    DIVIDER_AXE_ARTIFACT_JSON,
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
      reportFileName: 'divider-accessibility-axe-report.html',
      projectKey: 'Divider QA Playground',
      customSummary: `Divider QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/divider-summary.json.`,
    },
  });
}

export type ConfigureDividerAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureDividerAxeBuilder(page: Page, options: ConfigureDividerAxeOptions): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...DIVIDER_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: ConfigureDividerAxeOptions): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureDividerAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
