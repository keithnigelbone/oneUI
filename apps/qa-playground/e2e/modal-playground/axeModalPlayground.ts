import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults, Result } from 'axe-core';
import type { Page } from 'playwright/test';

import { MODAL_SHOWCASE_AXE_SCOPE } from './manifest';

export const MODAL_AXE_JSON_OUT = join(process.cwd(), 'test-results', 'modal-axe-violations.json');

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

export function formatAxeViolations(violations: Result[]): string {
  if (!violations.length) return 'No violations';
  return violations
    .map(
      (v) =>
        `\n[${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n` +
        `  Description: ${v.description}\n` +
        `  Help: ${v.helpUrl ?? ''}\n` +
        `  Elements: ${v.nodes.map((n) => n.html ?? '').join(', ')}`,
    )
    .join('\n');
}

export function seriousOrCritical(violations: Result[]): Result[] {
return violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
}

export function writeModalAxeArtefact(results: AxeResults): void {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    MODAL_AXE_JSON_OUT,
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

export async function runModalAxePageScan(
  page: Page,
  include = MODAL_SHOWCASE_AXE_SCOPE,
): Promise<AxeResults> {
  return new AxeBuilder({ page }).include(include).withTags([...WCAG_AA_TAGS]).analyze();
}

export function writeModalAxeHtmlReport(results: AxeResults): void {
  createHtmlReport({
    results,
    options: {
      outputDir: 'test-results',
      reportFileName: 'modal-accessibility-axe-report.html',
      projectKey: 'Modal QA Playground',
      customSummary: 'Modal QA Playground — axe WCAG 2.1 AA. Ingest via pnpm qa:modal:report.',
    },
  });
}
