/**
 * Shared helpers for Indicator Badge Playwright automation.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  INDICATOR_BADGE_PLAYGROUND_ROUTE,
  INDICATOR_BADGE_ROOT_TESTIDS,
  INDICATOR_BADGE_SHOWCASE_AXE_SCOPE,
} from '../indicator-badge-playground/manifest';

export { INDICATOR_BADGE_PLAYGROUND_ROUTE, INDICATOR_BADGE_SHOWCASE_AXE_SCOPE };

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const INDICATOR_BADGE_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'indicator-badge-axe-violations.json',
);

const LOG_PREFIX = '[IndicatorBadge QA]';

export const INDICATOR_BADGE_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export function qaLog(message: string): void {
  console.log(`${LOG_PREFIX} ${message}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openIndicatorBadgeTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Indicator Badge playground', async () => {
    await page.goto(INDICATOR_BADGE_PLAYGROUND_ROUTE);
    await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Indicator Badge', level: 1 })).toBeVisible();
    await page
      .getByTestId(INDICATOR_BADGE_ROOT_TESTIDS.default)
      .waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
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
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

export function writeAxeArtifact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    INDICATOR_BADGE_AXE_ARTIFACT_JSON,
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
      reportFileName: 'indicator-badge-accessibility-axe-report.html',
      projectKey: 'Indicator Badge QA Playground',
      customSummary: `Indicator Badge QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}), scoped to story bands. Pair with public/qa-reports/indicator-badge-summary.json.`,
    },
  });
}

export type ConfigureIndicatorBadgeAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureIndicatorBadgeAxeBuilder(
  page: Page,
  options: ConfigureIndicatorBadgeAxeOptions,
): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...INDICATOR_BADGE_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureIndicatorBadgeAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureIndicatorBadgeAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
