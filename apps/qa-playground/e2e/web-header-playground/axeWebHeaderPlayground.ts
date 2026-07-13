import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults } from 'axe-core';
import type { Page } from 'playwright/test';

export const WEB_HEADER_AXE_JSON_OUT = join(
  process.cwd(),
  'test-results',
  'web-header-axe-violations.json',
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

export function seriousOrCritical(violations: { impact?: string; id?: string }[]): typeof violations {
  return violations.filter(
    (v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'),
  );
}

export function writeWebHeaderAxeArtefact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    WEB_HEADER_AXE_JSON_OUT,
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

export async function runWebHeaderAxePageScan(
  page: Page,
  include = '[data-section^="web-header-qa-"]',
): Promise<AxeResults> {
  return new AxeBuilder({ page }).include(include).withTags([...WCAG_AA_TAGS]).analyze();
}

export function writeWebHeaderAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'web-header-accessibility-axe-report.html',
      projectKey: 'Web Header QA Playground',
      customSummary: 'Web Header QA — axe WCAG 2.1 AA. Ingest via pnpm qa:web-header:report.',
    },
  });
}
