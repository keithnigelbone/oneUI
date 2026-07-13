/**
 * colorScale/lightness.ts
 *
 * Lightness interpolation, distribution presets, and step-finding helpers.
 * Depends only on `types` and the private easing helpers in `internal`.
 */

import {
  COLOR_SCALE_STEPS,
  STEP_LIGHTNESS,
  type ColorScaleStep,
  type LightnessDistribution,
} from './types';
import { applyExtremeBias, smoothStep } from './internal';

/** Get the canonical lightness for a given step. */
export function getLightness(step: ColorScaleStep): number {
  return STEP_LIGHTNESS[step];
}

/**
 * Calculate smooth lightness for a step, ensuring smooth transitions around
 * the base.
 *
 * CRITICAL — this function guarantees:
 * 1. Step 100 = 0% lightness (pure black)
 * 2. Base step = base lightness (exact colour preserved)
 * 3. Step 2500 = 100% lightness (pure white)
 * 4. Smooth interpolation in both directions from the base
 * 5. Bias only affects the extremes, not the area around the base
 *
 * @param step          The step number (100-2500)
 * @param baseStep      The base step position
 * @param baseLightness The lightness of the base colour (0-100)
 * @param bias          Extreme bias adjustment (-50 to 50)
 */
export function calculateSmoothLightness(
  step: ColorScaleStep,
  baseStep: ColorScaleStep,
  baseLightness: number,
  bias: number = 0,
): number {
  const MIN_STEP = 100;
  const MAX_STEP = 2500;
  const MIN_LIGHTNESS = 0;
  const MAX_LIGHTNESS = 100;

  if (step === MIN_STEP) return MIN_LIGHTNESS;
  if (step === MAX_STEP) return MAX_LIGHTNESS;
  if (step === baseStep) return baseLightness;

  const normalizedBias = Math.max(-50, Math.min(50, bias)) / 50;

  if (step < baseStep) {
    const range = baseStep - MIN_STEP;
    const position = step - MIN_STEP;
    let t = position / range;

    t = smoothStep(t);

    const fadeFromExtreme = t;
    const biasStrength = 1 - fadeFromExtreme;
    const adjustedT = t + (applyExtremeBias(t, normalizedBias) - t) * biasStrength * 0.85;

    return MIN_LIGHTNESS + adjustedT * (baseLightness - MIN_LIGHTNESS);
  } else {
    const range = MAX_STEP - baseStep;
    const position = step - baseStep;
    let t = position / range;

    t = smoothStep(t);

    const fadeFromExtreme = 1 - t;
    const biasStrength = 1 - fadeFromExtreme;
    const adjustedT = t + (applyExtremeBias(t, -normalizedBias) - t) * biasStrength * 0.85;

    return baseLightness + adjustedT * (MAX_LIGHTNESS - baseLightness);
  }
}

/**
 * Get adjusted lightness for a step with distribution and bias.
 * @deprecated Use `calculateSmoothLightness` instead for proper smooth transitions.
 */
export function getAdjustedLightness(
  step: ColorScaleStep,
  _distribution: LightnessDistribution = 'linear',
  _bias: number = 0,
): number {
  return STEP_LIGHTNESS[step];
}

/** Lightness distribution presets with descriptions. */
export const LIGHTNESS_DISTRIBUTION_PRESETS: Array<{
  value: LightnessDistribution;
  name: string;
  description: string;
}> = [
  { value: 'linear', name: 'Linear', description: 'Even distribution (default)' },
  { value: 'compressed-dark', name: 'Compressed Dark', description: 'More steps in dark range' },
  { value: 'compressed-light', name: 'Compressed Light', description: 'More steps in light range' },
  { value: 'expanded-mid', name: 'Expanded Mid', description: 'More steps in midtones' },
];

/** Find the closest step for a given lightness value (auto-detect base position). */
export function findClosestStep(lightness: number): ColorScaleStep {
  let closest: ColorScaleStep = 1300;
  let minDiff = Infinity;

  for (const step of COLOR_SCALE_STEPS) {
    const stepLightness = STEP_LIGHTNESS[step];
    const diff = Math.abs(stepLightness - lightness);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}
