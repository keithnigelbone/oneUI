/**
 * colorScale/presets.ts
 *
 * Preset tables, scale-from-params generators, scale update helpers, and
 * lightness-offset / distribution helpers used by the foundations editor.
 */

import {
  COLOR_SCALE_STEPS,
  STEP_LIGHTNESS,
  type ColorScaleConfig,
  type ColorScaleParams,
  type ColorScaleStep,
  type GeneratedColorScale,
  type LightnessOffsetsConfig,
  type LightnessScaleConfig,
} from './types';
import { oklchToHex } from './oklch';
import { calculateSmoothLightness, findClosestStep } from './lightness';
import { generateColorStep } from './generation';

/** Chroma pattern presets for different colour types. */
export const CHROMA_PATTERNS = {
  /** High-chroma colours (red, blue, purple) — bell curve centred on base. */
  saturated: {
    description: 'Bell curve centered on base',
    fadeRate: 'gradual',
    typicalChroma: 0.2,
  },
  /** Low-chroma colours (grey, sand, olive) — flattened curve. */
  desaturated: {
    description: 'Flattened curve with gentle peak',
    fadeRate: 'very_gradual',
    typicalChroma: 0.08,
  },
  /** Neutral colours — minimal variation. */
  neutral: {
    description: 'Minimal variation across range',
    fadeRate: 'gentle',
    typicalChroma: 0.02,
  },
} as const;

/** Default scale presets for common use cases. */
export const COLOR_SCALE_PRESETS = {
  vibrant: { chroma: 0.25, description: 'High saturation brand colors' },
  moderate: { chroma: 0.18, description: 'Standard brand colors' },
  subtle: { chroma: 0.12, description: 'Subtle brand accents' },

  neutral: { chroma: 0.02, description: 'Pure neutral greys' },
  warmNeutral: { chroma: 0.03, description: 'Warm grey tones' },
  coolNeutral: { chroma: 0.025, description: 'Cool grey tones' },

  success: { hue: 145, chroma: 0.18, description: 'Success/positive states' },
  warning: { hue: 45, chroma: 0.18, description: 'Warning/caution states' },
  error: { hue: 25, chroma: 0.22, description: 'Error/danger states' },
  info: { hue: 250, chroma: 0.15, description: 'Informational states' },
} as const;

/** Suggest a colour scale name based on hue. */
export function suggestScaleName(hue: number): string {
  if (hue >= 0 && hue < 15) return 'red';
  if (hue >= 15 && hue < 45) return 'orange';
  if (hue >= 45 && hue < 70) return 'yellow';
  if (hue >= 70 && hue < 100) return 'lime';
  if (hue >= 100 && hue < 160) return 'green';
  if (hue >= 160 && hue < 200) return 'cyan';
  if (hue >= 200 && hue < 250) return 'blue';
  if (hue >= 250 && hue < 290) return 'purple';
  if (hue >= 290 && hue < 330) return 'magenta';
  if (hue >= 330) return 'pink';
  return 'color';
}

/**
 * Generate a colour scale from hue/chroma/baseStep parameters. Alternative
 * to `generateColorScale` when you want direct control.
 */
export function generateColorScaleFromParams(params: ColorScaleParams): GeneratedColorScale {
  const {
    hue,
    chroma,
    baseStep = 1300,
    name = 'custom',
    lightnessDistribution = 'linear',
    lightnessBias = 0,
  } = params;

  const baseLightness = STEP_LIGHTNESS[baseStep];
  const baseColor = oklchToHex(baseLightness, chroma, hue);

  const config: ColorScaleConfig = {
    name,
    baseColor: baseColor.toUpperCase(),
    hue,
    chroma,
    baseStep,
    baseLightness,
    lightnessDistribution,
    lightnessBias,
  };

  const steps = COLOR_SCALE_STEPS.map((step) =>
    generateColorStep(
      step,
      baseStep,
      chroma,
      baseLightness,
      hue,
      baseColor,
      lightnessDistribution,
      lightnessBias,
    ),
  );

  return { config, steps };
}

/**
 * Update a generated scale with a new hue value.
 *
 * CRITICAL: Preserves the original base lightness — never resets to step default.
 *
 * When `config.lockBase` is true and a `lockedBaseOklch` snapshot exists, the
 * base step is pinned to the locked OkLCH verbatim — the hue change only
 * affects non-base steps. This is the behaviour users expect when they've
 * explicitly locked the base colour: the brand hex is the contract.
 */
