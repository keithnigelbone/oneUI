/**
 * platform-tokens.ts
 *
 * Generates CSS custom property overrides for platform-specific dimension values.
 *
 * V4: Uses the brand's platform config (base sizes from Convex) as primary source.
 * computeScaleFromBase() computes f-step values from the brand's base size using
 * the same fixed ratio formula as generateDimensionCSS (the @layer brand CSS generator),
 * ensuring pixel-perfect parity between inline overrides and brand CSS.
 *
 * Falls back to STATIC_DIMENSION_TABLES when no brand config is available.
 *
 * Dimension tokens vary by **viewport × density**. The static tables contain
 * 5 platforms × 3 densities × 25 f-steps matching ColourTool/platform output.
 * When density is not specified, defaults to 'default'.
 */

import {
  F_SCALE_STEPS,
  generateDimensionScale,
} from './dimension';
import type { FScaleStep } from './dimension';
import type { PlatformEntry, PlatformDensityConfig } from '../types/platforms';
import { STATIC_DIMENSION_TABLES, resolveGridSpacing, resolveBreakpointRange, F_STEPS } from '../data/dimension-scales';
import { NEGATIVE_SPACING_SIZES } from '../data/spacing-aliases';
import type { BreakpointId, DensityId } from '../data/dimension-scales';
import { computeScaleFromBase, getBaseSizesForBreakpoint } from './dimensionCSS';

// Re-export types so consumers can import from @oneui/shared
export type { DensityId } from '../data/dimension-scales';

/**
 * Map a canonical breakpoint viewport width to its S/M/L breakpoint for static
 * table lookup. Only the canonical widths are listed — other widths fall through
 * to {@link resolveBreakpointRange}.
 */
const VIEWPORT_TO_BREAKPOINT_ID: Record<number, BreakpointId> = {
  360: 'S',
  768: 'M',
  1024: 'L',
  1440: 'L',
  1920: 'L',
};

/**
 * Default density config base sizes — used to detect unscaled configs.
 * When a platform's density configs match these defaults, its
 * calculatedBaseSize hasn't been applied. We scale them proportionally
 * so each platform produces distinct dimension/spacing values.
 */
const DEFAULT_DENSITY_BASE_SIZES: Record<string, { mobile: number; desktop: number }> = {
  compact: { mobile: 14, desktop: 18 },
  default: { mobile: 16, desktop: 20 },
  open: { mobile: 18, desktop: 22 },
};

const DESKTOP_REF_CALC_BASE = 19.5;

function densityConfigsAreDefault(configs: readonly PlatformDensityConfig[]): boolean {
  return configs.every((dc) => {
    const ref = DEFAULT_DENSITY_BASE_SIZES[dc.density];
    if (!ref) return false;
    return (
      Math.abs(dc.mobile.baseSize - ref.mobile) < 0.1 &&
      Math.abs(dc.desktop.baseSize - ref.desktop) < 0.1
    );
  });
}

function applyCalculatedBaseSizeScaling(
  configs: readonly PlatformDensityConfig[],
  calculatedBaseSize: number,
): PlatformDensityConfig[] {
  if (
    calculatedBaseSize <= 0 ||
    Math.abs(calculatedBaseSize / DESKTOP_REF_CALC_BASE - 1) < 0.02 ||
    !densityConfigsAreDefault(configs)
  ) {
    return configs as PlatformDensityConfig[];
  }
  const ratio = calculatedBaseSize / DESKTOP_REF_CALC_BASE;
  return configs.map((dc) => ({
    ...dc,
    mobile: {
      ...dc.mobile,
      baseSize: Math.round(dc.mobile.baseSize * ratio * 10) / 10,
    },
    desktop: {
      ...dc.desktop,
      baseSize: Math.round(dc.desktop.baseSize * ratio * 10) / 10,
    },
  }));
}

/**
 * Compute --Dimension-f* and --Grid-* overrides from a PlatformEntry at a specific breakpoint.
 *
 * For known breakpoint viewports (360, 768, 1024, 1440, 1920), uses the
 * ColourTool/platform-aligned static dimension tables defined in scale.css.
 * For unknown viewports or native platforms, falls back to the exponential formula.
 *
 * @param platform - The platform entry with density configs and viewport range
 * @param viewportWidth - Breakpoint viewport width, or null for "Responsive" (no override)
 * @param density - Density mode to use for static table lookup (default: 'default')
 * @returns CSS custom property overrides suitable for spreading onto a style prop
 */
