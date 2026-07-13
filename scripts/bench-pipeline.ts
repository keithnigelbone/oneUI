#!/usr/bin/env tsx
/**
 * bench-pipeline.ts
 *
 * Performance harness for the brand CSS pipeline. Runs a representative
 * set of scenarios N times each, reports p50/p95/p99 timings, and writes
 * a JSON report that `scripts/check-perf.ts` compares against a committed
 * baseline in CI.
 *
 * Usage:
 *   pnpm bench:pipeline                     # 200 iterations, print + write perf-current.json
 *   pnpm bench:pipeline --iterations=500    # more iterations = less noise
 *   pnpm bench:pipeline --output=<path>     # override output path
 *   pnpm bench:pipeline --bless             # overwrite perf-baseline.json with current
 *
 * Scenarios live in SCENARIOS below — each is a pure function over shared
 * inputs. No React, no DOM. Script is deterministic modulo CPU noise.
 */

import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import {
  buildAvailableScales,
  validateBrandCSS,
  validateBrandCSSSignature,
  wrapCSSForInjection,
} from '@oneui/shared/engine';
import {
  buildNewPaletteData,
  generateNewRootCSS,
  generateNewContextCSS,
  generateNewStepLookupCSS,
} from '@oneui/ui/engine';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const ITERATIONS = Number(getArg('iterations', '200'));
const WARMUP = Number(getArg('warmup', '20'));
const OUTPUT_PATH = resolve(REPO_ROOT, getArg('output', 'perf-current.json')!);
const BLESS_BASELINE = getArg('bless') === 'true';

// ---------------------------------------------------------------------------
// Synthetic inputs — representative of a real multi-accent brand
// ---------------------------------------------------------------------------

const colorConfig = {
  brandScales: [
    { name: 'Brand',       source: 'custom' as const, baseColor: '#ff5500' },
    { name: 'Secondary',   source: 'custom' as const, baseColor: '#0066ff' },
    { name: 'Tertiary',    source: 'custom' as const, baseColor: '#00aa88' },
    { name: 'Quaternary',  source: 'custom' as const, baseColor: '#aa00ff' },
    { name: 'Sparkle',     source: 'custom' as const, baseColor: '#ff00aa' },
    { name: 'Positive',    source: 'custom' as const, baseColor: '#00aa44' },
    { name: 'Negative',    source: 'custom' as const, baseColor: '#cc0022' },
    { name: 'Warning',     source: 'custom' as const, baseColor: '#ffaa00' },
    { name: 'Informative', source: 'custom' as const, baseColor: '#0088cc' },
  ],
};

const appearanceConfig = {
  accentCount: 9,
  background: {
    scaleName: 'Neutral',
    backgroundStep: { light: 2500, dark: 100 },
  },
  accents: [
    { role: 'primary',     label: 'Primary',     scaleName: 'Brand',       baseStep: 1500 },
    { role: 'secondary',   label: 'Secondary',   scaleName: 'Secondary',   baseStep: 1500 },
    { role: 'tertiary',    label: 'Tertiary',    scaleName: 'Tertiary',    baseStep: 1500 },
    { role: 'quaternary',  label: 'Quaternary',  scaleName: 'Quaternary',  baseStep: 1500 },
    { role: 'sparkle',     label: 'Sparkle',     scaleName: 'Sparkle',     baseStep: 1500 },
    { role: 'positive',    label: 'Positive',    scaleName: 'Positive',    baseStep: 1500 },
    { role: 'negative',    label: 'Negative',    scaleName: 'Negative',    baseStep: 1500 },
    { role: 'warning',     label: 'Warning',     scaleName: 'Warning',     baseStep: 1500 },
    { role: 'informative', label: 'Informative', scaleName: 'Informative', baseStep: 1500 },
  ],
};

// Pre-compute a representative CSS payload for validation-only scenarios.
// Large enough to exercise the per-declaration parse path meaningfully.
const SAMPLE_CSS = (() => {
  const scales = buildAvailableScales(colorConfig, null);
  const palette = buildNewPaletteData(scales, appearanceConfig);
  if (!palette) throw new Error('bench-pipeline: palette failed to build');
  const root = generateNewRootCSS(palette, 'light');
  const context = generateNewContextCSS(palette, 'light');
  const wrapped = wrapCSSForInjection(root, 'global', context || undefined);
  return { root, context, wrapped };
})();

const SAMPLE_RAW_CSS = SAMPLE_CSS.root;

// ---------------------------------------------------------------------------
// Measurement helpers
// ---------------------------------------------------------------------------

interface ScenarioResult {
  scenario: string;
  iterations: number;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function run(name: string, fn: () => void): ScenarioResult {
  // Warmup — lets V8 inline and JIT-compile hot paths, reduces first-run noise.
  for (let i = 0; i < WARMUP; i++) fn();

  const samples: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }

  samples.sort((a, b) => a - b);
  const sum = samples.reduce((acc, v) => acc + v, 0);

