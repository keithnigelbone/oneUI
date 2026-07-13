#!/usr/bin/env node
/**
 * PHASE 4 — Markdown summary from Playwright JSON reporter (figma matrix).
 *
 * Usage (repo root): pnpm figma-matrix:report Checkbox
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

type PWSpec = {
  title?: string;
  ok?: boolean;
  tests?: Array<{ results?: Array<{ status?: string }> }>;
};

type PWSuite = {
  title?: string;
  suites?: PWSuite[];
  specs?: PWSpec[];
};

type JsonReport = {
  suites?: PWSuite[];
};

function walkSuite(suite: PWSuite, prefix: string, out: Array<{ path: string; ok: boolean }>): void {
  const title = suite.title ?? '';
  const p = prefix ? `${prefix} › ${title}` : title;

  for (const spec of suite.specs ?? []) {
    const st = spec.tests?.[0]?.results?.[0]?.status;
    const ok = spec.ok === true || st === 'passed';
    out.push({ path: `${p} › ${spec.title ?? ''}`.replace(/^ › /, ''), ok });
  }

  for (const child of suite.suites ?? []) {
    walkSuite(child, p, out);
  }
}

function main(): void {
  const slug = process.argv[2]?.trim();
  if (!slug) {
    console.error('Usage: pnpm figma-matrix:report <Slug>');
    process.exit(1);
  }

  const base = join(REPO_ROOT, 'packages/ui/src/__tests__', slug);
  const jsonPath = join(base, 'test-results-figma-matrix.json');
  const fixturePath = join(base, 'figma-variant-matrix.fixture.json');

  if (!existsSync(jsonPath)) {
    console.error(`Missing ${jsonPath} — run pnpm figma-matrix:test ${slug} first.`);
    process.exit(1);
  }

  let fixtureMeta: { figmaUrl?: string; componentName?: string; fetchedAt?: string; totalVariants?: number } =
    {};
  if (existsSync(fixturePath)) {
    try {
      const fx = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
        meta?: typeof fixtureMeta;
      };
      fixtureMeta = fx.meta ?? {};
    } catch {
      /* ignore */
    }
  }

  const report = JSON.parse(readFileSync(jsonPath, 'utf8')) as JsonReport;
  const rows: Array<{ path: string; ok: boolean }> = [];
  for (const s of report.suites ?? []) {
    walkSuite(s, '', rows);
  }

  const passed = rows.filter((r) => r.ok).length;
  const failed = rows.filter((r) => !r.ok).length;
  const total = rows.length;
  const pct = total ? Math.round((passed / total) * 100) : 0;

  const lines: string[] = [
    `# ${slug} — Figma variant matrix report`,
    '',
    '| | |',
    '|---|---|',
    `| Figma URL | ${fixtureMeta.figmaUrl ?? '—'} |`,
    `| Component | ${fixtureMeta.componentName ?? slug} |`,
    `| Fetched at | ${fixtureMeta.fetchedAt ?? '—'} |`,
    `| Variants (fixture) | ${fixtureMeta.totalVariants ?? '—'} |`,
    `| Playwright checks | ${total} |`,
    `| Passed | ${passed} |`,
    `| Failed | ${failed} |`,
    `| Pass rate | ${pct}% |`,
    '',
    '## Results',
    '',
    '| Check | Result |',
    '|-------|--------|',
    ...rows.map((r) => `| ${r.path.replace(/\|/g, '\\|')} | ${r.ok ? 'PASS' : 'FAIL'} |`),
    '',
  ];

  const outMd = join(base, 'validation-report-figma-matrix.md');
  writeFileSync(outMd, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${outMd}`);
}

main();
