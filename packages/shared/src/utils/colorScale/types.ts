/**
 * colorScale/types.ts
 *
 * Pure type definitions, constants, and built-in scale identifiers for the
 * 25-step OkLCH color scale system.
 *
 * Extracted from the monolithic `colorScale.ts` (1738 LOC) so consumers that
 * only need the shape of `ColorStepValue`/`GeneratedColorScale` (e.g. type
 * imports inside generated docs) don't pull in the full math + presets graph.
 *
 * Public API is re-exported by `../colorScale.ts`.
 */

/**
 * 25-step color scale (100-2500)
 */
export const COLOR_SCALE_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
  2100, 2200, 2300, 2400, 2500,
] as const;

export type ColorScaleStep = (typeof COLOR_SCALE_STEPS)[number];

/**
 * Lightness values for each step (based on Jio Design System).
 * Non-linear distribution for perceptual uniformity.
 *
 * Step 100 = pure black (L=0), Step 2500 = pure white (L=100).
 */
export const STEP_LIGHTNESS: Record<ColorScaleStep, number> = {
  100: 0,
  200: 4,
  300: 8.5,
  400: 12.5,
  500: 16.5,
  600: 21,
  700: 25,
  800: 29,
  900: 33.5,
  1000: 37.5,
  1100: 41.5,
  1200: 46,
  1300: 50,
  1400: 54,
  1500: 58.5,
  1600: 62.5,
  1700: 66.5,
  1800: 71,
  1900: 75,
  2000: 79,
  2100: 83.5,
  2200: 87.5,
  2300: 91.5,
  2400: 96,
  2500: 100,
};

/** Single color step value */
export interface ColorStepValue {
  step: ColorScaleStep;
  lightness: number;
  chroma: number;
  hue: number;
  oklch: string;
  hex: string;
  isBase: boolean;
}

/**
 * Lightness distribution mode.
 *
 * - 'linear':            Even distribution from black to white
 * - 'compressed-dark':   More steps in the dark range (vibrant colors)
 * - 'compressed-light':  More steps in the light range
 * - 'expanded-mid':      More steps around the midtones
 */
export type LightnessDistribution =
  | 'linear'
  | 'compressed-dark'
  | 'compressed-light'
  | 'expanded-mid';

/**
 * Frozen OkLCH snapshot of a locked base color.
 *
 * When `lockBase` is true on a `ColorScaleConfig`, the scale's base step is
 * written from this snapshot verbatim, regardless of what the user does with
 * the chroma/hue sliders. Non-base steps still respect the harmony rules
 * (chroma cap from `lockedBaseOklch.c`, lightness curve anchored on
 * `lockedBaseOklch.l`).
 */
export interface LockedBaseOklch {
  /** OkLCH lightness (0-100) */
  l: number;
  /** OkLCH chroma (0-0.4) */
  c: number;
  /** OkLCH hue (0-360) */
  h: number;
}

/** Configuration for generating a color scale from a base color */
export interface ColorScaleConfig {
  name: string;
  baseColor: string;
  hue: number;
  chroma: number;
  baseStep: ColorScaleStep;
  baseLightness: number;
  lightnessDistribution?: LightnessDistribution;
  lightnessBias?: number;
  /**
   * When true, the base step's {l, c, h, hex} is frozen to `lockedBaseOklch`
   * and cannot drift when the user moves the Chroma or Hue sliders. Non-base
   * steps still follow the harmony rules.
   *
   * Defaults to `true` for newly created user scales (see the studio editor).
   * Preset scales and migrations may leave this undefined, which is treated
   * as "unlocked" for backward compatibility with the organic slider flow.
   */
  lockBase?: boolean;
  /**
   * Snapshot of the locked base color in OkLCH space. Captured when the user
   * enables the lock (or types a new hex while locked). Engine functions read
   * this when `lockBase` is true to write the base step and to derive the
   * harmony caps for non-base steps.
   */
  lockedBaseOklch?: LockedBaseOklch;
}

/** Generated 25-step color scale paired with its config */
export interface GeneratedColorScale {
  config: ColorScaleConfig;
  steps: ColorStepValue[];
}

/** All scales for a brand (primary, secondary, etc.) */
export interface BrandColorScales {
  [scaleName: string]: GeneratedColorScale;
}

/** Built-in neutral scale name (always present in every brand). */
export const BUILT_IN_NEUTRAL_SCALE_NAME = 'Neutral';

/** Default base color for the built-in neutral scale (mid-gray). */
export const BUILT_IN_NEUTRAL_BASE_COLOR = '#808080';

/** Chroma distribution pattern presets */
export type ChromaPattern = 'saturated' | 'desaturated' | 'neutral';

/** Lightness scale mode used by `LightnessScaleConfig`. */
export type LightnessScaleMode = 'auto' | 'preset' | 'manual';

/**
 * Custom lightness scale configuration. Defines the lightness value for each
 * of the 25 steps.
 */
export interface LightnessScaleConfig {
  mode: LightnessScaleMode;
  presetName?: string;
  values: Record<ColorScaleStep, number>;
}

/** Parameters for generating a color scale from hue/chroma/baseStep. */
export interface ColorScaleParams {
  hue: number;
  chroma: number;
  baseStep?: ColorScaleStep;
  name?: string;
  lightnessDistribution?: LightnessDistribution;
  lightnessBias?: number;
}

/** Lightness offsets interface for fine-tuning */
export interface LightnessOffsetsConfig {
  /** -10 to +10, affects steps below the base (toward black) */
  dark: number;
  /** -10 to +10, affects steps above the base (toward white) */
  light: number;
}
