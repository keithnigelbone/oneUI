/**
 * colorScale/lightnessScale.ts
 *
 * Global lightness-scale config + preset data tables, plus the alternative
 * generation pipeline that uses an explicit per-step lightness map instead
 * of smooth interpolation around a base step.
 *
 * Largest single chunk of the original `colorScale.ts`: the
 * `LIGHTNESS_SCALE_PRESETS` table alone is ~200 lines of static data.
 */

import {
  COLOR_SCALE_STEPS,
  STEP_LIGHTNESS,
  type ColorScaleConfig,
  type ColorScaleStep,
  type ColorStepValue,
  type GeneratedColorScale,
  type LightnessScaleConfig,
  type LockedBaseOklch,
} from './types';
import { smoothStep } from './internal';
import { findMaxChromaInGamut, oklchToHex } from './oklch';
import { calculateHueForStep } from './generation';

/** Default lightness scale (matches `STEP_LIGHTNESS`). */
export const DEFAULT_LIGHTNESS_SCALE: Record<ColorScaleStep, number> = { ...STEP_LIGHTNESS };

/**
 * Lightness scale presets. Each preset defines a different distribution
 * characteristic — `linear`, `perceptual` (default), `compressed-dark`,
 * `compressed-light`, `expanded-mid`, `strong-contrast`, `soft-gradient`.
 */
export const LIGHTNESS_SCALE_PRESETS: Record<
  string,
  {
    name: string;
    description: string;
    values: Record<ColorScaleStep, number>;
  }
> = {
  linear: {
    name: 'Linear',
    description: 'Even distribution from black to white',
    values: {
      100: 0,
      200: 4.17,
      300: 8.33,
      400: 12.5,
      500: 16.67,
      600: 20.83,
      700: 25,
      800: 29.17,
      900: 33.33,
      1000: 37.5,
      1100: 41.67,
      1200: 45.83,
      1300: 50,
      1400: 54.17,
      1500: 58.33,
      1600: 62.5,
      1700: 66.67,
      1800: 70.83,
      1900: 75,
      2000: 79.17,
      2100: 83.33,
      2200: 87.5,
      2300: 91.67,
      2400: 95.83,
      2500: 100,
    },
  },
  perceptual: {
    name: 'Perceptual',
    description: 'Optimized for perceptual uniformity (default)',
    values: { ...STEP_LIGHTNESS },
  },
  'compressed-dark': {
    name: 'Compressed Dark',
    description: 'More steps in the dark range for vibrant colors',
    values: {
      100: 0,
      200: 2,
      300: 4.5,
      400: 7,
      500: 10,
      600: 14,
      700: 18,
      800: 23,
      900: 28,
      1000: 34,
      1100: 40,
      1200: 46,
      1300: 52,
      1400: 58,
      1500: 64,
      1600: 70,
      1700: 76,
      1800: 82,
      1900: 87,
      2000: 91,
      2100: 94,
      2200: 96,
      2300: 97.5,
      2400: 99,
      2500: 100,
    },
  },
  'compressed-light': {
    name: 'Compressed Light',
    description: 'More steps in the light range for pastel colors',
    values: {
      100: 0,
      200: 1,
      300: 2.5,
      400: 4,
      500: 6,
      600: 9,
      700: 13,
      800: 18,
      900: 24,
      1000: 30,
      1100: 36,
      1200: 42,
      1300: 48,
      1400: 54,
      1500: 60,
      1600: 66,
      1700: 72,
      1800: 77,
      1900: 82,
      2000: 86,
      2100: 90,
      2200: 93,
      2300: 95.5,
      2400: 98,
      2500: 100,
    },
  },
  'expanded-mid': {
    name: 'Expanded Mid',
    description: 'More steps in the midtones for subtle variations',
    values: {
      100: 0,
      200: 5,
      300: 10,
      400: 15,
      500: 20,
      600: 26,
      700: 32,
      800: 38,
      900: 42,
      1000: 45,
      1100: 48,
      1200: 49.5,
      1300: 50,
      1400: 50.5,
      1500: 52,
      1600: 55,
      1700: 58,
      1800: 62,
      1900: 68,
      2000: 74,
      2100: 80,
      2200: 85,
      2300: 90,
      2400: 95,
      2500: 100,
    },
  },
  'strong-contrast': {
    name: 'Strong Contrast',
    description: 'Faster fade at edges for high contrast designs',
    values: {
      100: 0,
      200: 2,
      300: 5,
      400: 9,
      500: 14,
      600: 20,
      700: 27,
      800: 34,
      900: 40,
      1000: 45,
      1100: 48,
      1200: 49,
      1300: 50,
      1400: 51,
      1500: 52,
      1600: 55,
      1700: 60,
      1800: 66,
      1900: 73,
      2000: 80,
      2100: 86,
      2200: 91,
      2300: 95,
      2400: 98,
      2500: 100,
    },
  },
  'soft-gradient': {
    name: 'Soft Gradient',
    description: 'Slower fade at edges for gentle transitions',
    values: {
      100: 0,
      200: 6,
      300: 12,
      400: 18,
      500: 23,
      600: 28,
      700: 33,
      800: 38,
      900: 42,
      1000: 46,
      1100: 48,
      1200: 49,
      1300: 50,
      1400: 51,
      1500: 52,
      1600: 54,
      1700: 58,
      1800: 62,
      1900: 67,
      2000: 72,
      2100: 77,
      2200: 82,
      2300: 88,
      2400: 94,
      2500: 100,
    },
  },
};

