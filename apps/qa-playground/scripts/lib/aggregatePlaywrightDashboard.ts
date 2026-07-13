/**
 * Aggregates Playwright JSON reporter output into dashboard data.
 */
import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import { parseReportTimestamp } from '../../src/lib/qa/testing/reportTime.ts';
import { extractQaBugs, type QaBugReport } from './extractQaBugs';
import { walkPlaywrightSuites, type PwSuite, type PwTestResult } from './playwrightReportWalk';

export type SuiteType = 'functional' | 'accessibility' | 'visual';

export type SuiteCounts = { passed: number; failed: number; skipped: number };

export type TestCaseRow = {
  name: string;
  suite: SuiteType;
  error?: string;
  durationMs?: number;
};

export type FailedTestCase = TestCaseRow;
export type SkippedTestCase = TestCaseRow;
export type PassedTestCase = TestCaseRow;

export type ComponentDashboard = {
  slug: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  retries: number;
  durationMs: number;
  duration: string;
  lastRun: string;
  /** Epoch ms — Playwright run time from summary message, or file mtime fallback. */
  lastRunMs: number;
  source: 'playwright' | 'summary';
  suites: Record<SuiteType, SuiteCounts>;
  failedTests: FailedTestCase[];
  skippedTests: SkippedTestCase[];
  passedTests: PassedTestCase[];
};

export type FailedTestRow = FailedTestCase & {
  component: string;
  slug: string;
};

export type SkippedTestRow = SkippedTestCase & {
  component: string;
  slug: string;
};

export type PassedTestRow = PassedTestCase & {
  component: string;
  slug: string;
};

export type DashboardSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  retries: number;
  successRate: string;
  duration: string;
  durationMs: number;
  lastRun: string;
  lastRunMs: number;
  testType: string;
  componentCount: number;
  stableComponents: number;
  unstableComponents: number;
  sources: { playwright: number; summary: number };
};

export type DashboardData = {
  generatedAt: string;
  summary: DashboardSummary;
  components: ComponentDashboard[];
  failedTests: FailedTestRow[];
  skippedTests: SkippedTestRow[];
  passedTests: PassedTestRow[];
  bugs: QaBugReport;
};

const EMPTY_SUITE: SuiteCounts = { passed: 0, failed: 0, skipped: 0 };

function emptySuites(): Record<SuiteType, SuiteCounts> {
  return {
    functional: { ...EMPTY_SUITE },
    accessibility: { ...EMPTY_SUITE },
    visual: { ...EMPTY_SUITE },
  };
}

export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

export function resolveSuiteType(chain: string[], caseTitle: string): SuiteType {
  const chainLower = chain.join(' ').toLowerCase();
  const titleLower = caseTitle.toLowerCase();
  if (chain.includes('Accessibility') || titleLower.startsWith('[a11y]')) return 'accessibility';
  if (
    chain.includes('Visual') ||
    chainLower.includes('visual') ||
    titleLower.includes('visual') ||
    titleLower.includes('responsive')
  ) {
    return 'visual';
  }
  if (chain.includes('Functional') || titleLower.startsWith('[fn]')) return 'functional';
  return 'functional';
}

function pickLatestResult(results: PwTestResult[] | undefined): PwTestResult | undefined {
  if (!results?.length) return undefined;
  return results[results.length - 1];
}

function analyzeTestResults(results: PwTestResult[] | undefined): {
  status: string;
  durationMs: number;
  retries: number;
  flaky: boolean;
} {
  if (!results?.length) {
    return { status: 'unknown', durationMs: 0, retries: 0, flaky: false };
  }
  const last = pickLatestResult(results);
  const status = (last?.status as string | undefined) ?? 'unknown';
  const durationMs =
    results.reduce((sum, r) => sum + (typeof r.duration === 'number' ? r.duration : 0), 0) || 0;
  const retries = Math.max(0, results.length - 1);
  const flaky =
    retries > 0 &&
    status === 'passed' &&
    results.slice(0, -1).some((r) => r.status === 'failed' || r.status === 'flaky');
  return { status, durationMs, retries, flaky };
}

function walkRowsWithSuiteType(suites: PwSuite[] | undefined, ancestors: string[] = []) {
  if (!suites?.length) {
    return [] as Array<{
      name: string;
      suiteType: SuiteType;
      status: string;
      durationMs: number;
      retries: number;
      flaky: boolean;
      error?: string;
    }>;
  }

  const rows: Array<{
    name: string;
    suiteType: SuiteType;
    status: string;
    durationMs: number;
    retries: number;
    flaky: boolean;
    error?: string;
  }> = [];

  for (const s of suites) {
    const title = typeof s.title === 'string' ? s.title : '';
    const chain = title ? [...ancestors, title] : [...ancestors];
    if (s.suites?.length) rows.push(...walkRowsWithSuiteType(s.suites, chain));

    const collectSpec = (
      specTitle: string,
      tests: { title?: string; results?: PwTestResult[] }[] | undefined,
    ) => {
      const suiteType = resolveSuiteType(chain, specTitle);
      for (const t of tests ?? []) {
        const testTitle = typeof t.title === 'string' && t.title.trim() ? t.title : specTitle;
        const meta = analyzeTestResults(t.results);
        const last = pickLatestResult(t.results);
        rows.push({
          name: testTitle,
          suiteType,
          ...meta,
          error: last?.error?.message,
        });
      }
    };

    for (const spec of s.specs ?? []) {
      collectSpec(typeof spec.title === 'string' ? spec.title : '', spec.tests);
    }
    for (const t of s.tests ?? []) {
      collectSpec(typeof t.title === 'string' ? t.title : '', [t]);
    }
  }

  return rows;
}

