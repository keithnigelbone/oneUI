/**
 * Reads the Vitest JSON report from packages/ui-native/test-results/native-all.json,
 * splits tests by [smoke] / [fn] / [a11y] prefix tags, and writes
 * public/qa-reports/native-summary.json for the QA playground native detail page.
 *
 * Run via: pnpm --filter @oneui/qa-playground ingest:native
 * Or as part of: pnpm qa:native:report
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  QAPlaceholderSuiteReport,
  QAPlaywrightRunResponse,
  QAReportSuiteId,
} from '../src/lib/qa/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MONOREPO_ROOT = join(__dirname, '..', '..', '..');
const VITEST_JSON = join(ROOT, 'native', 'test-results', 'native-all.json');
const OUT = join(ROOT, 'public', 'qa-reports', 'native-summary.json');

// ─── Vitest JSON schema (subset) ─────────────────────────────────────────────

interface VitestAssertionResult {
  ancestorTitles: string[];
  fullName: string;
  title: string;
  status: 'passed' | 'failed' | 'pending' | 'todo';
  duration?: number;
  failureMessages: string[];
}

interface VitestTestResult {
  testFilePath: string;
  status: 'passed' | 'failed';
  assertionResults: VitestAssertionResult[];
}

interface VitestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numSkippedTests?: number;
  success: boolean;
  testResults: VitestTestResult[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptySuite(suite: QAReportSuiteId, msg: string): QAPlaceholderSuiteReport {
  return { suite, passed: 0, failed: 0, skipped: 0, logs: [msg], errors: [] };
}

type CaseRow = NonNullable<QAPlaceholderSuiteReport['cases']>[number];

function tagOf(title: string): 'smoke' | 'fn' | 'a11y' | null {
  if (title.startsWith('[smoke]')) return 'smoke';
  if (title.startsWith('[fn]')) return 'fn';
  if (title.startsWith('[a11y]')) return 'a11y';
  return null;
}

function buildSuite(rows: CaseRow[], suiteId: QAReportSuiteId): QAPlaceholderSuiteReport {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (row.status === 'passed') passed += 1;
    else if (row.status === 'skipped') skipped += 1;
    else {
      failed += 1;
      if (row.error) errors.push(`${row.name}: ${row.error}`);
    }
  }

  return {
    suite: suiteId,
    passed,
    failed,
    skipped,
    logs: [`${rows.length} test(s) in vitest report for ${suiteId}.`],
    errors,
    cases: rows,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync(join(ROOT, 'public', 'qa-reports'), { recursive: true });

  if (!existsSync(VITEST_JSON)) {
    const payload: QAPlaywrightRunResponse = {
      ok: false,
      slug: 'native',
      message: `No Vitest JSON at ${VITEST_JSON}. Run: pnpm --filter @oneui/qa-playground qa:native:test`,
      suites: {
        smoke: emptySuite('smoke', 'Run test:native:report first.'),
        functional: emptySuite('functional', 'Run test:native:report first.'),
        accessibility: emptySuite('accessibility', 'Run test:native:report first.'),
      },
    };
    writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
    console.error(payload.message);
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(VITEST_JSON, 'utf8')) as VitestReport;

  const smokeRows: CaseRow[] = [];
  const fnRows: CaseRow[] = [];
  const a11yRows: CaseRow[] = [];
  const untaggedRows: CaseRow[] = [];

  for (const fileResult of report.testResults) {
    for (const assertion of fileResult.assertionResults) {
      const tag = tagOf(assertion.title);
      const status: CaseRow['status'] =
        assertion.status === 'passed'
          ? 'passed'
          : assertion.status === 'pending'
            ? 'skipped'
            : 'failed';

      const row: CaseRow = {
        name: assertion.fullName,
        status,
        durationMs: assertion.duration,
        error: assertion.failureMessages[0],
      };

      if (tag === 'smoke') smokeRows.push(row);
      else if (tag === 'fn') fnRows.push(row);
      else if (tag === 'a11y') a11yRows.push(row);
      else untaggedRows.push(row);
    }
  }

  const smoke = buildSuite(smokeRows, 'smoke');
  const functional = buildSuite(fnRows, 'functional');
  const accessibility = buildSuite(a11yRows, 'accessibility');

  // Untagged tests (pure-function interface tests) roll into accessibility
  // since they test a11y props — just logged separately for transparency.
  if (untaggedRows.length > 0) {
    accessibility.logs.push(
      `${untaggedRows.length} untagged test(s) (interface-level a11y) are not shown in suites.`,
    );
  }

  const ok = smoke.failed === 0 && functional.failed === 0 && accessibility.failed === 0;

  const payload: QAPlaywrightRunResponse = {
    ok,
    slug: 'native',
    message: ok
      ? `Native component tests OK — ${new Date().toISOString()}`
      : `Native component tests had failures — ${new Date().toISOString()}`,
    suites: { smoke, functional, accessibility },
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${OUT}`);
  if (!ok) process.exit(1);
}

main();
