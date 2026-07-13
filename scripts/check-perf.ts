#!/usr/bin/env tsx
/**
 * check-perf.ts
 *
 * Compares a benchmark output (perf-current.json) against a committed
 * baseline (perf-baseline.json) and exits 1 if any scenario regresses
 * beyond the allowed tolerance OR breaches an absolute budget.
 *
 * The baseline is ground truth — the numbers the team agreed are acceptable.
 * It is only updated deliberately by running `pnpm bench:pipeline --bless`.
 *
 * Usage:
 *   pnpm check:perf                                 # default: 15% tolerance
 *   pnpm check:perf --tolerance=10                  # stricter
 *   pnpm check:perf --baseline=<path> --current=<path>
 *
 * Tolerances in plain terms:
 *   - CI runners are noisy (shared CPUs). Identical code can benchmark
 *     ±5-8% between runs.
 *   - A tolerance narrower than the noise floor produces false positives
 *     and the gate gets ignored.
 *   - 15% is a good starting default on GitHub Actions `ubuntu-latest`.
 *     Tighten to 10% after a month of data.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
function getArg(name: string, fallback?: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  if (args.includes(`--${name}`)) return 'true';
  return fallback;
}

const BASELINE_PATH = resolve(REPO_ROOT, getArg('baseline', 'perf-baseline.json')!);
const CURRENT_PATH = resolve(REPO_ROOT, getArg('current', 'perf-current.json')!);
const TOLERANCE_PCT = Number(getArg('tolerance', '15'));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Scenario {
  scenario: string;
  iterations: number;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
}

interface Report {
  timestamp: string;
  iterations: number;
  warmup: number;
  node: string;
  platform: string;
  metrics?: Record<string, number>;
  scenarios: Scenario[];
}

const ADOPTION_BUDGETS: Record<string, { max: number; unit: string; label: string }> = {
  rootCssBytes: {
    max: 50 * 1024,
    unit: 'bytes',
    label: 'root brand CSS',
  },
  contextCssBytes: {
    max: 75 * 1024,
    unit: 'bytes',
    label: 'surface-context CSS',
  },
  injectedCssBytes: {
    max: 125 * 1024,
    unit: 'bytes',
    label: 'single injected brand stylesheet',
  },
  storybookBrandStyleChannels: {
    max: 3,
    unit: 'count',
    label: 'Storybook brand style injectors',
  },
};

/**
 * Absolute budgets per scenario — exceed these and CI fails regardless of
 * the relative regression check. These are "we never want to drift above X"
 * lines. Adjust deliberately; aim for ~2× today's typical measurement so
 * they protect against slow drift without triggering false alarms.
 */
const ABSOLUTE_BUDGETS_MS: Record<string, number> = {
  'buildAvailableScales':           5,
  'buildNewPaletteData':            10,
  'generateNewRootCSS-light':       10,
  'generateNewContextCSS-light':    15,
  'validateBrandCSSSignature':      0.5,
  'validateBrandCSS-full':          5,
  // Cold path fires only on brand change. Cost dominated by
  // generateNewStepLookupCSS, which gained a per-decl static/dynamic
  // partition step (commit 44636b0b) — intentional trade for ~100 KB
  // brand-invariant hoisting. ~2× today's p95 leaves headroom for drift.
  'full-pipeline-cold':             60,
  'theme-toggle-light-to-dark':     15,
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function loadReport(path: string, label: string): Report {
  if (!existsSync(path)) {
    console.error(`check-perf: missing ${label} at ${path}`);
    console.error(`  Run  pnpm bench:pipeline         to produce perf-current.json`);
    console.error(`  Run  pnpm bench:pipeline --bless to (re)commit perf-baseline.json`);
    process.exit(2);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Report;
}

function fmt(ms: number): string {
  return ms.toFixed(3) + 'ms';
}

function fmtMetric(value: number, unit: string): string {
  if (unit === 'bytes') return `${(value / 1024).toFixed(1)}KB`;
  return String(value);
}

function pct(diff: number, base: number): string {
  if (base === 0) return 'n/a';
  const p = (diff / base) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
}

function main(): number {
  const baseline = loadReport(BASELINE_PATH, 'baseline');
  const current = loadReport(CURRENT_PATH, 'current');

  console.log(`check-perf: baseline ${baseline.timestamp}  vs  current ${current.timestamp}`);
  console.log(`            tolerance ${TOLERANCE_PCT}% · platform baseline=${baseline.platform} current=${current.platform}\n`);

  const byName = new Map(baseline.scenarios.map((s) => [s.scenario, s]));
  const failures: string[] = [];

  for (const cur of current.scenarios) {
    const base = byName.get(cur.scenario);
    const budget = ABSOLUTE_BUDGETS_MS[cur.scenario];
    const absViolated = budget !== undefined && cur.p95 > budget;

    if (!base) {
      console.log(`  ${cur.scenario.padEnd(36)}  p95 ${fmt(cur.p95).padStart(10)}  (new scenario — not in baseline)`);
      continue;
    }

    const p95Diff = cur.p95 - base.p95;
    const p95Regressed = p95Diff > 0 && (p95Diff / base.p95) * 100 > TOLERANCE_PCT;

    const verdict = absViolated || p95Regressed ? '✗' : '✓';
    const line = `  ${verdict} ${cur.scenario.padEnd(34)}  baseline p95 ${fmt(base.p95).padStart(10)}  current p95 ${fmt(cur.p95).padStart(10)}  Δ ${pct(p95Diff, base.p95).padStart(8)}`;
    console.log(line);

    if (absViolated) {
      failures.push(`${cur.scenario}: p95 ${fmt(cur.p95)} exceeds absolute budget ${fmt(budget!)}`);
    }
    if (p95Regressed) {
      failures.push(`${cur.scenario}: p95 regressed ${pct(p95Diff, base.p95)} (tolerance ${TOLERANCE_PCT}%)`);
    }
  }

  // Surface scenarios that disappeared from current
  const currentNames = new Set(current.scenarios.map((s) => s.scenario));
  for (const base of baseline.scenarios) {
    if (!currentNames.has(base.scenario)) {
      console.log(`  ? ${base.scenario.padEnd(34)}  (in baseline but missing from current run)`);
    }
  }

  if (current.metrics) {
    console.log('\nAdoption budgets:');
    for (const [key, budget] of Object.entries(ADOPTION_BUDGETS)) {
      const value = current.metrics[key];
      if (value === undefined) continue;
      const violated = value > budget.max;
      console.log(
        `  ${violated ? '✗' : '✓'} ${budget.label.padEnd(34)}  current ${fmtMetric(value, budget.unit).padStart(10)}  budget ${fmtMetric(budget.max, budget.unit).padStart(10)}`,
      );
      if (violated) {
        failures.push(`${budget.label}: ${fmtMetric(value, budget.unit)} exceeds budget ${fmtMetric(budget.max, budget.unit)}`);
      }
    }
  }

  console.log('');

  if (failures.length === 0) {
    console.log('check-perf: OK — no regressions.');
    return 0;
  }

  console.error(`check-perf: FAIL — ${failures.length} issue(s):`);
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  console.error('Fix options:');
  console.error('  1. Find & fix the regression in the PR.');
  console.error('  2. If the change is intentional and the new numbers are acceptable,');
  console.error('     run  pnpm bench:pipeline --bless  locally and commit perf-baseline.json.');
  return 1;
}

process.exit(main());
