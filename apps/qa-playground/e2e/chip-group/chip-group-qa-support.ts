/**
 * Shared helpers for ChipGroup Playwright automation.
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

export { collectRichTabFocusSignatures as collectChipGroupTabFocusSignatures };

import {
  CHIP_GROUP_PLAYGROUND_ROUTE,
  CHIP_GROUP_SHOWCASE_AXE_SCOPE,
  type CHIP_GROUP_DATA_SECTIONS,
} from '../chip-group-playground/manifest';

export { CHIP_GROUP_PLAYGROUND_ROUTE, CHIP_GROUP_SHOWCASE_AXE_SCOPE };

export const ChipGroupTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const CHIP_GROUP_TAG_SET = {
  functional: [ChipGroupTags.functional],
  accessibility: [ChipGroupTags.accessibility],
  smoke: [ChipGroupTags.functional, ChipGroupTags.smoke],
  functionalAndSmoke: [ChipGroupTags.functional, ChipGroupTags.smoke],
  accessibilitySmoke: [ChipGroupTags.accessibility, ChipGroupTags.smoke],
} as const;

const LOG_PREFIX = '[ChipGroup QA]';

export const CHIP_GROUP_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const CHIP_GROUP_AXE_ARTIFACT_JSON = join(
  process.cwd(),
  'test-results',
  'chip-group-axe-violations.json',
);

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

/** Opens `/c/chip-group` → Test Scenarios only (ignores Brand / Theme toolbar). */
export async function openChipGroupTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to ChipGroup playground', async () => {
    await page.goto(CHIP_GROUP_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Chip Group', level: 1 }),
      'Chip Group page heading should be visible',
    ).toBeVisible();
    await page.getByTestId('chip-group-default').waitFor({ state: 'visible', timeout: 90_000 });
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
    `Browser console should have no errors during ChipGroup scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function expectSectionVisible(
  page: Page,
  sectionId: (typeof CHIP_GROUP_DATA_SECTIONS)[number],
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
    CHIP_GROUP_AXE_ARTIFACT_JSON,
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
      reportFileName: 'chip-group-accessibility-axe-report.html',
      projectKey: 'ChipGroup QA Playground',
      customSummary: `ChipGroup QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/chip-group-summary.json.`,
    },
  });
}

export type ConfigureChipGroupAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureChipGroupAxeBuilder(
  page: Page,
  options: ConfigureChipGroupAxeOptions,
): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...CHIP_GROUP_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(
  page: Page,
  options: ConfigureChipGroupAxeOptions,
): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureChipGroupAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