  return {
    scenario: name,
    iterations: ITERATIONS,
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    p99: percentile(samples, 99),
    mean: sum / ITERATIONS,
    min: samples[0],
    max: samples[samples.length - 1],
  };
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

/**
 * Each scenario must be self-contained and deterministic.
 * Note: colorConfig/appearanceConfig are captured from module scope —
 * they are frozen across all iterations so every call has identical input.
 */
const SCENARIOS: ReadonlyArray<{ name: string; run: () => void }> = [
  {
    name: 'buildAvailableScales',
    run: () => {
      buildAvailableScales(colorConfig, null);
    },
  },
  {
    name: 'buildNewPaletteData',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      buildNewPaletteData(scales, appearanceConfig);
    },
  },
  {
    name: 'generateNewRootCSS-light',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      generateNewRootCSS(palette, 'light');
    },
  },
  {
    name: 'generateNewContextCSS-light',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      generateNewContextCSS(palette, 'light');
    },
  },
  {
    // RFC-0003 Phase 9: the new step-keyed lookup runs alongside the
    // legacy mode-keyed context blocks. Tracking it here so future
    // perf regressions are visible per-stage.
    // Theme-agnostic since Option C: emits both light + dark in one string.
    name: 'generateNewStepLookupCSS',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      generateNewStepLookupCSS(palette);
    },
  },
  {
    name: 'validateBrandCSSSignature',
    run: () => {
      validateBrandCSSSignature(SAMPLE_RAW_CSS);
    },
  },
  {
    name: 'validateBrandCSS-full',
    run: () => {
      validateBrandCSS(SAMPLE_RAW_CSS);
    },
  },
  {
    name: 'full-pipeline-cold',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      const root = generateNewRootCSS(palette, 'light');
      const ctx = generateNewContextCSS(palette, 'light');
      // RFC-0003: step lookup is now part of the cold path. Both blocks
      // get composed into additionalBlocks by useBrandCSS.
      // Theme-agnostic step lookup (Option C): one call covers both themes.
      const stepLookup = generateNewStepLookupCSS(palette);
      const raw = [root].filter(Boolean).join('\n  ');
      const additional = [ctx, stepLookup].filter(Boolean).join('\n');
      validateBrandCSSSignature(raw);
      wrapCSSForInjection(raw, 'global', additional || undefined);
    },
  },
  {
    // Cold toggle — palette rebuilt every iteration. Models the worst case
    // (e.g. brand switch + theme toggle in the same tick). Step-lookup
    // cache misses every run because themeConfig identity is fresh, but
    // post-Option-C it runs once (theme-agnostic) instead of twice.
    name: 'theme-toggle-light-to-dark-cold',
    run: () => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      generateNewRootCSS(palette, 'light');
      generateNewContextCSS(palette, 'light');
      generateNewStepLookupCSS(palette);
      generateNewRootCSS(palette, 'dark');
      generateNewContextCSS(palette, 'dark');
      // Step lookup is theme-agnostic — no second call needed on toggle.
    },
  },
  {
    // Warm toggle — palette identity stable across iterations, matching
    // real React behavior (Memo 1 in useBrandCSS reuses palette when inputs
    // unchanged). Post-Option-C the step-lookup is theme-agnostic and
    // cached after first generation, so the warm toggle pays only the
    // theme-dependent root + context regen.
    ...(() => {
      const scales = buildAvailableScales(colorConfig, null);
      const palette = buildNewPaletteData(scales, appearanceConfig)!;
      return {
        name: 'theme-toggle-light-to-dark-warm',
        run: () => {
          generateNewRootCSS(palette, 'light');
          generateNewContextCSS(palette, 'light');
          generateNewStepLookupCSS(palette);
          generateNewRootCSS(palette, 'dark');
          generateNewContextCSS(palette, 'dark');
          // Step lookup is theme-agnostic — cached after first call.
        },
      };
    })(),
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function formatMs(n: number): string {
  return n.toFixed(3).padStart(8, ' ') + 'ms';
}

function main(): number {
  console.log(`bench-pipeline: running ${SCENARIOS.length} scenarios × ${ITERATIONS} iterations (warmup: ${WARMUP})\n`);

  const results: ScenarioResult[] = [];
  for (const { name, run: fn } of SCENARIOS) {
    const r = run(name, fn);
    results.push(r);
    console.log(`  ${name.padEnd(36)}  p50 ${formatMs(r.p50)}  p95 ${formatMs(r.p95)}  p99 ${formatMs(r.p99)}  mean ${formatMs(r.mean)}`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    iterations: ITERATIONS,
    warmup: WARMUP,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    metrics: {
      rootCssBytes: Buffer.byteLength(SAMPLE_CSS.root, 'utf8'),
      contextCssBytes: Buffer.byteLength(SAMPLE_CSS.context, 'utf8'),
      injectedCssBytes: Buffer.byteLength(SAMPLE_CSS.wrapped, 'utf8'),
      storybookBrandStyleChannels: 3,
    },
    scenarios: results,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2) + '\n');
  console.log(`\nwrote ${OUTPUT_PATH}`);

  if (BLESS_BASELINE) {
    const baselinePath = resolve(REPO_ROOT, 'perf-baseline.json');
    writeFileSync(baselinePath, JSON.stringify(report, null, 2) + '\n');
    console.log(`blessed baseline: ${baselinePath}`);
  }

  return 0;
}

process.exit(main());
