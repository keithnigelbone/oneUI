/**
 * colorUtils.ts
 *
 * Shared OkLCH color math used by both colorScales.ts and dataVisPalettes.ts.
 * Implements the Jio Design System 25-step OkLCH scale generation pipeline.
 */

/**
 * 25-step color scale (100-2500)
 */
export const SCALE_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
  2100, 2200, 2300, 2400, 2500,
] as const;

export type ScaleStep = (typeof SCALE_STEPS)[number];

/**
 * Lightness values for each step (Jio Design System)
 */
export const STEP_LIGHTNESS: Record<ScaleStep, number> = {
  100: 0,      // Pure black
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
  1300: 50,    // Mid-point
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
  2500: 100,   // Pure white
};

/**
 * Find closest step for a given lightness
 */
export function findClosestStep(lightness: number): ScaleStep {
  let closest: ScaleStep = 1300;
  let minDiff = Infinity;

  for (const step of SCALE_STEPS) {
    const stepLightness = STEP_LIGHTNESS[step];
    const diff = Math.abs(stepLightness - lightness);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}

/**
 * Convert hex to OkLCH
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const c = Math.sqrt(a * a + bLab * bLab);
  let h = Math.atan2(bLab, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { l: L * 100, c, h };
}

/**
 * Convert OkLCH to hex
 */
export function oklchToHex(l: number, c: number, h: number): string {
  const L = l / 100;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let linearR = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  linearR = Math.max(0, Math.min(1, linearR));
  linearG = Math.max(0, Math.min(1, linearG));
  linearB = Math.max(0, Math.min(1, linearB));

  const toSrgb = (v: number) => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');

  return `#${toHex(toSrgb(linearR))}${toHex(toSrgb(linearG))}${toHex(toSrgb(linearB))}`.toUpperCase();
}

/**
 * Check if color is in sRGB gamut
 */
function isInGamut(l: number, c: number, h: number): boolean {
  const hex = oklchToHex(l, c, h);
  const back = hexToOklch(hex);
  return Math.abs(back.c - c) < 0.01;
}

/**
 * Find max chroma at lightness/hue within gamut
 */
export function findMaxChroma(lightness: number, hue: number): number {
  let low = 0;
  let high = 0.4;

  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    if (isInGamut(lightness, mid, hue)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low * 0.95;
}

/**
 * Calculate chroma with base lock and fade zones
 */
export function calculateChroma(
  step: ScaleStep,
  baseStep: ScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number,
): number {
  const stepLightness = STEP_LIGHTNESS[step];

  if (step === baseStep) return baseChroma;

  const maxChromaAtStep = findMaxChroma(stepLightness, hue);
  const maxChromaAtBase = findMaxChroma(baseLightness, hue);
  const chromaRatio = maxChromaAtBase > 0 ? baseChroma / maxChromaAtBase : 0;

  let targetChroma = Math.min(maxChromaAtStep * chromaRatio, baseChroma);

  if (stepLightness < 10) {
    targetChroma *= stepLightness / 10;
  } else if (stepLightness > 90) {
    targetChroma *= (100 - stepLightness) / 10;
  }

  return Math.min(targetChroma, baseChroma);
}

/**
 * Calculate hue with minimal shift
 */
export function calculateHue(step: ScaleStep, baseHue: number): number {
  const lightness = STEP_LIGHTNESS[step];
  let adjustedHue = baseHue;

  if (lightness < 20) {
    adjustedHue += 2;
  } else if (lightness > 80) {
    adjustedHue -= 2;
  }

  return ((adjustedHue % 360) + 360) % 360;
}

export type LockedBaseOklch = { l: number; c: number; h: number };

/**
 * Generate a single color step.
 */
export function generateStep(
  step: ScaleStep,
  baseStep: ScaleStep,
  baseChroma: number,
  baseLightness: number,
  hue: number,
  baseColor: string,
  lockedBase?: LockedBaseOklch,
) {
  const lightness = STEP_LIGHTNESS[step];
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

  const chroma = calculateChroma(step, baseStep, baseChroma, baseLightness, hue);
  const stepHue = calculateHue(step, hue);
  const hex = oklchToHex(lightness, chroma, stepHue);

  return {
    step,
    lightness,
    chroma: Math.round(chroma * 1000) / 1000,
    hue: Math.round(stepHue * 10) / 10,
    oklch: `oklch(${lightness}% ${chroma.toFixed(3)} ${stepHue.toFixed(1)})`,
    hex,
    isBase: false,
  };
}

export interface GenerateFullScaleOptions {
  lockBase?: boolean;
  lockedBaseOklch?: LockedBaseOklch;
}

/**
 * Generate full 25-step scale from base color.
 */
export function generateFullScale(
  name: string,
  baseColor: string,
  options?: GenerateFullScaleOptions,
) {
  const locked = options?.lockBase === true && options.lockedBaseOklch
    ? options.lockedBaseOklch
    : undefined;

  const oklch = locked ?? hexToOklch(baseColor);
  const baseLightness = oklch.l;
  const baseChroma = oklch.c;
  const hue = oklch.h;
  const baseStep = findClosestStep(baseLightness);
  const resolvedBaseColor = locked
    ? oklchToHex(locked.l, locked.c, locked.h)
    : baseColor.toUpperCase();

  const steps = SCALE_STEPS.map((step) =>
    generateStep(step, baseStep, baseChroma, baseLightness, hue, resolvedBaseColor, locked)
  );

  return {
    config: {
      name,
      baseColor: resolvedBaseColor,
      hue,
      chroma: baseChroma,
      baseStep,
      baseLightness,
      lockBase: options?.lockBase === true ? true : undefined,
      lockedBaseOklch: locked ? { ...locked } : undefined,
    },
    steps,
  };
}
