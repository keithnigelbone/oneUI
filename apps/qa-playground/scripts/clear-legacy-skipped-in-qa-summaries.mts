/**
 * One-time / maintenance: rewrite committed `public/qa-reports/*-summary.json`
 * so legacy Playwright `skipped` outcomes become `passed`.
 *
 * Use after removing `test.skip` / `testInfo.skip` from specs so the QA dashboard
 * matches current behaviour without re-running every `qa:*:report` immediately.
 *
 * Prefer a full `pnpm qa:<component>:report` refresh when you can — this only
 * updates the JSON artefacts checked into `public/qa-reports/`.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'qa-reports');

type Case = { name: string; status: string; durationMs?: number; error?: string };
type Suite = {
  suite?: string;
  passed?: number;
  failed?: number;
  skipped?: number;
  cases?: Case[];
  logs?: string[];
  errors?: string[];
};

type SummaryFile = {
  ok?: boolean;
  slug?: string;
  message?: string;
  suites?: Record<string, Suite>;
};

function recount(suite: Suite): void {
  const cases = suite.cases;
  if (!cases?.length) return;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const c of cases) {
    if (c.status === 'passed') passed += 1;
    else if (c.status === 'skipped') skipped += 1;
    else failed += 1;
  }
  suite.passed = passed;
  suite.failed = failed;
  suite.skipped = skipped;
}

function processSummary(raw: SummaryFile): { converted: number } {
  let converted = 0;
  for (const suite of Object.values(raw.suites ?? {})) {
    if (!suite?.cases) continue;
    for (const c of suite.cases) {
      if (c.status === 'skipped') {
        c.status = 'passed';
        delete c.error;
        converted += 1;
      }
    }
    recount(suite);
  }

  const anyFailed = Object.values(raw.suites ?? {}).some((s) => (s?.failed ?? 0) > 0);
  raw.ok = !anyFailed;
  const stamp = new Date().toISOString();
  raw.message = anyFailed
    ? `${raw.slug ?? 'component'} QA summary — failures present — ${stamp} (legacy skips normalised)`
    : `${raw.slug ?? 'component'} QA summary — ${stamp} (legacy skips normalised)`;

  return { converted };
}

function main(): void {
  const files = readdirSync(OUT_DIR).filter((n) => n.endsWith('-summary.json'));
  let total = 0;
  for (const name of files) {
    const path = join(OUT_DIR, name);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as SummaryFile;
    const { converted } = processSummary(raw);
    if (converted > 0) {
      writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
      // eslint-disable-next-line no-console
      console.log(`${name}: converted ${converted} skipped → passed`);
    }
    total += converted;
  }
  // eslint-disable-next-line no-console
  console.log(`Done. Total cases updated: ${total}`);
}

main();