export function formatDurationMs(ms: number): string {
  if (ms <= 0) return '00m:00s:000ms';
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const rem = ms % 1000;
  return `${String(m).padStart(2, '0')}m:${String(s).padStart(2, '0')}s:${String(rem).padStart(3, '0')}ms`;
}

export function formatLastRun(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function resolveLastRunMs(message: string | undefined, fileMtime: Date): number {
  const fromMessage = parseReportTimestamp(message);
  if (fromMessage) return fromMessage.getTime();
  return fileMtime.getTime();
}

function sumSummaryCaseDurations(raw: SummaryJson): number {
  let total = 0;
  const suiteKeys = ['functional', 'accessibility', 'visual', 'performance'] as const;
  for (const key of suiteKeys) {
    for (const testCase of raw.suites?.[key]?.cases ?? []) {
      if (typeof testCase.durationMs === 'number' && testCase.durationMs > 0) {
        total += testCase.durationMs;
      }
    }
  }
  return total;
}

export function playwrightSlugFromFile(filePath: string): string {
  const base = basename(filePath);
  if (base === 'badge-playground-test-results.json') return 'badge';
  const m = base.match(/^(.+)-playwright\.json$/);
  return m?.[1] ?? base.replace(/\.json$/, '');
}

export function aggregatePlaywrightJson(filePath: string): ComponentDashboard {
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as { suites?: PwSuite[] };
  const slug = playwrightSlugFromFile(filePath);
  const rows = walkRowsWithSuiteType(raw.suites, []);
  const suites = emptySuites();

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;
  let retries = 0;
  let durationMs = 0;

  for (const row of rows) {
    durationMs += row.durationMs;
    retries += row.retries;
    if (row.flaky) flaky += 1;

    const bucket = suites[row.suiteType];
    if (row.status === 'passed') {
      passed += 1;
      bucket.passed += 1;
    } else if (row.status === 'skipped') {
      skipped += 1;
      bucket.skipped += 1;
    } else if (row.status === 'failed' || row.status === 'timedOut' || row.status === 'interrupted') {
      failed += 1;
      bucket.failed += 1;
    }
  }

  const failedTests: FailedTestCase[] = rows
    .filter(
      (row) =>
        row.status === 'failed' || row.status === 'timedOut' || row.status === 'interrupted',
    )
    .map((row) => ({
      name: row.name,
      suite: row.suiteType,
      error: row.error,
      durationMs: row.durationMs,
    }));

  const skippedTests: SkippedTestCase[] = rows
    .filter((row) => row.status === 'skipped')
    .map((row) => ({
      name: row.name,
      suite: row.suiteType,
      durationMs: row.durationMs,
    }));

  const passedTests: PassedTestCase[] = rows
    .filter((row) => row.status === 'passed')
    .map((row) => ({
      name: row.name,
      suite: row.suiteType,
      durationMs: row.durationMs,
    }));

  const mtime = statSync(filePath).mtime;
  const lastRunMs = mtime.getTime();

  return {
    slug,
    name: slugToDisplayName(slug),
    total: passed + failed + skipped,
    passed,
    failed,
    skipped,
    flaky,
    retries,
    durationMs,
    duration: formatDurationMs(durationMs),
    lastRun: formatLastRun(mtime),
    lastRunMs,
    source: 'playwright',
    suites,
    failedTests,
    skippedTests,
    passedTests,
  };
}

type SummaryCase = {
  name: string;
  status: string;
  error?: string;
  durationMs?: number;
};

type SummarySuite = {
  passed?: number;
  failed?: number;
  skipped?: number;
  cases?: SummaryCase[];
};

/** When `cases` exists, overwrite suite counters from rows so totals match the case list. */
function applySuiteCountsFromCases(src: SummarySuite | undefined): void {
  if (!src?.cases?.length) return;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const c of src.cases) {
    if (c.status === 'passed') passed += 1;
    else if (c.status === 'skipped') skipped += 1;
    else failed += 1;
  }
  src.passed = passed;
  src.failed = failed;
  src.skipped = skipped;
}

type SummaryJson = {
  slug?: string;
  message?: string;
  suites?: {
    functional?: SummarySuite;
    accessibility?: SummarySuite;
    performance?: SummarySuite;
    visual?: SummarySuite;
  };
};

