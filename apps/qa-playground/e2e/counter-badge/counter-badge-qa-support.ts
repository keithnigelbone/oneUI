/**
 * Shared helpers for Counter Badge Playwright automation.
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
  COUNTER_BADGE_PLAYGROUND_ROUTE,
  COUNTER_BADGE_ROOT_TESTIDS,
  COUNTER_BADGE_SHOWCASE_AXE_SCOPE,
  type COUNTER_BADGE_DATA_SECTIONS,
} from '../counter-badge-playground/manifest';

export { COUNTER_BADGE_PLAYGROUND_ROUTE, COUNTER_BADGE_SHOWCASE_AXE_SCOPE };

export const CounterBadgeTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const COUNTER_BADGE_TAG_SET = {
  functional: [CounterBadgeTags.functional],
  accessibility: [CounterBadgeTags.accessibility],
  smoke: [CounterBadgeTags.functional, CounterBadgeTags.smoke],
  functionalAndSmoke: [CounterBadgeTags.functional, CounterBadgeTags.smoke],
  accessibilitySmoke: [CounterBadgeTags.accessibility, CounterBadgeTags.smoke],
} as const;

const LOG_PREFIX = '[CounterBadge QA]';

export const COUNTER_BADGE_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const COUNTER_BADGE_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'counter-badge-axe-violations.json',
);

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openCounterBadgeTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Counter Badge playground', async () => {
    await page.goto(COUNTER_BADGE_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Counter Badge', level: 1 }),
      'Counter Badge page heading should be visible',
    ).toBeVisible();
    await page
      .getByTestId(COUNTER_BADGE_ROOT_TESTIDS.default)
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
    `Browser console should have no errors during Counter Badge scenario load.\n${errors.join('\n')}`,
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
  sectionId: (typeof COUNTER_BADGE_DATA_SECTIONS)[number],
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
    COUNTER_BADGE_AXE_ARTIFACT_JSON,
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
      reportFileName: 'counter-badge-accessibility-axe-report.html',
      projectKey: 'Counter Badge QA Playground',
      customSummary: `Counter Badge QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/counter-badge-summary.json.`,
    },
  });
}

export type ConfigureCounterBadgeAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureCounterBadgeAxeBuilder(
  page: Page,
  options: ConfigureCounterBadgeAxeOptions,
): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...COUNTER_BADGE_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureCounterBadgeAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureCounterBadgeAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
