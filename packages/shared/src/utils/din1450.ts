/**
 * din1450.ts
 *
 * Internal closed-form DIN 1450 base-size calculation used by
 * `platform-config.ts` when building `PlatformEntry.calculatedBaseSize` and
 * by `data/dimension-scales.ts` when applying per-breakpoint DIN overrides.
 *
 * This file is **intentionally not re-exported from the shared barrel**: the
 * public `calculateDIN1450BaseSize` in `utils/dimension.ts` is a different
 * implementation that uses the full `tan(0.3°)` formula and rounds to an
 * integer. Both are mathematically equivalent up to rounding, but they
 * produce slightly different values (e.g. desktop 19 vs 19.5), so the
 * codebase keeps them cleanly separated:
 *
 *   - `compute` (this file, 1-decimal): used to populate `calculatedBaseSize`
 *     and the density-scaling ratio for non-web platforms. Its output is
 *     what existing Convex data was serialized against — changing the
 *     rounding would shift dimension ratios for TV / Outdoor / Print.
 *   - `calculate` (`utils/dimension.ts`, integer): used by the typography
 *     scale preview and public API consumers. Kept separate for backward
 *     compatibility with code that imports from `@oneui/shared`.
 *
 * If you ever need to unify the two, do it deliberately in a dedicated PR
 * with migration notes — silently swapping rounding here will change the
 * dimension scale of every non-web platform on every existing brand.
 */

/**
 * Closed-form DIN 1450 constant: `tan(0.3°) / (2.54 × xHeight)` with
 * xHeight = 0.53 (JioType) ≈ 0.00389. Expressed as a literal so the
 * constant math is visible in a grep without resolving `Math.tan`.
 */
const DIN_1450_K = 0.00389;

/**
 * Compute the DIN 1450 base font size (in CSS pixels) for a given viewing
 * context. All other dimension f-steps derive from this value via
 * `SCALE_RATIOS` in `data/scale-ratios.ts`.
 *
 * Rounded to 1 decimal place so the stored value survives JSON
 * serialization without drift.
 *
 * @param viewingDistance  Distance from viewer to surface, in centimeters.
 * @param ppi              Display pixel density (e.g. 458 for iPhone 15 Pro, 100 for standard desktop).
 * @param pixelDensity     Device pixel ratio (@1x / @2x / @3x).
 * @returns                Base font size in CSS pixels, rounded to 1 decimal place.
 */
export function computeDIN1450BaseSize(
  viewingDistance: number,
  ppi: number,
  pixelDensity: number,
): number {
  const physicalPPI = ppi / pixelDensity;
  const baseSizePx = viewingDistance * physicalPPI * DIN_1450_K;
  return Math.round(baseSizePx * 10) / 10;
}
