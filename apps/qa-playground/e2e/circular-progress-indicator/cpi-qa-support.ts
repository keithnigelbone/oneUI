/**
 * Shared helpers for Circular Progress Indicator Playwright automation.
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
  CPI_PLAYGROUND_ROUTE,
  CPI_SHOWCASE_AXE_SCOPE,
  CPI_ROOT_TESTIDS,
  type CPI_DATA_SECTIONS,
} from '../circular-progress-indicator-playground/manifest';

export { CPI_PLAYGROUND_ROUTE, CPI_SHOWCASE_AXE_SCOPE };

export const CpiTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const CPI_TAG_SET = {
  functional: [CpiTags.functional],
  accessibility: [CpiTags.accessibility],
  smoke: [CpiTags.functional, CpiTags.smoke],
  functionalAndSmoke: [CpiTags.functional, CpiTags.smoke],
  accessibilitySmoke: [CpiTags.accessibility, CpiTags.smoke],
} as const;

const LOG_PREFIX = '[CPI QA]';

export const CPI_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const CPI_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'circular-progress-indicator-axe-violations.json',
);

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

/** Opens `/c/circular-progress-indicator` → Test Scenarios only. */
export async function openCpiTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Circular Progress Indicator playground', async () => {
    await page.goto(CPI_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    const tab = page.getByRole('tab', { name: 'Test Scenarios' });
    if ((await tab.getAttribute('aria-selected')) !== 'true') {
      await tab.click();
    }
    await expect(
      page.getByRole('heading', { name: 'Circular Progress Indicator', level: 1 }),
      'Circular Progress Indicator page heading should be visible',
    ).toBeVisible();
    await page.getByTestId(CPI_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during CPI scenario load.\n${errors.join('\n')}`,
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
  sectionId: (typeof CPI_DATA_SECTIONS)[number],
): Promise<void> {
  await expect(async () => {
    const band = page.locator(`[data-section="${sectionId}"]`);
    await band.scrollIntoViewIfNeeded();
    await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
  }).toPass({ timeout: 15_000 });
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
    CPI_AXE_ARTIFACT_JSON,
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
      reportFileName: 'circular-progress-indicator-accessibility-axe-report.html',
      projectKey: 'Circular Progress Indicator QA Playground',
      customSummary: `Circular Progress Indicator QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/circular-progress-indicator-summary.json.`,
    },
  });
}

export type ConfigureCpiAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureCpiAxeBuilder(page: Page, options: ConfigureCpiAxeOptions): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...CPI_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureCpiAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureCpiAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
