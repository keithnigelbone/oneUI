/**
 * dimension-scales.ts
 *
 * Static lookup tables for the dimension scale system.
 * Source of truth: OneUIColourTool core.
 *
 * ColourTool resolves each spacing token as a dimension token:
 *   base(viewport, density) × token multiplier.
 * Density changes the base value, not the spacing alias mapping.
 */

import type {
  PlatformBreakpoint,
  PlatformCategory,
  PlatformEntry,
  PlatformsFoundationConfig,
} from '../types/platforms';
import { SCALE_RATIOS, CSS_PX_PER_INCH, MM_PER_INCH } from './scale-ratios';
import { computeDIN1450BaseSize } from '../utils/din1450';

export type DensityId = 'default' | 'compact' | 'open';
export type FStep =
  | 'f-8'
  | 'f-7'
  | 'f-6'
  | 'f-5'
  | 'f-4'
  | 'f-3'
  | 'f-2'
  | 'f-1'
  | 'f0'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'f13'
  | 'f14'
  | 'f15'
  | 'f16'
  // Half-step rung (ratio 1.375 → dimension token '5.5' → 22px at base-16).
  // Appended (not inserted between f2 and f3) so existing f-step array indices
  // are preserved; all value lookups are name-based via F_STEP_INDEX.
  | 'f2-5';

export const F_STEPS: FStep[] = [
  'f-8', 'f-7', 'f-6', 'f-5', 'f-4', 'f-3', 'f-2', 'f-1',
  'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7',
  'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16',
  // Half-step appended at the end — sort by parseFStepNumber() for display.
  'f2-5',
];

export const DENSITY_IDS: DensityId[] = ['default', 'compact', 'open'];

export const DIMENSION_SPACING_TOKENS = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5',
  '4', '4.5', '5', '5.5', '6', '7', '8', '9',
  '10', '12', '14', '16', '18', '20', '24', '28', '32', '40',
] as const;

export type DimensionSpacingToken = (typeof DIMENSION_SPACING_TOKENS)[number];

export const NEGATIVE_SPACING_TOKENS = [
  '0.5', '1', '1.5', '2', '2.5', '3', '3.5',
  '4', '4.5', '5', '5.5', '6', '7', '8',
] as const;

export type NegativeSpacingToken = (typeof NEGATIVE_SPACING_TOKENS)[number];

export const DIMENSION_TOKEN_MULTIPLIERS: Record<DimensionSpacingToken, number> = {
  '0': 0,
  '0.5': 0.125,
  '1': 0.25,
  '1.5': 0.375,
  '2': 0.5,
  '2.5': 0.625,
  '3': 0.75,
  '3.5': 0.875,
  '4': 1,
  '4.5': 1.125,
  '5': 1.25,
  '5.5': 1.375,
  '6': 1.5,
  '7': 1.75,
  '8': 2,
  '9': 2.25,
  '10': 2.5,
  '12': 3,
  '14': 3.5,
  '16': 4,
  '18': 4.5,
  '20': 5,
  '24': 6,
  '28': 7,
  '32': 8,
  '40': 10,
};

const F_STEP_TO_DIMENSION_TOKEN: Record<FStep, DimensionSpacingToken> = {
  'f-8': '0',
  'f-7': '0.5',
  'f-6': '1',
  'f-5': '1.5',
  'f-4': '2',
  'f-3': '2.5',
  'f-2': '3',
  'f-1': '3.5',
  f0: '4',
  f1: '4.5',
  f2: '5',
  f3: '6',
  f4: '7',
  f5: '8',
  f6: '9',
  f7: '10',
  f8: '12',
  f9: '14',
  f10: '16',
  f11: '18',
  f12: '20',
  f13: '24',
  f14: '28',
  f15: '32',
  f16: '40',
  // Half-step rung — maps to the dimension token '5.5' (ratio 1.375).
  'f2-5': '5.5',
};

/**
 * The dimension *step* name for an f-step — the Figma naming convention
 * (quarter-base index). e.g. `f7` → `'10'`, `f0` → `'4'`, `f2-5` → `'5.5'`.
 * Used to label the type scale in the editor with Figma vocabulary instead of
 * the internal f-step names.
 */
export function fStepToDimensionStep(fStep: FStep): DimensionSpacingToken {
  return F_STEP_TO_DIMENSION_TOKEN[fStep];
}

/**
 * Responsive breakpoint group (matches the Figma "Breakpoints" table and the
 * grid brackets): S `0–619px` · M `620–990px` · L `991px+`. The type scale uses
 * these groups to step Display/Headline up on large screens.
 */
