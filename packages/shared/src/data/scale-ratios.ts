/**
 * scale-ratios.ts
 *
 * Foundational constants for the dimension + grid system.
 *
 * These values have NO dependencies so both `data/dimension-scales.ts` and
 * `utils/dimensionCSS.ts` can import them without creating an import cycle.
 * Previously SCALE_RATIOS was defined in `dimensionCSS.ts` and copied into
 * `dimension-scales.ts` — this module is the single source of truth.
 *
 * Source: OneUIColourTool core dimension multipliers.
 */

/**
 * Fixed per-step ratios for the 26-step f-scale (f-8 → f16, plus the appended
 * half-step `f2-5`). Dimension value at a given f-step:
 * `baseSize × SCALE_RATIOS[stepIndex]`.
 *
 * Ratios are **not** exponential — they are hand-tuned discrete steps matching
 * the ColourTool core spec. Index 8 (f0) is always `1` (base).
 *
 * The trailing `1.375` is the `f2-5` rung (dimension token '5.5' = 22px at
 * base-16). It is appended (NOT inserted between 1.25 and 1.5) so that the
 * indices of every existing f-step stay parallel to `F_STEPS`, which likewise
 * appends `f2-5`. Lookups are name-based (`F_STEP_INDEX`), so array order is
 * irrelevant to value resolution.
 */
export const SCALE_RATIOS: readonly number[] = [
  0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875,
  1,        // f0 = base
  1.125, 1.25, 1.5, 1.75, 2, 2.25, 2.5,
  3, 3.5, 4, 4.5, 5, 6, 7, 8, 10,
  1.375,    // f2-5 (appended half-step; parallel to F_STEPS[25])
] as const;

/** Legacy fallback only. ColourTool grid margin uses breakpoint+density token aliases. */
export const GRID_MARGIN_RATIO = 1;

/** Legacy fallback only. ColourTool grid gutter uses breakpoint+density token aliases. */
export const GRID_GUTTER_RATIO = 0.5;

/**
 * CSS pixel density baseline. Per the W3C spec, 1 inch = 96 CSS pixels.
 * Used to convert physical units (mm) to CSS pixels when rendering print /
 * physical breakpoints inside the browser-based editor.
 *
 * @see https://www.w3.org/TR/css-values-3/#absolute-lengths
 */
export const CSS_PX_PER_INCH = 96;

/** Millimeters per inch — used alongside CSS_PX_PER_INCH for mm → px conversion. */
export const MM_PER_INCH = 25.4;
