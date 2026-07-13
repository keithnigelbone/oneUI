import { describe, expect, it } from 'vitest';
import type { QAPlaywrightRunResponse } from './types';
import {
  isArchivableReport,
  parseHistoryFile,
  prependHistoryRun,
  reportsAreEquivalent,
} from './qaReportHistory';

const baseReport = (message: string, passed = 1): QAPlaywrightRunResponse => ({
  ok: true,
  message,
  slug: 'button',
  suites: {
    accessibility: { suite: 'accessibility', passed, failed: 0, skipped: 0, logs: [], errors: [] },
    functional: { suite: 'functional', passed, failed: 0, skipped: 0, logs: [], errors: [] },
  },
});

describe('qaReportHistory', () => {
  it('treats empty stubs as non-archivable', () => {
    expect(isArchivableReport({ ok: false, message: 'missing', suites: {} })).toBe(false);
  });

  it('detects equivalent reports by suite totals and message', () => {
    const a = baseReport('run A — 2026-06-01T10:00:00.000Z');
    const b = baseReport('run A — 2026-06-01T10:00:00.000Z');
    const c = baseReport('run B — 2026-06-02T10:00:00.000Z', 2);
    expect(reportsAreEquivalent(a, b)).toBe(true);
    expect(reportsAreEquivalent(a, c)).toBe(false);
  });

  it('prepends runs and dedupes identical archives', () => {
    const older = baseReport('older — 2026-06-01T10:00:00.000Z');
    const history = prependHistoryRun(
      { slug: 'button', runs: [] },
      { savedAt: '2026-06-01T11:00:00.000Z', report: older },
    );
    const duplicate = prependHistoryRun(history, {
      savedAt: '2026-06-01T12:00:00.000Z',
      report: older,
    });
    expect(duplicate.runs).toHaveLength(1);
  });

  it('parses history JSON', () => {
    const parsed = parseHistoryFile({
      slug: 'button',
      runs: [{ savedAt: '2026-06-01T00:00:00.000Z', report: baseReport('x') }],
    });
    expect(parsed?.runs).toHaveLength(1);
    expect(parsed?.slug).toBe('button');
  });
});
