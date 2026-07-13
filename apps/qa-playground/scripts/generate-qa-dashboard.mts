/**
 * Reads Playwright JSON + qa-reports summaries and writes
 * `public/qa-reports/dashboard/index.html`.
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aggregatePlaywrightJson,
  aggregateSummaryJson,
  buildDashboardData,
  type ComponentDashboard,
} from './lib/aggregatePlaywrightDashboard';
import { renderDashboardHtml } from './lib/dashboardHtml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const TEST_RESULTS = join(ROOT, 'test-results');
const SUMMARY_DIR = join(ROOT, 'public', 'qa-reports');
const OUT_DIR = join(SUMMARY_DIR, 'dashboard');
const OUT_HTML = join(OUT_DIR, 'index.html');

function discoverPlaywrightJson(): string[] {
  const files: string[] = [];
  if (!existsSync(TEST_RESULTS)) return files;

  for (const name of readdirSync(TEST_RESULTS)) {
    if (name.endsWith('-playwright.json')) {
      files.push(join(TEST_RESULTS, name));
    }
  }

  const badgeJson = join(ROOT, 'badge-playground-test-results.json');
  if (existsSync(badgeJson)) files.push(badgeJson);

  return files;
}

function discoverSummaryJson(): string[] {
  if (!existsSync(SUMMARY_DIR)) return [];
  return readdirSync(SUMMARY_DIR)
    .filter((name) => name.endsWith('-summary.json'))
    .map((name) => join(SUMMARY_DIR, name));
}

function main() {
  const bySlug = new Map<string, ComponentDashboard>();
  /** Prefer the artefact with the newest mtime per slug (summary vs playwright JSON). */
  const mtimeBySlug = new Map<string, number>();

  const mergeRow = (row: ComponentDashboard, filePath: string) => {
    const mtime = statSync(filePath).mtime.getTime();
    const prev = mtimeBySlug.get(row.slug) ?? 0;
    if (mtime >= prev) {
      bySlug.set(row.slug, row);
      mtimeBySlug.set(row.slug, mtime);
    }
  };

  for (const file of discoverSummaryJson()) {
    try {
      mergeRow(aggregateSummaryJson(file), file);
    } catch (err) {
      console.warn(`Skip summary ${file}:`, err);
    }
  }

  /** Raw Playwright JSON fills gaps only — ingested *-summary.json is canonical when present. */
  for (const file of discoverPlaywrightJson()) {
    try {
      const row = aggregatePlaywrightJson(file);
      if (!bySlug.has(row.slug)) {
        bySlug.set(row.slug, row);
      }
    } catch (err) {
      console.warn(`Skip playwright ${file}:`, err);
    }
  }

  const data = buildDashboardData([...bySlug.values()]);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_HTML, renderDashboardHtml(data), 'utf8');

  console.log(`✅ Dashboard written to ${OUT_HTML}`);
  console.log(`   Components: ${data.summary.componentCount}`);
  console.log(`   Total:      ${data.summary.total}`);
  console.log(`   Passed:     ${data.summary.passed}`);
  console.log(`   Failed:     ${data.summary.failed}`);
  console.log(`   Skipped:    ${data.summary.skipped}`);
  console.log(`   Flaky:      ${data.summary.flaky}`);
  console.log(`   Retries:    ${data.summary.retries}`);
  console.log(`   Rate:       ${data.summary.successRate}`);
  console.log(`   Duration:   ${data.summary.duration}`);
  console.log(`   Last run:   ${data.summary.lastRun}`);
  console.log(`   Stable:     ${data.summary.stableComponents} components`);
  console.log(`   Unstable:   ${data.summary.unstableComponents} components`);
}

main();
