import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults } from 'axe-core';
import type { Page } from 'playwright/test';

import { RADIO_AXE_ARIA_READONLY_EXCLUDE, RADIO_SHOWCASE_AXE_SCOPE } from './manifest';

export const RADIO_AXE_JSON_OUT = join(process.cwd(), 'test-results', 'radio-axe-violations.json');

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

export function seriousOrCritical(violations: { impact?: string }[]): typeof violations {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

export function writeRadioAxeArtefact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    RADIO_AXE_JSON_OUT,
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

export type RadioAxeBuilderOptions = {
  include?: string;
  /** Additional axe exclude selectors (comma-separated or repeated via array). */
  exclude?: string | readonly string[];
};

export function configureRadioAxeBuilder(
  page: Page,
  options: RadioAxeBuilderOptions = {},
): AxeBuilder {
  const include = options.include ?? RADIO_SHOWCASE_AXE_SCOPE;
  let builder = new AxeBuilder({ page }).include(include).exclude(RADIO_AXE_ARIA_READONLY_EXCLUDE);

  const extraExclude = options.exclude;
  if (extraExclude) {
    const selectors = Array.isArray(extraExclude) ? extraExclude : extraExclude.split(',');
    for (const selector of selectors.map((s) => s.trim()).filter(Boolean)) {
      builder = builder.exclude(selector);
    }
  }

  return builder;
}

export async function runRadioAxePageScan(
  page: Page,
  include = RADIO_SHOWCASE_AXE_SCOPE,
): Promise<AxeResults> {
  return configureRadioAxeBuilder(page, { include }).withTags([...WCAG_AA_TAGS]).analyze();
}

export function writeRadioAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'radio-accessibility-axe-report.html',
      projectKey: 'Radio QA Playground',
      customSummary: `Radio QA Playground — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Ingest via pnpm qa:radio:report.`,
    },
  });
}
