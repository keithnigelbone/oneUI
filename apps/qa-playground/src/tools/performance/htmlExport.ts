/**
 * htmlExport.ts — emit a self-contained HTML performance report.
 *
 * Standalone document with inline CSS (no token dependency) so the file can be
 * shared, archived, or opened offline. Contains:
 *   • Run metadata header (timestamp, config, UA)
 *   • OneUI-only Summary table (status + actionable suggestion per row)
 *   • Full Per-step results table
 *
 * The HTML report mirrors the on-screen Summary section so developers receive
 * the same evidence in an exportable form.
 */

import type { ComponentResults, RunMetadata } from './useScalability';

export type ReportPerfStatus = 'excellent' | 'good' | 'review' | 'slow';

export interface ReportSummaryRow {
  componentId: string;
  componentLabel: string;
  avgMountMs: number;
  avgUpdateMs: number;
  overheadPct: number | null;
  status: ReportPerfStatus;
  statusLabel: string;
  suggestion: string;
}

export interface BuildHtmlReportInput {
  meta: RunMetadata;
  results: ReadonlyArray<ComponentResults>;
  oneuiSummary: ReadonlyArray<ReportSummaryRow>;
  mountBudgetMs: number;
  updateBudgetMs: number;
}

const STATUS_PALETTE: Record<
  ReportPerfStatus,
  { bg: string; text: string; border: string }
