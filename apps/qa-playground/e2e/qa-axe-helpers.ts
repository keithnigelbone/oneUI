import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect } from 'playwright/test';
import type { AxeResults, Result } from 'axe-core';
import { formatAxeViolationsPlain } from '../scripts/lib/axe-plain-language';

export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'] as const;

/** Deferred until QA showcase bands use `<Surface>` for token-aware contrast. */
export const QA_AXE_DEFERRED_RULES = ['color-contrast'] as const;

/** Rules where moderate impact is also treated as a release blocker in QA. */
export const STRICT_MODERATE_RULES = [
  'button-name',
  'role-img-alt',
  'image-alt',
] as const;

export function withoutDeferredAxeRules<T extends { id: string }>(violations: T[]): T[] {
  const deferred = new Set<string>(QA_AXE_DEFERRED_RULES);
  return violations.filter((v) => !deferred.has(v.id));
}

export function seriousOrCriticalAxeViolations<T extends { id: string; impact?: string }>(
  violations: T[],
): T[] {
  return withoutDeferredAxeRules(violations).filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
}

export type BlockingImpact = 'critical' | 'serious' | 'moderate';

export function blockingViolations(
  violations: Result[],
  options?: { includeModerateRules?: readonly string[] },
): Result[] {
  const moderateRules = new Set(options?.includeModerateRules ?? STRICT_MODERATE_RULES);
  return withoutDeferredAxeRules(violations).filter(
    (v) =>
      v.impact === 'critical' ||
      v.impact === 'serious' ||
      (v.impact === 'moderate' && moderateRules.has(v.id)),
  );
}

export function formatAxeViolations(violations: Result[]): string {
  return formatAxeViolationsPlain(violations);
}

/** Fail the test when axe reports blocking violations (no silent green). */
export function expectA11yClean(
  results: AxeResults,
  context: string,
  options?: { includeModerateRules?: readonly string[] },
): void {
  const blocking = blockingViolations(results.violations, options);
  const headline =
    blocking.length === 0
      ? context
      : `${context}\n\nAccessibility check failed:\n${formatAxeViolationsPlain(blocking)}`;
  expect(blocking, headline).toHaveLength(0);
}

export function writeAxeJson(fileName: string, results: AxeResults) {
  mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
  writeFileSync(
    join(process.cwd(), 'test-results', fileName),
    JSON.stringify({
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact ?? 'unknown',
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes?.length ?? 0,
      })),
    }),
    null,
    2,
  );
}
