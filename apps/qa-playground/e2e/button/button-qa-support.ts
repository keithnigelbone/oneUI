/**
 * Shared helpers for Button Playwright automation.
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
  BUTTON_PLAYGROUND_ROUTE,
  BUTTON_SHOWCASE_AXE_SCOPE,
  BUTTON_AXE_MATRIX_SECTION,
  type BUTTON_DATA_SECTIONS,
} from '../button-playground/manifest';

export { BUTTON_SHOWCASE_AXE_SCOPE, BUTTON_AXE_MATRIX_SECTION };

export const ButtonTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const BUTTON_TAG_SET = {
  functional: [ButtonTags.functional],
  accessibility: [ButtonTags.accessibility],
  smoke: [ButtonTags.functional, ButtonTags.smoke],
  functionalAndSmoke: [ButtonTags.functional, ButtonTags.smoke],
  accessibilitySmoke: [ButtonTags.accessibility, ButtonTags.smoke],
} as const;

const LOG_PREFIX = '[Button QA]';

/** Axe rules that flag QA app shell / story chrome rather than Button. */
export const BUTTON_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

/** Raised in @oneui/ui — loading hides label from AT but does not set button accessible name. */
export const BUTTON_LOADING_TESTIDS = [
  'btn-loading-true',
  'btn-loading-slots-hidden',
  'btn-combo-4',
] as const;

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export async function openButtonTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Button playground', async () => {
    await page.goto(BUTTON_PLAYGROUND_ROUTE);
    await expect(
      page.getByRole('tab', { name: 'Test Scenarios' }),
      'Test Scenarios tab should be available',
    ).toBeVisible();
  });

  await qaStep('Select the Test Scenarios tab', async () => {
    await page.getByRole('tab', { name: 'Test Scenarios' }).click();
    await expect(
      page.getByRole('heading', { name: 'Button', level: 1 }),
      'Button page heading should be visible',
    ).toBeVisible();
    await expect(
      page.locator('#button-qa-default').getByRole('button', { name: 'Button' }),
      'Default contained button should be visible',
    ).toBeVisible();
  });
}

export async function expectButtonVisible(
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
  sectionId: (typeof BUTTON_DATA_SECTIONS)[number],
): Promise<void> {
  const band = page.locator(`[data-section="${sectionId}"]`);
  await band.scrollIntoViewIfNeeded();
  await expect(
    band,
    `Story band "${sectionId}" should be visible on the Button playground`,
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
    `Browser console should have no errors during Button scenario load.\n${errors.join('\n')}`,
  ).toHaveLength(0);
}

export async function switchPlaygroundToDarkTheme(page: Page): Promise<void> {
  await qaStep('Switch playground to dark theme', () => switchPlaygroundToDarkThemeCore(page));
}

export async function clickPageThemeButton(page: Page): Promise<{ before: string; after: string }> {
  return qaStep('Toggle mode using the toolbar control', () => clickPageThemeButtonCore(page));
}

export async function collectTabFocusSignatures(page: Page, presses = 25): Promise<Set<string>> {
  const seen = new Set<string>();
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    const sig =
      (await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return '';
        const role = el.getAttribute('role') ?? '';
        const testId = el.getAttribute('data-testid') ?? '';
        const id = el.getAttribute('id') ?? '';
        const name = (el as HTMLElement).ariaLabel ?? el.getAttribute('aria-label') ?? '';
        return `${el.tagName}:${role}:${testId}:${id}:${name}`;
      })) ?? '';
    seen.add(sig);
  }
  return seen;
}

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const BUTTON_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'button-axe-violations.json');

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
    BUTTON_AXE_ARTIFACT_JSON,
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
      reportFileName: 'button-accessibility-axe-report.html',
      projectKey: 'Button QA Playground',
      customSummary:
        'Button playground — axe-core WCAG 2.1 AA. Pair with public/qa-reports/button-summary.json.',
    },
  });
}

type AxeScanOptions = {
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: readonly string[];
  scopeLabel: string;
  relaxColorContrast?: boolean;
};

export function configureButtonAxeBuilder(page: Page, options: AxeScanOptions): AxeBuilder {
  const disable = [...BUTTON_AXE_SHELL_DISABLE];
  if (options.relaxColorContrast) disable.push('color-contrast');

  let builder = new AxeBuilder({ page }).disableRules(disable);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: AxeScanOptions): Promise<AxeResults> {
  const { scopeLabel, relaxColorContrast } = options;

  return qaStep(`Run axe scan — ${scopeLabel}`, async () => {
    const results = await configureButtonAxeBuilder(page, options).analyze();
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
