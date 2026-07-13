/**
 * Shared helpers for Avatar Playwright automation.
 * Keeps specs readable; logs use a consistent prefix for dashboard ingest.
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

import {
  AVATAR_APPEARANCES,
  AVATAR_PLAYGROUND_ROUTE,
  AVATAR_SHOWCASE_AXE_SCOPE,
  type AVATAR_DATA_SECTIONS,
} from '../avatar-playground/manifest';

export { AVATAR_SHOWCASE_AXE_SCOPE };

// ─── Tags (filter with: npx playwright test --grep @Smoke) ───────────────────

export const AvatarTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const AVATAR_TAG_SET = {
  functional: [AvatarTags.functional],
  accessibility: [AvatarTags.accessibility],
  smoke: [AvatarTags.functional, AvatarTags.smoke],
  functionalAndSmoke: [AvatarTags.functional, AvatarTags.smoke],
  accessibilitySmoke: [AvatarTags.accessibility, AvatarTags.smoke],
} as const;

// ─── Dashboard-friendly logging ──────────────────────────────────────────────

const LOG_PREFIX = '[Avatar QA]';

/** Structured console line — picked up in CI logs and manual debugging. */
export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

/** Playwright step with the same log prefix for trace/report readability. */
export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export async function openAvatarTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Avatar playground', async () => {
    await page.goto(AVATAR_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available on the Avatar page',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Avatar', level: 1 }),
      'Avatar page heading should be visible after opening scenarios',
    ).toBeVisible();
  });
}

// ─── Assertions ──────────────────────────────────────────────────────────────

export async function expectAvatarVisible(
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
  sectionId: (typeof AVATAR_DATA_SECTIONS)[number],
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(
    band,
    `Story band "${sectionId}" should be visible on the Avatar playground`,
  ).toBeVisible();
}

/** Read computed colour (always rgb/rgba) for token-safe comparisons. */
export async function readComputedRgb(
  locator: Locator,
  property: 'backgroundColor' | 'color' = 'backgroundColor',
): Promise<string> {
  return locator.evaluate((node, prop) => getComputedStyle(node)[prop], property);
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
    `Browser console should have no errors during Avatar scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

// ─── Theme ─────────────────────────────────────────────────────────────────────

// ─── axe-core ────────────────────────────────────────────────────────────────

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const AVATAR_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'avatar-axe-violations.json');

export const AVATAR_APPEARANCE_A11Y_TESTIDS = [
  'avatar-appearance-auto',
  'avatar-appearance-neutral',
  'avatar-appearance-primary',
  'avatar-appearance-secondary',
  'avatar-appearance-sparkle',
  'avatar-appearance-negative',
  'avatar-appearance-positive',
  'avatar-appearance-warning',
  'avatar-appearance-informative',
  'avatar-appearance-brand-bg',
] as const;

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
    AVATAR_AXE_ARTIFACT_JSON,
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
  qaLog('Wrote axe artefact', { path: AVATAR_AXE_ARTIFACT_JSON, rules: results.violations.length });
}

export function writeAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'avatar-accessibility-axe-report.html',
      projectKey: 'Avatar QA Playground',
      customSummary:
        'Avatar playground — axe-core WCAG 2.1 AA scan. Pair with public/qa-reports/avatar-summary.json in the QA dashboard.',
    },
  });
}

type AxeScanOptions = {
  /** CSS selector passed to AxeBuilder.include — omit for full page. */
  include?: string;
  tags?: readonly string[];
  rules?: readonly string[];
  /** Human label for logs and assertion messages. */
  scopeLabel: string;
};

/**
 * Run axe-core and assert zero serious/critical violations.
 * Wraps scan in test.step for readable HTML reports.
 */
export async function runAxeScan(page: Page, options: AxeScanOptions): Promise<AxeResults> {
  const { include, tags, rules, scopeLabel } = options;

  return qaStep(`Run axe scan — ${scopeLabel}`, async () => {
    let builder = new AxeBuilder({ page });
    if (include) builder = builder.include(include);
    if (tags?.length) builder = builder.withTags([...tags]);
    if (rules?.length) builder = builder.withRules([...rules]);

    const results = await builder.analyze();
    const blocking = blockingAxeViolations(results.violations);

    qaLog(`Axe finished — ${scopeLabel}`, {
      violations: results.violations.length,
      blocking: blocking.length,
    });

    expect(
      blocking,
      `${scopeLabel} must have no serious or critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);

    return results;
  });
}

/** Sample appearance roles used in colour distinctness checks (Group 2.3). */
export const APPEARANCE_COLOUR_SAMPLE = [
  'primary',
  'secondary',
  'positive',
  'warning',
  'neutral',
] as const satisfies readonly (typeof AVATAR_APPEARANCES)[number][];

/** Maps Figma size labels on the playground to code `data-size` values. */
export const FIGMA_TO_CODE_SIZE: Record<string, string> = {
  '2XS': '2xs',
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
  '2XL': '2xl',
};