/** Create a default lightness-scale config (auto mode). */
export function createDefaultLightnessScale(): LightnessScaleConfig {
  return {
    mode: 'auto',
    values: { ...STEP_LIGHTNESS },
  };
}

/** Create a lightness-scale config from a preset name. */
export function createLightnessScaleFromPreset(presetName: string): LightnessScaleConfig {
  const preset = LIGHTNESS_SCALE_PRESETS[presetName];
  if (!preset) {
    return createDefaultLightnessScale();
  }
  return {
    mode: 'preset',
    presetName,
    values: { ...preset.values },
  };
}

/**
 * Create a manual lightness-scale config with custom values. In manual mode
 * the user has full control over all values including the boundaries.
 */
export function createManualLightnessScale(
  values: Record<ColorScaleStep, number>,
): LightnessScaleConfig {
  return {
    mode: 'manual',
    values: { ...values },
  };
}

/** Get the lightness value for a step from the lightness-scale config. */
export function getLightnessFromScale(
  step: ColorScaleStep,
  config: LightnessScaleConfig,
): number {
  if (config.mode === 'auto') {
    return STEP_LIGHTNESS[step];
  }
  return config.values[step];
}

/**
 * Validate lightness values and return warnings. In manual mode these are
 * informational — the user has full control.
 */
