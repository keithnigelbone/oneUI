/**
 * Shared helpers for Chip Playwright automation.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import { expect, test, type Page } from 'playwright/test';
import {
  collectRichTabFocusSignatures,
  switchPlaygroundToDarkTheme as switchPlaygroundToDarkThemeCore,
} from '../shared/playgroundTheme';

import {
  CHIP_PLAYGROUND_ROUTE,
  CHIP_SHOWCASE_AXE_SCOPE,
  type CHIP_DATA_SECTIONS,
} from '../chip-playground/manifest';

export { CHIP_PLAYGROUND_ROUTE, CHIP_SHOWCASE_AXE_SCOPE };

export const ChipTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const CHIP_TAG_SET = {
  functional: [ChipTags.functional],
  accessibility: [ChipTags.accessibility],
  smoke: [ChipTags.functional, ChipTags.smoke],
  functionalAndSmoke: [ChipTags.functional, ChipTags.smoke],
  accessibilitySmoke: [ChipTags.accessibility, ChipTags.smoke],
} as const;

const LOG_PREFIX = '[Chip QA]';

/** QA shell chrome — not Chip defects. */
export const CHIP_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const CHIP_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'chip-axe-violations.json');

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

/** Opens `/c/chip` → Test Scenarios only (ignores Brand / Theme toolbar bands). */
export async function openChipTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Chip playground', async () => {
    await page.goto(CHIP_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Chip', level: 1 }),
      'Chip page heading should be visible',
    ).toBeVisible();
    await page.getByTestId('chip-default').waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during Chip scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

/** Rich focus fingerprint — chip buttons lack data-testid on the focused node. */
export const collectChipTabFocusSignatures = collectRichTabFocusSignatures;

export async function expectSectionVisible(
  page: Page,
  sectionId: (typeof CHIP_DATA_SECTIONS)[number],
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
    CHIP_AXE_ARTIFACT_JSON,
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
      reportFileName: 'chip-accessibility-axe-report.html',
      projectKey: 'Chip QA Playground',
      customSummary: `Chip QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/chip-summary.json.`,
    },
  });
}

export type ConfigureChipAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureChipAxeBuilder(page: Page, options: ConfigureChipAxeOptions): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...CHIP_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: ConfigureChipAxeOptions): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureChipAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