export function updateScaleHue(scale: GeneratedColorScale, newHue: number): GeneratedColorScale {
  const { config } = scale;
  const locked = config.lockBase === true && config.lockedBaseOklch
    ? config.lockedBaseOklch
    : undefined;
  const baseLightness = config.baseLightness;
  const distribution = config.lightnessDistribution ?? 'linear';
  const bias = config.lightnessBias ?? 0;

  // When locked, the baseColor hex is frozen to the locked snapshot. The new
  // hue only flows through to non-base step hues (via the `hue` argument to
  // generateColorStep, which passes it to calculateHueForStep). When
  // unlocked, we keep the legacy behaviour of rebuilding baseColor from the
  // new (L, C, H) triple.
  const baseColor = locked
    ? oklchToHex(locked.l, locked.c, locked.h)
    : oklchToHex(baseLightness, config.chroma, newHue);

  // The chroma cap used for non-base steps. Locked path preserves the
  // existing scale chroma (slider cap), so the chroma behaviour is unchanged
  // by a hue move; unlocked path matches the pre-lock behaviour identically.
  const scaleChroma = config.chroma;

  return {
    config: {
      ...config,
      hue: newHue,
      baseColor: baseColor.toUpperCase(),
    },
    steps: COLOR_SCALE_STEPS.map((step) =>
      generateColorStep(
        step,
        config.baseStep,
        scaleChroma,
        baseLightness,
        newHue,
        baseColor,
        distribution,
        bias,
        0,
        locked,
      ),
    ),
  };
}

/**
 * Update a generated scale with a new chroma value.
 *
 * CRITICAL: Preserves the original base lightness — never resets to step default.
 *
 * When `config.lockBase` is true and a `lockedBaseOklch` snapshot exists, the
 * new chroma value becomes the CAP for non-base steps only. The base step
 * stays pinned to the locked OkLCH — its chroma is never reduced below the
 * locked value, even if the slider moves to zero. The slider input is
 * clamped to [0, lockedC] to keep the cap semantics honest.
 */
export function updateScaleChroma(
  scale: GeneratedColorScale,
  newChroma: number,
): GeneratedColorScale {
  const { config } = scale;
  const locked = config.lockBase === true && config.lockedBaseOklch
    ? config.lockedBaseOklch
    : undefined;
  const baseLightness = config.baseLightness;
  const distribution = config.lightnessDistribution ?? 'linear';
  const bias = config.lightnessBias ?? 0;

  // Locked: the slider value is capped at the locked chroma (cap-only
  // semantics per the UX plan). Unlocked: preserve legacy behaviour where
  // the slider directly drives the whole scale's chroma.
  const effectiveChroma = locked
    ? Math.max(0, Math.min(newChroma, locked.c))
    : newChroma;

  // Locked: baseColor hex is frozen to the locked snapshot. Unlocked: rebuild
  // from the new (L, C, H) triple exactly like before.
  const baseColor = locked
    ? oklchToHex(locked.l, locked.c, locked.h)
    : oklchToHex(baseLightness, newChroma, config.hue);

  return {
    config: {
      ...config,
      chroma: effectiveChroma,
      baseColor: baseColor.toUpperCase(),
    },
    steps: COLOR_SCALE_STEPS.map((step) =>
      generateColorStep(
        step,
        config.baseStep,
        effectiveChroma,
        baseLightness,
        config.hue,
        baseColor,
        distribution,
        bias,
        0,
        locked,
      ),
    ),
  };
}

/** Update a generated scale with a new lightness bias. */
export function updateScaleLightnessBias(
  scale: GeneratedColorScale,
  newBias: number,
): GeneratedColorScale {
  const { config } = scale;
  const distribution = config.lightnessDistribution ?? 'linear';
  const locked = config.lockBase === true && config.lockedBaseOklch
    ? config.lockedBaseOklch
    : undefined;

  return {
    config: {
      ...config,
      lightnessBias: newBias,
    },
    steps: COLOR_SCALE_STEPS.map((step) =>
      generateColorStep(
        step,
        config.baseStep,
        config.chroma,
        config.baseLightness,
        config.hue,
        config.baseColor,
        distribution,
        newBias,
        0,
        locked,
      ),
    ),
  };
}

/**
 * Update a generated scale with a new base lightness. Recalculates the base
 * step position based on the new lightness so the closest scale anchor stays
 * accurate.
 */
export function updateScaleBaseLightness(
  scale: GeneratedColorScale,
  newLightness: number,
): GeneratedColorScale {
  const { config } = scale;
  const distribution = config.lightnessDistribution ?? 'linear';
  const bias = config.lightnessBias ?? 0;

  const clampedLightness = Math.max(5, Math.min(95, newLightness));
  const newBaseStep = findClosestStep(clampedLightness);
  const baseColor = oklchToHex(clampedLightness, config.chroma, config.hue);

  return {
    config: {
      ...config,
      baseLightness: clampedLightness,
      baseStep: newBaseStep,
      baseColor: baseColor.toUpperCase(),
    },
    steps: COLOR_SCALE_STEPS.map((step) =>
      generateColorStep(
        step,
        newBaseStep,
        config.chroma,
        clampedLightness,
        config.hue,
        baseColor,
        distribution,
        bias,
      ),
    ),
  };
}

