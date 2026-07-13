/**
 * dimensionCSS.ts
 *
 * Generates CSS custom property overrides for the dimension scale system
 * from a brand's platforms foundation config.
 *
 * When a brand customizes base sizes in Density & Platforms, this generates
 * `[data-Breakpoint][data-6-Density]` CSS blocks that override the static
 * values in scale.css. Only needed when brand injection mode is active.
 *
 * IMPORTANT: Only emits CSS blocks whose values DIFFER from the static
 * dimension tables (scale.css). When all values match, returns empty string
 * so that scale.css's ColourTool/platform values are preserved.
 *
 * Formula: value[i] = base × SCALE_RATIOS[i]
 * where SCALE_RATIOS are fixed per-step multipliers (NOT exponential).
 */

import {
  F_STEPS,
  BREAKPOINT_IDS,
  DENSITY_IDS,
  STATIC_DIMENSION_TABLES,
  GRID_VALUES,
  resolveGridSpacing,
  resolveBreakpointRange,
  type BreakpointId,
  type DensityId,
  type FStep,
} from '../data/dimension-scales';
import { SCALE_RATIOS, GRID_MARGIN_RATIO, GRID_GUTTER_RATIO } from '../data/scale-ratios';
import type { PlatformsFoundationConfig, PlatformDensityConfig } from '../types/platforms';
import type { StructuredDimensionContext } from '../types/nativeDimensionPayload';
import { SPACING_TOKENS, SPACING_TO_FSTEP } from './dimension';
import { LEGACY_SHAPE_ALIASES } from '../constants/shape-system';

// Re-export the primitives so existing consumers that imported them from
// `dimensionCSS.ts` keep working without a breaking-change sweep.
export { SCALE_RATIOS, GRID_MARGIN_RATIO, GRID_GUTTER_RATIO };

/** Module-level index of f0 in F_STEPS — avoids repeated indexOf in hot loops */
export const BASE_F0_INDEX = F_STEPS.indexOf('f0');

/**
 * Copy f-step px values into `--Spacing-*` / `--Shape-*` so native payloads match
 * web `primitives.css` aliases (`var(--Spacing-M)` → `--Dimension-f0`, etc.).
 */
