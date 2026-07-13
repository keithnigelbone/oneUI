import type { QAPlaywrightRunResponse, QAReportSuiteId } from './types';
import { parseHistoryFile } from './qaReportHistory';
import {
  QA_PLAYWRIGHT_SLUGS,
  isQaPlaywrightSlug,
  qaPlaywrightReportHistoryUrl,
  qaPlaywrightReportUrl,
} from './qaPlaywrightSlugs';
import type { QAPlaywrightReportHistoryFile } from './types';

export type ComponentTestStability = 'stable' | 'unstable' | 'under-development';

export type ComponentTestStabilityFilter = 'all' | ComponentTestStability;

const SUITE_IDS: QAReportSuiteId[] = ['functional', 'accessibility', 'performance'];

/** Total test rows across functional, accessibility, and performance suites. */
export function getTotalTestCount(report: QAPlaywrightRunResponse | null | undefined): number {
  if (!report?.suites) return 0;
  let total = 0;
  for (const id of SUITE_IDS) {
    const suite = report.suites[id];
    if (!suite) continue;
    total += (suite.passed ?? 0) + (suite.failed ?? 0) + (suite.skipped ?? 0);
  }
  return total;
}

/** Total failed test rows across functional, accessibility, and performance suites. */
export function getTotalFailedTests(report: QAPlaywrightRunResponse | null | undefined): number {
  if (!report?.suites) return 0;
  let total = 0;
  for (const id of SUITE_IDS) {
    total += report.suites[id]?.failed ?? 0;
  }
  return total;
}

/** True when the slug has an ingested Playwright summary with at least one test row. */
export function hasPlaywrightTestCoverage(
  slug: string,
  report: QAPlaywrightRunResponse | null | undefined,
): boolean {
  if (!isQaPlaywrightSlug(slug)) return false;
  return getTotalTestCount(report) > 0;
}

export function getComponentTestStability(
  slug: string,
  report: QAPlaywrightRunResponse | null | undefined,
): ComponentTestStability {
  if (!hasPlaywrightTestCoverage(slug, report)) {
    return 'under-development';
  }
  return getTotalFailedTests(report) > 0 ? 'unstable' : 'stable';
}

export async function fetchQaPlaywrightReport(slug: string): Promise<QAPlaywrightRunResponse | null> {
  try {
    const res = await fetch(qaPlaywrightReportUrl(slug, Date.now()), { cache: 'no-store' });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    if (!text.startsWith('{')) return null;
    return JSON.parse(text) as QAPlaywrightRunResponse;
  } catch {
    return null;
  }
}

export async function fetchQaPlaywrightReportHistory(
  slug: string,
): Promise<QAPlaywrightReportHistoryFile | null> {
  try {
    const res = await fetch(qaPlaywrightReportHistoryUrl(slug, Date.now()), { cache: 'no-store' });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    if (!text.startsWith('{')) return null;
    return parseHistoryFile(JSON.parse(text));
  } catch {
    return null;
  }
}

/** Loads ingested summaries for Playwright slugs and maps each to stable / unstable / under-development. */
export async function fetchCatalogStabilityIndex(): Promise<Map<string, ComponentTestStability>> {
  const results = await Promise.all(
    QA_PLAYWRIGHT_SLUGS.map(async (slug) => {
      const report = await fetchQaPlaywrightReport(slug);
      return [slug, getComponentTestStability(slug, report)] as const;
    }),
  );
  return new Map(results);
}

export function resolveCatalogEntryStability(
  slug: string,
  stabilityBySlug: Map<string, ComponentTestStability>,
): ComponentTestStability {
  if (!isQaPlaywrightSlug(slug)) {
    return 'under-development';
  }
  return stabilityBySlug.get(slug) ?? 'under-development';
}

export function countCatalogByTestStability(
  slugs: readonly string[],
  stabilityBySlug: Map<string, ComponentTestStability>,
): { stable: number; unstable: number; underDevelopment: number; total: number } {
  let stable = 0;
  let unstable = 0;
  let underDevelopment = 0;
  for (const slug of slugs) {
    const stability = resolveCatalogEntryStability(slug, stabilityBySlug);
    if (stability === 'unstable') {
      unstable += 1;
    } else if (stability === 'under-development') {
      underDevelopment += 1;
    } else {
      stable += 1;
    }
  }
  return { stable, unstable, underDevelopment, total: slugs.length };
}