/** Lightness presets for common base positions. */
export const LIGHTNESS_PRESETS = [
  { name: 'Very Dark', value: 20, description: 'Base near shadows' },
  { name: 'Dark', value: 35, description: 'Dark base color' },
  { name: 'Mid-Dark', value: 45, description: 'Below middle' },
  { name: 'Middle', value: 50, description: 'Centered base' },
  { name: 'Mid-Light', value: 60, description: 'Above middle' },
  { name: 'Light', value: 70, description: 'Light base color' },
  { name: 'Very Light', value: 80, description: 'Base near highlights' },
] as const;

/**
 * Lightness bias presets. Subtle adjustments that only affect the extremes:
 * negative compresses (faster fade to black/white), positive expands (slower
 * fade). The area around the base colour stays smooth in all cases.
 */
export const LIGHTNESS_BIAS_PRESETS = [
  { name: 'Compress Extremes', value: -25, description: 'Faster fade at edges' },
  { name: 'Slight Compress', value: -12, description: 'Slightly faster fade' },
  { name: 'Neutral', value: 0, description: 'Balanced smooth distribution' },
  { name: 'Slight Expand', value: 12, description: 'Slightly slower fade' },
  { name: 'Expand Extremes', value: 25, description: 'Slower fade at edges' },
] as const;

/**
 * Apply lightness offsets to a lightness scale configuration.
 *
 * The offset blends in linearly with distance from the base step so the area
 * around the base colour keeps its perceptual position while the extremes
 * shift up or down.
 */
export function applyLightnessOffsets(
  config: LightnessScaleConfig,
  offsets: LightnessOffsetsConfig,
  baseStep: ColorScaleStep = 1300,
): LightnessScaleConfig {
  const newValues = { ...config.values };

  for (const step of COLOR_SCALE_STEPS) {
    if (step === 100 || step === 2500) continue;

    const baseLightness = config.values[step];
    let offset = 0;

    if (step < baseStep) {
      const distanceFromBase = baseStep - step;
      const maxDistance = baseStep - 100;
      const blendFactor = Math.min(1, distanceFromBase / maxDistance);
      offset = offsets.dark * blendFactor;
    } else if (step > baseStep) {
      const distanceFromBase = step - baseStep;
      const maxDistance = 2500 - baseStep;
      const blendFactor = Math.min(1, distanceFromBase / maxDistance);
      offset = offsets.light * blendFactor;
    }

    newValues[step] = Math.max(0, Math.min(100, baseLightness + offset));
  }

  return {
    ...config,
    mode: 'manual',
    values: newValues,
  };
}

/**
 * Calculate the lightness distribution for visualisation. Uses smooth
 * interpolation from a reference base position.
 */
export function calculateLightnessDistribution(
  baseStep: ColorScaleStep = 1300,
  baseLightness: number = 50,
  bias: number = 0,
): Array<{ step: ColorScaleStep; lightness: number; normalizedPosition: number }> {
  return COLOR_SCALE_STEPS.map((step, index) => {
    const lightness = calculateSmoothLightness(step, baseStep, baseLightness, bias);
    return {
      step,
      lightness,
      normalizedPosition: index / (COLOR_SCALE_STEPS.length - 1),
    };
  });
}

/**
 * Get distribution statistics for visualisation. Counts how many steps fall
 * in dark (0-33%), mid (33-66%), and light (66-100%) ranges.
 */
export function getDistributionStats(
  baseStep: ColorScaleStep = 1300,
  baseLightness: number = 50,
  bias: number = 0,
): { dark: number; mid: number; light: number } {
  const dist = calculateLightnessDistribution(baseStep, baseLightness, bias);

  let dark = 0;
  let mid = 0;
  let light = 0;

  for (const { lightness } of dist) {
    if (lightness < 33) dark++;
    else if (lightness < 66) mid++;
    else light++;
  }

  return { dark, mid, light };
}

/** Hue presets for common colours. */
export const HUE_PRESETS = [
  { name: 'Red', value: 25 },
  { name: 'Orange', value: 50 },
  { name: 'Amber', value: 85 },
  { name: 'Green', value: 145 },
  { name: 'Teal', value: 180 },
  { name: 'Blue', value: 250 },
  { name: 'Purple', value: 290 },
  { name: 'Pink', value: 340 },
] as const;

/** Chroma presets for different saturation levels. */
export const CHROMA_PRESETS = [
  { name: 'Neutral', value: 0.02 },
  { name: 'Subtle', value: 0.08 },
  { name: 'Moderate', value: 0.14 },
  { name: 'Vibrant', value: 0.2 },
  { name: 'Bold', value: 0.25 },
] as const;
