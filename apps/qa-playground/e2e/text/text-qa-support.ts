/**
 * Shared helpers for Text Playwright automation.
 *
 * Mirrors the pattern of `checkbox-field/checkbox-field-qa-support.ts` —
 * tag sets, axe configuration, logging, navigation, and artifact writing.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import { expect, test, type Page } from 'playwright/test';
import { clickPageThemeButton as clickPageThemeButtonCore } from '../shared/playgroundTheme';

import {
  TEXT_PLAYGROUND_ROUTE,
  TEXT_SHOWCASE_AXE_SCOPE,
  type TextSection,
} from '../text-playground/manifest';

export { TEXT_PLAYGROUND_ROUTE, TEXT_SHOWCASE_AXE_SCOPE };

/* ─── Tags ───────────────────────────────────────────────────── */

export const TextTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const TEXT_TAG_SET = {
  functional: [TextTags.functional] as string[],
  accessibility: [TextTags.accessibility] as string[],
  smoke: [TextTags.functional, TextTags.smoke] as string[],
  functionalAndSmoke: [TextTags.functional, TextTags.smoke] as string[],
  accessibilitySmoke: [TextTags.accessibility, TextTags.smoke] as string[],
};

/* ─── Axe configuration ──────────────────────────────────────── */

/**
 * Shell / QA chrome rules that are not Text-component-specific defects.
 * `heading-order` is disabled because the showcase intentionally renders
 * heading levels non-sequentially to demonstrate the `as` prop.
 */
export const TEXT_AXE_SHELL_DISABLE = [
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
  'scrollable-region-focusable',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const TEXT_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'text-axe-violations.json',
);

/* ─── Logging ────────────────────────────────────────────────── */

const LOG_PREFIX = '[Text QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

/* ─── Navigation ──────────────────────────────────────────────── */

export async function openTextTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Text playground', async () => {
    await page.goto(TEXT_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab must be visible',
    ).toBeVisible({ timeout: 15_000 });
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Text', level: 1 }),
      'Text page heading must be visible',
    ).toBeVisible({ timeout: 15_000 });
    await page
      .locator('[data-section="text-qa-default"]')
      .waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console must have no errors during Text load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

/* ─── Theme helpers ──────────────────────────────────────────── */

/* ─── Section helpers ────────────────────────────────────────── */

export async function expectSectionVisible(
  page: Page,
  sectionId: TextSection,
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(band, `Story band "${sectionId}" must be visible`).toBeVisible();
}

/* ─── Axe helpers ────────────────────────────────────────────── */

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

export function configureTextAxeBuilder(
  page: Page,
  options: ConfigureAxeOptions,
): AxeBuilder {
  const disable: string[] = [...TEXT_AXE_SHELL_DISABLE];
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
    const results = await configureTextAxeBuilder(page, options).analyze();
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
    TEXT_AXE_ARTIFACT_JSON,
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
      reportFileName: 'text-accessibility-axe-report.html',
      projectKey: 'Text QA Playground',
      customSummary: `Text QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/text-summary.json.`,
    },
  });
}