export function computeDimensionOverrides(
  platform: PlatformEntry,
  viewportWidth: number | null,
  density: DensityId = 'default'
): Record<string, string> {
  // Responsive mode = no override, default browser clamp() behavior
  if (viewportWidth == null) {
    return {};
  }

  // V4: Compute from the brand's platform config (Convex source of truth).
  // Uses the same computeScaleFromBase() formula as generateDimensionCSS,
  // ensuring pixel-perfect parity with the @layer brand CSS.
  if (platform.densityConfigs.length > 0) {
    const baseSizes = getBaseSizesForBreakpoint(
      viewportWidth,
      platform.viewportMin,
      platform.viewportMax,
      applyCalculatedBaseSizeScaling(platform.densityConfigs, platform.calculatedBaseSize),
    );
    const baseSize = baseSizes[density] ?? baseSizes['default'] ?? 16;
    const bp = VIEWPORT_TO_BREAKPOINT_ID[viewportWidth] ?? resolveBreakpointRange(viewportWidth);
    return buildOverridesFromBrandScale(baseSize, bp, density);
  }

  // Fallback: static tables when no brand config is available
  const bp = VIEWPORT_TO_BREAKPOINT_ID[viewportWidth];
  if (bp) {
    return buildOverridesFromStaticTable(bp, density);
  }

  // Platforms without breakpoints (e.g., TV Native) use DIN 1450 calculated base size
  if (platform.breakpoints.length === 0) {
    const baseSize = platform.calculatedBaseSize;
    const densityConfig = platform.densityConfigs[0];
    const scaleFactor = densityConfig?.desktop.scaleFactor ?? 1.185;
    return buildOverridesFromScale(baseSize, scaleFactor);
  }

  return {};
}

/**
 * Compute density-aware dimension overrides for the current viewport (responsive mode).
 * Used when no specific breakpoint is selected — reads the static table at the
 * V2 platform ID (derived from current viewport width) and the selected density.
 *
 * Always returns a full set of --Dimension-f* and --Grid-* overrides, ensuring
 * the preview container is fully isolated from the global density on <html>.
 *
 * @param breakpointId - Breakpoint ID matching the current viewport ('S' | 'M' | 'L')
 * @param density - Density mode for the preview
 * @returns CSS custom property overrides
 */
export function computeResponsiveDensityOverrides(
  breakpointId: BreakpointId,
  density: DensityId
): Record<string, string> {
  return buildOverridesFromStaticTable(breakpointId, density);
}

/**
 * Static mapping of spacing tokens → f-step index.
 * These tokens are declared in primitives.css as var(--Dimension-fN) on :root.
 * When we override --Dimension-fN on a descendant, the spacing tokens' inherited
 * computed values don't update because CSS resolves var() in custom properties at
 * declaration site. So we must also inject resolved spacing values on the preview
 * container.
 */
const SPACING_ALIAS_MAP: Array<[string, number]> = [
  ['--Spacing-0', 0],
  ['--Spacing-0-5', 1],
  ['--Spacing-1', 2],
  ['--Spacing-1-5', 3],
  ['--Spacing-2', 4],
  ['--Spacing-2-5', 5],
  ['--Spacing-3', 6],
  ['--Spacing-3-5', 7],
  ['--Spacing-4', 8],
  ['--Spacing-4-5', 9],
  ['--Spacing-5', 10],
  ['--Spacing-6', 11],
  ['--Spacing-7', 12],
  ['--Spacing-8', 13],
  ['--Spacing-9', 14],
  ['--Spacing-10', 15],
  ['--Spacing-12', 16],
  ['--Spacing-14', 17],
  ['--Spacing-16', 18],
  ['--Spacing-18', 19],
  ['--Spacing-20', 20],
  ['--Spacing-24', 21],
  ['--Spacing-28', 22],
  ['--Spacing-32', 23],
  ['--Spacing-40', 24],
];

function getSpacingMidpointValue(values: readonly number[]): number {
  return (values[10] + values[11]) / 2;
}