function testsFromSummaryByStatus(
  raw: SummaryJson,
  status: 'passed' | 'failed' | 'skipped',
): TestCaseRow[] {
  const rows: TestCaseRow[] = [];
  const entries: Array<[SuiteType, SummarySuite | undefined]> = [
    ['functional', raw.suites?.functional],
    ['accessibility', raw.suites?.accessibility],
    ['visual', raw.suites?.visual],
  ];
  for (const [suite, src] of entries) {
    for (const testCase of src?.cases ?? []) {
      if (testCase.status !== status) continue;
      rows.push({
        name: testCase.name,
        suite,
        error: testCase.error,
        durationMs: testCase.durationMs,
      });
    }
  }
  return rows;
}

export function aggregateSummaryJson(filePath: string): ComponentDashboard {
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as SummaryJson;
  const slug = raw.slug ?? basename(filePath).replace(/-summary\.json$/, '');

  const snap = raw.suites;
  if (snap) {
    for (const key of ['functional', 'accessibility', 'visual', 'performance'] as const) {
      applySuiteCountsFromCases(snap[key]);
    }
  }

  const suites = emptySuites();

  const mapSuite = (key: SuiteType, src?: SummarySuite) => {
    if (!src) return;
    suites[key].passed = src.passed ?? 0;
    suites[key].failed = src.failed ?? 0;
    suites[key].skipped = src.skipped ?? 0;
  };

  mapSuite('functional', raw.suites?.functional);
  mapSuite('accessibility', raw.suites?.accessibility);
  mapSuite('visual', raw.suites?.visual);

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const bucket of Object.values(suites)) {
    passed += bucket.passed;
    failed += bucket.failed;
    skipped += bucket.skipped;
  }

  const mtime = statSync(filePath).mtime;
  const durationMs = sumSummaryCaseDurations(raw);
  const lastRunMs = resolveLastRunMs(raw.message, mtime);

  return {
    slug,
    name: slugToDisplayName(slug),
    total: passed + failed + skipped,
    passed,
    failed,
    skipped,
    flaky: 0,
    retries: 0,
    durationMs,
    duration: formatDurationMs(durationMs),
    lastRun: formatLastRun(new Date(lastRunMs)),
    lastRunMs,
    source: 'summary',
    suites,
    failedTests: testsFromSummaryByStatus(raw, 'failed'),
    skippedTests: testsFromSummaryByStatus(raw, 'skipped'),
    passedTests: testsFromSummaryByStatus(raw, 'passed'),
  };
}

export function buildDashboardData(components: ComponentDashboard[]): DashboardData {
  const sorted = [...components].sort((a, b) => a.name.localeCompare(b.name));

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;
  let retries = 0;
  let durationMs = 0;
  let latestMs = 0;
  let playwrightSources = 0;
  let summarySources = 0;
  let stableComponents = 0;
  let unstableComponents = 0;

  for (const c of sorted) {
    passed += c.passed;
    failed += c.failed;
    skipped += c.skipped;
    flaky += c.flaky;
    retries += c.retries;
    durationMs += c.durationMs;
    if (c.failed > 0) unstableComponents += 1;
    else stableComponents += 1;
    if (c.source === 'playwright') playwrightSources += 1;
    else summarySources += 1;
    if (c.lastRunMs > latestMs) latestMs = c.lastRunMs;
  }

  const total = passed + failed + skipped;
  const successRate = total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0.00%';

  const failedTests: FailedTestRow[] = sorted.flatMap((component) =>
    component.failedTests.map((testCase) => ({
      ...testCase,
      component: component.name,
      slug: component.slug,
    })),
  );

  const skippedTests: SkippedTestRow[] = sorted.flatMap((component) =>
    component.skippedTests.map((testCase) => ({
      ...testCase,
      component: component.name,
      slug: component.slug,
    })),
  );

  const passedTests: PassedTestRow[] = sorted.flatMap((component) =>
    component.passedTests.map((testCase) => ({
      ...testCase,
      component: component.name,
      slug: component.slug,
    })),
  );

  const bugs = extractQaBugs(failedTests);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      skipped,
      flaky,
      retries,
      successRate,
      duration: formatDurationMs(durationMs),
      durationMs,
      lastRun: latestMs > 0 ? formatLastRun(new Date(latestMs)) : '—',
      lastRunMs: latestMs,
      testType: 'QA Playground — Playwright component runs',
      componentCount: sorted.length,
      stableComponents,
      unstableComponents,
      sources: { playwright: playwrightSources, summary: summarySources },
    },
    components: sorted,
    failedTests,
    skippedTests,
    passedTests,
    bugs,
  };
}

/** Flat walk export for tests / debugging. */
export function flattenPlaywrightFile(filePath: string) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as { suites?: PwSuite[] };
  return walkPlaywrightSuites(raw.suites, []);
}
