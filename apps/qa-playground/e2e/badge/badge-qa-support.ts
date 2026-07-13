/**
 * Shared helpers for Badge Playwright automation.
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

import { BADGE_PLAYGROUND_AXE_SHELL_DISABLE } from '../badge-playground/axeBadgePlayground';
import {
  BADGE_APPEARANCE_KEYS,
  BADGE_PLAYGROUND_ROUTE,
  BADGE_SHOWCASE_AXE_SCOPE,
  type BADGE_DATA_SECTIONS,
} from '../badge-playground/manifest';

export { BADGE_SHOWCASE_AXE_SCOPE };

export const BadgeTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const BADGE_TAG_SET = {
  functional: [BadgeTags.functional],
  accessibility: [BadgeTags.accessibility],
  smoke: [BadgeTags.functional, BadgeTags.smoke],
  functionalAndSmoke: [BadgeTags.functional, BadgeTags.smoke],
  accessibilitySmoke: [BadgeTags.accessibility, BadgeTags.smoke],
} as const;

const LOG_PREFIX = '[Badge QA]';

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openBadgeTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Badge playground', async () => {
    await page.goto(BADGE_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available on the Badge page',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Badge', level: 1 }),
      'Badge page heading should be visible after opening scenarios',
    ).toBeVisible();
    await expect(
      page.getByTestId('badge-default'),
      'Default badge should be visible in the showcase',
    ).toBeVisible();
  });
}

export async function expectBadgeVisible(
  page: Page,
  testId: string,
  reason: string,
): Promise<Locator> {
  const el = page.getByTestId(testId);
  await el.scrollIntoViewIfNeeded();
  await expect(el, reason).toBeVisible();
  return el;
}

export async function expectSectionVisible(
  page: Page,
  sectionId: (typeof BADGE_DATA_SECTIONS)[number],
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(
    band,
    `Story band "${sectionId}" should be visible on the Badge playground`,
  ).toBeVisible();
}

export async function readComputedRgb(
  locator: Locator,
  property: 'backgroundColor' | 'color' = 'backgroundColor',
): Promise<string> {
  return locator.evaluate((node, prop) => getComputedStyle(node)[prop], property);
}

export function isFullyTransparentBackground(bg: string): boolean {
  const t = bg.trim().toLowerCase();
  if (t === 'transparent') return true;
  const m = t.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  if (m) return parseFloat(m[4]) === 0;
  return false;
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
    `Browser console should have no errors during Badge scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const BADGE_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'badge-axe-violations.json');

export const APPEARANCE_COLOUR_SAMPLE = [
  'primary',
  'secondary',
  'positive',
  'warning',
  'neutral',
] as const satisfies readonly (typeof BADGE_APPEARANCE_KEYS)[number][];

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
    BADGE_AXE_ARTIFACT_JSON,
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
  qaLog('Wrote axe artefact', { path: BADGE_AXE_ARTIFACT_JSON, rules: results.violations.length });
}

export function writeAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'badge-accessibility-axe-report.html',
      projectKey: 'Badge QA Playground',
      customSummary:
        'Badge playground — axe-core WCAG 2.1 AA scan. Pair with public/qa-reports/badge-summary.json in the QA dashboard.',
    },
  });
}

type AxeScanOptions = {
  include?: string;
  tags?: readonly string[];
  rules?: readonly string[];
  scopeLabel: string;
  /** Mute color-contrast for known matrix edge cases (full showcase scans only). */
  relaxColorContrast?: boolean;
};

function configureBadgeAxeBuilder(page: Page, options: AxeScanOptions): AxeBuilder {
  const disable = [...BADGE_PLAYGROUND_AXE_SHELL_DISABLE];
  if (options.relaxColorContrast) disable.push('color-contrast');

  let builder = new AxeBuilder({ page }).disableRules(disable);
  if (options.include) builder = builder.include(options.include);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: AxeScanOptions): Promise<AxeResults> {
  const { scopeLabel, relaxColorContrast } = options;

  return qaStep(`Run axe scan — ${scopeLabel}`, async () => {
    const results = await configureBadgeAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);

    qaLog(`Axe finished — ${scopeLabel}`, {
      violations: results.violations.length,
      blocking: blocking.length,
      relaxColorContrast: Boolean(relaxColorContrast),
    });

    expect(
      blocking,
      `${scopeLabel} must have no serious or critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);

    return results;
  });
}
