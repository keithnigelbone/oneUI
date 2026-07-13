/**
 * Shared ingest: Playwright JSON + optional axe artefact → public/qa-reports/<slug>-summary.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  QAPlaceholderSuiteReport,
  QAPlaywrightRunResponse,
  QAReportSuiteId,
} from '../../src/lib/qa/types.ts';
import {
  walkPlaywrightSuites,
  type CollectedRow,
  type PwSuite,
} from './playwrightReportWalk';
import { summarizeAxeFailureMessage } from './axe-plain-language';
import { archiveReportBeforeWrite } from './qaReportHistory.mts';

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

/** Plain-English failure text for dashboard Reason column and failure output. */
export function summarizeError(error: string | undefined): string | undefined {
  if (!error) return undefined;
  const clean = stripAnsi(error);
  const bugLine = clean.match(/(BUG-[A-Z0-9]+-\d+):[^\n]+/);
  if (bugLine) return bugLine[0].trim().slice(0, 500);
  const a11yBlock = clean.match(/Accessibility check failed:\s*([\s\S]+?)(?:\n\nexpect\(|$)/);
  if (a11yBlock?.[1]) return a11yBlock[1].trim();
  return summarizeAxeFailureMessage(clean) ?? clean.split('\n').find((l) => l.trim().length > 20)?.trim()?.slice(0, 400);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

export type IngestQaPlaywrightJsonOptions = {
  /** When true (default), missing Playwright JSON exits the process with code 1. */
  exitOnError?: boolean;
  /** When true, ingest even when Playwright JSON looks like a filtered/partial run. */
  allowPartial?: boolean;
};

function countSummaryTests(summary: QAPlaywrightRunResponse): number {
  let total = 0;
  for (const suite of Object.values(summary.suites ?? {})) {
    total += (suite?.passed ?? 0) + (suite?.failed ?? 0) + (suite?.skipped ?? 0);
  }
  return total;
}

/** Skip ingest when a `-g` / single-spec run would clobber a full component report. */
function isLikelyPartialPlaywrightRun(
  slug: string,
  newRowCount: number,
  outPath: string,
): boolean {
  if (!existsSync(outPath)) return false;
  if (newRowCount >= 20) return false;
  try {
    const prev = JSON.parse(readFileSync(outPath, 'utf8')) as QAPlaywrightRunResponse;
    const prevTotal = countSummaryTests(prev);
    if (prevTotal >= 40 && newRowCount < prevTotal * 0.5) {
      console.warn(
        `[qa-ingest] Skipping partial Playwright ingest for "${slug}": ` +
          `${newRowCount} test row(s) in JSON vs ${prevTotal} in existing summary. ` +
          `Run the full qa:${slug}:report (no -g filter) to refresh public/qa-reports/${slug}-summary.json.`,
      );
      return true;
    }
  } catch {
    /* ignore corrupt prior summary */
  }
  return false;
}

export function ingestQaPlaywrightJson(
  slug: string,
  playJsonName: string,
  axeJsonName: string,
  options: IngestQaPlaywrightJsonOptions = {},
) {
  const exitOnError = options.exitOnError !== false;
  const PLAY_JSON = join(ROOT, 'test-results', playJsonName);
  const AXE_JSON = join(ROOT, 'test-results', axeJsonName);
  const OUT = join(ROOT, 'public', 'qa-reports', `${slug}-summary.json`);

  mkdirSync(join(ROOT, 'public', 'qa-reports'), { recursive: true });

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
        error: row.error ? summarizeError(row.error) ?? stripAnsi(row.error).slice(0, 500) : undefined,
        bugId: row.bugId,
        componentBand: row.componentBand,
      });
      if (row.error && outcome === 'failed') {
        const summary = summarizeError(row.error) ?? row.name;
        if (row.bugId && summary.startsWith(`${row.bugId}:`)) {
          errors.push(`${row.name}: ${summary}`);
        } else if (row.bugId) {
          errors.push(`${row.bugId}: ${summary}`);
        } else {
          errors.push(`${row.name}: ${summary}`);
        }
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

  if (!existsSync(PLAY_JSON)) {
    const payload: QAPlaywrightRunResponse = {
      ok: false,
      slug,
      message: `No Playwright JSON at ${PLAY_JSON}. Run qa:${slug}:report`,
      suites: {
        accessibility: emptySuite('accessibility', ['Run report script after e2e tests.']),
        functional: emptySuite('functional', ['Run report script after e2e tests.']),
        performance: emptySuite('performance', ['Not part of this QA e2e bundle.']),
      },
    };
    writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
    console.error(payload.message);
    if (exitOnError) process.exit(1);
    return false;
  }

  const raw = JSON.parse(readFileSync(PLAY_JSON, 'utf8')) as { suites?: PwSuite[] };
  const flat = walkPlaywrightSuites(raw.suites, []);

  if (
    !options.allowPartial &&
    isLikelyPartialPlaywrightRun(slug, flat.length, OUT)
  ) {
    return false;
  }

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
        ? `Axe: ${violations.length} violation rule(s) reported.`
        : 'Axe: scan completed — 0 violation rules reported.',
    );
  }

  const functional = aggregate(fnRows, 'functional');
  const performance = emptySuite('performance', [
    `Performance suite is not executed in apps/qa-playground ${slug} Playwright bundle.`,
  ]);

  const ok = accessibility.failed === 0 && functional.failed === 0;

  const payload: QAPlaywrightRunResponse = {
    ok,
    slug,
    message: ok
      ? `${slug} QA Playwright run OK — ${new Date().toISOString()}`
      : `${slug} QA Playwright run had failures — ${new Date().toISOString()}`,
    suites: { accessibility, functional, performance },
  };

  archiveReportBeforeWrite(slug, payload, OUT, ROOT);
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${OUT}`);
  return true;
}

/** Convention-based ingest for `<slug>-playwright.json` + optional `<slug>-axe-violations.json`. */
export function ingestQaPlaywrightJsonForSlug(
  slug: string,
  options: IngestQaPlaywrightJsonOptions = {},
) {
  return ingestQaPlaywrightJson(
    slug,
    `${slug}-playwright.json`,
    `${slug}-axe-violations.json`,
    options,
  );
}
