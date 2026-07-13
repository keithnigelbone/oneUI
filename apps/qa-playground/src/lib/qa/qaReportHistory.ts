import type { QAPlaywrightReportHistoryFile, QAPlaywrightRunResponse } from './types';

export const MAX_QA_REPORT_HISTORY = 25;

function totalTestRows(report: QAPlaywrightRunResponse): number {
  let total = 0;
  for (const suite of Object.values(report.suites ?? {})) {
    if (!suite) continue;
    total += (suite.passed ?? 0) + (suite.failed ?? 0) + (suite.skipped ?? 0);
  }
  return total;
}

/** True when the report has at least one ingested test row (not an empty error stub). */
export function isArchivableReport(report: QAPlaywrightRunResponse | null | undefined): boolean {
  if (!report) return false;
  return totalTestRows(report) > 0;
}

function suiteSignature(report: QAPlaywrightRunResponse): string {
  const parts: string[] = [report.message ?? ''];
  for (const id of ['accessibility', 'functional', 'performance'] as const) {
    const s = report.suites?.[id];
    if (!s) continue;
    parts.push(`${id}:${s.passed}/${s.failed}/${s.skipped}`);
  }
  return parts.join('|');
}

/** Skip archiving when the outgoing summary matches the incoming run. */
export function reportsAreEquivalent(
  a: QAPlaywrightRunResponse,
  b: QAPlaywrightRunResponse,
): boolean {
  return suiteSignature(a) === suiteSignature(b);
}

export function parseHistoryFile(raw: unknown): QAPlaywrightReportHistoryFile | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.slug !== 'string' || !Array.isArray(o.runs)) return null;
  const runs = o.runs
    .filter((entry): entry is QAPlaywrightReportHistoryFile['runs'][number] => {
      if (!entry || typeof entry !== 'object') return false;
      const e = entry as Record<string, unknown>;
      return typeof e.savedAt === 'string' && e.report != null && typeof e.report === 'object';
    })
    .map((entry) => ({
      savedAt: entry.savedAt,
      report: entry.report as QAPlaywrightRunResponse,
    }));
  return { slug: o.slug, runs };
}

export function prependHistoryRun(
  history: QAPlaywrightReportHistoryFile,
  entry: QAPlaywrightReportHistoryFile['runs'][number],
): QAPlaywrightReportHistoryFile {
  const runs = [
    entry,
    ...history.runs.filter((r) => !reportsAreEquivalent(r.report, entry.report)),
  ].slice(0, MAX_QA_REPORT_HISTORY);
  return { slug: history.slug, runs };
}

export function emptyHistoryFile(slug: string): QAPlaywrightReportHistoryFile {
  return { slug, runs: [] };
}
