import type { DashboardData } from './aggregatePlaywrightDashboard';

export function renderDashboardHtml(data: DashboardData): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OneUI QA Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg: #f4f6fa;
      --surface: #ffffff;
      --border: #e6eaf0;
      --border-strong: #d8dee6;
      --text: #1a1f26;
      --muted: #6b7280;
      --accent: #6c5ce7;
      --accent-soft: #f3f0ff;
      --radius: 10px;
      --radius-lg: 14px;
      --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.04);
      --shadow-md: 0 4px 12px rgba(16, 24, 40, 0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px 28px 40px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .page-meta {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 16px;
    }

    .overview-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 22px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-sm);
    }
    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .section-title-block {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-icon svg { width: 20px; height: 20px; }
    .section-icon.tone-purple { background: #ede9fe; color: #6c5ce7; }
    .section-icon.tone-green { background: #dcfce7; color: #16a34a; }
    .section-title-block h2 {
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }
    .section-subtitle {
      font-size: 0.8125rem;
      color: var(--muted);
      margin-top: 2px;
    }
    .last-run-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid #e9d5ff;
      background: #faf5ff;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b21a8;
      white-space: nowrap;
    }
    .last-run-badge svg { width: 14px; height: 14px; flex-shrink: 0; }

    .section-header-end {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }
    .run-tests-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }
    .run-tests-toolbar[hidden],
    .run-tests-panel[hidden],
    .run-tests-unavailable[hidden] { display: none !important; }
    .run-tests-select {
      min-width: 180px;
      max-width: 240px;
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
      font: inherit;
      font-size: 0.8125rem;
      color: var(--text);
    }
    .run-tests-btn {
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--text);
      transition: background 0.15s, border-color 0.15s;
    }
    .run-tests-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
    .run-tests-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .run-tests-btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .run-tests-btn-primary:hover:not(:disabled) { background: #5b4cdb; border-color: #5b4cdb; }
    .run-tests-btn-ghost {
      background: transparent;
      border-color: transparent;
      color: var(--accent);
      font-weight: 500;
      padding-inline: 8px;
    }
    .run-tests-unavailable {
      font-size: 0.75rem;
      color: var(--muted);
      text-align: right;
      max-width: 280px;
      line-height: 1.4;
    }
    .run-tests-panel {
      margin-bottom: 16px;
      padding: 12px 14px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: #f8fafc;
    }
    .run-tests-status {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text);
    }
    .run-tests-status.is-running { color: #6b21a8; }
    .run-tests-status.is-success { color: #15803d; }
    .run-tests-status.is-failed { color: #b91c1c; }
    .run-tests-log {
      margin-top: 10px;
      max-height: 220px;
      overflow: auto;
      padding: 10px 12px;
      border-radius: 8px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.6875rem;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .run-tests-btn-row {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .stat-cards-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .stat-card-v2 {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 14px 10px 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      font: inherit;
      color: var(--text);
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    }
    .stat-card-v2:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .stat-card-v2.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.14);
    }
    .stat-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .stat-card-icon svg { width: 18px; height: 18px; }
    .stat-card-v2.tone-all .stat-card-icon { background: #ede9fe; color: #6c5ce7; }
    .stat-card-v2.tone-pass .stat-card-icon { background: #dcfce7; color: #16a34a; }
    .stat-card-v2.tone-fail .stat-card-icon { background: #ffe4e6; color: #e11d48; }
    .stat-card-v2.tone-skip .stat-card-icon { background: #e0f2fe; color: #0284c7; }
    .stat-card-v2.tone-flaky .stat-card-icon { background: #ffedd5; color: #ea580c; }
    .stat-card-v2.tone-retry .stat-card-icon { background: #f1f5f9; color: #64748b; }
    .stat-card-value {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }
    .stat-card-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--muted);
      margin-top: 4px;
    }
    .stat-card-pill {
      display: inline-block;
      margin-top: 10px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
    }
    .stat-card-v2.tone-all .stat-card-pill { background: #ede9fe; color: #6c5ce7; }
    .stat-card-v2.tone-pass .stat-card-pill { background: #dcfce7; color: #15803d; }
    .stat-card-v2.tone-fail .stat-card-pill { background: #ffe4e6; color: #be123c; }
    .stat-card-v2.tone-skip .stat-card-pill { background: #e0f2fe; color: #0369a1; }
    .stat-card-v2.tone-flaky .stat-card-pill { background: #ffedd5; color: #c2410c; }
    .stat-card-v2.tone-retry .stat-card-pill { background: #f1f5f9; color: #475569; }

    .health-panel {
      display: flex;
      align-items: stretch;
      gap: 20px;
      padding: 16px 18px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .health-main { flex: 1; min-width: 0; }
    .health-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .health-title svg { width: 18px; height: 18px; color: #16a34a; }
    .health-bar {
      display: flex;
      height: 12px;
      border-radius: 999px;
      overflow: hidden;
      background: #e2e8f0;
    }
    .health-seg { height: 100%; min-width: 0; transition: width 0.3s ease; }
    .health-seg.pass { background: #22c55e; }
    .health-seg.fail { background: #f43f5e; }
    .health-seg.skip { background: #38bdf8; }
    .health-seg.other { background: #cbd5e1; }
    .health-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 14px 20px;
      margin-top: 12px;
    }
    .health-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--muted);
    }
    .health-legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .health-legend-item strong { color: var(--text); font-weight: 600; }
    .health-aside {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 120px;
      padding-left: 20px;
      border-left: 1px solid var(--border);
    }
    .health-rate-value {
      font-size: 2rem;
      font-weight: 700;
      color: #16a34a;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .health-rate-label {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 4px;
      font-weight: 500;
    }
    .health-meta {
      margin-top: 12px;
      font-size: 0.6875rem;
      color: var(--muted);
      text-align: center;
      line-height: 1.4;
      max-width: 140px;
    }

    .components-split {
      display: grid;
      grid-template-columns: minmax(200px, 280px) 1fr;
      gap: 24px;
      align-items: center;
    }
    .components-chart-wrap {
      position: relative;
      height: 220px;
    }
    .components-chart-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }
    .components-chart-center .center-num {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .components-chart-center .center-label {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 2px;
      font-weight: 500;
    }
    .insights-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      align-items: stretch;
    }
    .insights-row > .overview-card {
      margin-bottom: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .insights-row .components-split {
      flex: 1;
      align-items: stretch;
    }

    .component-stat-list {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      background: #fafbfc;
    }
    .component-stat-card {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 16px;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      cursor: pointer;
      font: inherit;
      text-align: left;
      color: var(--text);
      transition: background 0.15s;
    }
    .component-stat-card:last-child { border-bottom: none; }
    .component-stat-card:hover { background: var(--surface); }
    .component-stat-card.active {
      background: var(--accent-soft);
      box-shadow: inset 3px 0 0 var(--accent);
    }
    .component-stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .component-stat-icon svg { width: 22px; height: 22px; }
    .component-stat-card.tone-stable .component-stat-icon { background: #dcfce7; color: #16a34a; }
    .component-stat-card.tone-unstable .component-stat-icon { background: #ffe4e6; color: #e11d48; }
    .component-stat-card.tone-total .component-stat-icon { background: #ede9fe; color: #6c5ce7; }
    .component-stat-body { flex: 1; min-width: 0; }
    .component-stat-title { font-size: 0.9375rem; font-weight: 600; }
    .component-stat-desc { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }
    .component-stat-metrics {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
    }
    .component-stat-value {
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .component-stat-card.tone-stable .component-stat-value { color: #16a34a; }
    .component-stat-card.tone-unstable .component-stat-value { color: #e11d48; }
    .component-stat-card.tone-total .component-stat-value { color: #6c5ce7; }
    .component-stat-pill {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
    }
    .component-stat-card.tone-stable .component-stat-pill { background: #dcfce7; color: #15803d; }
    .component-stat-card.tone-unstable .component-stat-pill { background: #ffe4e6; color: #be123c; }
    .component-stat-card.tone-total .component-stat-pill { background: #ede9fe; color: #6c5ce7; }

    .volume-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .volume-card-header h2 {
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .volume-card-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 8px;
      color: var(--muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .icon-btn:hover { background: var(--bg); color: var(--text); }
    .icon-btn svg { width: 18px; height: 18px; }

    .volume-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .volume-split {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
      gap: 12px 20px;
      align-items: center;
      flex: 1;
    }
    .volume-chart-wrap {
      position: relative;
      height: 240px;
      min-width: 0;
    }
    .volume-legend-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
      align-content: start;
      max-height: 248px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .volume-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 2px;
      border: none;
      background: none;
      cursor: pointer;
      font: inherit;
      font-size: 0.75rem;
      color: var(--text);
      text-align: left;
      border-radius: 4px;
      transition: background 0.12s;
    }
    .volume-legend-item:hover { background: var(--bg); }
    .volume-legend-swatch {
      width: 14px;
      height: 4px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .volume-legend-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .volume-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      border: none;
      background: none;
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--accent);
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .view-all-link:hover { opacity: 0.8; text-decoration: underline; }
    .view-all-link svg { width: 16px; height: 16px; }

    .detail-panel-card { display: none; margin-bottom: 24px; }
    .detail-panel-card.visible { display: block; }
    .detail-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .detail-panel-header h2 { margin-bottom: 0; }
    .toggle-btn {
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--muted);
      flex-shrink: 0;
    }
    .toggle-btn:hover { border-color: var(--accent); color: var(--accent); }
    .detail-panel-body.collapsed { display: none; }
    .detail-panel-card .lead {
      font-size: 13px;
      color: #636e72;
      margin: 0 0 12px;
    }
    .suite-filter-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .suite-chip {
      padding: 4px 12px;
      border-radius: 16px;
      border: 1px solid #dfe6e9;
      background: white;
      font-size: 12px;
      cursor: pointer;
    }
    .suite-chip.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .error-cell {
      font-size: 12px;
      color: #636e72;
      max-width: 480px;
      vertical-align: top;
    }
    .error-preview {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      line-height: 1.4;
    }
    .error-cell.is-expanded .error-preview { display: none; }
    .error-full {
      display: none;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      line-height: 1.4;
      max-height: 320px;
      overflow: auto;
      padding: 8px 10px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-top: 6px;
    }
    .error-cell.is-expanded .error-full { display: block; }
    .error-toggle {
      margin-top: 6px;
      padding: 2px 10px;
      border-radius: 12px;
      border: 1px solid #dfe6e9;
      background: white;
      font-size: 11px;
      font-weight: 600;
      color: #6C5CE7;
      cursor: pointer;
    }
    .error-toggle:hover { border-color: #6C5CE7; }
    .suite-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }
    .suite-tag-functional { background: #e3f2fd; color: #1565C0; }
    .suite-tag-accessibility { background: #f3e5f5; color: #6A1B9A; }
    .suite-tag-visual { background: #fff8e1; color: #F57F17; }
    .status-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-tag-passed { background: #e8f5e9; color: #2E7D32; }
    .status-tag-failed { background: #fce4ec; color: #C62828; }
    .status-tag-skipped { background: #e0f7fa; color: #00838F; }
    .count-link {
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .count-link:hover { opacity: 0.85; }
    .count-link.count-pass { color: #2E7D32; }
    .count-link.count-fail { color: #C62828; }
    .count-link.count-skip { color: #E65100; }
    .count-link:disabled, .count-link.is-zero {
      cursor: default;
      text-decoration: none;
      opacity: 0.45;
    }
    tr.row-highlight td { background: var(--accent-soft) !important; }

    .table-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
    }
    .table-card h2 {
      font-size: 0.9375rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 16px;
      color: var(--text);
    }
    .table-card { margin-bottom: 24px; }

    .filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    .filter-btn {
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid #dfe6e9;
      background: white;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .search-input {
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid #dfe6e9;
      font-size: 13px;
      width: 220px;
      margin-left: auto;
    }

    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th {
      text-align: left;
      padding: 10px 12px;
      background: #f8f9fa;
      color: #636e72;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td { padding: 12px; border-bottom: 1px solid #f0f2f5; vertical-align: middle; }
    tr:hover td { background: #fafafa; }

    .progress-bar {
      height: 6px;
      background: #f0f2f5;
      border-radius: 3px;
      margin-top: 4px;
      overflow: hidden;
    }
    .progress-fill { height: 100%; border-radius: 3px; background: #4CAF50; }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-pass { background: #e8f5e9; color: #2E7D32; }
    .badge-fail { background: #fce4ec; color: #C62828; }
    .badge-skip { background: #fff3e0; color: #E65100; }

    .bug-stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .bug-stat-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 16px 20px;
      text-align: center;
    }
    .bug-stat-card .bug-stat-value {
      font-size: 28px;
      font-weight: 700;
      display: block;
      line-height: 1.2;
    }
    .bug-stat-card .bug-stat-label {
      font-size: 12px;
      color: #636e72;
      margin-top: 4px;
      display: block;
    }
    .bug-stat-critical .bug-stat-value { color: #C62828; }
    .bug-stat-high .bug-stat-value { color: #E65100; }
    .bug-stat-components .bug-stat-value { color: #6C5CE7; }

    .priority-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: lowercase;
    }
    .priority-critical { background: #fce4ec; color: #C62828; }
    .priority-high { background: #fff3e0; color: #E65100; }
    .priority-medium { background: #e3f2fd; color: #1565C0; }
    .priority-low { background: #eceff1; color: #546E7A; }

    .effort-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      background: #f0f2f5;
      color: #636e72;
    }

    .bug-title-cell { max-width: 420px; }
    .bug-id-cell { font-family: ui-monospace, monospace; font-size: 12px; color: #636e72; }
    .bug-canonical { display: block; font-size: 10px; color: #b2bec3; margin-top: 2px; }

    .count-pass { color: #2E7D32; font-weight: 600; }
    .count-fail { color: #C62828; font-weight: 600; }
    .count-skip { color: #E65100; font-weight: 600; }
    .count-flaky { color: #F57F17; font-weight: 600; }
    .suite-pass { color: #2E7D32; }
    .suite-fail { color: #C62828; }
    .source-tag { font-size: 11px; color: #b2bec3; }

    .empty-state {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 40px 24px;
      text-align: center;
      color: var(--muted);
      box-shadow: var(--shadow-sm);
    }

    @media (max-width: 1100px) {
      .stat-cards-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .insights-row { grid-template-columns: 1fr; }
      .components-split { grid-template-columns: minmax(180px, 240px) 1fr; }
      .volume-split { grid-template-columns: 1fr; }
      .volume-chart-wrap { max-width: 280px; margin: 0 auto; width: 100%; }
    }
    @media (max-width: 1024px) {
      .health-panel { flex-direction: column; }
      .health-aside {
        border-left: none;
        border-top: 1px solid var(--border);
        padding-left: 0;
        padding-top: 16px;
        min-width: 0;
      }
      .stats-row { grid-template-columns: repeat(3, 1fr); }
      .info-row { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .bug-stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      body { padding: 16px; }
      .stat-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .search-input { width: 100%; margin-left: 0; margin-top: 8px; }
    }
  </style>
</head>
<body>
  <p class="page-meta" id="generated-meta"></p>

  <div id="empty-banner" class="empty-state" style="display:none;margin-bottom:24px;">
    <p><strong>No component results found.</strong></p>
    <p style="margin-top:8px;">Run <code>pnpm dashboard:generate</code> after Playwright QA reports, or run individual <code>qa:&lt;component&gt;:report</code> scripts.</p>
  </div>

  <div id="overview-root">
    <section class="overview-card" aria-label="Test results overview">
      <div class="section-header">
        <div class="section-title-block">
          <div class="section-icon tone-purple" aria-hidden="true" id="tests-section-icon"></div>
          <div>
            <h2>Test Results Overview</h2>
            <p class="section-subtitle">Summary of automated test execution</p>
          </div>
        </div>
        <div class="section-header-end">
          <div class="run-tests-toolbar" id="run-tests-toolbar" hidden>
            <label class="visually-hidden" for="run-component-select">Component</label>
            <select id="run-component-select" class="run-tests-select" aria-label="Component to test"></select>
            <button type="button" class="run-tests-btn run-tests-btn-primary" id="run-component-btn">Run component</button>
            <button type="button" class="run-tests-btn" id="run-all-btn">Run all</button>
          </div>
          <p class="run-tests-unavailable" id="run-tests-unavailable" hidden>
            Run tests from the QA playground dev server (<code>pnpm dev</code> in apps/qa-playground).
          </p>
          <div class="last-run-badge" id="last-run-badge"></div>
        </div>
      </div>
      <div class="run-tests-panel" id="run-tests-panel" hidden>
        <div class="run-tests-status" id="run-tests-status" role="status" aria-live="polite"></div>
        <pre class="run-tests-log" id="run-tests-log" hidden></pre>
      </div>
      <div class="stat-cards-grid" id="stats-row"></div>
      <div class="health-panel" id="health-panel"></div>
    </section>

    <div class="insights-row">
      <section class="overview-card" aria-label="Components stability">
        <div class="section-header">
          <div class="section-title-block">
            <div class="section-icon tone-green" aria-hidden="true" id="components-section-icon"></div>
            <div>
              <h2>Components</h2>
              <p class="section-subtitle">Stability overview of all components</p>
            </div>
          </div>
        </div>
        <div class="components-split">
          <div class="components-chart-wrap">
            <canvas id="componentsStabilityChart" aria-label="Component stability chart"></canvas>
            <div class="components-chart-center" id="components-chart-center"></div>
          </div>
          <div class="component-stat-list" id="component-stats-row"></div>
        </div>
      </section>

      <section class="overview-card volume-card" aria-label="Test volume by component">
        <div class="volume-card-header">
          <h2>Test volume by component</h2>
          <div class="volume-card-actions">
            <button type="button" class="icon-btn" id="volume-info-btn" title="Test count per component from latest QA summaries" aria-label="About this chart">
              <span id="volume-info-icon"></span>
            </button>
            <button type="button" class="icon-btn" id="volume-menu-btn" title="Scroll to component table" aria-label="More options">
              <span id="volume-menu-icon"></span>
            </button>
          </div>
        </div>
        <div class="volume-body">
          <div class="volume-split">
            <div class="volume-chart-wrap">
              <canvas id="componentChart" aria-label="Test volume by component chart"></canvas>
            </div>
            <div class="volume-legend-grid" id="volume-legend" role="list"></div>
          </div>
          <div class="volume-footer">
            <button type="button" class="view-all-link" id="view-all-components">
              View all components
              <span id="view-all-arrow" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div class="table-card detail-panel-card" id="tests-detail-card">
    <div class="detail-panel-header">
      <h2 id="tests-detail-title">Test details</h2>
      <button type="button" class="toggle-btn" id="tests-detail-toggle" aria-expanded="true">Hide</button>
    </div>
    <div class="detail-panel-body" id="tests-detail-body">
      <p class="lead" id="tests-detail-lead"></p>
      <div class="suite-filter-row" id="suite-filter-row">
        <button type="button" class="suite-chip active" data-suite="all">All suites</button>
        <button type="button" class="suite-chip" data-suite="functional">Functional</button>
        <button type="button" class="suite-chip" data-suite="accessibility">Accessibility</button>
        <button type="button" class="suite-chip" data-suite="visual">Visual</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Suite</th>
            <th>Test</th>
            <th>Duration</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody id="testsDetailTableBody"></tbody>
      </table>
    </div>
  </div>

  <div class="table-card" id="bugs-report-card">
    <h2>Dashboard Report — Component Bugs</h2>
    <p class="lead" style="margin-bottom:16px;font-size:13px;color:#636e72;">
      Deduplicated from Playwright failures. One row per distinct component defect, sorted by priority.
    </p>
    <div class="bug-stats-row" id="bug-stats-row"></div>
    <div class="filters" id="bug-filter-row">
      <button type="button" class="filter-btn bug-filter-btn active" data-bug-filter="all">All</button>
      <button type="button" class="filter-btn bug-filter-btn" data-bug-filter="critical">Critical</button>
      <button type="button" class="filter-btn bug-filter-btn" data-bug-filter="high">High</button>
      <button type="button" class="filter-btn bug-filter-btn" data-bug-filter="medium">Medium</button>
      <button type="button" class="filter-btn bug-filter-btn" data-bug-filter="low">Low</button>
      <input class="search-input" type="search" id="bug-search-input" placeholder="Search bugs…" aria-label="Search bugs" />
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Bug title</th>
          <th>Component</th>
          <th>Category</th>
          <th>Priority</th>
          <th>WCAG</th>
          <th>Effort</th>
          <th>Tests</th>
        </tr>
      </thead>
      <tbody id="bugsTableBody"></tbody>
    </table>
  </div>

  <div class="table-card" id="component-table-card">
    <h2>Each Component</h2>
    <div class="filters">
      <button type="button" class="filter-btn active" data-filter="all">All</button>
      <button type="button" class="filter-btn" data-filter="fail">Failed</button>
      <button type="button" class="filter-btn" data-filter="pass">Passed</button>
      <button type="button" class="filter-btn" data-filter="skip">Skipped</button>
      <button type="button" class="filter-btn" data-filter="flaky">Flaky</button>
      <input class="search-input" type="search" placeholder="🔍 Search component…" aria-label="Search components" />
    </div>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Total</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th>Flaky</th>
          <th>Duration</th>
          <th>Success %</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="componentTableBody"></tbody>
    </table>
  </div>

  <div class="table-card">
    <h2>Suite Coverage per Component</h2>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Functional Pass</th>
          <th>Functional Fail</th>
          <th>A11y Pass</th>
          <th>A11y Fail</th>
          <th>Visual Pass</th>
          <th>Visual Fail</th>
        </tr>
      </thead>
      <tbody id="suiteTableBody"></tbody>
    </table>
  </div>

  <script>
    const data = ${json};
    let activeFilter = 'all';
    let searchQuery = '';
    let detailVisible = false;
    let detailSuiteFilter = 'all';
    let drillSlug = '';
    let drillComponentName = '';
    let bugFilter = 'all';
    let bugSearchQuery = '';
    let componentStabilityFilter = 'all';
    let runTestsBusy = false;
    let runTestsSource = null;

    function setRunTestsBusy(busy) {
      runTestsBusy = busy;
      const runBtn = document.getElementById('run-component-btn');
      const allBtn = document.getElementById('run-all-btn');
      const select = document.getElementById('run-component-select');
      if (runBtn) runBtn.disabled = busy;
      if (allBtn) allBtn.disabled = busy;
      if (select) select.disabled = busy;
      document.querySelectorAll('.run-row-btn').forEach((btn) => {
        btn.disabled = busy;
      });
    }

    function setRunTestsStatus(text, tone) {
      const el = document.getElementById('run-tests-status');
      const panel = document.getElementById('run-tests-panel');
      if (!el || !panel) return;
      panel.hidden = false;
      el.textContent = text;
      el.className = 'run-tests-status' + (tone ? ' is-' + tone : '');
    }

    function appendRunLog(line) {
      const log = document.getElementById('run-tests-log');
      if (!log) return;
      log.hidden = false;
      log.textContent += line;
      log.scrollTop = log.scrollHeight;
    }

    function clearRunLog() {
      const log = document.getElementById('run-tests-log');
      if (log) {
        log.textContent = '';
        log.hidden = true;
      }
    }

    async function startPlaywrightRun(options) {
      if (runTestsBusy) return;
      const all = options.all === true;
      const slug = options.slug || '';
      setRunTestsBusy(true);
      clearRunLog();
      const label = all ? 'all components' : slug;
      setRunTestsStatus('Starting Playwright run for ' + label + '…', 'running');

      try {
        const response = await fetch('/api/qa/component-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(all ? { all: true } : { slug }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || ('HTTP ' + response.status));
        }
        if (!payload.runId) throw new Error('Missing run id');

        setRunTestsStatus('Running tests for ' + label + '…', 'running');

        await new Promise((resolve, reject) => {
          const source = new EventSource('/api/qa/component-run/' + payload.runId + '/stream');
          runTestsSource = source;

          source.addEventListener('log', (event) => {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.line) appendRunLog(parsed.line);
            } catch (_) { /* ignore malformed chunks */ }
          });

          source.addEventListener('done', (event) => {
            source.close();
            runTestsSource = null;
            try {
              const parsed = JSON.parse(event.data);
              const ok = parsed.ok;
              const dashboardOk = parsed.dashboardOk !== false;
              if (ok) {
                setRunTestsStatus('Tests passed. Refreshing dashboard…', 'success');
              } else {
                setRunTestsStatus(
                  'Tests finished with failures (exit ' + parsed.exitCode + '). Refreshing dashboard…',
                  'failed',
                );
              }
              if (dashboardOk) {
                setTimeout(() => {
                  window.location.href = window.location.pathname + '?t=' + Date.now();
                }, 800);
              } else {
                setRunTestsStatus(
                  'Run complete but dashboard regenerate failed. Run pnpm dashboard:generate manually.',
                  'failed',
                );
              }
              resolve();
            } catch (streamError) {
              reject(streamError);
            }
          });

          source.onerror = () => {
            source.close();
            runTestsSource = null;
            reject(new Error('Lost connection to test run stream.'));
          };
        });
      } catch (error) {
        setRunTestsStatus(error instanceof Error ? error.message : String(error), 'failed');
      } finally {
        setRunTestsBusy(false);
      }
    }

    function initRunTestsPanel() {
      const toolbar = document.getElementById('run-tests-toolbar');
      const unavailable = document.getElementById('run-tests-unavailable');
      const select = document.getElementById('run-component-select');
      const runBtn = document.getElementById('run-component-btn');
      const allBtn = document.getElementById('run-all-btn');
      if (!toolbar || !select || !runBtn || !allBtn) return;

      fetch('/api/qa/components')
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((payload) => {
          const registrySlugs = payload.slugs || [];
          const slugSet = new Set(registrySlugs);
          const options = data.components
            .filter((c) => slugSet.has(c.slug))
            .map((c) => ({ slug: c.slug, name: c.name }));

          for (const slug of registrySlugs) {
            if (!options.find((c) => c.slug === slug)) {
              options.push({ slug, name: slug });
            }
          }
          options.sort((a, b) => a.name.localeCompare(b.name));

          select.innerHTML = options
            .map(
              (c) =>
                '<option value="' + escapeHtml(c.slug) + '">' + escapeHtml(c.name) + '</option>',
            )
            .join('');

          toolbar.hidden = false;
          if (unavailable) unavailable.hidden = true;

          runBtn.addEventListener('click', () => {
            const value = select.value;
            if (value) startPlaywrightRun({ slug: value });
          });
          allBtn.addEventListener('click', () => {
            if (
              window.confirm(
                'Run Playwright for all registered components? This may take a long time.',
              )
            ) {
              startPlaywrightRun({ all: true });
            }
          });

          document.body.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            if (!target.classList.contains('run-row-btn')) return;
            const rowSlug = target.dataset.runSlug;
            if (!rowSlug || runTestsBusy) return;
            select.value = rowSlug;
            startPlaywrightRun({ slug: rowSlug });
          });
        })
        .catch(() => {
          toolbar.hidden = true;
          if (unavailable) unavailable.hidden = false;
        });
    }

    const palette = [
      '#6C5CE7','#00B894','#E17055','#0984E3',
      '#FDCB6E','#D63031','#00CEC9','#E84393',
      '#55EFC4','#A29BFE','#FD79A8','#74B9FF',
      '#636E72','#F39C12','#1ABC9C','#9B59B6'
    ];

    function pct(part, total, digits) {
      if (!total) return '0%';
      return (part / total * 100).toFixed(digits == null ? 1 : digits) + '%';
    }

    function iconSvg(name) {
      const icons = {
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 5 5-9"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
        doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
        x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
        skip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 5 7 7-7 7"/><path d="M13 5l7 7-7 7"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
        retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
        shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        shieldCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
        shieldAlert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
        layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 8 4-8 4-8-4 8-4z"/><path d="m4 10 8 4 8-4"/><path d="m4 18 8 4 8-4"/></svg>',
        trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 6-6 4 4 8-10"/><path d="M14 5h7v7"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
        arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
      };
      return icons[name] || icons.doc;
    }

    function rowStatus(c) {
      if (c.failed > 0) return 'fail';
      if (c.skipped > 0) return 'skip';
      return 'pass';
    }

    function statCardV2Html(c) {
      return '<button type="button" class="stat-card-v2 ' + c.tone + '" data-filter="' + c.filter + '" data-metric="test" aria-pressed="false">' +
        '<div class="stat-card-icon" aria-hidden="true">' + iconSvg(c.icon) + '</div>' +
        '<div class="stat-card-value">' + c.value + '</div>' +
        '<div class="stat-card-label">' + escapeHtml(c.label) + '</div>' +
        '<span class="stat-card-pill">' + escapeHtml(c.pill) + '</span>' +
      '</button>';
    }

    function renderStatCards() {
      const t = data.summary.total;
      const cards = [
        { label: 'All Tests', value: t, tone: 'tone-all', filter: 'all', icon: 'doc', pill: '100% of total' },
        { label: 'Passed', value: data.summary.passed, tone: 'tone-pass', filter: 'pass', icon: 'check', pill: pct(data.summary.passed, t) + ' success rate' },
        { label: 'Failed', value: data.summary.failed, tone: 'tone-fail', filter: 'fail', icon: 'x', pill: pct(data.summary.failed, t) + ' failure rate' },
        { label: 'Skipped', value: data.summary.skipped, tone: 'tone-skip', filter: 'skip', icon: 'skip', pill: pct(data.summary.skipped, t) + ' skipped' },
        { label: 'Flaky', value: data.summary.flaky, tone: 'tone-flaky', filter: 'flaky', icon: 'alert', pill: pct(data.summary.flaky, t) + ' flaky' },
        { label: 'Retry', value: data.summary.retries, tone: 'tone-retry', filter: 'retry', icon: 'retry', pill: pct(data.summary.retries, t) + ' retried' }
      ];
      document.getElementById('stats-row').innerHTML = cards.map(statCardV2Html).join('');
      document.querySelectorAll('[data-metric="test"]').forEach(card => {
        card.addEventListener('click', () => setActiveFilter(card.dataset.filter || 'all', 'stat'));
      });
    }

    function renderHealthPanel() {
      const t = data.summary.total;
      const others = Math.max(0, t - data.summary.passed - data.summary.failed - data.summary.skipped);
      const w = (n) => (t > 0 ? (n / t * 100) : 0);
      const rateNum = t > 0 ? ((data.summary.passed / t) * 100).toFixed(1) : '0.0';
      document.getElementById('health-panel').innerHTML =
        '<div class="health-main">' +
          '<div class="health-title">' + iconSvg('shieldCheck') + ' Overall Test Health</div>' +
          '<div class="health-bar" role="img" aria-label="Test outcome distribution">' +
            '<div class="health-seg pass" style="width:' + w(data.summary.passed) + '%" title="Passed"></div>' +
            '<div class="health-seg fail" style="width:' + w(data.summary.failed) + '%" title="Failed"></div>' +
            '<div class="health-seg skip" style="width:' + w(data.summary.skipped) + '%" title="Skipped"></div>' +
            (others > 0 ? '<div class="health-seg other" style="width:' + w(others) + '%" title="Others"></div>' : '') +
          '</div>' +
          '<div class="health-legend">' +
            '<span class="health-legend-item"><span class="health-legend-dot" style="background:#22c55e"></span>Passed <strong>' + pct(data.summary.passed, t) + '</strong> (' + data.summary.passed + ')</span>' +
            '<span class="health-legend-item"><span class="health-legend-dot" style="background:#f43f5e"></span>Failed <strong>' + pct(data.summary.failed, t) + '</strong> (' + data.summary.failed + ')</span>' +
            '<span class="health-legend-item"><span class="health-legend-dot" style="background:#38bdf8"></span>Skipped <strong>' + pct(data.summary.skipped, t) + '</strong> (' + data.summary.skipped + ')</span>' +
            '<span class="health-legend-item"><span class="health-legend-dot" style="background:#cbd5e1"></span>Others <strong>' + pct(others, t) + '</strong> (' + others + ')</span>' +
          '</div>' +
        '</div>' +
        '<div class="health-aside">' +
          '<div class="health-rate-value">' + rateNum + '%</div>' +
          '<div class="health-rate-label">Success Rate</div>' +
          '<div class="health-meta">' + escapeHtml(data.summary.duration) + ' total run time</div>' +
        '</div>';
    }

    function renderLastRunBadge() {
      document.getElementById('last-run-badge').innerHTML =
        iconSvg('calendar') + '<span>Last run: ' + escapeHtml(data.summary.lastRun) + '</span>';
    }

    function renderSectionIcons() {
      document.getElementById('tests-section-icon').innerHTML = iconSvg('chart');
      document.getElementById('components-section-icon').innerHTML = iconSvg('layers');
    }

    function componentStatCardHtml(c) {
      return '<button type="button" class="component-stat-card ' + c.tone + '" data-stability="' + c.stability + '" data-metric="component" aria-pressed="false">' +
        '<div class="component-stat-icon" aria-hidden="true">' + iconSvg(c.icon) + '</div>' +
        '<div class="component-stat-body">' +
          '<div class="component-stat-title">' + escapeHtml(c.title) + '</div>' +
          '<div class="component-stat-desc">' + escapeHtml(c.desc) + '</div>' +
        '</div>' +
        '<div class="component-stat-metrics">' +
          '<div class="component-stat-value">' + c.value + '</div>' +
          '<span class="component-stat-pill">' + escapeHtml(c.pill) + '</span>' +
        '</div>' +
      '</button>';
    }

    function renderComponentStatCards() {
      const n = data.summary.componentCount;
      const cards = [
        {
          title: 'Stable',
          desc: 'Components are performing well',
          value: data.summary.stableComponents,
          tone: 'tone-stable',
          stability: 'stable',
          icon: 'shieldCheck',
          pill: pct(data.summary.stableComponents, n)
        },
        {
          title: 'Unstable',
          desc: 'Components need attention',
          value: data.summary.unstableComponents,
          tone: 'tone-unstable',
          stability: 'unstable',
          icon: 'shieldAlert',
          pill: pct(data.summary.unstableComponents, n)
        },
        {
          title: 'Total Components',
          desc: 'Across all test suites',
          value: n,
          tone: 'tone-total',
          stability: 'all',
          icon: 'layers',
          pill: '100%'
        }
      ];
      document.getElementById('component-stats-row').innerHTML = cards.map(componentStatCardHtml).join('');
      document.getElementById('components-chart-center').innerHTML =
        '<span class="center-num">' + n + '</span><span class="center-label">Total Components</span>';
      document.querySelectorAll('[data-metric="component"]').forEach(card => {
        card.addEventListener('click', () => setComponentStabilityFilter(card.dataset.stability || 'all'));
      });
    }

    function syncComponentStabilityUi() {
      document.querySelectorAll('[data-metric="component"]').forEach(card => {
        const stability = card.dataset.stability || 'all';
        const isActive = componentStabilityFilter !== 'all' && stability === componentStabilityFilter;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function setComponentStabilityFilter(filter) {
      componentStabilityFilter = filter;
      syncComponentStabilityUi();
      applyTableFilters();
      document.getElementById('component-table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function errorCellHtml(err) {
      if (!err) return '—';
      const safe = escapeHtml(err);
      return '<div class="error-cell" data-error-cell="1">' +
        '<div class="error-preview">' + safe + '</div>' +
        '<div class="error-full">' + safe + '</div>' +
        '<button type="button" class="error-toggle" aria-expanded="false">Show full error</button>' +
      '</div>';
    }

    function bindErrorToggles(root) {
      root.querySelectorAll('[data-error-cell]').forEach(cell => {
        const btn = cell.querySelector('.error-toggle');
        if (!btn || btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
          const expanded = cell.classList.toggle('is-expanded');
          btn.textContent = expanded ? 'Show less' : 'Show full error';
          btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
      });
    }

    function formatMs(ms) {
      if (!ms || ms <= 0) return '—';
      if (ms < 1000) return ms + 'ms';
      return (ms / 1000).toFixed(1) + 's';
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function stripAnsi(value) {
      return String(value).replace(/\u001b\[[0-9;]*m/g, '');
    }

    function suiteLabel(suite) {
      if (suite === 'accessibility') return 'Accessibility';
      if (suite === 'visual') return 'Visual';
      return 'Functional';
    }

    function suiteTagHtml(suite) {
      return '<span class="suite-tag suite-tag-' + escapeHtml(suite) + '">' + suiteLabel(suite) + '</span>';
    }

    function statusTagHtml(status) {
      const label = status === 'passed' ? 'Passed' : status === 'skipped' ? 'Skipped' : 'Failed';
      return '<span class="status-tag status-tag-' + status + '">' + label + '</span>';
    }

    function allTestRows() {
      const passed = (data.passedTests || []).map(t => ({ ...t, status: 'passed' }));
      const failed = (data.failedTests || []).map(t => ({ ...t, status: 'failed' }));
      const skipped = (data.skippedTests || []).map(t => ({ ...t, status: 'skipped' }));
      return passed.concat(failed, skipped);
    }

    function matchesStatusFilter(status) {
      if (activeFilter === 'pass') return status === 'passed';
      if (activeFilter === 'fail') return status === 'failed';
      if (activeFilter === 'skip') return status === 'skipped';
      if (activeFilter === 'flaky' || activeFilter === 'retry') return false;
      return true;
    }

    function getFilteredTestRows() {
      return allTestRows().filter(t => {
        if (!matchesStatusFilter(t.status)) return false;
        if (detailSuiteFilter !== 'all' && t.suite !== detailSuiteFilter) return false;
        if (drillSlug && t.slug !== drillSlug) return false;
        const hay = (t.component + ' ' + t.name + ' ' + (t.error || '')).toLowerCase();
        if (searchQuery && !hay.includes(searchQuery)) return false;
        return true;
      });
    }

    function countLink(label, count, drill, slug, suite, extraClass) {
      if (count <= 0) {
        return '<span class="count-link is-zero ' + (extraClass || '') + '" aria-disabled="true">' + count + '</span>';
      }
      return '<button type="button" class="count-link ' + (extraClass || '') + '"' +
        ' data-drill="' + drill + '" data-slug="' + escapeHtml(slug) + '"' +
        (suite ? ' data-suite="' + suite + '"' : '') +
        ' title="Show ' + count + ' ' + label + ' test(s)">' + count + '</button>';
    }

    function renderTestsDetailTable() {
      const rows = getFilteredTestRows();
      const tbody = document.getElementById('testsDetailTableBody');
      tbody.innerHTML = rows.length
        ? rows.map(t => {
            const err = stripAnsi(t.error || '');
            return '<tr data-detail-row="1" data-slug="' + escapeHtml(t.slug) + '" data-suite="' + escapeHtml(t.suite) + '" data-status="' + t.status + '">' +
              '<td><button type="button" class="count-link" data-drill="' + t.status + '" data-slug="' + escapeHtml(t.slug) + '"><strong>' + escapeHtml(t.component) + '</strong></button></td>' +
              '<td>' + statusTagHtml(t.status) + '</td>' +
              '<td>' + suiteTagHtml(t.suite) + '</td>' +
              '<td>' + escapeHtml(t.name) + '</td>' +
              '<td>' + formatMs(t.durationMs) + '</td>' +
              '<td>' + errorCellHtml(err) + '</td>' +
            '</tr>';
          }).join('')
        : '<tr><td colspan="6">No tests match this filter. Run component QA reports to populate per-test names in summary JSON.</td></tr>';
      bindDrillLinks(tbody);
      bindErrorToggles(tbody);
    }

    function bindDrillLinks(root) {
      root.querySelectorAll('[data-drill]').forEach(btn => {
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const drill = btn.dataset.drill || 'all';
          const slug = btn.dataset.slug || '';
          const suite = btn.dataset.suite || '';
          openTestDrill(drill, slug, suite);
        });
      });
    }

    function openTestDrill(drill, slug, suite) {
      if (drill === 'passed') activeFilter = 'pass';
      else if (drill === 'skipped') activeFilter = 'skip';
      else if (drill === 'failed') activeFilter = 'fail';
      else if (drill === 'all') activeFilter = 'all';
      else activeFilter = drill;
      drillSlug = slug || '';
      drillComponentName = slug
        ? (data.components.find(c => c.slug === slug)?.name || '')
        : '';
      detailSuiteFilter = suite || 'all';
      detailVisible = true;
      syncFilterUi();
      updateDetailPanel();
      applyTableFilters();
      highlightComponentRows();
      document.getElementById('tests-detail-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function syncFilterUi() {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', (b.dataset.filter || 'all') === activeFilter);
      });
      document.querySelectorAll('.stat-card-v2[data-metric="test"]').forEach(card => {
        const isActive = (card.dataset.filter || 'all') === activeFilter;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      document.querySelectorAll('.suite-chip').forEach(chip => {
        chip.classList.toggle('active', (chip.dataset.suite || 'all') === detailSuiteFilter);
      });
    }

    function highlightComponentRows() {
      document.querySelectorAll('#componentTableBody tr, #suiteTableBody tr').forEach(row => {
        row.classList.toggle('row-highlight', drillSlug && row.dataset.slug === drillSlug);
      });
    }

    function detailPanelShouldShow() {
      return activeFilter === 'pass' || activeFilter === 'fail' || activeFilter === 'skip' || Boolean(drillSlug);
    }

    function updateDetailPanel() {
      const panel = document.getElementById('tests-detail-card');
      const body = document.getElementById('tests-detail-body');
      const lead = document.getElementById('tests-detail-lead');
      const title = document.getElementById('tests-detail-title');
      const toggle = document.getElementById('tests-detail-toggle');
      const show = detailPanelShouldShow();
      panel.classList.toggle('visible', show);
      if (!show) return;

      body.classList.toggle('collapsed', !detailVisible);

      const rows = getFilteredTestRows();
      const statusLabel = activeFilter === 'pass' ? 'Passed' : activeFilter === 'skip' ? 'Skipped' : activeFilter === 'fail' ? 'Failed' : 'All';
      const suitePart = detailSuiteFilter === 'all' ? '' : ' · ' + suiteLabel(detailSuiteFilter);
      const compPart = drillComponentName ? ' — ' + drillComponentName : '';

      title.textContent = statusLabel + ' tests' + compPart;
      lead.textContent = rows.length + ' test(s)' + suitePart + '. Suite column shows Functional vs Accessibility vs Visual. Use Show/Hide to collapse this list.';

      toggle.textContent = detailVisible ? 'Hide' : 'Show';
      toggle.setAttribute('aria-expanded', detailVisible ? 'true' : 'false');
      if (detailVisible) renderTestsDetailTable();
    }

    function renderBugStats() {
      const bugs = data.bugs || { summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0, componentsHit: 0 }, bugs: [] };
      const s = bugs.summary;
      document.getElementById('bug-stats-row').innerHTML =
        '<div class="bug-stat-card"><span class="bug-stat-value">' + s.total + '</span><span class="bug-stat-label">Total bugs</span></div>' +
        '<div class="bug-stat-card bug-stat-critical"><span class="bug-stat-value">' + s.critical + '</span><span class="bug-stat-label">Critical</span></div>' +
        '<div class="bug-stat-card bug-stat-high"><span class="bug-stat-value">' + s.high + '</span><span class="bug-stat-label">High</span></div>' +
        '<div class="bug-stat-card bug-stat-components"><span class="bug-stat-value">' + s.componentsHit + '</span><span class="bug-stat-label">Components hit</span></div>';
    }

    function priorityTagHtml(priority) {
      return '<span class="priority-tag priority-' + escapeHtml(priority) + '">' + escapeHtml(priority) + '</span>';
    }

    function getFilteredBugs() {
      const list = (data.bugs && data.bugs.bugs) ? data.bugs.bugs : [];
      return list.filter(b => {
        if (bugFilter !== 'all' && b.priority !== bugFilter) return false;
        if (bugSearchQuery) {
          const hay = (b.displayId + ' ' + (b.canonicalId || '') + ' ' + b.title + ' ' + b.component + ' ' + b.category + ' ' + b.wcag).toLowerCase();
          if (!hay.includes(bugSearchQuery)) return false;
        }
        return true;
      });
    }

    function renderBugsTable() {
      const rows = getFilteredBugs();
      const tbody = document.getElementById('bugsTableBody');
      tbody.innerHTML = rows.length
        ? rows.map(b =>
            '<tr data-bug-priority="' + escapeHtml(b.priority) + '" data-slug="' + escapeHtml(b.slug) + '">' +
              '<td class="bug-id-cell">' + escapeHtml(b.displayId) +
                (b.canonicalId ? '<span class="bug-canonical">' + escapeHtml(b.canonicalId) + '</span>' : '') +
              '</td>' +
              '<td class="bug-title-cell">' + escapeHtml(b.title) + '</td>' +
              '<td><button type="button" class="count-link" data-drill="failed" data-slug="' + escapeHtml(b.slug) + '">' + escapeHtml(b.component) + '</button></td>' +
              '<td>' + escapeHtml(b.category) + '</td>' +
              '<td>' + priorityTagHtml(b.priority) + '</td>' +
              '<td>' + escapeHtml(b.wcag) + '</td>' +
              '<td><span class="effort-tag">' + escapeHtml(b.effort) + '</span></td>' +
              '<td>' + b.testCount + '</td>' +
            '</tr>'
          ).join('')
        : '<tr><td colspan="8">No bugs match this filter.</td></tr>';
      bindDrillLinks(tbody);
    }

    function renderVolumeLegend(withTests, colors) {
      const el = document.getElementById('volume-legend');
      el.innerHTML = withTests.map((c, i) =>
        '<button type="button" class="volume-legend-item" role="listitem" data-slug="' + escapeHtml(c.slug) + '" title="' + escapeHtml(c.name) + ': ' + c.total + ' tests">' +
          '<span class="volume-legend-swatch" style="background:' + colors[i] + '"></span>' +
          '<span class="volume-legend-name">' + escapeHtml(c.name) + '</span>' +
        '</button>'
      ).join('');
      el.querySelectorAll('.volume-legend-item').forEach(btn => {
        btn.addEventListener('click', () => {
          openTestDrill('all', btn.dataset.slug || '', '');
        });
      });
    }

    function bindVolumeCardActions() {
      document.getElementById('volume-info-icon').innerHTML = iconSvg('info');
      document.getElementById('volume-menu-icon').innerHTML = iconSvg('more');
      document.getElementById('view-all-arrow').innerHTML = iconSvg('arrow');
      document.getElementById('volume-menu-btn').addEventListener('click', () => {
        document.getElementById('component-table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      document.getElementById('view-all-components').addEventListener('click', () => {
        componentStabilityFilter = 'all';
        syncComponentStabilityUi();
        applyTableFilters();
        document.getElementById('component-table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    function renderCharts() {
      const stable = data.summary.stableComponents;
      const unstable = data.summary.unstableComponents;
      if (stable + unstable > 0) {
        new Chart(document.getElementById('componentsStabilityChart'), {
          type: 'doughnut',
          data: {
            labels: ['Stable', 'Unstable'],
            datasets: [{
              data: [stable, unstable],
              backgroundColor: ['#22c55e', '#f43f5e'],
              borderWidth: 0,
              hoverOffset: 6
            }]
          },
          options: {
            cutout: '72%',
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => ' ' + ctx.label + ': ' + ctx.parsed + ' (' + pct(ctx.parsed, stable + unstable) + ')'
                }
              }
            }
          }
        });
      }

      const withTests = [...data.components.filter(c => c.total > 0)].sort((a, b) => b.total - a.total);
      if (withTests.length) {
        const colors = withTests.map((_, i) => palette[i % palette.length]);
        renderVolumeLegend(withTests, colors);
        new Chart(document.getElementById('componentChart'), {
          type: 'doughnut',
          data: {
            labels: withTests.map(c => c.name),
            datasets: [{
              data: withTests.map(c => c.total),
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 6
            }]
          },
          options: {
            cutout: '58%',
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.parsed + ' tests' } }
            }
          }
        });
      } else {
        document.getElementById('volume-legend').innerHTML =
          '<p style="font-size:0.8125rem;color:var(--muted);grid-column:1/-1;">No component test data yet.</p>';
      }
    }

    function renderComponentTable() {
      const sorted = [...data.components].sort((a, b) => b.failed - a.failed || a.name.localeCompare(b.name));
      const tbody = document.getElementById('componentTableBody');
      tbody.innerHTML = sorted.map(c => {
        const rate = c.total > 0 ? Math.round((c.passed / c.total) * 100) : 0;
        const status = rowStatus(c);
        return '<tr data-status="' + status + '" data-name="' + c.name.toLowerCase() + '" data-slug="' + escapeHtml(c.slug) + '"' +
          ' data-passed="' + c.passed + '" data-failed="' + c.failed + '" data-skipped="' + c.skipped + '"' +
          ' data-flaky="' + (c.flaky > 0 ? 'yes' : 'no') + '">' +
          '<td><button type="button" class="count-link" data-drill="all" data-slug="' + escapeHtml(c.slug) + '"><strong>' + escapeHtml(c.name) + '</strong></button>' +
            ' <button type="button" class="run-tests-btn run-tests-btn-ghost run-row-btn" data-run-slug="' + escapeHtml(c.slug) + '" title="Run Playwright for this component">Run</button>' +
            '<br><span class="source-tag">' + c.source + ' · ' + c.slug + '</span></td>' +
          '<td>' + c.total + '</td>' +
          '<td>' + countLink('passed', c.passed, 'passed', c.slug, '', 'count-pass') +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + rate + '%"></div></div></td>' +
          '<td>' + countLink('failed', c.failed, 'failed', c.slug, '', 'count-fail') + '</td>' +
          '<td>' + countLink('skipped', c.skipped, 'skipped', c.slug, '', 'count-skip') + '</td>' +
          '<td><span class="count-flaky">' + c.flaky + '</span></td>' +
          '<td>' + c.duration + '</td>' +
          '<td>' + rate + '%</td>' +
          '<td><span class="badge badge-' + status + '">' + status.toUpperCase() + '</span></td>' +
        '</tr>';
      }).join('');
      bindDrillLinks(tbody);
      applyTableFilters();
    }

    function suiteCell(count, drill, slug, suite, isFail) {
      if (count <= 0) return '—';
      const prefix = isFail ? '❌ ' : '✅ ';
      return prefix + countLink(isFail ? 'failed' : 'passed', count, drill, slug, suite, isFail ? 'count-fail' : 'count-pass');
    }

    function renderSuiteTable() {
      const tbody = document.getElementById('suiteTableBody');
      tbody.innerHTML = data.components.map(c => {
        const fn = c.suites.functional;
        const a11y = c.suites.accessibility;
        const vis = c.suites.visual;
        return '<tr data-name="' + c.name.toLowerCase() + '" data-slug="' + escapeHtml(c.slug) + '">' +
          '<td><button type="button" class="count-link" data-drill="all" data-slug="' + escapeHtml(c.slug) + '"><strong>' + escapeHtml(c.name) + '</strong></button></td>' +
          '<td>' + suiteCell(fn.passed, 'passed', c.slug, 'functional', false) + '</td>' +
          '<td>' + suiteCell(fn.failed, 'failed', c.slug, 'functional', true) + '</td>' +
          '<td>' + suiteCell(a11y.passed, 'passed', c.slug, 'accessibility', false) + '</td>' +
          '<td>' + suiteCell(a11y.failed, 'failed', c.slug, 'accessibility', true) + '</td>' +
          '<td>' + suiteCell(vis.passed, 'passed', c.slug, 'visual', false) + '</td>' +
          '<td>' + suiteCell(vis.failed, 'failed', c.slug, 'visual', true) + '</td>' +
        '</tr>';
      }).join('');
      bindDrillLinks(tbody);
    }

    function applyTableFilters() {
      document.querySelectorAll('#componentTableBody tr').forEach(row => {
        const name = row.dataset.name || '';
        const passed = Number(row.dataset.passed) || 0;
        const failed = Number(row.dataset.failed) || 0;
        const skipped = Number(row.dataset.skipped) || 0;
        const isFlaky = row.dataset.flaky === 'yes';
        let show = true;
        if (activeFilter === 'fail') show = failed > 0;
        else if (activeFilter === 'pass') show = passed > 0;
        else if (activeFilter === 'skip') show = skipped > 0;
        else if (activeFilter === 'flaky') show = isFlaky;
        else if (activeFilter === 'retry') show = false;
        if (drillSlug && row.dataset.slug !== drillSlug) show = false;
        if (componentStabilityFilter === 'stable' && failed > 0) show = false;
        else if (componentStabilityFilter === 'unstable' && failed <= 0) show = false;
        if (searchQuery && !name.includes(searchQuery)) show = false;
        row.style.display = show ? '' : 'none';
      });

      document.querySelectorAll('#suiteTableBody tr').forEach(row => {
        const name = row.dataset.name || '';
        let show = !searchQuery || name.includes(searchQuery);
        if (drillSlug && row.dataset.slug !== drillSlug) show = false;
        row.style.display = show ? '' : 'none';
      });

      if (detailPanelShouldShow() && detailVisible) renderTestsDetailTable();
      highlightComponentRows();
    }

    function setActiveFilter(filter, source) {
      activeFilter = filter;
      if (filter === 'all') {
        drillSlug = '';
        drillComponentName = '';
        detailSuiteFilter = 'all';
        detailVisible = false;
      } else if (filter === 'pass' || filter === 'fail' || filter === 'skip') {
        detailVisible = true;
      }
      syncFilterUi();
      updateDetailPanel();
      applyTableFilters();
      if (source !== 'init') {
        if (filter === 'pass' || filter === 'fail' || filter === 'skip') {
          document.getElementById('tests-detail-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (filter !== 'retry') {
          document.getElementById('component-table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter || 'all', 'filter'));
    });

    document.querySelector('.search-input:not(#bug-search-input)').addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').toLowerCase().trim();
      applyTableFilters();
      updateDetailPanel();
    });

    document.getElementById('bug-search-input').addEventListener('input', (e) => {
      bugSearchQuery = (e.target.value || '').toLowerCase().trim();
      renderBugsTable();
    });

    document.querySelectorAll('.bug-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bugFilter = btn.dataset.bugFilter || 'all';
        document.querySelectorAll('.bug-filter-btn').forEach(b => {
          b.classList.toggle('active', (b.dataset.bugFilter || 'all') === bugFilter);
        });
        renderBugsTable();
      });
    });

    document.getElementById('tests-detail-toggle').addEventListener('click', () => {
      detailVisible = !detailVisible;
      updateDetailPanel();
    });

    document.querySelectorAll('.suite-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        detailSuiteFilter = chip.dataset.suite || 'all';
        detailVisible = true;
        syncFilterUi();
        updateDetailPanel();
      });
    });

    document.getElementById('generated-meta').textContent =
      'Generated ' + new Date(data.generatedAt).toLocaleString() +
      ' · ' + data.summary.componentCount + ' components' +
      ' (' + data.summary.sources.playwright + ' Playwright JSON, ' + data.summary.sources.summary + ' summary fallback)';

    if (!data.components.length || data.summary.total === 0) {
      document.getElementById('empty-banner').style.display = 'block';
      document.getElementById('overview-root').style.display = 'none';
    } else {
      renderSectionIcons();
      renderLastRunBadge();
      renderStatCards();
      renderHealthPanel();
      renderComponentStatCards();
      syncComponentStabilityUi();
      bindVolumeCardActions();
      renderCharts();
      renderBugStats();
      renderBugsTable();
      renderComponentTable();
      renderSuiteTable();
      initRunTestsPanel();
      setActiveFilter('all', 'init');
    }
  </script>
</body>
</html>`;
}
