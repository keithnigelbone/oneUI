import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults } from 'axe-core';
import type { Page } from 'playwright/test';

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

const AXE_JSON_OUT = join(process.cwd(), 'test-results', 'input-field-axe-violations.json');

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
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

export async function runIffAxePageScan(page: Page, scope: string): Promise<AxeResults> {
  return new AxeBuilder({ page }).include(scope).withTags([...WCAG_AA_TAGS]).analyze();
}

export function writeIffAxeArtefact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    AXE_JSON_OUT,
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

export function writeIffAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'input-field-accessibility-axe-report.html',
      projectKey: 'Input Field QA Playground',
      customSummary: `Input Field QA — axe WCAG 2.1 AA (${WCAG_AA_TAGS.join(', ')}). Pair with public/qa-reports/input-field-summary.json.`,
    },
  });
}