export type BreakpointGroup = 'S' | 'M' | 'L';

export function viewportToBreakpointGroup(viewportWidth: number): BreakpointGroup {
  if (viewportWidth <= 619) return 'S';
  if (viewportWidth <= 990) return 'M';
  return 'L';
}

/**
 * Canonical breakpoint identifier — the unified S/M/L model that supersedes the
 * legacy 5 fixed-width platform IDs. Ranges (Colour Tool 5.0): S `<620` ·
 * M `620–990` · L `>991`. Alias of {@link BreakpointGroup}.
 */
export type BreakpointId = BreakpointGroup;

export const BREAKPOINT_IDS: BreakpointId[] = ['S', 'M', 'L'];

/** Map a viewport width to its S/M/L breakpoint. Alias of viewportToBreakpointGroup. */
export const resolveBreakpointRange = viewportToBreakpointGroup;

export const COLOURTOOL_BASE_ENDPOINTS: Record<DensityId, {
  min: { viewport: number; base: number };
  max: { viewport: number; base: number };
}> = {
  default: {
    min: { viewport: 360, base: 16 },
    max: { viewport: 1920, base: 20 },
  },
  compact: {
    min: { viewport: 360, base: 14 },
    max: { viewport: 1920, base: 18 },
  },
  open: {
    min: { viewport: 360, base: 18 },
    max: { viewport: 1920, base: 22 },
  },
};

/**
 * Fluid clamp anchors per density — the S-edge (min) and L-edge (max) base sizes
 * the continuous `clamp()` interpolates between. Alias of COLOURTOOL_BASE_ENDPOINTS,
 * named for the fluid dimension model.
 */
export const FLUID_DIMENSION_ANCHORS = COLOURTOOL_BASE_ENDPOINTS;

/**
 * Static base size for an S/M/L breakpoint (Option A — Min/Mid/Max):
 * S → min.base · M → midpoint (avg of min/max) · L → max.base.
 * Default density: 16 / 18 / 20. This is the flat per-breakpoint snapshot used by
 * static (non-fluid) mode, re-keyed onto the unified 619/990 breakpoint thresholds.
 */
export function breakpointStaticBaseSize(
  bp: BreakpointId,
  density: DensityId = 'default',
): number {
  const { min, max } = COLOURTOOL_BASE_ENDPOINTS[density];
  if (bp === 'S') return min.base;
  if (bp === 'L') return max.base;
  return (min.base + max.base) / 2;
}

