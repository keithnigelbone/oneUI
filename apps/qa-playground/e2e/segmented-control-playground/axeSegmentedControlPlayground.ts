import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults } from 'axe-core';
import { expect, type Page } from 'playwright/test';

import { SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE } from './manifest';

export const SEGMENTED_CONTROL_AXE_JSON_OUT = join(
  process.cwd(),
  'test-results',
  'segmented-control-axe-violations.json',
);

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export function formatAxeViolations(
  violations: { impact?: string; id: string; description: string; helpUrl?: string; nodes?: { html?: string }[] }[],
): string {
  if (!violations.length) return 'No violations';
  return violations
    .map(
      (v) =>
        `\n[${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n` +
        `  Description: ${v.description}\n` +
        `  Help: ${v.helpUrl ?? ''}\n` +
        `  Elements: ${(v.nodes ?? []).map((n) => n.html ?? '').join(', ')}`,
    )
    .join('\n');
}

export function seriousOrCritical(violations: { impact?: string; id?: string }[]) {
  return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

export function writeSegmentedControlAxeArtefact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    SEGMENTED_CONTROL_AXE_JSON_OUT,
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

export function writeSegmentedControlAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'segmented-control-accessibility-axe-report.html',
      projectKey: 'SegmentedControl QA Playground',
      customSummary: 'SegmentedControl QA — axe WCAG 2.1 AA on Test Scenarios bands.',
    },
  });
}

export type SegmentedControlAxeBuilderOptions = {
  include?: string;
  exclude?: string | readonly string[];
};

export function configureSegmentedControlAxeBuilder(
  page: Page,
  options: SegmentedControlAxeBuilderOptions = {},
): AxeBuilder {
  const include = options.include ?? SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE;
  let builder = new AxeBuilder({ page }).include(include);

  const extraExclude = options.exclude;
  if (extraExclude) {
    const selectors = Array.isArray(extraExclude) ? extraExclude : extraExclude.split(',');
    for (const selector of selectors.map((s) => s.trim()).filter(Boolean)) {
      builder = builder.exclude(selector);
    }
  }

  return builder;
}

export async function runSegmentedControlAxePageScan(
  page: Page,
  include = SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE,
): Promise<AxeResults> {
  return configureSegmentedControlAxeBuilder(page, { include }).withTags([...WCAG_AA_TAGS]).analyze();
}

/** Legacy single-scan helper — preserved for existing accessibility spec import. */
export async function axeSegmentedControlPlayground(page: Page): Promise<void> {
  const results = await runSegmentedControlAxePageScan(page);
  writeSegmentedControlAxeArtefact(results);
  writeSegmentedControlAxeHtmlReport(results);
  expect(seriousOrCritical(results.violations), formatAxeViolations(results.violations)).toHaveLength(0);
}
