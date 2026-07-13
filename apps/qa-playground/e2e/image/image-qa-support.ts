/**
 * Shared helpers for Image Playwright automation.
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

import { imageRoot } from '../image-playground/imageHelpers';
import {
  IMAGE_FIGMA_VALIDATION_TAB,
  IMAGE_PLAYGROUND_ROUTE,
  IMAGE_ROOT_TESTIDS,
  IMAGE_SHOWCASE_AXE_SCOPE,
  type IMAGE_DATA_SECTIONS,
} from '../image-playground/manifest';

export { IMAGE_FIGMA_VALIDATION_TAB, IMAGE_PLAYGROUND_ROUTE, IMAGE_SHOWCASE_AXE_SCOPE };

export const ImageTags = {
  functional: '@Functional',
  accessibility: '@Accessibility',
  smoke: '@Smoke',
} as const;

export const IMAGE_TAG_SET = {
  functional: [ImageTags.functional],
  accessibility: [ImageTags.accessibility],
  smoke: [ImageTags.functional, ImageTags.smoke],
} as const;

const LOG_PREFIX = '[Image QA]';

export const IMAGE_AXE_SHELL_DISABLE = [
  'scrollable-region-focusable',
  'heading-order',
  'landmark-no-duplicate-banner',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export const IMAGE_AXE_ARTIFACT_JSON = join(process.cwd(), 'test-results', 'image-axe-violations.json');

export function qaLog(message: string, detail?: Record<string, unknown>): void {
  const extra = detail ? ` ${JSON.stringify(detail)}` : '';
  console.log(`${LOG_PREFIX} ${message}${extra}`);
}

export async function qaStep<T>(title: string, body: () => Promise<T>): Promise<T> {
  qaLog(`STEP: ${title}`);
  return test.step(title, body);
}

export { imageRoot };

export async function openImageTestScenarios(page: Page): Promise<void> {
  await qaStep('Navigate to Image playground', async () => {
    await page.goto(IMAGE_PLAYGROUND_ROUTE);
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
      page.getByRole('heading', { name: 'Image', level: 1 }),
      'Image page heading should be visible',
    ).toBeVisible();
    await imageRoot(page, IMAGE_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
  });
}

export async function openImageFigmaValidationTab(page: Page): Promise<void> {
  await qaStep('Open Image Figma Validation tab', async () => {
    await page.getByRole('tab', { name: IMAGE_FIGMA_VALIDATION_TAB }).click();
    await expect(page.getByTestId('figma-image-aspect-grid')).toBeVisible({ timeout: 90_000 });
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

export async function assertNoConsoleErrors(
  errors: string[],
  options?: { allowBrokenImageResourceErrors?: boolean },
): Promise<void> {
  const filtered =
    options?.allowBrokenImageResourceErrors === true
      ? errors.filter(
          (e) =>
            !/invalid\.example|Failed to load resource|404|net::ERR|favicon|ERR_NAME_NOT_RESOLVED/i.test(
              e,
            ),
        )
      : errors;
  expect(
    filtered,
    `Browser console should have no unexpected errors.\n${filtered.join('\n')}`,
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
  sectionId: (typeof IMAGE_DATA_SECTIONS)[number],
): Promise<void> {
  await expect(async () => {
    const band = page.locator(`[data-section="${sectionId}"]`);
    await band.scrollIntoViewIfNeeded();
    await expect(band, `Story band "${sectionId}" should be visible`).toBeVisible();
  }).toPass({ timeout: 15_000 });
}

/** Scroll broken-image fixture into view and surface fallback UI (lazy load / DNS timing). */
async function triggerImageErrorIfNeeded(root: ReturnType<typeof imageRoot>): Promise<void> {
  const img = root.locator('img').first();
  if ((await img.count()) === 0) return;
  await img.evaluate((el) => {
    el.dispatchEvent(new Event('error'));
  });
}

export async function waitForBrokenImageFallback(page: Page, testId: string): Promise<void> {
  const root = imageRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  await expect(async () => {
    const svg = root.locator('svg').first();
    if (!(await svg.isVisible())) {
      await triggerImageErrorIfNeeded(root);
    }
    await expect(svg).toBeVisible();
  }).toPass({ timeout: 15_000 });
}

export async function waitForCustomImageFallback(
  page: Page,
  testId: string,
  text: string,
): Promise<void> {
  const root = imageRoot(page, testId);
  await root.scrollIntoViewIfNeeded();
  await expect(async () => {
    const label = root.getByText(text);
    if (!(await label.isVisible())) {
      await triggerImageErrorIfNeeded(root);
    }
    await expect(label).toBeVisible();
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
    IMAGE_AXE_ARTIFACT_JSON,
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
      reportFileName: 'image-accessibility-axe-report.html',
      projectKey: 'Image QA Playground',
      customSummary: `Image QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/image-summary.json.`,
    },
  });
}

export type ConfigureImageAxeOptions = {
  scopeLabel: string;
  include?: string;
  exclude?: string;
  tags?: readonly string[];
  rules?: string[];
};

export function configureImageAxeBuilder(page: Page, options: ConfigureImageAxeOptions): AxeBuilder {
  let builder = new AxeBuilder({ page }).disableRules([...IMAGE_AXE_SHELL_DISABLE]);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags?.length) builder = builder.withTags([...options.tags]);
  if (options.rules?.length) builder = builder.withRules([...options.rules]);
  return builder;
}

export async function runAxeScan(page: Page, options: ConfigureImageAxeOptions): Promise<AxeResults> {
  return qaStep(`axe: ${options.scopeLabel}`, async () => {
    const results = await configureImageAxeBuilder(page, options).analyze();
    const blocking = blockingAxeViolations(results.violations);
    expect(
      blocking,
      `${options.scopeLabel} must have no serious/critical axe violations.\n${formatAxeViolations(blocking)}`,
    ).toHaveLength(0);
    return results;
  });
}