function addNegativeSpacingOverrides(overrides: Record<string, string>): void {
  for (const size of NEGATIVE_SPACING_SIZES) {
    const positiveValue = overrides[`--Spacing-${size}`];
    if (!positiveValue) continue;
    overrides[`--Spacing-Negative-${size}`] = positiveValue === '0px' ? '0px' : `-${positiveValue}`;
  }
}

const SHAPE_ALIAS_MAP: Array<[string, number]> = [
  // --Shape-* → f-step index (from primitives.css)
  ['--Shape-0-5', 1],  // f-7
  ['--Shape-1', 2],  // f-6
  ['--Shape-1-5', 3],  // f-5
  ['--Shape-2', 4],  // f-4
  ['--Shape-2-5', 5],  // f-3
  ['--Shape-3', 6],   // f-2
  ['--Shape-3-5', 7],    // f-1
  ['--Shape-4', 8],    // f0
  ['--Shape-4-5', 9],    // f1
  ['--Shape-5', 10],  // f2
  ['--Shape-6', 11], // f3
  ['--Shape-7', 12], // f4
  ['--Shape-8', 13], // f5
  ['--Shape-9', 14], // f6
  ['--Shape-10', 15], // f7
];

const TYPOGRAPHY_ALIAS_MAP: Array<[string, number]> = [
  // Typography font-size and line-height → f-step index (from typography.css)
  // Display
  ['--Display-L-FontSize', 15],     // f7
  ['--Display-L-LineHeight', 15],   // f7
  ['--Display-M-FontSize', 14],     // f6
  ['--Display-M-LineHeight', 14],   // f6
  ['--Display-S-FontSize', 13],     // f5
  ['--Display-S-LineHeight', 13],   // f5
  // Headline
  ['--Headline-L-FontSize', 12],    // f4 (S/M base; bumps to f6 at the L group)
  ['--Headline-L-LineHeight', 12],  // f4
  ['--Headline-M-FontSize', 10],    // f2
  ['--Headline-M-LineHeight', 10],  // f2
  ['--Headline-S-FontSize', 8],     // f0
  ['--Headline-S-LineHeight', 8],   // f0
  // Title
  ['--Title-L-FontSize', 10],      // f2
  ['--Title-L-LineHeight', 11],    // f3
  ['--Title-M-FontSize', 8],       // f0
  ['--Title-M-LineHeight', 9],     // f1
  ['--Title-S-FontSize', 6],       // f-2
  ['--Title-S-LineHeight', 7],     // f-1
  // Body (5 sizes: L, M, S, XS, 2XS)
  ['--Body-L-FontSize', 9],       // f1
  ['--Body-L-LineHeight', 12],     // f4
  ['--Body-M-FontSize', 8],       // f0
  ['--Body-M-LineHeight', 11],     // f3
  ['--Body-S-FontSize', 7],       // f-1
  ['--Body-S-LineHeight', 10],     // f2
  ['--Body-XS-FontSize', 6],      // f-2
  ['--Body-XS-LineHeight', 9],     // f1
  ['--Body-2XS-FontSize', 5],     // f-3
  ['--Body-2XS-LineHeight', 8],    // f0
  // Label (6 sizes: L, M, S, XS, 2XS, 3XS)
  ['--Label-L-FontSize', 9],      // f1
  ['--Label-L-LineHeight', 9],    // f1
  ['--Label-M-FontSize', 8],      // f0
  ['--Label-M-LineHeight', 8],    // f0
  ['--Label-S-FontSize', 7],      // f-1
  ['--Label-S-LineHeight', 7],    // f-1
  ['--Label-XS-FontSize', 6],     // f-2
  ['--Label-XS-LineHeight', 6],   // f-2
  ['--Label-2XS-FontSize', 5],    // f-3
  ['--Label-2XS-LineHeight', 5],  // f-3
  ['--Label-3XS-FontSize', 4],    // f-4
  ['--Label-3XS-LineHeight', 4],  // f-4
  // Code (5 sizes: M, S, XS, 2XS, 3XS)
  ['--Code-M-FontSize', 8],       // f0
  ['--Code-M-LineHeight', 10],     // f2
  ['--Code-S-FontSize', 7],       // f-1
  ['--Code-S-LineHeight', 9],      // f1
  ['--Code-XS-FontSize', 6],      // f-2
  ['--Code-XS-LineHeight', 8],     // f0
  ['--Code-2XS-FontSize', 5],     // f-3
  ['--Code-2XS-LineHeight', 7],   // f-1 (offset 2)
  ['--Code-3XS-FontSize', 4],     // f-4
  ['--Code-3XS-LineHeight', 6],   // f-2 (offset 2)
];

