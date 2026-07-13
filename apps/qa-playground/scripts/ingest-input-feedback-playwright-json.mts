/**
 * Reads Playwright JSON report + optional axe artefact from `test-results/`,
 * writes `public/qa-reports/input-feedback-summary.json` for the Input Feedback QA detail page.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  QAPlaceholderSuiteReport,
  QAPlaywrightRunResponse,
  QAReportSuiteId,
} from '../src/lib/qa/types.ts';
import { walkPlaywrightSuites, type CollectedRow, type PwSuite } from './lib/playwrightReportWalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLAY_JSON = join(ROOT, 'test-results', 'input-feedback-playwright.json');
const AXE_JSON = join(ROOT, 'test-results', 'input-feedback-axe-violations.json');
const OUT = join(ROOT, 'public', 'qa-reports', 'input-feedback-summary.json');

function emptySuite(suite: QAReportSuiteId, logs: string[]): QAPlaceholderSuiteReport {
  return { suite, passed: 0, failed: 0, skipped: 0, logs, errors: [] };
}

function aggregate(rows: CollectedRow[], suiteId: QAReportSuiteId): QAPlaceholderSuiteReport {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const cases: NonNullable<QAPlaceholderSuiteReport['cases']> = [];
  const errors: string[] = [];

  for (const row of rows) {
    const st = row.status;
    if (st === 'passed') passed += 1;
    else if (st === 'skipped') skipped += 1;
    else failed += 1;

    const outcome: 'passed' | 'failed' | 'skipped' =
      st === 'passed' ? 'passed' : st === 'skipped' ? 'skipped' : 'failed';
    cases.push({
      name: row.name,
      status: outcome,
      durationMs: row.durationMs,
      error: row.error,
    });
    if (row.error && outcome === 'failed') {
      errors.push(`${row.name}: ${row.error}`);
    }
  }

  return {
    suite: suiteId,
    passed,
    failed,
    skipped,
    logs: [`${rows.length} test(s) in Playwright report for ${suiteId}.`],
    errors,
    cases,
  };
}

function main() {
  mkdirSync(join(ROOT, 'public', 'qa-reports'), { recursive: true });

  if (!existsSync(PLAY_JSON)) {
    const payload: QAPlaywrightRunResponse = {
      ok: false,
      slug: 'input-feedback',
      message: `No Playwright JSON at ${PLAY_JSON}. Run: pnpm --filter @oneui/qa-playground qa:input-feedback:report`,
      suites: {
        accessibility: emptySuite('accessibility', ['Run qa:input-feedback:report after e2e tests.']),
        functional: emptySuite('functional', ['Run qa:input-feedback:report after e2e tests.']),
        performance: emptySuite('performance', ['Not part of Input Feedback QA e2e bundle.']),
      },
    };
    writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
    console.error(payload.message);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(PLAY_JSON, 'utf8')) as { suites?: PwSuite[] };
  const flat = walkPlaywrightSuites(raw.suites, []);
  const a11yRows = flat.filter((r) => r.group === 'Accessibility');
  const fnRows = flat.filter((r) => r.group === 'Functional');

  const accessibility = aggregate(a11yRows, 'accessibility');

  if (existsSync(AXE_JSON)) {
    const axeRaw = JSON.parse(readFileSync(AXE_JSON, 'utf8')) as {
      violations?: Array<{
        id: string;
        impact: string;
        description: string;
        helpUrl?: string;
        nodes: number;
      }>;
    };
    const violations = axeRaw.violations ?? [];
    accessibility.axe = { violations };
    accessibility.logs.push(
      violations.length > 0
        ? `Axe: ${violations.length} violation rule(s) reported (any impact). Critical/serious must be zero for pass.`
        : 'Axe: scan completed — 0 violation rules reported.',
    );
  }

  const functional = aggregate(fnRows, 'functional');
  const performance = emptySuite('performance', [
    'Performance suite is not executed in apps/qa-playground Input Feedback Playwright bundle.',
  ]);

  const ok = accessibility.failed === 0 && functional.failed === 0;

  const payload: QAPlaywrightRunResponse = {
    ok,
    slug: 'input-feedback',
    message: ok
      ? `Input Feedback QA Playwright run OK — ${new Date().toISOString()}`
      : `Input Feedback QA Playwright run had failures — ${new Date().toISOString()}`,
    suites: { accessibility, functional, performance },
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${OUT}`);
}

main();