export function validateLightnessScale(values: Record<ColorScaleStep, number>): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (values[100] !== 0) {
    warnings.push(`Step 100 is ${values[100].toFixed(1)}% (typically 0% for black)`);
  }

  if (values[2500] !== 100) {
    warnings.push(`Step 2500 is ${values[2500].toFixed(1)}% (typically 100% for white)`);
  }

  let prevValue = -1;
  let prevStep = 0;
  for (const step of COLOR_SCALE_STEPS) {
    if (values[step] < prevValue) {
      warnings.push(
        `Step ${step} (${values[step].toFixed(1)}%) is less than step ${prevStep} (${prevValue.toFixed(
          1,
        )}%)`,
      );
    }
    prevValue = values[step];
    prevStep = step;
  }

  for (const step of COLOR_SCALE_STEPS) {
    if (values[step] < 0 || values[step] > 100) {
      warnings.push(`Step ${step} value (${values[step].toFixed(1)}%) is outside 0-100% range`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Interpolate the lightness value when manually adjusting a step. Ensures
 * smooth transitions by adjusting neighbouring steps to keep the scale
 * monotonic.
 */
export function interpolateLightnessNeighbors(
  values: Record<ColorScaleStep, number>,
  changedStep: ColorScaleStep,
  newValue: number,
  _smoothingRadius: number = 2,
): Record<ColorScaleStep, number> {
  const result = { ...values };
  const stepIndex = COLOR_SCALE_STEPS.indexOf(changedStep);

  result[changedStep] = Math.max(0, Math.min(100, newValue));

  for (let i = stepIndex - 1; i >= 0; i--) {
    const step = COLOR_SCALE_STEPS[i];
    const nextStep = COLOR_SCALE_STEPS[i + 1];
    if (result[step] >= result[nextStep]) {
      result[step] = Math.max(0, result[nextStep] - 0.5);
    }
  }

  for (let i = stepIndex + 1; i < COLOR_SCALE_STEPS.length; i++) {
    const step = COLOR_SCALE_STEPS[i];
    const prevStep = COLOR_SCALE_STEPS[i - 1];
    if (result[step] <= result[prevStep]) {
      result[step] = Math.min(100, result[prevStep] + 0.5);
    }
  }

  result[100] = 0;
  result[2500] = 100;

  return result;
}

/**
 * Generate a single colour step using a custom lightness scale.
 *
 * @param chromaRetention How much chroma to retain at extremes (0-1).
 *                        0 = normal fade, 1 = maximum retention.
 */
export function generateColorStepWithLightnessScale(
  step: ColorScaleStep,
  baseChroma: number,
  hue: number,
  lightnessScale: LightnessScaleConfig,
  chromaRetention: number = 0,
): ColorStepValue {
  const lightness = getLightnessFromScale(step, lightnessScale);
  const retention = Math.max(0, Math.min(1, chromaRetention));

  if (step === 100) {
    return {
      step,
      lightness: 0,
      chroma: 0,
      hue,
      oklch: 'oklch(0% 0 0)',
      hex: '#000000',
      isBase: false,
    };
  }

  if (step === 2500) {
    return {
      step,
      lightness: 100,
      chroma: 0,
      hue,
      oklch: 'oklch(100% 0 0)',
      hex: '#FFFFFF',
      isBase: false,
    };
  }

  const maxChromaAtStep = findMaxChromaInGamut(lightness, hue);
  let targetChroma = Math.min(maxChromaAtStep, baseChroma);

  if (lightness < 15) {
    const t = lightness / 15;
    const fadeMultiplier = smoothStep(t);
    const minRetention = retention * 0.5;
    targetChroma *= minRetention + (1 - minRetention) * fadeMultiplier;
  } else if (lightness > 85) {
    const t = (100 - lightness) / 15;
    const fadeMultiplier = smoothStep(t);
    const minRetention = retention * 0.5;
    targetChroma *= minRetention + (1 - minRetention) * fadeMultiplier;
  }

  targetChroma = Math.min(targetChroma, baseChroma, maxChromaAtStep);

  const stepHue = calculateHueForStep(step, hue);
  const hex = oklchToHex(lightness, targetChroma, stepHue);

  return {
    step,
    lightness: Math.round(lightness * 10) / 10,
    chroma: Math.round(targetChroma * 1000) / 1000,
    hue: Math.round(stepHue * 10) / 10,
    oklch: `oklch(${lightness.toFixed(1)}% ${targetChroma.toFixed(3)} ${stepHue.toFixed(1)})`,
    hex,
    isBase: false,
  };
}

/**
 * Options for `generateColorScaleWithLightnessScale` controlling locked-base
 * behaviour. Mirrors `GenerateColorScaleOptions` but scoped to this pipeline.
 */
export interface GenerateColorScaleWithLightnessScaleOptions {
  lockBase?: boolean;
  lockedBaseOklch?: LockedBaseOklch;
}

/**
 * Generate a complete 25-step colour scale using a custom lightness scale.
 *
 * CRITICAL: The base step is determined by finding the step whose lightness
 * in the new scale is closest to the original base lightness. This preserves
 * the user's original colour perception.
 *
 * When the base is locked, the base step's {l, c, h, hex} is written from
 * the locked OkLCH snapshot verbatim. The `chroma` argument continues to act
 * as the cap for non-base steps. Non-base steps still use the supplied
 * lightness scale for their L values — only the base step is pinned.
 */
export function generateColorScaleWithLightnessScale(
  name: string,
  hue: number,
  chroma: number,
  lightnessScale: LightnessScaleConfig,
  originalBaseLightness?: number,
  chromaRetention: number = 0,
  options?: GenerateColorScaleWithLightnessScaleOptions,
): GeneratedColorScale {
  const locked = options?.lockBase === true && options.lockedBaseOklch
    ? options.lockedBaseOklch
    : undefined;

  // When locked, the "target" lightness is the locked L — the base step
  // anchors on it so the user's brand colour stays at the right perceptual
  // position in the new lightness curve.
  const targetLightness = locked?.l ?? originalBaseLightness ?? 50;

  let baseStep: ColorScaleStep = 1300;
  let minDiff = Infinity;
  for (const step of COLOR_SCALE_STEPS) {
    const stepLightness = getLightnessFromScale(step, lightnessScale);
    const diff = Math.abs(stepLightness - targetLightness);
    if (diff < minDiff) {
      minDiff = diff;
      baseStep = step;
    }
  }

  const baseLightness = locked?.l ?? originalBaseLightness ?? getLightnessFromScale(baseStep, lightnessScale);
  // Non-base chroma cap, clamped to locked C when locked so the cap never
  // exceeds the locked base's chroma.
  const scaleChromaCap = locked
    ? Math.max(0, Math.min(chroma, locked.c))
    : chroma;
  // The base step's own chroma is the locked C when locked (never reduced
  // by the slider), otherwise the slider value itself.
  const baseStepChroma = locked?.c ?? chroma;
  const baseStepHue = locked?.h ?? hue;
  const baseColor = oklchToHex(baseLightness, baseStepChroma, baseStepHue);

  const config: ColorScaleConfig = {
    name,
    baseColor: baseColor.toUpperCase(),
    hue,
    chroma: scaleChromaCap,
    baseStep,
    baseLightness,
    lightnessDistribution: 'linear',
    lightnessBias: 0,
    ...(options?.lockBase ? { lockBase: true } : {}),
    ...(locked ? { lockedBaseOklch: { ...locked } } : {}),
  };

  const steps = COLOR_SCALE_STEPS.map((step) => {
    const generated = generateColorStepWithLightnessScale(
      step,
      scaleChromaCap,
      hue,
      lightnessScale,
      chromaRetention,
    );
    if (step === baseStep) {
      return {
        ...generated,
        lightness: Math.round(baseLightness * 10) / 10,
        chroma: Math.round(baseStepChroma * 1000) / 1000,
        hue: Math.round(baseStepHue * 10) / 10,
        hex: baseColor,
        oklch: `oklch(${baseLightness.toFixed(1)}% ${baseStepChroma.toFixed(3)} ${baseStepHue.toFixed(1)})`,
        isBase: true,
      };
    }
    return generated;
  });

  return { config, steps };
}

/**
 * Update a generated scale with a new lightness scale configuration.
 * CRITICAL: Preserves the original base lightness — finds the step in the
 * new scale that best matches the original base lightness.
 *
 * When the base is locked, the base step's {l, c, h, hex} is written from
 * the locked snapshot. Non-base steps follow the new lightness curve and
 * remain capped at the scale's chroma (which itself is clamped to locked C).
 */
export function updateScaleWithLightnessScale(
  scale: GeneratedColorScale,
  lightnessScale: LightnessScaleConfig,
  chromaRetention: number = 0,
): GeneratedColorScale {
  const { config } = scale;
  const locked = config.lockBase === true && config.lockedBaseOklch
    ? config.lockedBaseOklch
    : undefined;

  const originalBaseLightness = locked?.l ?? config.baseLightness;

  let newBaseStep: ColorScaleStep = 1300;
  let minDiff = Infinity;
  for (const step of COLOR_SCALE_STEPS) {
    const stepLightness = getLightnessFromScale(step, lightnessScale);
    const diff = Math.abs(stepLightness - originalBaseLightness);
    if (diff < minDiff) {
      minDiff = diff;
      newBaseStep = step;
    }
  }

  const scaleChromaCap = locked
    ? Math.max(0, Math.min(config.chroma, locked.c))
    : config.chroma;
  const baseStepChroma = locked?.c ?? config.chroma;
  const baseStepHue = locked?.h ?? config.hue;
  const newBaseColor = oklchToHex(originalBaseLightness, baseStepChroma, baseStepHue);

  const steps = COLOR_SCALE_STEPS.map((step) => {
    const generated = generateColorStepWithLightnessScale(
      step,
      scaleChromaCap,
      config.hue,
      lightnessScale,
      chromaRetention,
    );
    if (step === newBaseStep) {
      return {
        ...generated,
        lightness: Math.round(originalBaseLightness * 10) / 10,
        chroma: Math.round(baseStepChroma * 1000) / 1000,
        hue: Math.round(baseStepHue * 10) / 10,
        hex: newBaseColor,
        oklch: `oklch(${originalBaseLightness.toFixed(1)}% ${baseStepChroma.toFixed(3)} ${baseStepHue.toFixed(1)})`,
        isBase: true,
      };
    }
    return generated;
  });

  return {
    config: {
      ...config,
      baseStep: newBaseStep,
      baseLightness: originalBaseLightness,
      baseColor: newBaseColor.toUpperCase(),
      chroma: scaleChromaCap,
    },
    steps,
  };
}
