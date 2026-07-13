/**
 * generate-scale-css.ts
 *
 * Regenerates `src/css/dimensions/scale.css` from the canonical S/M/L dimension
 * tables in `@oneui/shared`. Run after changing the base-size model or f-step scale:
 *
 *   npx tsx packages/tokens/scripts/generate-scale-css.ts
 *
 * Two-layer model:
 *  - DIMENSIONS are fluid OR static. Static resolves via build-time `@media`
 *    (zero-JS, correct first paint); fluid resolves via `clamp()` between the
 *    S-edge and L-edge base sizes. Fluid is opt-in per page via
 *    `[data-dimension-mode="fluid"]`.
 *  - GRID (margin/gutter) is always STEPPED per breakpoint (the margin/gutter
 *    token changes between S/M/L), so it is emitted in the `@media` blocks and
 *    is NOT part of the fluid clamp.
 *
 * A `[data-Breakpoint="S|M|L"][data-6-Density]` override layer (higher specificity
 * than the `@media [data-6-Density]` rules) lets `ScopedPlatform` force a subtree
 * to a specific breakpoint regardless of the live viewport.
 *
 * Source of truth: STATIC_DIMENSION_TABLES + GRID_VALUES + BREAKPOINT_RANGES +
 * FLUID_DIMENSION_ANCHORS.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  F_STEPS,
  BREAKPOINT_IDS,
  DENSITY_IDS,
  STATIC_DIMENSION_TABLES,
  GRID_VALUES,
  BREAKPOINT_RANGES,
  FLUID_DIMENSION_ANCHORS,
  type BreakpointId,
  type DensityId,
} from '../../shared/src/data/dimension-scales';
import { parseFStepNumber } from '../../shared/src/data/typography-roles';
import { generateClampFormula } from '../../shared/src/utils/dimension/scale';

const BREAKPOINT_LABELS: Record<BreakpointId, string> = {
  S: 'Small (< 620px)',
  M: 'Medium (620–990px)',
  L: 'Large (≥ 991px)',
};

// f-steps in numeric order so the appended `f2-5` rung lands between f2 and f3.
const STEPS_SORTED = [...F_STEPS].sort((a, b) => parseFStepNumber(a) - parseFStepNumber(b));
const STEP_INDEX: Record<string, number> = Object.fromEntries(F_STEPS.map((s, i) => [s, i]));

const px = (v: number): string => `${v}px`;

function getRange(bp: BreakpointId): (typeof BREAKPOINT_RANGES)[number] {
  return BREAKPOINT_RANGES.find((r) => r.id === bp)!;
}

/** `--Dimension-*` lines for a breakpoint × density (static stepped values). */
function dimensionLines(bp: BreakpointId, densityId: DensityId): string[] {
  const values = STATIC_DIMENSION_TABLES[bp][densityId];
  return STEPS_SORTED.map((step) => `  --Dimension-${step}: ${px(values[STEP_INDEX[step]])};`);
}

/** `--Grid-*` lines for a breakpoint × density (always stepped). */
function gridLines(bp: BreakpointId, densityId: DensityId): string[] {
  const grid = GRID_VALUES[bp][densityId];
  return [`  --Grid-Margin: ${px(grid.margin)};`, `  --Grid-Gutter: ${px(grid.gutter)};`];
}

function staticBlockBody(bp: BreakpointId, densityId: DensityId): string {
  return [...dimensionLines(bp, densityId), ...gridLines(bp, densityId)].join('\n');
}

/** `--Dimension-*` clamp() lines interpolating S-edge → L-edge over the fluid viewport. */
function fluidDimensionLines(densityId: DensityId): string[] {
  const anchors = FLUID_DIMENSION_ANCHORS[densityId];
  const viewport = { min: anchors.min.viewport, max: anchors.max.viewport };
  const sValues = STATIC_DIMENSION_TABLES.S[densityId]; // S-edge = min base × ratio
  const lValues = STATIC_DIMENSION_TABLES.L[densityId]; // L-edge = max base × ratio
  return STEPS_SORTED.map((step) => {
    const i = STEP_INDEX[step];
    const min = sValues[i];
    const max = lValues[i];
    const value = min === max ? px(min) : generateClampFormula(min, max, viewport);
    return `  --Dimension-${step}: ${value};`;
  });
}

