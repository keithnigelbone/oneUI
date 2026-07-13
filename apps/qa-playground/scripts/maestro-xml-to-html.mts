/**
 * maestro-xml-to-html.mts
 *
 * Reads:
 *   apps/qa-playground/native/e2e/maestro/test-results/results.xml  — JUnit XML from Maestro
 *
 * Writes:
 *   apps/qa-playground/native/e2e/maestro/test-results/maestro-report.html
 *
 * Run via:
 *   pnpm --filter @oneui/qa-playground qa:native:e2e:report:html
 *
 * Generate the XML first with:
 *   pnpm qa:native:e2e:ios   (or :android)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAESTRO_RESULTS = join(__dirname, '..', 'native', 'e2e', 'maestro', 'test-results');
const XML_FILE = join(MAESTRO_RESULTS, 'results.xml');
const OUT_HTML = join(MAESTRO_RESULTS, 'maestro-report.html');

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestCase {
  name: string;
  classname: string;
  time: number;
  status: 'passed' | 'failed' | 'skipped';
  failureMessage?: string;
}

interface TestSuite {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  skipped: number;
  time: number;
  testCases: TestCase[];
}

interface ParsedReport {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalTime: number;
  suites: TestSuite[];
}

// ─── JUnit XML parser ─────────────────────────────────────────────────────────
// Lightweight regex-based parser for the simple JUnit XML format Maestro outputs.

function attr(tag: string, name: string): string {
  const m = new RegExp(`${name}="([^"]*)"`, 'i').exec(tag);
  return m ? m[1] : '';
}

function numAttr(tag: string, name: string): number {
  const v = attr(tag, name);
  return v ? parseFloat(v) : 0;
}

function parseXml(xml: string): ParsedReport {
  const suites: TestSuite[] = [];

  // Match each <testsuite ...>...</testsuite> block.
  // Use \b to avoid matching <testsuites> (the wrapper element).
  const suiteRe = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/gi;
  let suiteMatch: RegExpExecArray | null;

  while ((suiteMatch = suiteRe.exec(xml)) !== null) {
    const suiteAttrs = suiteMatch[1];
    const suiteBody = suiteMatch[2];

    const suite: TestSuite = {
      name: attr(suiteAttrs, 'name'),
      tests: numAttr(suiteAttrs, 'tests'),
      failures: numAttr(suiteAttrs, 'failures'),
      errors: numAttr(suiteAttrs, 'errors'),
      skipped: numAttr(suiteAttrs, 'skipped'),
      time: numAttr(suiteAttrs, 'time'),
      testCases: [],
    };

    // Match each <testcase ...> (self-closing or with children)
    const caseRe = /<testcase([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/gi;
    let caseMatch: RegExpExecArray | null;

    while ((caseMatch = caseRe.exec(suiteBody)) !== null) {
      const caseAttrs = caseMatch[1];
      const caseBody = caseMatch[2] ?? '';

      let status: TestCase['status'] = 'passed';
      let failureMessage: string | undefined;

      if (/<failure/i.test(caseBody)) {
        status = 'failed';
        const msgMatch = /message="([^"]*)"/.exec(caseBody);
        const bodyText = caseBody.replace(/<[^>]*>/g, '').trim();
        failureMessage = msgMatch ? msgMatch[1] : bodyText || 'Test failed';
      } else if (/<skipped/i.test(caseBody)) {
        status = 'skipped';
      }

      suite.testCases.push({
        name: attr(caseAttrs, 'name'),
        classname: attr(caseAttrs, 'classname'),
        time: numAttr(caseAttrs, 'time'),
        status,
        failureMessage,
      });
    }

    suites.push(suite);
  }

  const totalTests   = suites.reduce((s, x) => s + x.tests, 0);
  const totalFailed  = suites.reduce((s, x) => s + x.failures + x.errors, 0);
  const totalSkipped = suites.reduce((s, x) => s + x.skipped, 0);
  const totalPassed  = totalTests - totalFailed - totalSkipped;
  const totalTime    = suites.reduce((s, x) => s + x.time, 0);

  return { totalTests, totalPassed, totalFailed, totalSkipped, totalTime, suites };
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function flowType(name: string): string {
  const p0 = ['button', 'chip', 'chip-group', 'bottom-navigation-item'];
  const normalized = name.toLowerCase().replace(/[^a-z-]/g, '');
  if (p0.some((k) => normalized.includes(k.replace('-', '')))) {
    return '<span class="priority p0">P0 Interactive</span>';
  }
  return '<span class="priority p1">P1 Display</span>';
}

function buildHtml(report: ParsedReport, generatedAt: string): string {
  let suiteSections = '';

  for (const suite of report.suites) {
    const suitePassed = suite.testCases.filter((c) => c.status === 'passed').length;
    const suiteFailed = suite.testCases.filter((c) => c.status === 'failed').length;
    const suiteSkipped = suite.testCases.filter((c) => c.status === 'skipped').length;
    const suiteStatusCls = suiteFailed > 0 ? 'suite-fail' : 'suite-pass';

    let caseRows = '';
    for (const tc of suite.testCases) {
      const icon   = tc.status === 'passed' ? '✓' : tc.status === 'skipped' ? '⊘' : '✗';
      const cls    = tc.status === 'passed' ? 'pass' : tc.status === 'skipped' ? 'skip' : 'fail';
      const dur    = tc.time > 0 ? `${tc.time.toFixed(2)}s` : '—';
      const errRow = tc.failureMessage
        ? `<div class="case-error"><pre>${escHtml(tc.failureMessage)}</pre></div>`
        : '';

      caseRows += `
        <div class="case-row ${cls}">
          <span class="case-icon ${cls}">${icon}</span>
          <span class="case-name">${escHtml(tc.name)}</span>
          <span class="case-dur">${dur}</span>
        </div>
        ${errRow}`;
    }

    suiteSections += `
      <details class="suite-block ${suiteStatusCls}" open>
        <summary class="suite-summary">
          <span class="suite-icon">${suiteFailed > 0 ? '✗' : '✓'}</span>
          <span class="suite-name">${escHtml(suite.name)}</span>
          ${flowType(suite.name)}
          <span class="suite-counts">
            <span class="pass-count">${suitePassed} passed</span>
            ${suiteFailed > 0 ? `<span class="fail-count">${suiteFailed} failed</span>` : ''}
            ${suiteSkipped > 0 ? `<span class="skip-count">${suiteSkipped} skipped</span>` : ''}
          </span>
          <span class="suite-time">${suite.time.toFixed(2)}s</span>
        </summary>
        <div class="case-list">${caseRows}</div>
      </details>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maestro E2E Report — Native QA</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
    }

    /* ── Header ──────────────────────────────────────────────── */
    .header {
      background: #1a1d27;
      border-bottom: 1px solid #2d3147;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .header-title { font-size: 18px; font-weight: 600; color: #f0f4ff; }
    .header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 16px;
      border-radius: 8px;
      min-width: 80px;
    }
    .stat-value { font-size: 22px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .stat-total  { background: #1e2235; }
    .stat-pass   { background: #0f2a1a; }
    .stat-fail   { background: #2a0f0f; }
    .stat-skip   { background: #2a1f0f; }
    .stat-time   { background: #1e2235; }
    .stat-pass .stat-value { color: #4ade80; }
    .stat-fail .stat-value { color: #f87171; }
    .stat-skip .stat-value { color: #fbbf24; }
    .stat-total .stat-value, .stat-time .stat-value { color: #94a3b8; }

    .status-banner {
      margin-left: auto;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-banner.all-pass { background: #052e16; color: #4ade80; border: 1px solid #16a34a; }
    .status-banner.has-fail { background: #2a0f0f; color: #f87171; border: 1px solid #dc2626; }

    .info-bar {
      background: #131825;
      border-bottom: 1px solid #2d3147;
      padding: 8px 32px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      gap: 24px;
    }
    .info-bar span { color: #94a3b8; }

    /* ── Content ─────────────────────────────────────────────── */
    .content { padding: 24px 32px; max-width: 900px; margin: 0 auto; }

    .suite-block {
      background: #1a1d27;
      border: 1px solid #2d3147;
      border-radius: 10px;
      margin-bottom: 14px;
      overflow: hidden;
    }
    .suite-block.suite-fail { border-color: #7f1d1d; }
    .suite-block.suite-pass { border-color: #14532d; }

    .suite-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      cursor: pointer;
      list-style: none;
      background: #20243a;
      user-select: none;
    }
    .suite-summary::-webkit-details-marker { display: none; }

    .suite-icon { font-size: 14px; }
    .suite-block.suite-pass .suite-icon { color: #4ade80; }
    .suite-block.suite-fail .suite-icon { color: #f87171; }
    .suite-name { font-size: 14px; font-weight: 600; color: #c7d2fe; }

    .priority {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }
    .priority.p0 { background: #3b1a6b; color: #c4b5fd; }
    .priority.p1 { background: #1e3a5f; color: #7dd3fc; }

    .suite-counts { display: flex; gap: 8px; font-size: 12px; }
    .pass-count { color: #4ade80; }
    .fail-count { color: #f87171; }
    .skip-count { color: #fbbf24; }
    .suite-time { margin-left: auto; font-size: 12px; color: #475569; }

    /* ── Cases ───────────────────────────────────────────────── */
    .case-list { padding: 8px 16px 12px; }

    .case-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    .case-row.fail { background: #1a0a0a; }
    .case-row.skip { background: #1a1505; }
    .case-row:hover { background: #252a3f; }

    .case-icon {
      font-size: 13px;
      font-weight: 700;
      width: 18px;
      flex-shrink: 0;
    }
    .case-icon.pass { color: #4ade80; }
    .case-icon.fail { color: #f87171; }
    .case-icon.skip { color: #fbbf24; }

    .case-name { flex: 1; color: #cbd5e1; }
    .case-dur  { font-size: 11px; color: #475569; flex-shrink: 0; }

    .case-error {
      margin: 0 10px 4px 38px;
      padding: 8px 12px;
      background: #1f0a0a;
      border-left: 3px solid #dc2626;
      border-radius: 0 4px 4px 0;
    }
    .case-error pre {
      font-size: 11px;
      color: #fca5a5;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      max-height: 150px;
      overflow: auto;
    }

    /* ── Notice ──────────────────────────────────────────────── */
    .no-results {
      text-align: center;
      padding: 60px;
      color: #475569;
    }
    .no-results h2 { color: #64748b; margin-bottom: 12px; }
    .no-results code {
      background: #1e2235;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    /* ── Footer ──────────────────────────────────────────────── */
    .footer {
      text-align: center;
      padding: 32px;
      font-size: 12px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">Maestro E2E Report</div>
      <div class="header-sub">iOS / Android · Real simulator/emulator · Generated: ${escHtml(generatedAt)}</div>
    </div>
    <div class="stat-card stat-total">
      <div class="stat-value">${report.totalTests}</div>
      <div class="stat-label">Total</div>
    </div>
    <div class="stat-card stat-pass">
      <div class="stat-value">${report.totalPassed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card stat-fail">
      <div class="stat-value">${report.totalFailed}</div>
      <div class="stat-label">Failed</div>
    </div>
    ${report.totalSkipped > 0 ? `<div class="stat-card stat-skip"><div class="stat-value">${report.totalSkipped}</div><div class="stat-label">Skipped</div></div>` : ''}
    <div class="stat-card stat-time">
      <div class="stat-value">${report.totalTime.toFixed(1)}s</div>
      <div class="stat-label">Duration</div>
    </div>
    <div class="status-banner ${report.totalFailed === 0 ? 'all-pass' : 'has-fail'}">
      ${report.totalFailed === 0 ? '✓ All flows passed' : `✗ ${report.totalFailed} flow(s) failed`}
    </div>
  </div>

  <div class="info-bar">
    <div>App ID: <span>com.oneui.nativecomponents</span></div>
    <div>Flows tested: <span>${report.suites.length}</span></div>
    <div>Source: <span>apps/qa-playground/native/e2e/maestro/</span></div>
  </div>

  <div class="content">
    ${report.suites.length === 0
      ? `<div class="no-results">
          <h2>No test results found</h2>
          <p>Run Maestro E2E tests first, then generate this report:</p>
          <br>
          <code>pnpm qa:native:e2e:ios</code>
          <br><br>
          <code>pnpm qa:native:e2e:report:html</code>
        </div>`
      : suiteSections}
  </div>

  <div class="footer">
    Generated by <code>maestro-xml-to-html.mts</code> · OneUI QA Playground
  </div>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  mkdirSync(MAESTRO_RESULTS, { recursive: true });

  if (!existsSync(XML_FILE)) {
    console.error(`\nNo Maestro JUnit XML found at:\n  ${XML_FILE}\n`);
    console.error('Run Maestro tests first:');
    console.error('  pnpm qa:native:e2e:ios\n  (or) pnpm qa:native:e2e:android\n');
    // Still generate an empty-state HTML so opening the report doesn't 404
    const emptyReport: ParsedReport = {
      totalTests: 0, totalPassed: 0, totalFailed: 0,
      totalSkipped: 0, totalTime: 0, suites: [],
    };
    const html = buildHtml(emptyReport, new Date().toLocaleString());
    writeFileSync(OUT_HTML, html, 'utf8');
    console.log(`Empty-state report written → ${OUT_HTML}\n`);
    process.exit(0);
  }

  const xml = readFileSync(XML_FILE, 'utf8');
  const report = parseXml(xml);

  console.log(`Parsed ${report.suites.length} flow(s), ${report.totalTests} test case(s).`);
  console.log(`  Passed: ${report.totalPassed}  Failed: ${report.totalFailed}  Skipped: ${report.totalSkipped}`);

  const html = buildHtml(report, new Date().toLocaleString());
  writeFileSync(OUT_HTML, html, 'utf8');
  console.log(`\nReport written → ${OUT_HTML}`);
  console.log(`Open with:  open "${OUT_HTML}"\n`);

  if (report.totalFailed > 0) process.exit(1);
}

main();