> = {
  excellent: { bg: '#e6f9ed', text: '#0d5b27', border: '#2fa45a' },
  good: { bg: '#e6f0fc', text: '#0b3a82', border: '#2d6cdb' },
  review: { bg: '#fff3df', text: '#7a4500', border: '#d88a1a' },
  slow: { bg: '#fde7e7', text: '#7d1313', border: '#d23a3a' },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatOverhead(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return '&mdash;';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

function statusBadge(row: ReportSummaryRow): string {
  const palette = STATUS_PALETTE[row.status];
  return `<span class="badge" style="background:${palette.bg};color:${palette.text};border:1px solid ${palette.border};">${escapeHtml(row.statusLabel)}</span>`;
}

function healthSummaryChips(rows: ReadonlyArray<ReportSummaryRow>): string {
  const counts: Record<ReportPerfStatus, number> = {
    excellent: 0,
    good: 0,
    review: 0,
    slow: 0,
  };
  for (const r of rows) counts[r.status]++;
  const order: ReadonlyArray<ReportPerfStatus> = ['excellent', 'good', 'review', 'slow'];
  const labels: Record<ReportPerfStatus, string> = {
    excellent: 'excellent',
    good: 'good',
    review: 'needs review',
    slow: 'slow',
  };
  return order
    .filter((s) => counts[s] > 0)
    .map((s) => {
      const palette = STATUS_PALETTE[s];
      return `<span class="badge" style="background:${palette.bg};color:${palette.text};border:1px solid ${palette.border};">${counts[s]} ${labels[s]}</span>`;
    })
    .join(' ');
}

export function buildHtmlReport(input: BuildHtmlReportInput): string {
  const { meta, results, oneuiSummary, mountBudgetMs, updateBudgetMs } = input;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const generatedAt = new Date(meta.timestamp).toLocaleString();

  const summaryRowsHtml = oneuiSummary
    .map(
      (row) => `
        <tr>
          <td class="cell-primary">${escapeHtml(row.componentLabel)}</td>
          <td class="num">${row.avgMountMs.toFixed(2)}</td>
          <td class="num">${row.avgUpdateMs.toFixed(2)}</td>
          <td class="num">${formatOverhead(row.overheadPct)}</td>
          <td>${statusBadge(row)}</td>
          <td class="cell-suggestion">${escapeHtml(row.suggestion)}</td>
        </tr>`,
    )
    .join('');

  const perStepRowsHtml = results
    .flatMap((cr) =>
      cr.steps.map(
        (r) => `
        <tr>
          <td>${escapeHtml(cr.componentLabel)}</td>
          <td class="num">${r.instanceCount}</td>
          <td class="num">${r.mount.wallMs.toFixed(3)}</td>
          <td class="num">${r.mount.profilerMs.toFixed(3)}</td>
          <td class="num">${r.mount.commitMs.toFixed(3)}</td>
          <td class="num">${r.mount.p95Ms.toFixed(3)}</td>
          <td class="num">${r.update.wallMs.toFixed(3)}</td>
          <td class="num">${r.update.profilerMs.toFixed(3)}</td>
          <td class="num">${r.update.commitMs.toFixed(3)}</td>
          <td class="num">${r.update.p95Ms.toFixed(3)}</td>
        </tr>`,
      ),
    )
    .join('');

  const componentIdsList = meta.componentIds.map(escapeHtml).join(', ');
  const emptySummaryNote =
    oneuiSummary.length === 0
      ? '<p class="note">No OneUI components were included in this run.</p>'
      : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>OneUI performance report — ${escapeHtml(generatedAt)}</title>
<style>
  :root {
    color-scheme: light;
    --fg-high: #0f172a;
    --fg-med: #475569;
    --fg-low: #64748b;
    --bg: #ffffff;
    --bg-subtle: #f8fafc;
    --bg-elevated: #ffffff;
    --stroke: #e2e8f0;
    --accent: #4f46e5;
    --accent-soft: #eef2ff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--fg-high);
    background: var(--bg-subtle);
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
  .doc-header { display: flex; flex-direction: column; gap: 8px; }
  .doc-header h1 { margin: 0; font-size: 28px; letter-spacing: -0.01em; }
  .doc-header .meta { color: var(--fg-med); font-size: 14px; }
  .pill {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .panel {
    background: var(--bg-elevated);
    border: 1px solid var(--stroke);
    border-radius: 14px;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .section-head h2 { margin: 0; font-size: 20px; }
  .section-head .lead { margin: 4px 0 0; color: var(--fg-med); font-size: 14px; max-width: 720px; }
  .badges { display: inline-flex; flex-wrap: wrap; gap: 8px; }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px 24px;
  }
  .config-item { display: flex; flex-direction: column; gap: 2px; }
  .config-item .k { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-low); }
  .config-item .v { font-size: 14px; color: var(--fg-high); font-variant-numeric: tabular-nums; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    text-align: left;
    padding: 10px 12px;
    background: var(--bg-subtle);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-med);
    border-bottom: 1px solid var(--stroke);
  }
  tbody td { padding: 10px 12px; border-bottom: 1px solid var(--stroke); vertical-align: top; font-variant-numeric: tabular-nums; }
  tbody tr:last-child td { border-bottom: none; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  td.cell-primary { font-weight: 600; }
  td.cell-suggestion { color: var(--fg-med); max-width: 360px; }
  .scroll { overflow-x: auto; border: 1px solid var(--stroke); border-radius: 10px; }
  .note { margin: 0; color: var(--fg-med); font-size: 14px; font-style: italic; }
  footer { color: var(--fg-low); font-size: 12px; text-align: center; padding-top: 8px; }
</style>
</head>
<body>
<div class="wrap">
  <header class="doc-header">
    <span class="pill">OneUI · Performance harness</span>
    <h1>Performance report</h1>
    <div class="meta">Generated ${escapeHtml(generatedAt)}</div>
  </header>

  <section class="panel">
    <div class="section-head">
      <div>
        <h2>Run configuration</h2>
        <p class="lead">Components ran from ${meta.startCount} to ${meta.endCount} in steps of ${meta.step}. Wall-clock readings reflect the full <code>flushSync</code> commit.</p>
      </div>
    </div>
    <div class="config-grid">
      <div class="config-item"><span class="k">Start</span><span class="v">${meta.startCount}</span></div>
      <div class="config-item"><span class="k">End</span><span class="v">${meta.endCount}</span></div>
      <div class="config-item"><span class="k">Step</span><span class="v">${meta.step}</span></div>
      <div class="config-item"><span class="k">Iterations</span><span class="v">${meta.iterations}</span></div>
      <div class="config-item"><span class="k">Warmup</span><span class="v">${meta.warmupIterations}</span></div>
      <div class="config-item"><span class="k">Components</span><span class="v">${componentIdsList}</span></div>
      <div class="config-item"><span class="k">User agent</span><span class="v" style="font-size:12px;color:var(--fg-low);">${escapeHtml(ua)}</span></div>
    </div>
  </section>

  <section class="panel">
    <div class="section-head">
      <div>
        <h2>Summary &mdash; OneUI components</h2>
        <p class="lead">Average wall-clock per commit, mean across every instance-count step. Status compares against an internal budget (Mount &lt; ${mountBudgetMs}ms, Update &lt; ${updateBudgetMs}ms).</p>
      </div>
      <div class="badges">${healthSummaryChips(oneuiSummary)}</div>
    </div>
    ${emptySummaryNote}
    ${
      oneuiSummary.length > 0
        ? `<div class="scroll"><table>
        <thead>
          <tr>
            <th>Component</th>
            <th class="num">Avg mount (ms)</th>
            <th class="num">Avg update (ms)</th>
            <th class="num">Overhead vs Base UI</th>
            <th>Status</th>
            <th>Suggestion</th>
          </tr>
        </thead>
        <tbody>${summaryRowsHtml}</tbody>
      </table></div>`
        : ''
    }
  </section>

  <section class="panel">
    <div class="section-head">
      <div>
        <h2>Per-step results</h2>
        <p class="lead">Mount and update phases side by side across every instance-count step. Includes all libraries (OneUI + reference baselines).</p>
      </div>
    </div>
    <div class="scroll"><table>
      <thead>
        <tr>
          <th rowspan="2">Component</th>
          <th class="num" rowspan="2">N</th>
          <th colspan="4" style="text-align:center;">Mount</th>
          <th colspan="4" style="text-align:center;">Update</th>
        </tr>
        <tr>
          <th class="num">wall</th><th class="num">profiler</th><th class="num">commit</th><th class="num">p95</th>
          <th class="num">wall</th><th class="num">profiler</th><th class="num">commit</th><th class="num">p95</th>
        </tr>
      </thead>
      <tbody>${perStepRowsHtml}</tbody>
    </table></div>
  </section>

  <footer>Generated by the OneUI QA Playground · ${escapeHtml(meta.timestamp)}</footer>
</div>
</body>
</html>`;
}

export function downloadHtml(filename: string, html: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