function roundDimensionValue(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Continuous (fluid) base-size resolver — linear interpolation between the
 * mobile (min) and desktop (max) endpoints. Kept for fluid/clamp scaling
 * (`fluidScaling`) and any caller that needs a value at an arbitrary viewport
 * between breakpoints. The discrete per-breakpoint anchors use
 * `resolveColourToolDiscreteBaseSize` instead (see below).
 */
export function resolveColourToolBaseSize(
  viewportWidth: number,
  density: DensityId = 'default',
): number {
  const { min, max } = COLOURTOOL_BASE_ENDPOINTS[density];
  if (viewportWidth <= min.viewport) return min.base;
  if (viewportWidth >= max.viewport) return max.base;
  const t = (viewportWidth - min.viewport) / (max.viewport - min.viewport);
  return min.base + t * (max.base - min.base);
}

/**
 * Discrete per-breakpoint base size for a viewport, on the unified S/M/L ranges
 * (S `<620` → min · M `620–990` → midpoint · L `>991` → max). Default density
 * resolves to 16 / 18 / 20. This is the static-mode snapshot resolver.
 */
export function resolveColourToolDiscreteBaseSize(
  viewportWidth: number,
  density: DensityId = 'default',
): number {
  return breakpointStaticBaseSize(resolveBreakpointRange(viewportWidth), density);
}

export function resolveColourToolDimensionTokenValue(
  token: DimensionSpacingToken,
  key: BreakpointId,
  density: DensityId = 'default',
): number {
  return roundDimensionValue(
    breakpointStaticBaseSize(key, density) * DIMENSION_TOKEN_MULTIPLIERS[token],
  );
}

/** Build the 26-value f-step array for one breakpoint × density. */
function buildDensityTable(key: BreakpointId, densityId: DensityId): number[] {
  return F_STEPS.map((step) =>
    resolveColourToolDimensionTokenValue(F_STEP_TO_DIMENSION_TOKEN[step], key, densityId),
  );
}

function buildStaticDimensionTables(): Record<BreakpointId, Record<DensityId, number[]>> {
  const tables = {} as Record<BreakpointId, Record<DensityId, number[]>>;

  for (const bp of BREAKPOINT_IDS) {
    const densityTables = {} as Record<DensityId, number[]>;
    for (const densityId of DENSITY_IDS) densityTables[densityId] = buildDensityTable(bp, densityId);
    tables[bp] = densityTables;
  }

  return tables;
}

/**
 * Full static dimension tables, keyed by S/M/L breakpoint. Access:
 * STATIC_DIMENSION_TABLES[bp][densityId] → number[] (26 values, indexed by
 * F_STEPS). Values rounded to two decimals.
 */
export const STATIC_DIMENSION_TABLES: Record<BreakpointId, Record<DensityId, number[]>> =
  buildStaticDimensionTables();

/**
 * Per-platform grid layout configuration.
 *
 * These values are NOT density-scaled — column count and max-width are layout
 * choices, not spacing/typography dimensions. Density affects `--Grid-Margin`
 * and `--Grid-Gutter` (see GRID_VALUES below) but leaves columns untouched.
 *
 * `maxWidth: null` means the container is unbounded at this breakpoint (the
 * "full-width / software tool" case — common at mobile sizes and for apps
 * that want to fill any viewport, including 1920+).
 *
 * Mirrors `packages/tokens/src/css/dimensions/grid.css`.
 */
export interface GridLayoutConfig {
  columns: number;
  maxWidth: number | null;
}

/** Canonical S/M/L grid layout (columns + max-width). L max-width signed off at 1280. */
const GRID_LAYOUT_BY_BREAKPOINT: Record<BreakpointId, GridLayoutConfig> = {
  S: { columns: 4,  maxWidth: null },
  M: { columns: 8,  maxWidth: null },
  L: { columns: 12, maxWidth: 1280 },
};

export const GRID_LAYOUT: Record<BreakpointId, GridLayoutConfig> = GRID_LAYOUT_BY_BREAKPOINT;

/**
 * Canonical S/M/L breakpoint ranges + grid margin/gutter token mapping (Colour Tool
 * 5.0 values). `min`/`max` are inclusive px bounds (null = open-ended). Grid columns
 * live in {@link GRID_LAYOUT}; margin/gutter here are dimension token names per density.
 */
export const BREAKPOINT_RANGES = [
  {
    id: 'S', name: 'S',
    min: null,
    max: 619,
    margin: { default: '4', compact: '3', open: '5' },
    gutter: { default: '2', compact: '1.5', open: '2.5' },
  },
  {
    id: 'M', name: 'M',
    min: 620,
    max: 990,
    margin: { default: '8', compact: '6', open: '10' },
    gutter: { default: '4', compact: '3', open: '5' },
  },
  {
    id: 'L', name: 'L',
    min: 991,
    max: null,
    margin: { default: '10', compact: '8', open: '16' },
    gutter: { default: '5', compact: '4', open: '5.5' },
  },
] as const;

/** @deprecated Internal alias retained for the resolver below. Use BREAKPOINT_RANGES. */
const GRID_BREAKPOINTS = BREAKPOINT_RANGES;

export function getBreakpointRange(bp: BreakpointId): (typeof BREAKPOINT_RANGES)[number] {
  return BREAKPOINT_RANGES.find((r) => r.id === bp) ?? BREAKPOINT_RANGES[0];
}

function resolveColourToolGridBreakpoint(viewportWidth: number): (typeof GRID_BREAKPOINTS)[number] {
  for (const bp of GRID_BREAKPOINTS) {
    const aboveMin = bp.min === null || viewportWidth >= bp.min;
    const belowMax = bp.max === null || viewportWidth <= bp.max;
    if (aboveMin && belowMax) return bp;
  }
  return GRID_BREAKPOINTS[GRID_BREAKPOINTS.length - 1];
}

function buildGridValues(): Record<BreakpointId, Record<DensityId, { margin: number; gutter: number }>> {
  const values = {} as Record<BreakpointId, Record<DensityId, { margin: number; gutter: number }>>;

  for (const bp of BREAKPOINT_IDS) {
    const gridBreakpoint = getBreakpointRange(bp);
    const densityValues = {} as Record<DensityId, { margin: number; gutter: number }>;

    for (const densityId of DENSITY_IDS) {
      densityValues[densityId] = {
        margin: resolveColourToolDimensionTokenValue(
          gridBreakpoint.margin[densityId],
          bp,
          densityId,
        ),
        gutter: resolveColourToolDimensionTokenValue(
          gridBreakpoint.gutter[densityId],
          bp,
          densityId,
        ),
      };
    }

    values[bp] = densityValues;
  }

  return values;
}

/** Grid spacing values per breakpoint × density (margin + gutter), keyed by S/M/L breakpoint. */
export const GRID_VALUES: Record<BreakpointId, Record<DensityId, { margin: number; gutter: number }>> = {
  ...buildGridValues(),
};

/**
 * Look up a dimension value for a given platform, density, and f-step.
 *
 * @param platform - Breakpoint ID ('S', 'M', or 'L')
 * @param density - Density mode ('default', 'compact', 'open')
 * @param step - F-scale step ('f-8' through 'f16')
 * @returns Dimension value in pixels
 */
/** Precomputed index map for O(1) f-step lookup. */
const F_STEP_INDEX = Object.fromEntries(
  F_STEPS.map((s, i) => [s, i])
) as Record<FStep, number>;

export function getDimensionValue(
  platform: BreakpointId,
  density: DensityId,
  step: FStep,
): number {
  const index = F_STEP_INDEX[step];
  if (index === undefined) {
    throw new Error(`Invalid f-step: ${step}`);
  }
  return STATIC_DIMENSION_TABLES[platform][density][index];
}

/**
 * Look up a grid value for a given platform, density, and token.
 *
 * @param platform - Platform ID
 * @param density - Density mode
 * @param token - Grid token ('margin' or 'gutter')
 * @returns Grid value in pixels
 */
export function getGridValue(
  platform: BreakpointId,
  density: DensityId,
  token: 'margin' | 'gutter',
): number {
  return GRID_VALUES[platform][density][token];
}

export interface ResolvedGridSpacing {
  margin: number;
  gutter: number;
}

function roundGridValue(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Resolve grid margin/gutter for a platform+density pair.
 *
 * ColourTool/platform defines grid spacing as platform+density variables, not as raw
 * `f0` / `f0 * .5` aliases. When a brand customizes the f0 base size, preserve
 * the platform-specific relationship by scaling from the static table.
 */
export function resolveGridSpacing(
  platform: BreakpointId,
  density: DensityId,
  baseSize?: number,
): ResolvedGridSpacing {
  const staticGrid = GRID_VALUES[platform][density];
  if (baseSize == null) return staticGrid;

  const staticBase = getDimensionValue(platform, density, 'f0');
  if (!Number.isFinite(baseSize) || baseSize <= 0 || !staticBase) return staticGrid;

  const roundedBaseSize = roundGridValue(baseSize);
  if (Math.abs(roundedBaseSize - staticBase) < 0.01) return staticGrid;

  const gridBreakpoint = getBreakpointRange(platform);
  return {
    margin: roundGridValue(
      baseSize * DIMENSION_TOKEN_MULTIPLIERS[gridBreakpoint.margin[density]],
    ),
    gutter: roundGridValue(
      baseSize * DIMENSION_TOKEN_MULTIPLIERS[gridBreakpoint.gutter[density]],
    ),
  };
}

// ─── Config-aware dynamic lookup (non-web platforms) ─────────────────────────
//
// The static tables above are the source of truth for Web. For Mobile Native,
// Print, Outdoor, etc., breakpoints are user-defined and live in Convex, so
// their f-scale values must be computed from the PlatformsFoundationConfig.
//
// The helpers below accept a config, locate a breakpoint by (platformId,
// breakpointId), apply any per-breakpoint DIN 1450 override, and derive the
// f-step values via the same SCALE_RATIOS used in `dimensionCSS.ts`. When the
// requested breakpoint can't be located, they fall back to the Web static
// tables so existing callers keep working.

/**
 * Compute the base size for a specific breakpoint inside a platform.
 *
 * If the breakpoint has a `din1450Override`, any field set there takes
 * precedence; unset fields inherit from the parent platform's DIN params.
 * Otherwise the parent platform's pre-computed `calculatedBaseSize` is used
 * directly.
 *
 * For `digital-responsive` (Web) breakpoints, this path is **not** used.
 * Callers route through `getDimensionValue()` so Web stays byte-identical to
 * the ColourTool/platform platform-mode tables.
 */
export function resolveBreakpointBaseSize(
  platform: PlatformEntry,
  breakpoint: PlatformBreakpoint,
): number {
  const override = breakpoint.din1450Override;
  if (override) {
    const viewingDistance = override.viewingDistance ?? platform.viewingDistance;
    const ppi = override.ppi ?? platform.ppi;
    const pixelDensity = override.pixelDensity ?? platform.pixelDensity;
    return computeDIN1450BaseSize(viewingDistance, ppi, pixelDensity);
  }
  return platform.calculatedBaseSize;
}

/**
 * Scale the parent's density config by the ratio between the breakpoint's
 * resolved base size and the parent's. Returns per-density base sizes in px.
 *
 * INVARIANT: this function must NEVER be called for digital-responsive
 * (Web) platforms. Web breakpoints go through the static dimension tables
 * via `getDimensionValue()` so their values remain byte-identical to the
 * ColourTool/platform platform-mode output.
 *
 * The guard throws in development (via a thrown error that's caught at the
 * `getDimensionValueFromConfig` fast-path level) rather than returning
 * wrong values. Callers must route Web breakpoints through the static lookup.
 */
function densityBaseSizesForBreakpoint(
  platform: PlatformEntry,
  breakpoint: PlatformBreakpoint,
): Record<DensityId, number> {
  if (platform.category === 'digital-responsive') {
    throw new Error(
      `densityBaseSizesForBreakpoint: refusing to compute dynamic f-scale for ` +
      `digital-responsive platform "${platform.id}" breakpoint "${breakpoint.id}". ` +
      `Web breakpoints must route through getDimensionValue() + STATIC_DIMENSION_TABLES ` +
      `to preserve the ColourTool/platform values.`
    );
  }

  const parentBase = platform.calculatedBaseSize || 1;
  const bpBase = resolveBreakpointBaseSize(platform, breakpoint);
  const ratio = bpBase / parentBase;

  const result: Record<DensityId, number> = { default: 16, compact: 14, open: 18 };
  for (const dc of platform.densityConfigs) {
    const d = dc.density as DensityId;
    // digital-fixed / print / physical don't interpolate mobile→desktop, so
    // we use the 'desktop' endpoint (which the platform-config.ts density
    // scaling pass has already pre-multiplied by the DIN ratio). Mobile is
    // the fallback for entries that only define a mobile endpoint.
    const base = (dc.desktop?.baseSize ?? dc.mobile?.baseSize ?? 16) * ratio;
    result[d] = Math.round(base * 100) / 100;
  }
  return result;
}

/**
 * Look up a dimension value for any platform×breakpoint×density×step combination.
 *
 * - For the S/M/L breakpoint IDs: routes through the static
 *   `STATIC_DIMENSION_TABLES` — Web path is byte-identical to `getDimensionValue`.
 * - For any other (platformId, breakpointId) pair found in `config`: computes the
 *   f-step value from the platform's DIN 1450 params (with any per-breakpoint override).
 * - Falls back to the Web default for the requested density if nothing matches.
 *
 * @param config - Optional PlatformsFoundationConfig. If omitted, behaves like the Web static lookup.
 * @param platformId - Top-level platform id (e.g., 'web', 'mobile-native', 'print') OR an S/M/L breakpoint ID.
 * @param breakpointId - Breakpoint id within the platform (e.g., 'print-a4-portrait'). For Web breakpoint lookups, pass the same S/M/L value as platformId.
 * @param density - Density mode
 * @param step - F-scale step
 */
export function getDimensionValueFromConfig(
  config: PlatformsFoundationConfig | null | undefined,
  platformId: string,
  breakpointId: string,
  density: DensityId,
  step: FStep,
): number {
  // Fast path 1: S/M/L breakpoint static lookup — byte-identical to getDimensionValue.
  if ((BREAKPOINT_IDS as readonly string[]).includes(platformId)) {
    return getDimensionValue(platformId as BreakpointId, density, step);
  }

  // Fast path 2: web breakpoint addressed by (platformId='web', breakpointId='S' | 'M' | 'L')
  if (platformId === 'web' && (BREAKPOINT_IDS as readonly string[]).includes(breakpointId)) {
    return getDimensionValue(breakpointId as BreakpointId, density, step);
  }

  // Dynamic path: look up the platform entry in the config.
  if (config) {
    const platform = config.platforms.find((p) => p.id === platformId);
    if (platform) {
      const breakpoint = platform.breakpoints.find((bp) => bp.id === breakpointId);
      if (breakpoint) {
        // Fast path 3: digital-responsive platforms with custom breakpoint
        // IDs (e.g. a user-renamed Web breakpoint) still route through the
        // static dimension tables, keyed by viewport width on the unified
        // S/M/L ladder (619/990). This preserves the ColourTool/platform values
        // and keeps Web byte-identical with `getDimensionValue()` regardless of
        // breakpoint id shape.
        if (platform.category === 'digital-responsive') {
          return getDimensionValue(resolveBreakpointRange(breakpoint.viewportWidth), density, step);
        }
        // Dynamic DIN 1450 path — only for non-responsive categories.
        const baseSizes = densityBaseSizesForBreakpoint(platform, breakpoint);
        const baseForDensity = baseSizes[density] ?? baseSizes.default;
        const ratio = SCALE_RATIOS[F_STEP_INDEX[step]];
        return Math.round(baseForDensity * ratio * 100) / 100;
      }
    }
  }

  // Final fallback: web default for that density.
  // Mirrors the legacy behaviour of throwing-then-catching at the call site.
  return getDimensionValue('S', density, step);
}

/** Flat entry describing a selectable breakpoint in the Typography editor picker. */
export interface AvailableBreakpoint {
  platformId: string;
  platformLabel: string;
  category: PlatformCategory;
  breakpointId: string;
  breakpointLabel: string;
  widthPx: number;
  heightPx?: number;
  units: 'px' | 'mm';
  /** Convenience flag — true when this breakpoint is auto-selected by matchMedia (Web only) */
  isResponsive: boolean;
}

/**
 * Canonical breakpoint label including its width — the single naming convention
 * shared by the Dimension tabs, the Typography platform dropdown, and the
 * Density & Platforms editor. e.g. `Desktop Large (1920px)` / `Print A4 (210mm)`.
 */
export function formatBreakpointLabel(bp: Pick<AvailableBreakpoint, 'breakpointLabel' | 'widthPx' | 'units'>): string {
  const unit = bp.units === 'mm' ? 'mm' : 'px';
  return `${bp.breakpointLabel} (${Math.round(bp.widthPx)}${unit})`;
}

/**
 * Convert millimeters to CSS pixels for display inside the browser-based editor.
 * Uses the W3C-standard CSS pixel density (96 px/in) by default. Rounded to
 * one decimal place so the stored value survives JSON serialization cleanly.
 */
export function mmToPx(mm: number, ppi: number = CSS_PX_PER_INCH): number {
  return Math.round((mm / MM_PER_INCH) * ppi * 10) / 10;
}

/**
 * Flatten a PlatformsFoundationConfig into a list of selectable breakpoints
 * for UI pickers (Typography editor, preview toolbar, etc.).
 *
 * Filters out:
 *  - Disabled platforms (`isEnabled === false`)
 *  - Inactive breakpoints (`isActive === false`)
 *
 * Falls back to the three Web S/M/L breakpoints if `config` is null/undefined or
 * has no enabled platforms — preserves Web-only behaviour during initial load.
 */
export function getAllAvailableBreakpoints(
  config: PlatformsFoundationConfig | null | undefined,
): AvailableBreakpoint[] {
  const result: AvailableBreakpoint[] = [];

  if (config && Array.isArray(config.platforms)) {
    for (const platform of config.platforms) {
      if (!platform.isEnabled) continue;
      const category: PlatformCategory = platform.category ?? 'digital-responsive';

      for (const bp of platform.breakpoints) {
        if (!bp.isActive) continue;
        const units: 'px' | 'mm' = bp.units ?? 'px';
        const widthPx = units === 'mm' ? mmToPx(bp.viewportWidth) : bp.viewportWidth;
        const heightPx =
          bp.viewportHeight === undefined
            ? undefined
            : units === 'mm'
              ? mmToPx(bp.viewportHeight)
              : bp.viewportHeight;

        result.push({
          platformId: platform.id,
          platformLabel: platform.label,
          category,
          breakpointId: bp.id,
          breakpointLabel: bp.label,
          widthPx,
          heightPx,
          units,
          isResponsive: category === 'digital-responsive',
        });
      }
    }
  }

  if (result.length > 0) return result;

  // Fallback — the 3 Web S/M/L breakpoints so existing Web-only flows keep working.
  // Representative widths anchor each breakpoint's range for picker display.
  const fallbackWidths: Record<BreakpointId, number> = { S: 360, M: 768, L: 1440 };
  for (const id of BREAKPOINT_IDS) {
    result.push({
      platformId: 'web',
      platformLabel: 'Web',
      category: 'digital-responsive',
      breakpointId: id,
      breakpointLabel: id,
      widthPx: fallbackWidths[id],
      units: 'px',
      isResponsive: true,
    });
  }
  return result;
}
