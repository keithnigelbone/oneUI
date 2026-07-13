/**
 * csvExport.ts — emit a CSV download from a completed run.
 *
 * Duplicated from apps/storybook/src/stories/tools/csvExport.ts for the
 * qa-playground Performance page. Keep in sync with the Storybook original.
 *
 * Each row is one (component × instanceCount). Both mount and update phase
 * stats are emitted side-by-side.
 */

import type { ComponentResults, RunMetadata } from './useScalability';

const COLUMNS = [
  'componentId',
  'instanceCount',
  'mountWallMs',
  'mountProfilerMs',
  'mountCommitMs',
  'mountMedianMs',
  'mountP95Ms',
  'mountStddevMs',
  'updateWallMs',
  'updateProfilerMs',
  'updateCommitMs',
  'updateMedianMs',
  'updateP95Ms',
  'updateStddevMs',
  'iterationsKept',
  'iterations',
  'warmup',
  'timestamp',
  'ua',
] as const;

function csvCell(v: string | number): string {
  const s = typeof v === 'number' ? String(v) : v;
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv(meta: RunMetadata, results: ReadonlyArray<ComponentResults>): string {
  const headerComment = `# components=${meta.componentIds.join('+')} start=${meta.startCount} end=${meta.endCount} step=${meta.step} iter=${meta.iterations} warmup=${meta.warmupIterations} timestamp=${meta.timestamp}`;
  const timestamp = meta.timestamp;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const lines: string[] = [headerComment, COLUMNS.join(',')];
  for (const cr of results) {
    for (const r of cr.steps) {
      lines.push(
        [
          cr.componentId,
          r.instanceCount,
          r.mount.wallMs.toFixed(4),
          r.mount.profilerMs.toFixed(4),
          r.mount.commitMs.toFixed(4),
          r.mount.medianMs.toFixed(4),
          r.mount.p95Ms.toFixed(4),
          r.mount.stddevMs.toFixed(4),
          r.update.wallMs.toFixed(4),
          r.update.profilerMs.toFixed(4),
          r.update.commitMs.toFixed(4),
          r.update.medianMs.toFixed(4),
          r.update.p95Ms.toFixed(4),
          r.update.stddevMs.toFixed(4),
          r.iterationsKept,
          meta.iterations,
          meta.warmupIterations,
          timestamp,
          ua,
        ]
          .map(csvCell)
          .join(','),
      );
    }
  }
  return lines.join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
