/**
 * Shared helpers for Icon Contained Playwright automation.
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

import { iconContainedRoot } from '../icon-contained-playground/iconContainedHelpers';
import {
  ICON_CONTAINED_FIGMA_VALIDATION_TAB,
  ICON_CONTAINED_PLAYGROUND_ROUTE,
  ICON_CONTAINED_ROOT_TESTIDS,
  ICON_CONTAINED_SHOWCASE_AXE_SCOPE,
  type ICON_CONTAINED_DATA_SECTIONS,
} from '../icon-contained-playground/manifest';

export {
  ICON_CONTAINED_FIGMA_VALIDATION_TAB,
  ICON_CONTAINED_PLAYGROUND_ROUTE,
  ICON_CONTAINED_SHOWCASE_AXE_SCOPE,
};

export const IconContainedTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const ICON_CONTAINED_TAG_SET = {
  functional: [IconContainedTags.functional],
  accessibility: [IconContainedTags.accessibility],
  smoke: [IconContainedTags.functional, IconContainedTags.smoke],
} as const;

const LOG_PREFIX = '[IconContained QA]';

export const ICON_CONTAINED_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const ICON_CONTAINED_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'icon-contained-axe-violations.json',
);

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export { iconContainedRoot };

export async function openIconContainedTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Icon Contained playground', async () => {
    await page.goto(ICON_CONTAINED_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Icon Contained', level: 1 }),
      'Icon Contained page heading should be visible',
    ).toBeVisible();
    await iconContainedRoot(page, ICON_CONTAINED_ROOT_TESTIDS.default).waitFor({
      state: 'visible',
      timeout: 90_000,
    });
  });
}

export async function openIconContainedFigmaValidationTab(page: Page): Promise<void> {
  await qaStep('Open Icon Contained Figma Validation tab', async () => {
    await page.getByRole('tab', { name: ICON_CONTAINED_FIGMA_VALIDATION_TAB }).click();
    await expect(page.getByTestId('figma-icon-contained-grid')).toBeVisible({ timeout: 90_000 });
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
    `Browser console should have no errors during Icon Contained scenario load.\n${errors.join('\n')}`,
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
  sectionId: (typeof ICON_CONTAINED_DATA_SECTIONS)[number],
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
    ICON_CONTAINED_AXE_ARTIFACT_JSON,
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
      reportFileName: 'icon-contained-accessibility-axe-report.html',
      projectKey: 'IconContained QA Playground',
      customSummary: `IconContained QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/icon-contained-summary.json.`,
    },
  });
}

export type ConfigureIconContainedAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureIconContainedAxeBuilder(
  page: Page,
  options: ConfigureIconContainedAxeOptions,
): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...ICON_CONTAINED_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureIconContainedAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureIconContainedAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