function augmentDimensionsWithSpacingAndShapeAliases(dimensions: Record<string, string>): void {
  for (const token of SPACING_TOKENS) {
    const fStep = SPACING_TO_FSTEP[token];
    const dimKey = `--Dimension-${fStep}`;
    const v = dimensions[dimKey];
    if (v !== undefined) {
      dimensions[`--Spacing-${token}`] = v;
    }
  }

  dimensions['--Shape-Pill'] = '9999px';
  // `--Dimension-f-8` formats as unitless `0`; native payload consumers parse
  // `<n>px`, so pin the zero step explicitly rather than aliasing the f-step.
  dimensions['--Shape-0'] = '0px';

  // Canonical numeric scale — mirrors `--Shape-*` in `primitives.css`.
  const shapeToFStep: Array<[string, FStep]> = [
    ['0-5', 'f-7'],
    ['1', 'f-6'],
    ['1-5', 'f-5'],
    ['2', 'f-4'],
    ['2-5', 'f-3'],
    ['3', 'f-2'],
    ['3-5', 'f-1'],
    ['4', 'f0'],
    ['4-5', 'f1'],
    ['5', 'f2'],
    ['5-5', 'f2-5'],
    ['6', 'f3'],
    ['7', 'f4'],
    ['8', 'f5'],
    ['9', 'f6'],
    ['10', 'f7'],
  ];

  for (const [shape, step] of shapeToFStep) {
    const v = dimensions[`--Dimension-${step}`];
    if (v !== undefined) {
      dimensions[`--Shape-${shape}`] = v;
    }
  }

  // ── DEPRECATED t-shirt aliases ──────────────────────────────────────────
  // Emitted with the same resolved px value as their numeric counterpart so
  // consumers mid-migration keep rendering. Removed once
  // `pnpm check:shape-tokens` reports an empty allowlist.
  dimensions['--Shape-None'] = dimensions['--Shape-0'] ?? '0px';
  for (const [legacy, canonical] of Object.entries(LEGACY_SHAPE_ALIASES)) {
    if (legacy === 'None') continue;
    const v = dimensions[`--Shape-${canonical}`];
    if (v !== undefined) {
      dimensions[`--Shape-${legacy}`] = v;
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Compute the f-step values (26, incl. the appended `f2-5`) from a base size using fixed ratios */
export function computeScaleFromBase(baseSize: number): number[] {
  return SCALE_RATIOS.map((ratio) => {
    const value = baseSize * ratio;
    return Math.round(value * 100) / 100;
  });
}

/** Interpolate a value between mobile and desktop endpoints */
export function interpolateValue(
  viewportWidth: number,
  minViewport: number,
  maxViewport: number,
  mobileValue: number,
  desktopValue: number
): number {
  if (maxViewport === minViewport) return mobileValue;
  const t = Math.max(0, Math.min(1, (viewportWidth - minViewport) / (maxViewport - minViewport)));
  return mobileValue + (desktopValue - mobileValue) * t;
}

/**
 * Get base sizes per density for a viewport using the unified S/M/L breakpoint
 * model (Option A — Min/Mid/Max): S `<620` → mobile endpoint · M `620–990` →
 * midpoint (avg of mobile/desktop) · L `>991` → desktop endpoint.
 * `minViewport`/`maxViewport` are retained for signature compatibility.
 * Fluid/clamp interpolation lives in scale.css (the `[data-dimension-mode=fluid]`
 * blocks) and `interpolateValue` above.
 */
export function getBaseSizesForBreakpoint(
  viewportWidth: number,
  _minViewport: number,
  _maxViewport: number,
  densityConfigs: PlatformDensityConfig[]
): Record<DensityId, number> {
  const result: Record<DensityId, number> = { compact: 14, default: 16, open: 18 };
  const bp = resolveBreakpointRange(viewportWidth);
  for (const dc of densityConfigs) {
    const d = dc.density as DensityId;
    result[d] =
      bp === 'S'
        ? dc.mobile.baseSize
        : bp === 'L'
          ? dc.desktop.baseSize
          : (dc.mobile.baseSize + dc.desktop.baseSize) / 2;
  }
  return result;
}

/** Format a dimension value as CSS */
function formatDimensionValue(value: number): string {
  if (value === 0) return '0';
  if (Number.isInteger(value)) return `${value}px`;
  return `${parseFloat(value.toFixed(2))}px`;
}

/**
 * Check if a computed dimension block matches the static dimension table.
 * When values match (within floating-point tolerance), the block is redundant
 * and should NOT be emitted — letting scale.css (@layer base) handle it.
 */
function blockMatchesStaticTable(block: PlatformDimensionBlock): boolean {
  const staticValues = STATIC_DIMENSION_TABLES[block.platformId]?.[block.densityId];
  if (!staticValues || staticValues.length !== block.values.length) return false;
  return block.values.every((v, i) => Math.abs(v - staticValues[i]) < 0.01);
}

// ─── CSS Generation ────────────────────────────────────────────────────────

interface PlatformDimensionBlock {
  platformId: BreakpointId;
  densityId: DensityId;
  values: number[];
}

/**
 * Extract all platform×density dimension blocks from a PlatformsFoundationConfig.
 * Returns 15 blocks (5 platforms × 3 densities) with computed f-step values.
 */
/**
 * Maps `NativeThemeContext.platform` to the S/M/L breakpoint used by
 * `buildNativeTheme` typography + dimension tables.
 * mobile → S · tablet → M · desktop → L.
 */
export function mapNativePlatformToV2DimensionPlatform(
  platform: 'mobile' | 'tablet' | 'desktop'
): BreakpointId {
  return platform === 'tablet' ? 'M' : platform === 'desktop' ? 'L' : 'S';
}

export function pickStructuredDimensionContext(
  contexts: StructuredDimensionContext[],
  breakpointId: BreakpointId,
  densityId: DensityId
): StructuredDimensionContext | undefined {
  return contexts.find(
    (c) => c.platformId === breakpointId && c.densityId === densityId,
  );
}

/**
 * Brand dimension scales as structured token maps (Android / iOS / Flutter).
 * Includes every computed platform × density block — unlike
 * `generateDimensionCSS`, static-table-identical blocks are still included so
 * clients without `scale.css` get complete values.
 */
export function buildStructuredDimensionContexts(
  config: PlatformsFoundationConfig
): StructuredDimensionContext[] {
  const blocks = extractDimensionBlocks(config);
  const out: StructuredDimensionContext[] = [];
  // Blocks are already keyed per S/M/L breakpoint — dedupe defensively so each
  // breakpoint×density is emitted once.
  const seen = new Set<string>();

  for (const block of blocks) {
    const bp = block.platformId;
    const key = `${bp}:${block.densityId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dimensions: Record<string, string> = {};
    for (let i = 0; i < F_STEPS.length; i++) {
      const step = F_STEPS[i];
      dimensions[`--Dimension-${step}`] = formatDimensionValue(block.values[i]);
    }
    augmentDimensionsWithSpacingAndShapeAliases(dimensions);
    const baseSize = block.values[BASE_F0_INDEX];
    const gridMargin = baseSize * GRID_MARGIN_RATIO;
    const gridGutter = baseSize * GRID_GUTTER_RATIO;

    out.push({
      platformId: bp,
      densityId: block.densityId,
      dimensions,
      gridMargin: formatDimensionValue(gridMargin),
      gridGutter: formatDimensionValue(gridGutter),
    });
  }

  return out;
}

function extractDimensionBlocks(config: PlatformsFoundationConfig): PlatformDimensionBlock[] {
  const blocks: PlatformDimensionBlock[] = [];
  const seenKeys = new Set<string>();

  const enabledPlatforms = config.platforms.filter((p) => p.isEnabled);
  if (enabledPlatforms.length === 0) return [];

  for (const entry of enabledPlatforms) {
    const activeBreakpoints = entry.breakpoints
      .filter((bp) => bp.isActive)
      .sort((a, b) => a.viewportWidth - b.viewportWidth);

    const minVp = activeBreakpoints.length > 0 ? activeBreakpoints[0].viewportWidth : 360;
    const maxVp =
      activeBreakpoints.length > 0
        ? activeBreakpoints[activeBreakpoints.length - 1].viewportWidth
        : 360;

    // For platforms with breakpoints, generate blocks per breakpoint
    if (activeBreakpoints.length > 0) {
      for (const bp of activeBreakpoints) {
        const breakpointId = resolveBreakpointRange(bp.viewportWidth);
        const baseSizes = getBaseSizesForBreakpoint(
          bp.viewportWidth,
          minVp,
          maxVp,
          entry.densityConfigs
        );

        for (const densityId of DENSITY_IDS) {
          const key = `${breakpointId}:${densityId}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          blocks.push({
            platformId: breakpointId,
            densityId,
            values: computeScaleFromBase(baseSizes[densityId]),
          });
        }
      }
    } else {
      // No breakpoints — single block at the S breakpoint
      const breakpointId = resolveBreakpointRange(360);
      const baseSizes = getBaseSizesForBreakpoint(360, 360, 360, entry.densityConfigs);

      for (const densityId of DENSITY_IDS) {
        const key = `${breakpointId}:${densityId}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        blocks.push({
          platformId: breakpointId,
          densityId,
          values: computeScaleFromBase(baseSizes[densityId]),
        });
      }
    }
  }

  // Fill any missing breakpoint×density combos with fallback values
  for (const breakpointId of BREAKPOINT_IDS) {
    for (const densityId of DENSITY_IDS) {
      const key = `${breakpointId}:${densityId}`;
      if (!seenKeys.has(key)) {
        // Use default base sizes from the first enabled platform's density configs
        const fallbackEntry = enabledPlatforms[0];
        const dc = fallbackEntry.densityConfigs.find((d) => d.density === densityId);
        const baseSize =
          dc?.mobile.baseSize ?? (densityId === 'compact' ? 14 : densityId === 'open' ? 18 : 16);

        seenKeys.add(key);
        blocks.push({
          platformId: breakpointId,
          densityId,
          values: computeScaleFromBase(baseSize),
        });
      }
    }
  }

  return blocks;
}

/**
 * Generate CSS blocks for dimension overrides from a PlatformsFoundationConfig.
 *
 * Returns CSS like:
 * ```css
 * [data-Breakpoint="S"][data-6-Density="default"] {
 *   --Dimension-f-8: 0;
 *   --Dimension-f-7: 2px;
 *   ...
 * }
 * ```
 *
 * These blocks are injected alongside brand CSS in `@layer brand` and override
 * the static values in `scale.css` (which is in `@layer base`).
 */
export function generateDimensionCSS(config: PlatformsFoundationConfig): string {
  const blocks = extractDimensionBlocks(config);
  if (blocks.length === 0) return '';

  const cssBlocks: string[] = [];
  // Blocks are already keyed per S/M/L breakpoint — dedupe defensively so each
  // breakpoint×density emits once.
  const emitted = new Set<string>();

  for (const block of blocks) {
    const bp = block.platformId;
    const key = `${bp}:${block.densityId}`;
    if (emitted.has(key)) continue;
    emitted.add(key);

    // Skip blocks that match the static dimension tables — scale.css already
    // provides these values in @layer base.
    if (blockMatchesStaticTable(block)) continue;

    const declarations: string[] = [];

    for (let i = 0; i < F_STEPS.length; i++) {
      const step = F_STEPS[i];
      const value = block.values[i];
      // `f2-5` is now a first-class f-step appended to F_STEPS/SCALE_RATIOS, so
      // the loop emits --Dimension-f2-5 directly — no midpoint special-case.
      declarations.push(`    --Dimension-${step}: ${formatDimensionValue(value)};`);
    }

    // Grid tokens — use the same names as scale.css (--Grid-Margin, --Grid-Gutter)
    // to correctly override the static values.
    const baseSize = block.values[BASE_F0_INDEX];
    const staticGrid = GRID_VALUES[bp]?.[block.densityId];
    const grid = resolveGridSpacing(bp, block.densityId, baseSize);

    // Only emit grid overrides if they differ from static values
    if (!staticGrid || Math.abs(grid.margin - staticGrid.margin) >= 0.01) {
      declarations.push(`    --Grid-Margin: ${formatDimensionValue(grid.margin)};`);
    }
    if (!staticGrid || Math.abs(grid.gutter - staticGrid.gutter) >= 0.01) {
      declarations.push(`    --Grid-Gutter: ${formatDimensionValue(grid.gutter)};`);
    }

    const selector = `  [data-Breakpoint="${bp}"][data-6-Density="${block.densityId}"]`;
    cssBlocks.push(`${selector} {\n${declarations.join('\n')}\n  }`);
  }

  return cssBlocks.join('\n');
}