/**
 * Build spacing, shape, and typography alias overrides from the f-step px values.
 *
 * CSS custom properties like `--Spacing-4: var(--Dimension-f0)` are resolved at
 * `:root` declaration time. Overriding `--Dimension-f0` on a descendant does NOT
 * update the already-inherited `--Spacing-4`. This function produces the concrete
 * alias values so components like Button (which read `--Spacing-*`, `--Label-*`,
 * etc.) correctly react to scoped dimension overrides.
 *
 * @param fStepValues - Array of px values indexed by f-step position (f-8=0 … f16=24, f2-5=25)
 * @returns CSS custom property overrides for spacing, shape, and typography aliases
 */
export function buildAliasOverridesFromFStepValues(fStepValues: readonly number[]): Record<string, string> {
  const overrides: Record<string, string> = {};
  const fmt = (v: number): string => (v === 0 ? '0px' : `${parseFloat(v.toFixed(2))}px`);

  for (const [token, idx] of SPACING_ALIAS_MAP) {
    overrides[token] = fmt(fStepValues[idx]);
  }
  overrides['--Spacing-5-5'] = fmt(getSpacingMidpointValue(fStepValues));
  addNegativeSpacingOverrides(overrides);

  for (const [token, idx] of SHAPE_ALIAS_MAP) {
    overrides[token] = fmt(fStepValues[idx]);
  }

  for (const [token, idx] of TYPOGRAPHY_ALIAS_MAP) {
    overrides[token] = fmt(fStepValues[idx]);
  }

  return overrides;
}

/**
 * Build overrides from the V3 static dimension table.
 * Includes:
 * - All 25 --Dimension-f* tokens (raw scale values)
 * - --Grid-Margin and --Grid-Gutter
 * - All --Spacing-* alias tokens (resolved to concrete px)
 * - All --Shape-* alias tokens (resolved to concrete px)
 * - All typography size/line-height tokens (resolved to concrete px)
 *
 * The alias tokens are needed because primitives.css and typography.css declare
 * them as var(--Dimension-fN) on :root. CSS resolves these at :root level using
 * the global density. Overriding --Dimension-fN on a descendant doesn't update
 * the already-inherited alias values. By injecting resolved aliases, the preview
 * container is fully density-isolated.
 */
function buildOverridesFromStaticTable(breakpointId: BreakpointId, density: DensityId = 'default'): Record<string, string> {
  const table = STATIC_DIMENSION_TABLES[breakpointId][density];
  const overrides: Record<string, string> = {};

  // 1. Raw dimension f-steps
  for (let i = 0; i < F_STEPS.length; i++) {
    overrides[`--Dimension-${F_STEPS[i]}`] = `${table[i]}px`;
  }

  // 2. Grid tokens
  const grid = resolveGridSpacing(breakpointId, density);
  overrides['--Grid-Margin'] = `${grid.margin}px`;
  overrides['--Grid-Gutter'] = `${grid.gutter}px`;

  // 3. Spacing aliases (resolved to concrete px from f-step values)
  for (const [token, idx] of SPACING_ALIAS_MAP) {
    overrides[token] = `${table[idx]}px`;
  }
  overrides['--Spacing-5-5'] = `${getSpacingMidpointValue(table)}px`;
  addNegativeSpacingOverrides(overrides);
  overrides['--Spacing-Margin'] = `${grid.margin}px`;
  overrides['--Spacing-Gutter'] = `${grid.gutter}px`;

  // 4. Shape aliases (resolved to concrete px from f-step values)
  for (const [token, idx] of SHAPE_ALIAS_MAP) {
    overrides[token] = `${table[idx]}px`;
  }

  // 5. Typography font-size and line-height aliases
  for (const [token, idx] of TYPOGRAPHY_ALIAS_MAP) {
    overrides[token] = `${table[idx]}px`;
  }

  return overrides;
}