function baseLine(bp: BreakpointId): string {
  const b = (d: DensityId) => STATIC_DIMENSION_TABLES[bp][d][STEP_INDEX['f0']];
  return `compact=${b('compact')}  default=${b('default')}  open=${b('open')}`;
}

function mediaQuery(bp: BreakpointId): string {
  const { min, max } = getRange(bp);
  const parts: string[] = [];
  if (min !== null) parts.push(`(min-width: ${min}px)`);
  if (max !== null) parts.push(`(max-width: ${max}px)`);
  return parts.join(' and ');
}

const headerProgression = BREAKPOINT_IDS.map(
  (bp) => ` *   ${BREAKPOINT_LABELS[bp]}: ${baseLine(bp)}`,
).join('\n');

const header = `/**
 * DIMENSION SCALE — S/M/L Breakpoint Resolution
 *
 * Static dimensions resolve via @media (zero-JS first paint); fluid dimensions
 * resolve via clamp() (opt-in via [data-dimension-mode="fluid"]). Grid is always
 * stepped per breakpoint. Each block sets all 26 f-steps (f-8…f16, plus f2-5).
 *
 * GENERATED FILE — do not edit by hand.
 * Run: npx tsx packages/tokens/scripts/generate-scale-css.ts
 *
 * Base scale progression (Option A — Min/Mid/Max per breakpoint):
${headerProgression}
 *
 * Cascade:
 *   @media (width)                          → static, zero-JS, default+density
 *   [data-Breakpoint="S|M|L"][data-6-Density] → forced scope (ScopedPlatform), wins
 *   [data-dimension-mode="fluid"][data-6-Density] → clamp() dimensions, source-last
 *
 * Import order: This file MUST be loaded BEFORE primitives.css.
 */`;

const rootBlock = `/* ========================================
   FALLBACK — :root defaults (S / Default)
   Applied before any @media / attribute match
   ======================================== */

:root {
${staticBlockBody('S', 'default')}
}`;

// Static @media blocks: default density targets :root (works with zero attributes);
// compact/open target [data-6-Density]. Grid tokens included (always stepped).
const mediaBlocks = BREAKPOINT_IDS.map((bp) => {
  const comment = `/* ${BREAKPOINT_LABELS[bp]} — static */`;
  const rules = [
    `  :root {\n${indent(staticBlockBody(bp, 'default'))}\n  }`,
    ...(['compact', 'open'] as const).map(
      (d) => `  [data-6-Density="${d}"] {\n${indent(staticBlockBody(bp, d))}\n  }`,
    ),
  ].join('\n\n');
  return `${comment}\n@media ${mediaQuery(bp)} {\n${rules}\n}`;
}).join('\n\n');

// Forced-breakpoint overrides (specificity 0,2,0 → beats @media [data-6-Density]).
const overrideBlocks = BREAKPOINT_IDS.flatMap((bp) =>
  DENSITY_IDS.map(
    (d) =>
      `[data-Breakpoint="${bp}"][data-6-Density="${d}"] {\n${staticBlockBody(bp, d)}\n}`,
  ),
).join('\n\n');

// Fluid clamp dimensions (source-last → wins when data-dimension-mode="fluid").
// Grid stays stepped, so fluid blocks set ONLY --Dimension-* tokens.
const fluidBlocks = DENSITY_IDS.map(
  (d) =>
    `[data-dimension-mode="fluid"][data-6-Density="${d}"] {\n${fluidDimensionLines(d).join('\n')}\n}`,
).join('\n\n');

function indent(block: string): string {
  return block
    .split('\n')
    .map((l) => (l ? `  ${l}` : l))
    .join('\n');
}

const css = `${header}

@layer base {

${rootBlock}

/* ========================================
   STATIC — @media (zero-JS, correct first paint)
   ======================================== */

${mediaBlocks}

/* ========================================
   FORCED SCOPE — ScopedPlatform overrides
   ======================================== */

${overrideBlocks}

/* ========================================
   FLUID — clamp() dimensions (opt-in)
   ======================================== */

${fluidBlocks}

}
`;

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/css/dimensions/scale.css',
);
writeFileSync(outPath, css, 'utf8');
console.log(`Wrote ${outPath} (${css.split('\n').length} lines)`);
