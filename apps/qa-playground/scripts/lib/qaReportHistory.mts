import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { QAPlaywrightReportHistoryFile, QAPlaywrightRunResponse } from '../../src/lib/qa/types.ts';
import {
  emptyHistoryFile,
  isArchivableReport,
  prependHistoryRun,
  reportsAreEquivalent,
} from '../../src/lib/qa/qaReportHistory.ts';

export function historyPathForSlug(root: string, slug: string): string {
  return `${root}/public/qa-reports/${slug}-summary-history.json`;
}

function readHistory(slug: string, historyPath: string): QAPlaywrightReportHistoryFile {
  if (!existsSync(historyPath)) return emptyHistoryFile(slug);
  try {
    const raw = JSON.parse(readFileSync(historyPath, 'utf8')) as QAPlaywrightReportHistoryFile;
    if (raw.slug === slug && Array.isArray(raw.runs)) return raw;
  } catch {
    /* corrupt file — reset */
  }
  return emptyHistoryFile(slug);
}

/** Moves the existing summary into history before overwriting with a new Playwright ingest. */
export function archiveReportBeforeWrite(
  slug: string,
  newReport: QAPlaywrightRunResponse,
  summaryPath: string,
  root: string,
): void {
  if (!existsSync(summaryPath)) return;

  let previous: QAPlaywrightRunResponse;
  try {
    previous = JSON.parse(readFileSync(summaryPath, 'utf8')) as QAPlaywrightRunResponse;
  } catch {
    return;
  }

  if (!isArchivableReport(previous)) {
    return;
  }

  const historyPath = historyPathForSlug(root, slug);
  const history = readHistory(slug, historyPath);
  const hasPriorHistory = history.runs.length > 0;

  // First ingest after a component only had *-summary.json (no history file yet): always
  // archive the outgoing summary so Previous is populated in a single UI run. Later ingests
  // skip when the suite snapshot is unchanged (e.g. dev watcher + qa:component double-ingest).
  if (hasPriorHistory && reportsAreEquivalent(previous, newReport)) {
    return;
  }

  const next = prependHistoryRun(history, {
    savedAt: new Date().toISOString(),
    report: previous,
  });
  writeFileSync(historyPath, JSON.stringify(next, null, 2), 'utf8');
}