/**
 * Build overrides from the brand's base size using computeScaleFromBase().
 * Same fixed-ratio formula as generateDimensionCSS (the @layer brand CSS generator),
 * ensuring pixel-perfect parity between inline overrides and brand CSS.
 *
 * This replaces the static table lookup for brand-aware component previews.
 */
function buildOverridesFromBrandScale(
  baseSize: number,
  breakpointId: BreakpointId,
  density: DensityId,
): Record<string, string> {
  const values = computeScaleFromBase(baseSize);
  const overrides: Record<string, string> = {};

  // 1. Raw dimension f-steps
  for (let i = 0; i < F_STEPS.length; i++) {
    const v = values[i];
    overrides[`--Dimension-${F_STEPS[i]}`] = v === 0 ? '0px' : `${parseFloat(v.toFixed(2))}px`;
  }

  // 2. Grid tokens resolve from the breakpoint×density table, scaled
  // proportionally only when the brand customizes the f0 base size.
  const grid = resolveGridSpacing(breakpointId, density, baseSize);
  overrides['--Grid-Margin'] = `${grid.margin}px`;
  overrides['--Grid-Gutter'] = `${grid.gutter}px`;

  // 3. Spacing aliases (resolved to concrete px from computed f-step values)
  for (const [token, idx] of SPACING_ALIAS_MAP) {
    overrides[token] = values[idx] === 0 ? '0px' : `${parseFloat(values[idx].toFixed(2))}px`;
  }
  overrides['--Spacing-5-5'] = `${parseFloat(getSpacingMidpointValue(values).toFixed(2))}px`;
  addNegativeSpacingOverrides(overrides);
  overrides['--Spacing-Margin'] = overrides['--Grid-Margin'];
  overrides['--Spacing-Gutter'] = overrides['--Grid-Gutter'];

  // 4. Shape aliases
  for (const [token, idx] of SHAPE_ALIAS_MAP) {
    overrides[token] = values[idx] === 0 ? '0px' : `${parseFloat(values[idx].toFixed(2))}px`;
  }

  // 5. Typography font-size and line-height aliases
  for (const [token, idx] of TYPOGRAPHY_ALIAS_MAP) {
    overrides[token] = values[idx] === 0 ? '0px' : `${parseFloat(values[idx].toFixed(2))}px`;
  }

  return overrides;
}

/**
 * Compute dimension overrides from raw parameters.
 * Used for custom platforms or unknown viewport widths.
 *
 * @param viewportWidth - The viewport width to interpolate at
 * @param mobileEndpoint - Mobile base size and scale factor
 * @param desktopEndpoint - Desktop base size and scale factor
 * @param viewportRange - Min/max viewport for interpolation
 * @returns CSS custom property overrides
 */
export function computeDimensionOverridesRaw(
  viewportWidth: number,
  mobileEndpoint: { baseSize: number; scaleFactor: number },
  desktopEndpoint: { baseSize: number; scaleFactor: number },
  viewportRange: { min: number; max: number }
): Record<string, string> {
  // Clamp viewport to range
  const clamped = Math.max(
    viewportRange.min,
    Math.min(viewportRange.max, viewportWidth)
  );
  const range = viewportRange.max - viewportRange.min;
  const t = range > 0 ? (clamped - viewportRange.min) / range : 1;

  const baseSize = Math.round(
    mobileEndpoint.baseSize + t * (desktopEndpoint.baseSize - mobileEndpoint.baseSize)
  );
  const scaleFactor =
    mobileEndpoint.scaleFactor + t * (desktopEndpoint.scaleFactor - mobileEndpoint.scaleFactor);

  return buildOverridesFromScale(baseSize, scaleFactor);
}

/**
 * Internal: Generate CSS overrides from a computed base size and scale factor.
 * Fallback for custom platforms not in the static tables.
 */
function buildOverridesFromScale(
  baseSize: number,
  scaleFactor: number
): Record<string, string> {
  const scale = generateDimensionScale(baseSize, scaleFactor);

  const overrides: Record<string, string> = {};
  for (const step of F_SCALE_STEPS) {
    const value = scale.get(step as FScaleStep)!;
    overrides[`--Dimension-${step}`] = `${value}px`;
  }

  return overrides;
}
