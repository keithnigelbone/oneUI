/**
 * colorScale/index.ts — barrel re-export for the modular OkLCH colour scale.
 *
 * The previous monolithic `utils/colorScale.ts` (1738 LOC) is split into:
 *   - `types.ts`          types + constants + step lightness table
 *   - `internal.ts`       private easing helpers (NOT re-exported)
 *   - `oklch.ts`          hex ↔ OkLCH math + sRGB gamut helpers
 *   - `lightness.ts`      smooth lightness interpolation around a base
 *   - `generation.ts`     core single-step + 25-step scale generation + validation
 *   - `presets.ts`        chroma/colour/hue/lightness presets + scale updates
 *   - `lightnessScale.ts` global lightness-scale config + the giant preset table
 *
 * Public API is identical to the original file — every symbol that used to be
 * exported from `utils/colorScale` is still available here. Internal callers
 * may import from individual submodules for a smaller dependency graph.
 */

export * from './types';
export * from './oklch';
export * from './lightness';
export * from './generation';
export * from './presets';
export * from './lightnessScale';
