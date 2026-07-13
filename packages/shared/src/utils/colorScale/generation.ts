/**
 * colorScale/generation.ts
 *
 * Core scale generation: per-step chroma/hue calculation, single-step
 * generation, full 25-step scale generation, validation, and tiny accessors.
 */

import {
  COLOR_SCALE_STEPS,
  STEP_LIGHTNESS,
  type ColorScaleConfig,
  type ColorScaleStep,
  type ColorStepValue,
  type GeneratedColorScale,
  type LightnessDistribution,
  type LockedBaseOklch,
} from './types';
import { smoothStep } from './internal';
import {
  calculateSmoothLightness,
  findClosestStep,
} from './lightness';
import {
  findMaxChromaInGamut,
  hexToOklch,
  oklchToHex,
} from './oklch';

/**
 * Calculate chroma for a step with base chroma lock.
 *
 * CRITICAL: No colour can exceed the base colour's chroma. Chroma fades at the
 * extremes (near black and white) for smooth transitions.
 *
 * @param chromaRetention How much chroma to retain at extremes (0-1, default 0).
 *                        0 = normal fade, 1 = maximum retention.
 */
export function calculateChromaForStep(
  step: ColorScaleStep,
  baseStep: ColorScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number,
  stepLightness?: number,
  chromaRetention: number = 0,
): number {
  const lightness = stepLightness ?? STEP_LIGHTNESS[step];
  const retention = Math.max(0, Math.min(1, chromaRetention));

  if (step === baseStep) return baseChroma;

  const maxChromaAtStep = findMaxChromaInGamut(lightness, hue);
  const maxChromaAtBase = findMaxChromaInGamut(baseLightness, hue);
  const chromaRatio = maxChromaAtBase > 0 ? baseChroma / maxChromaAtBase : 0;

  let targetChroma = Math.min(maxChromaAtStep * chromaRatio, baseChroma);

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

  return Math.min(targetChroma, baseChroma, maxChromaAtStep);
}

/** Calculate hue with minimal shift (max 2°) for perceptual consistency. */
export function calculateHueForStep(step: ColorScaleStep, baseHue: number): number {
  const lightness = STEP_LIGHTNESS[step];
  let adjustedHue = baseHue;

  if (lightness < 20) {
    adjustedHue += 2;
  } else if (lightness > 80) {
    adjustedHue -= 2;
  }

  return ((adjustedHue % 360) + 360) % 360;
}

/**
 * Generate a single colour step with smooth interpolation from the base.
 *
 * @param chromaRetention How much chroma to retain at extremes (0-1, default 0).
 * @param lockedBase When provided, the base step is written from the locked
 *                   OkLCH triple verbatim (via `oklchToHex`), bypassing any
 *                   re-parsing of `baseColor`. This is the mechanism that
 *                   guarantees the user's chosen brand colour never drifts
 *                   when the Chroma / Hue sliders move.
 */
