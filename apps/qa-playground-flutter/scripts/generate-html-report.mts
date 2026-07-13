/**
 * generate-html-report.mts
 *
 * Reads Flutter `--file-reporter json:` NDJSON from qa-playground-flutter runs.
 * Writes:
 *   test-results/flutter-all.json          (copy/normalised)
 *   test-results/flutter-report.html       (detailed QA report — mirrors native Vitest UI)
 *   test-results/flutter-summary.json      (React QA dashboard shape)
 *
 * Run via: bash scripts/run_all_with_report.sh
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RESULTS = join(ROOT, 'test-results');

type Tier = 'smoke' | 'fn' | 'a11y' | 'catalog' | 'e2e' | 'visual' | 'other';
type SuiteId =
  | 'functional'
  | 'accessibility'
  | 'catalog'
  | 'smoke'
  | 'e2e'
  | 'visual'
  | 'other';

/// Per-case attachment paths for a failed golden test. Each value is a
/// site-rooted URL (e.g. `qa-reports/components/button-visual-assets/button_loading_testImage.png`)
/// the dashboard can render with `Image.network`.
interface VisualAssets {
  /// `*_masterImage.png` — the checked-in expected baseline.
  master?: string;
  /// `*_testImage.png` — the actual pixels produced by this run.
  test?: string;
  /// `*_maskedDiff.png` — diff with non-differing pixels masked out.
  maskedDiff?: string;
  /// `*_isolatedDiff.png` — diff isolated to only the differing pixels.
  isolatedDiff?: string;
}

interface ParsedTest {
  id: number;
  name: string;
  shortName: string;
  suitePath: string;
  suiteRel: string;
  groupName: string;
  component: string;
  tier: Tier;
  suiteId: SuiteId;
  platform: string | null;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
  line?: number;
  /// Populated for failed [golden] tests when `--visual-assets-dir` was passed.
  visualAssets?: VisualAssets;
}

interface FlutterEvent {
  type: string;
  time?: number;
  testID?: number;
  test?: {
    id: number;
    name: string;
    suiteID: number;
    line?: number;
  };
  suite?: { id: number; path: string };
  group?: { id: number; name: string; parentID: number | null };
  result?: string;
  skipped?: boolean;
  hidden?: boolean;
  error?: string;
  stackTrace?: string;
  message?: string;
  success?: boolean;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseTier(name: string): Tier {
  if (/\[smoke\]/i.test(name)) return 'smoke';
  if (/\[fn\]/i.test(name)) return 'fn';
  if (/\[a11y\]/i.test(name)) return 'a11y';
  if (/\[catalog\]/i.test(name)) return 'catalog';
  if (/\[e2e\]/i.test(name)) return 'e2e';
  // `[golden]` = pixel baseline comparison; `[visual]` = any other visual
  // category test (e.g. text rendering, icon glyph correctness, fallback
  // appearance). Both bucket into the Visual tier in the dashboard.
  if (/\[golden\]/i.test(name)) return 'visual';
  if (/\[visual\]/i.test(name)) return 'visual';
  return 'other';
}

function tierToSuiteId(tier: Tier): SuiteId {
  if (tier === 'a11y') return 'accessibility';
  if (tier === 'catalog') return 'catalog';
  if (tier === 'smoke') return 'smoke';
  if (tier === 'e2e') return 'e2e';
  if (tier === 'fn') return 'functional';
  if (tier === 'visual') return 'visual';
  return 'other';
}

function extractComponent(suitePath: string): string {
  const m = suitePath.match(/[/\\]components[/\\]([^/\\]+)[/\\]/);
  if (m) return m[1]!;
  // Integration tests: integration_test/<slug>_e2e_test.dart → slug
  const m3 = suitePath.match(/[/\\]integration_test[/\\]([^/\\]+)_e2e_test\.dart$/);
  if (m3) return m3[1]!;
  const m2 = suitePath.match(/[/\\]suites[/\\]([^/\\]+)/);
  if (m2) return 'suites';
  return 'other';
}

function extractPlatform(name: string): string | null {
  const m = name.match(/\((android|iOS|linux|macOS|windows|web)\)\s*$/i);
  return m ? m[1]!.toLowerCase() : null;
}

function shortTestName(full: string): string {
  const parts = full.split(' ');
  const last = parts[parts.length - 1] ?? full;
  if (last.match(/^\((android|iOS|linux)\)$/i)) {
    return parts.slice(0, -1).join(' ');
  }
  return full;
}

function parseFlutterJson(inputPath: string): {
  tests: ParsedTest[];
  startTime: number;
  endTime: number;
  success: boolean;
} {
  const lines = readFileSync(inputPath, 'utf8').split('\n').filter(Boolean);
  const suites = new Map<number, string>();
  const groups = new Map<number, string>();
  const testsMeta = new Map<
    number,
    { name: string; suiteID: number; line?: number; startTime: number }
  >();
  const done = new Map<
    number,
    { result: string; skipped: boolean; hidden: boolean; time: number; error?: string }
  >();
  /// Concatenated `print` event messages keyed by testID. Golden failures
  /// emit the `Golden "goldens/<name>.png"` reference here, NOT in the error
  /// event — the error event for golden tests is just "Test failed. See
  /// exception logs above." We mine these prints later for the golden basename.
  const prints = new Map<number, string>();

  let startTime = 0;
  let endTime = 0;
  let success = true;

  for (const line of lines) {
    let ev: FlutterEvent;
    try {
      ev = JSON.parse(line) as FlutterEvent;
    } catch {
      continue;
    }

    if (ev.type === 'start' && ev.time != null) startTime = ev.time;
    if (ev.type === 'done') {
      endTime = ev.time ?? endTime;
      success = ev.success !== false;
    }
    if (ev.type === 'suite' && ev.suite) suites.set(ev.suite.id, ev.suite.path);
    if (ev.type === 'group' && ev.group) groups.set(ev.group.id, ev.group.name);
    if (ev.type === 'testStart' && ev.test) {
      testsMeta.set(ev.test.id, {
        name: ev.test.name,
        suiteID: ev.test.suiteID,
        line: ev.test.line,
        startTime: ev.time ?? 0,
      });
    }
    if (ev.type === 'testDone' && ev.testID != null) {
      done.set(ev.testID, {
        result: ev.result ?? 'error',
        skipped: ev.skipped === true,
        hidden: ev.hidden === true,
        time: ev.time ?? 0,
        error: ev.error ?? ev.stackTrace,
      });
    }
    if (ev.type === 'error' && ev.testID != null) {
      const prev = done.get(ev.testID);
      done.set(ev.testID, {
        result: 'failure',
        skipped: false,
        hidden: false,
        time: ev.time ?? prev?.time ?? 0,
        error: ev.error ?? ev.stackTrace ?? prev?.error,
      });
    }
    if (ev.type === 'print' && ev.testID != null && ev.message) {
      const prev = prints.get(ev.testID) ?? '';
      prints.set(ev.testID, prev + ev.message + '\n');
    }
  }

  const tests: ParsedTest[] = [];

  for (const [id, meta] of testsMeta) {
    const finish = done.get(id);
    if (!finish || finish.hidden) continue;
    if (meta.name.startsWith('loading ')) continue;

    const suitePath = suites.get(meta.suiteID) ?? meta.name;
    const tier = parseTier(meta.name);
    const status: ParsedTest['status'] =
      finish.skipped || finish.result === 'skipped'
        ? 'skipped'
        : finish.result === 'success'
          ? 'passed'
          : 'failed';

    // Visual failures: append captured `print` log to error so the golden
    // path (`Golden "goldens/<name>.png"`) is visible to downstream regex
    // matching. Other tiers keep the original error to avoid noise.
    let combinedError = finish.error;
    if (tier === 'visual' && status === 'failed') {
      const printLog = prints.get(id) ?? '';
      combinedError =
        printLog.length > 0
          ? (finish.error ? finish.error + '\n' + printLog : printLog)
          : finish.error;
    }

    tests.push({
      id,
      name: meta.name,
      shortName: shortTestName(meta.name),
      suitePath,
      suiteRel: relative(ROOT, suitePath),
      groupName: groups.values().next().value ?? '',
      component: extractComponent(suitePath),
      tier,
      suiteId: tierToSuiteId(tier),
      platform: extractPlatform(meta.name),
      status,
      durationMs: Math.max(0, finish.time - meta.startTime),
      error: combinedError,
      line: meta.line,
    });
  }

  return { tests, startTime, endTime, success };
}

function tierTag(tier: Tier): string {
  const cls =
    tier === 'smoke'
      ? 'tag-smoke'
      : tier === 'fn'
        ? 'tag-fn'
        : tier === 'a11y'
          ? 'tag-a11y'
          : tier === 'catalog'
            ? 'tag-catalog'
            : tier === 'e2e'
              ? 'tag-e2e'
              : 'tag-other';
  return `<span class="tag ${cls}">${tier.toUpperCase()}</span>`;
}

function buildSummaryJson(tests: ParsedTest[], success: boolean, reportSlug = 'flutter-all') {
  const aggregate = (suiteId: SuiteId) => {
    const rows = tests.filter((t) => t.suiteId === suiteId);
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const cases = rows.map((r) => {
      if (r.status === 'passed') passed++;
      else if (r.status === 'skipped') skipped++;
      else failed++;
      return {
        name: r.shortName,
        status: r.status,
        durationMs: r.durationMs,
        component: r.component,
        platform: r.platform,
        tier: r.tier,
        error: r.error,
        visualAssets: r.visualAssets,
      };
    });
    return {
      suite: suiteId,
      passed,
      failed,
      skipped,
      logs: [`${rows.length} test(s) in Flutter QA report for ${suiteId}.`],
      errors: rows
        .filter((r) => r.status === 'failed')
        .map((r) => `${r.shortName}: ${r.error ?? 'failed'}`),
      cases,
    };
  };

  const functional = aggregate('functional');
  const accessibility = aggregate('accessibility');
  const catalog = aggregate('catalog');
  const smoke = aggregate('smoke');
  const e2e = aggregate('e2e');
  const visual = aggregate('visual');

  return {
    ok: success && tests.every((t) => t.status !== 'failed'),
    slug: reportSlug,
    message: success ? 'Flutter QA run completed' : 'Flutter QA run had failures',
    generatedAt: new Date().toISOString(),
    suites: {
      functional,
      accessibility,
      catalog,
      smoke,
      e2e,
      visual,
      performance: {
        suite: 'performance',
        passed: 0,
        failed: 0,
        skipped: 0,
        logs: ['Performance suite not part of Flutter widget QA.'],
        errors: [],
      },
    },
    totals: {
      passed: tests.filter((t) => t.status === 'passed').length,
      failed: tests.filter((t) => t.status === 'failed').length,
      skipped: tests.filter((t) => t.status === 'skipped').length,
      total: tests.length,
    },
  };
}

function buildHtml(
  tests: ParsedTest[],
  durationMs: number,
  success: boolean,
  title: string,
): string {
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const runDate = new Date().toLocaleString();
  const durationSec = (durationMs / 1000).toFixed(1);

  const components = [...new Set(tests.map((t) => t.component))].sort();
  const dropdownOptions = components
    .map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`)
    .join('\n            ');

  const byFile = new Map<string, ParsedTest[]>();
  for (const t of tests) {
    const list = byFile.get(t.suiteRel) ?? [];
    list.push(t);
    byFile.set(t.suiteRel, list);
  }

  const fileBlocks = [...byFile.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rel, fileTests]) => {
      const fp = fileTests.filter((t) => t.status === 'failed').length;
      const filePass = fileTests.filter((t) => t.status === 'passed').length;
      const fileDur = (
        fileTests.reduce((s, t) => s + t.durationMs, 0) / 1000
      ).toFixed(2);
      const comp = fileTests[0]?.component ?? 'other';

      const rows = fileTests
        .map((t) => {
          const icon = t.status === 'passed' ? '✓' : t.status === 'failed' ? '✗' : '○';
          const iconCls = t.status === 'passed' ? 'pass' : t.status === 'failed' ? 'fail' : 'skip';
          const plat = t.platform
            ? `<span class="platform-badge">${escHtml(t.platform)}</span>`
            : '';
          const err =
            t.status === 'failed' && t.error
              ? `<div class="error-block"><pre>${escHtml(t.error)}</pre></div>`
              : '';
          return `<div class="test-row ${t.status}" data-component="${escHtml(t.component)}" data-tier="${t.tier}">
        <div class="test-header">
          <span class="status-icon ${iconCls}">${icon}</span>
          ${tierTag(t.tier)}
          ${plat}
          <span class="test-name">${escHtml(t.shortName)}</span>
          <span class="test-dur">${t.durationMs}ms</span>
        </div>
        ${err}
      </div>`;
        })
        .join('\n');

      return `<details class="file-block ${fp ? 'file-fail' : 'file-pass'}" data-component="${escHtml(comp)}" open>
      <summary class="file-summary">
        <span class="file-icon">${fp ? '✗' : '✓'}</span>
        <span class="file-path">${escHtml(rel)}</span>
        <span class="file-counts">
          <span class="pass-count">${filePass} passed</span>
          ${fp ? `<span class="fail-count">${fp} failed</span>` : ''}
        </span>
        <span class="file-dur">${fileDur}s</span>
      </summary>
      <div class="suite-block">${rows}</div>
    </details>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flutter QA — ${escHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; }
    .header { background: #1a1d27; border-bottom: 1px solid #2d3147; padding: 20px 32px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .header-title { font-size: 18px; font-weight: 600; color: #f0f4ff; }
    .header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
    .stat-card { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 16px; border-radius: 8px; min-width: 80px; }
    .stat-value { font-size: 22px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .stat-total { background: #1e2235; }
    .stat-pass { background: #0f2a1a; }
    .stat-fail { background: #2a0f0f; }
    .stat-skip { background: #1e2235; }
    .stat-time { background: #1e2235; }
    .stat-pass .stat-value { color: #4ade80; }
    .stat-fail .stat-value { color: #f87171; }
    .stat-skip .stat-value { color: #94a3b8; }
    .stat-total .stat-value, .stat-time .stat-value { color: #94a3b8; }
    .status-banner { margin-left: auto; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-banner.all-pass { background: #052e16; color: #4ade80; border: 1px solid #16a34a; }
    .status-banner.has-fail { background: #2a0f0f; color: #f87171; border: 1px solid #dc2626; }
    .content { padding: 24px 32px; max-width: 1100px; margin: 0 auto; }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filter-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
    .filter-select { appearance: none; background: #1e2235; color: #c7d2fe; border: 1px solid #2d3147; border-radius: 6px; padding: 6px 12px; font-size: 12px; min-width: 140px; }
    .suite-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .suite-pill { font-size: 11px; padding: 4px 10px; border-radius: 999px; border: 1px solid #2d3147; color: #94a3b8; }
    .suite-pill.fn { border-color: #4c1d95; color: #c4b5fd; }
    .suite-pill.a11y { border-color: #14532d; color: #6ee7b7; }
    .suite-pill.smoke { border-color: #0c4a6e; color: #7dd3fc; }
    .file-block { background: #1a1d27; border: 1px solid #2d3147; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
    .file-block.file-fail { border-color: #7f1d1d; }
    .file-block.file-pass { border-color: #14532d; }
    .file-summary { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; list-style: none; background: #20243a; user-select: none; }
    .file-summary::-webkit-details-marker { display: none; }
    .file-icon { font-size: 14px; }
    .file-block.file-pass .file-icon { color: #4ade80; }
    .file-block.file-fail .file-icon { color: #f87171; }
    .file-path { font-size: 13px; font-weight: 500; color: #c7d2fe; font-family: 'JetBrains Mono', monospace; flex: 1; }
    .file-counts { display: flex; gap: 8px; font-size: 12px; }
    .pass-count { color: #4ade80; }
    .fail-count { color: #f87171; }
    .file-dur { font-size: 12px; color: #475569; }
    .suite-block { padding: 4px 16px 12px; }
    .test-row { border-radius: 6px; margin: 2px 0; }
    .test-row.failed { background: #1a0a0a; }
    .test-header { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; }
    .test-header:hover { background: #252a3f; }
    .status-icon { font-size: 13px; font-weight: 700; width: 18px; flex-shrink: 0; }
    .status-icon.pass { color: #4ade80; }
    .status-icon.fail { color: #f87171; }
    .status-icon.skip { color: #94a3b8; }
    .test-name { flex: 1; font-size: 13px; color: #cbd5e1; }
    .test-dur { font-size: 11px; color: #475569; flex-shrink: 0; }
    .tag { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 10px; letter-spacing: 0.3px; flex-shrink: 0; }
    .tag-smoke { background: #1e3a5f; color: #7dd3fc; }
    .tag-fn { background: #2d1b69; color: #c4b5fd; }
    .tag-a11y { background: #1a3a2a; color: #6ee7b7; }
    .tag-catalog { background: #3b2f0a; color: #fcd34d; }
    .tag-other { background: #2d2d2d; color: #94a3b8; }
    .platform-badge { font-size: 10px; color: #64748b; border: 1px solid #334155; border-radius: 4px; padding: 1px 5px; }
    .error-block { margin: 4px 10px 8px 36px; padding: 8px 12px; background: #1f0a0a; border-left: 3px solid #dc2626; border-radius: 0 4px 4px 0; }
    .error-block pre { font-size: 11px; color: #fca5a5; white-space: pre-wrap; word-break: break-word; font-family: 'JetBrains Mono', monospace; max-height: 240px; overflow: auto; }
    .footer { text-align: center; padding: 32px; font-size: 12px; color: #334155; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">Flutter QA — ${escHtml(title)}</div>
      <div class="header-sub">flutter_test · headless VM · ${escHtml(runDate)}</div>
    </div>
    <div class="stat-card stat-total"><div class="stat-value">${tests.length}</div><div class="stat-label">Total</div></div>
    <div class="stat-card stat-pass"><div class="stat-value">${passed}</div><div class="stat-label">Passed</div></div>
    <div class="stat-card stat-fail"><div class="stat-value">${failed}</div><div class="stat-label">Failed</div></div>
    <div class="stat-card stat-skip"><div class="stat-value">${skipped}</div><div class="stat-label">Skipped</div></div>
    <div class="stat-card stat-time"><div class="stat-value">${durationSec}s</div><div class="stat-label">Duration</div></div>
    <div class="status-banner ${failed === 0 ? 'all-pass' : 'has-fail'}">${failed === 0 ? '✓ All tests passed' : `✗ ${failed} failed`}</div>
  </div>
  <div class="content">
    <div class="toolbar">
      <div class="filters">
        <span class="filter-label">Component</span>
        <select class="filter-select" id="comp-filter" onchange="applyFilters()">
          <option value="">All</option>
          ${dropdownOptions}
        </select>
        <span class="filter-label">Tier</span>
        <select class="filter-select" id="tier-filter" onchange="applyFilters()">
          <option value="">All</option>
          <option value="smoke">Smoke</option>
          <option value="fn">Functional</option>
          <option value="a11y">Accessibility</option>
          <option value="catalog">Catalog</option>
        </select>
      </div>
    </div>
    <div class="suite-pills">
      <span class="suite-pill smoke">Smoke: ${tests.filter((t) => t.tier === 'smoke').length}</span>
      <span class="suite-pill fn">Functional: ${tests.filter((t) => t.tier === 'fn').length}</span>
      <span class="suite-pill a11y">Accessibility: ${tests.filter((t) => t.tier === 'a11y').length}</span>
      <span class="suite-pill">Catalog: ${tests.filter((t) => t.tier === 'catalog').length}</span>
    </div>
    ${fileBlocks}
  </div>
  <div class="footer">Generated by <code>generate-html-report.mts</code> · OneUI QA Playground Flutter</div>
  <script>
    function applyFilters() {
      var comp = document.getElementById('comp-filter').value;
      var tier = document.getElementById('tier-filter').value;
      document.querySelectorAll('.file-block').forEach(function(block) {
        var bc = block.getAttribute('data-component');
        var showFile = (!comp || bc === comp);
        if (showFile && tier) {
          var rows = block.querySelectorAll('.test-row');
          var any = false;
          rows.forEach(function(row) {
            var match = row.getAttribute('data-tier') === tier;
            row.style.display = match ? '' : 'none';
            if (match) any = true;
          });
          block.style.display = any ? '' : 'none';
        } else {
          block.style.display = showFile ? '' : 'none';
          block.querySelectorAll('.test-row').forEach(function(row) { row.style.display = ''; });
        }
      });
    }
  </script>
</body>
</html>`;
}

interface ExistingCase {
  name?: string;
  status?: string;
  durationMs?: number;
  component?: string;
  platform?: string | null;
  tier?: string;
  error?: string;
  visualAssets?: VisualAssets;
}

/// Each failure trio Flutter writes when `matchesGoldenFile` fails.
/// Keyed by `<basename>` (e.g. `button_loading`), which is the golden filename
/// minus extension. The dashboard renders these three columns side-by-side.
type VisualAssetKind = 'master' | 'test' | 'maskedDiff' | 'isolatedDiff';
const _kAssetSuffix: Record<VisualAssetKind, string> = {
  master: '_masterImage.png',
  test: '_testImage.png',
  maskedDiff: '_maskedDiff.png',
  isolatedDiff: '_isolatedDiff.png',
};

/// Scans [failuresDir] for Flutter's `_testImage.png` / `_masterImage.png` /
/// `_maskedDiff.png` / `_isolatedDiff.png` trios, copies each into [outDir],
/// and returns a `basename → VisualAssets` map where every URL is site-rooted
/// at [urlPrefix] (e.g. `qa-reports/components/button-visual-assets`).
function collectVisualAssets(
  failuresDir: string,
  outDir: string,
  urlPrefix: string,
): Map<string, VisualAssets> {
  const out = new Map<string, VisualAssets>();
  if (!existsSync(failuresDir)) return out;

  mkdirSync(outDir, { recursive: true });
  const entries = readdirSync(failuresDir);
  for (const file of entries) {
    if (!file.endsWith('.png')) continue;
    let kind: VisualAssetKind | null = null;
    let base = '';
    for (const k of Object.keys(_kAssetSuffix) as VisualAssetKind[]) {
      const suffix = _kAssetSuffix[k];
      if (file.endsWith(suffix)) {
        kind = k;
        base = file.slice(0, -suffix.length);
        break;
      }
    }
    if (!kind || !base) continue;

    copyFileSync(join(failuresDir, file), join(outDir, file));
    const existing = out.get(base) ?? {};
    existing[kind] = `${urlPrefix.replace(/\/+$/, '')}/${file}`;
    out.set(base, existing);
  }
  return out;
}

/// Extracts the golden filename basename (e.g. `button_loading`) from the
/// `matchesGoldenFile` error message. Returns null if no match.
///
/// Flutter's error includes the path: `goldens/<basename>.png`. We match that
/// substring so the basename does not depend on the test description naming.
function goldenBasenameFromError(error: string | undefined): string | null {
  if (!error) return null;
  const m = error.match(/goldens[/\\]([\w.-]+)\.png/);
  return m ? m[1]! : null;
}

/// Reads the prior summary at [summaryPath] and pulls out any e2e cases whose
/// platform != [currentPlatform]. The run_e2e_with_report.sh flow only ever
/// targets one device at a time, so re-running on iOS after Android would
/// overwrite Android. Preserving cross-platform cases lets the dashboard show
/// Android *and* iOS chips on the E2E tab after consecutive runs.
function loadOtherPlatformE2eCases(
  summaryPath: string,
  currentPlatform: string | null,
): ExistingCase[] {
  if (!currentPlatform || !existsSync(summaryPath)) return [];
  try {
    const raw = readFileSync(summaryPath, 'utf8');
    const parsed = JSON.parse(raw) as {
      suites?: { e2e?: { cases?: ExistingCase[] } };
    };
    const cases = parsed.suites?.e2e?.cases ?? [];
    return cases.filter((c) => {
      const p = (c.platform ?? '').toString().trim().toLowerCase();
      return p && p !== currentPlatform;
    });
  } catch {
    return [];
  }
}

function main() {
  const input = process.argv[2] ?? join(RESULTS, 'flutter-all.json');
  const htmlOut = process.argv[3] ?? join(RESULTS, 'flutter-report.html');
  const summaryOut = process.argv[4] ?? join(RESULTS, 'flutter-summary.json');
  const title = process.argv[5] ?? 'All Components';
  // Optional 6th arg: device platform from run_e2e_with_report.sh
  // (`android` / `ios`). `flutter test -d <device>` does not embed this in the
  // test name, so the shell script threads it through and we stamp every [e2e]
  // case missing a platform with this value — the dashboard's Android / iOS
  // filter chips then light up on the E2E tab.
  const e2ePlatform = (process.argv[6] ?? '').trim().toLowerCase() || null;

  // Optional 7th + 8th args: visual failure assets.
  //   argv[7] — filesystem path to the `test/components/<slug>/failures/` dir
  //             produced by a failed `matchesGoldenFile` run.
  //   argv[8] — site-rooted URL prefix (e.g.
  //             `qa-reports/components/button-visual-assets`) where the
  //             dashboard will fetch the copied PNGs from.
  //
  // When both are provided, every PNG in the failures dir is copied into
  // `web/qa-reports/components/<slug>-visual-assets/` (mkdir-ed by the script)
  // and attached to each failed [golden] case's `visualAssets` field.
  const visualFailuresDir = (process.argv[7] ?? '').trim() || null;
  const visualAssetsOutDir = (process.argv[9] ?? '').trim() || null;
  const visualAssetsUrl = (process.argv[8] ?? '').trim() || null;

  if (!existsSync(input)) {
    console.error(`Input not found: ${input}`);
    process.exit(1);
  }

  mkdirSync(RESULTS, { recursive: true });
  const { tests, startTime, endTime, success } = parseFlutterJson(input);
  if (e2ePlatform) {
    for (const t of tests) {
      if (t.tier === 'e2e' && !t.platform) t.platform = e2ePlatform;
    }
  }

  // Attach failure diff PNGs to failed [golden] tests.
  if (visualFailuresDir && visualAssetsOutDir && visualAssetsUrl) {
    const assetMap = collectVisualAssets(
      visualFailuresDir,
      visualAssetsOutDir,
      visualAssetsUrl,
    );
    if (assetMap.size > 0) {
      let attached = 0;
      for (const t of tests) {
        if (t.tier !== 'visual' || t.status !== 'failed') continue;
        const base = goldenBasenameFromError(t.error);
        if (base && assetMap.has(base)) {
          t.visualAssets = assetMap.get(base);
          attached++;
        }
      }
      console.log(
        `→ Visual: copied ${assetMap.size} failure trio(s), attached ${attached} to test case(s)`,
      );
    }
  }
  const durationMs = Math.max(0, endTime - startTime);

  const summary = buildSummaryJson(tests, success, title);

  // Merge prior runs from other devices so Android + iOS chips coexist.
  if (e2ePlatform && summary.suites.e2e) {
    const others = loadOtherPlatformE2eCases(summaryOut, e2ePlatform);
    if (others.length > 0) {
      const e2eSuite = summary.suites.e2e;
      e2eSuite.cases = [...e2eSuite.cases, ...others];
      for (const c of others) {
        if (c.status === 'passed') e2eSuite.passed++;
        else if (c.status === 'skipped') e2eSuite.skipped++;
        else e2eSuite.failed++;
      }
      e2eSuite.logs = [
        `${e2eSuite.cases.length} test(s) in Flutter QA report for e2e ` +
          `(merged with prior platforms: ${[
            ...new Set(
              others.map((c) => (c.platform ?? '').toString().toLowerCase()),
            ),
          ].join(', ')}).`,
      ];
      summary.totals.passed += others.filter((c) => c.status === 'passed').length;
      summary.totals.failed += others.filter(
        (c) => c.status !== 'passed' && c.status !== 'skipped',
      ).length;
      summary.totals.skipped += others.filter((c) => c.status === 'skipped').length;
      summary.totals.total += others.length;
      console.log(`→ Merged ${others.length} prior e2e case(s) from other platforms`);
    }
  }

  writeFileSync(summaryOut, JSON.stringify(summary, null, 2), 'utf8');
  writeFileSync(htmlOut, buildHtml(tests, durationMs, success, title), 'utf8');

  console.log(`Wrote ${htmlOut}`);
  console.log(`Wrote ${summaryOut}`);
  console.log(`Tests: ${tests.length} · Passed: ${tests.filter((t) => t.status === 'passed').length} · Failed: ${tests.filter((t) => t.status === 'failed').length}`);
}

main();