export function generateColorStep(
  step: ColorScaleStep,
  baseStep: ColorScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number,
  baseColor: string,
  _distribution: LightnessDistribution = 'linear',
  lightnessBias: number = 0,
  chromaRetention: number = 0,
  lockedBase?: LockedBaseOklch,
): ColorStepValue {
  const isBase = step === baseStep;

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

  if (isBase) {
    if (lockedBase) {
      const hex = oklchToHex(lockedBase.l, lockedBase.c, lockedBase.h);
      return {
        step,
        lightness: Math.round(lockedBase.l * 10) / 10,
        chroma: Math.round(lockedBase.c * 1000) / 1000,
        hue: Math.round(lockedBase.h * 10) / 10,
        oklch: `oklch(${lockedBase.l.toFixed(1)}% ${lockedBase.c.toFixed(3)} ${lockedBase.h.toFixed(1)})`,
        hex,
        isBase: true,
      };
    }
    const oklch = hexToOklch(baseColor);
    return {
      step,
      lightness: oklch.l,
      chroma: oklch.c,
      hue: oklch.h,
      oklch: `oklch(${oklch.l.toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      hex: baseColor.toUpperCase(),
      isBase: true,
    };
  }

  const lightness = calculateSmoothLightness(step, baseStep, baseLightness, lightnessBias);
  const chroma = calculateChromaForStep(
    step,
    baseStep,
    baseChroma,
    baseLightness,
    hue,
    undefined,
    chromaRetention,
  );
  const stepHue = calculateHueForStep(step, hue);
  const hex = oklchToHex(lightness, chroma, stepHue);

  return {
    step,
    lightness: Math.round(lightness * 10) / 10,
    chroma: Math.round(chroma * 1000) / 1000,
    hue: Math.round(stepHue * 10) / 10,
    oklch: `oklch(${lightness.toFixed(1)}% ${chroma.toFixed(3)} ${stepHue.toFixed(1)})`,
    hex,
    isBase: false,
  };
}

/**
 * Options for `generateColorScale` controlling the locked-base behaviour and
 * the non-base chroma cap.
 */
export interface GenerateColorScaleOptions {
  /** When true, the base step is pinned to `lockedBaseOklch` verbatim. */
  lockBase?: boolean;
  /**
   * OkLCH snapshot of the locked base colour. Required when `lockBase` is
   * true. When absent, `generateColorScale` falls back to re-parsing
   * `baseColor` (organic / unlocked flow).
   */
  lockedBaseOklch?: LockedBaseOklch;
  /**
   * Chroma cap for non-base steps (0..lockedBaseOklch.c when locked). If
   * omitted, the base colour's chroma is used as the cap, which matches the
   * existing unlocked behaviour.
   */
  scaleChroma?: number;
  /**
   * Hue used for non-base steps. When omitted, the hue is derived from the
   * base colour / locked snapshot, preserving legacy generation.
   */
  scaleHue?: number;
}

/**
 * Generate a complete 25-step colour scale from a base colour.
 *
 * @param chromaRetention How much chroma to retain at extremes (0-1, default 0).
 * @param options Locked-base options. When `options.lockBase` is true and a
 *                `lockedBaseOklch` is provided, the base step is frozen to
 *                that snapshot and `options.scaleChroma` (if set) acts as the
 *                chroma cap for non-base steps.
 */
export function generateColorScale(
  name: string,
  baseColor: string,
  distribution: LightnessDistribution = 'linear',
  lightnessBias: number = 0,
  chromaRetention: number = 0,
  options?: GenerateColorScaleOptions,
): GeneratedColorScale {
  const locked = options?.lockBase === true && options.lockedBaseOklch
    ? options.lockedBaseOklch
    : undefined;

  const oklch = locked ?? hexToOklch(baseColor);
  const baseLightness = oklch.l;
  const baseChroma = oklch.c;
  const hue = options?.scaleHue ?? oklch.h;

  const baseStep = findClosestStep(baseLightness);

  // The chroma used as the cap for non-base steps. When the caller provides
  // `scaleChroma` (slider value) we clamp it to [0, baseChroma] so the cap
  // can never exceed the base chroma (preserves the existing harmony rule).
  const scaleChromaCap = options?.scaleChroma !== undefined
    ? Math.max(0, Math.min(options.scaleChroma, baseChroma))
    : baseChroma;

  const resolvedBaseColor = locked
    ? oklchToHex(locked.l, locked.c, locked.h)
    : baseColor.toUpperCase();

  const config: ColorScaleConfig = {
    name,
    baseColor: resolvedBaseColor,
    hue,
    chroma: scaleChromaCap,
    baseStep,
    baseLightness,
    lightnessDistribution: distribution,
    lightnessBias,
    ...(options?.lockBase ? { lockBase: true } : {}),
    ...(locked ? { lockedBaseOklch: { ...locked } } : {}),
  };

  const steps = COLOR_SCALE_STEPS.map((step) =>
    generateColorStep(
      step,
      baseStep,
      scaleChromaCap,
      baseLightness,
      hue,
      resolvedBaseColor,
      distribution,
      lightnessBias,
      chromaRetention,
      locked,
    ),
  );

  return { config, steps };
}

/** Create a new empty scale configuration. */
export function createEmptyScale(name: string, hue: number = 0): ColorScaleConfig {
  return {
    name,
    baseColor: '#808080',
    hue,
    chroma: 0.1,
    baseStep: 1300,
    baseLightness: 50,
  };
}

/** Validate a generated colour scale. Returns aggregated structural errors. */
export function validateColorScale(
  scale: GeneratedColorScale,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { config, steps } = scale;

  if (steps.length !== 25) {
    errors.push(`Expected 25 steps, got ${steps.length}`);
  }

  const step100 = steps.find((s) => s.step === 100);
  if (step100 && step100.hex !== '#000000') {
    errors.push('Step 100 must be pure black (#000000)');
  }

  const step2500 = steps.find((s) => s.step === 2500);
  if (step2500 && step2500.hex !== '#FFFFFF') {
    errors.push('Step 2500 must be pure white (#FFFFFF)');
  }

  const baseStepValue = steps.find((s) => s.step === config.baseStep);
  if (baseStepValue && baseStepValue.hex.toUpperCase() !== config.baseColor.toUpperCase()) {
    errors.push('Base color must remain unchanged at base step');
  }

  if (config.lockBase && config.lockedBaseOklch && baseStepValue) {
    const { l, c, h } = config.lockedBaseOklch;
    const EPS = 0.05;
    if (Math.abs(baseStepValue.lightness - Math.round(l * 10) / 10) > EPS) {
      errors.push(
        `Locked base lightness drift: base step L=${baseStepValue.lightness} vs locked L=${l}`,
      );
    }
    if (Math.abs(baseStepValue.chroma - Math.round(c * 1000) / 1000) > 0.002) {
      errors.push(
        `Locked base chroma drift: base step C=${baseStepValue.chroma} vs locked C=${c}`,
      );
    }
    // Hue comparison is wrap-safe within [0, 360). Neutral-ish colours
    // (locked C near 0) make hue meaningless, so skip the check there.
    if (c > 0.005) {
      const hueDiff = Math.abs(
        ((baseStepValue.hue - Math.round(h * 10) / 10 + 540) % 360) - 180,
      );
      if (hueDiff > 0.2) {
        errors.push(
          `Locked base hue drift: base step H=${baseStepValue.hue} vs locked H=${h}`,
        );
      }
    }
  }

  // When the base is locked, the slider's `config.chroma` is the cap for
  // NON-BASE steps only. The base step's chroma is pinned to the locked value
  // and may legitimately exceed that cap, so skip it in this check.
  for (const step of steps) {
    if (config.lockBase && step.step === config.baseStep) continue;
    if (step.chroma > config.chroma + 0.001) {
      errors.push(`Step ${step.step} chroma (${step.chroma}) exceeds base chroma (${config.chroma})`);
    }
  }

  for (let i = 1; i < steps.length; i++) {
    if (steps[i].lightness < steps[i - 1].lightness) {
      errors.push(
        `Lightness must increase: step ${steps[i].step} < step ${steps[i - 1].step}`,
      );
    }
  }

  for (const step of steps) {
    if (step.step !== 100 && step.step !== 2500) {
      const hueDiff = Math.abs(step.hue - config.hue);
      if (hueDiff > 5 && hueDiff < 355) {
        errors.push(`Step ${step.step} hue shift (${hueDiff.toFixed(1)}deg) exceeds maximum (5deg)`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Get a specific step from a generated scale. */
export function getStepFromScale(
  scale: GeneratedColorScale,
  step: ColorScaleStep,
): ColorStepValue | undefined {
  return scale.steps.find((s) => s.step === step);
}
