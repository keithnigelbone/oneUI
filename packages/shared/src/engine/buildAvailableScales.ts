/**
 * buildAvailableScales.ts
 *
 * Pure function that transforms color foundation config + preset selections
 * into an array of scale objects with computed hex colors.
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

import {
  generateColorScale,
  generateColorScaleWithLightnessScale,
  applyLightnessOffsets,
  hexToOklch,
  oklchToHex,
  BUILT_IN_NEUTRAL_SCALE_NAME,
  BUILT_IN_NEUTRAL_BASE_COLOR,
  type LightnessScaleConfig,
  type LockedBaseOklch,
} from '../utils/colorScale';
import { normalizeSolidCssHex } from './colorMath';
import type { EngineAvailableScale } from './types';

interface ColorFoundationConfig {
  brandScales?: Array<{
    name: string;
    source: 'preset' | 'custom';
    presetCollectionId?: string;
    baseColor?: string;
    lightnessBias?: number;
    lightnessOffsets?: { dark: number; light: number };
    /** Hue used for non-base steps when the editor hue slider has been moved. */
    scaleHue?: number;
    /** Chroma cap used for non-base steps when the editor chroma slider has been moved. */
    scaleChroma?: number;
    /** Chroma retained at very dark/light scale extremes. */
    chromaRetention?: number;
    /**
     * When true, the scale's base step is pinned to `lockedBaseOklch` (see
     * the "lock base color" feature). Persisted on each brand scale so the
     * CSS pipeline regenerates from the same snapshot the editor sees.
     */
    lockBase?: boolean;
    lockedBaseOklch?: LockedBaseOklch;
  }>;
  savedCustomScales?: Array<{
    name: string;
    baseColor?: string;
    lightnessOffsets?: { dark: number; light: number };
    scaleHue?: number;
    scaleChroma?: number;
    chromaRetention?: number;
    lockBase?: boolean;
    lockedBaseOklch?: LockedBaseOklch;
  }>;
  lightnessScale?: LightnessScaleConfig;
}

interface PresetSelection {
  selectedScales?: Array<{
    name: string;
    steps?: Array<{ step: string; oklch: string }>;
    baseColor?: string;
    baseStep?: string;
  }>;
}

function parseOklchToHex(oklch: string): string {
  // Handle varied OkLCH formats: fractional without leading digit (.5), optional %,
  // alpha channel suffix (/ 1), extra whitespace
  const match = oklch.match(/oklch\(\s*(\d*\.?\d+)(%?)\s+(\d*\.?\d+)\s+(\d*\.?\d+)/);
  if (!match) return '#808080';
  let l = parseFloat(match[1]);
  // If no % sign and value <= 1, treat as 0-1 range and convert to percentage
  if (match[2] !== '%' && l <= 1) l = l * 100;
  const c = parseFloat(match[3]);
  const h = parseFloat(match[4]);

  if (isNaN(l) || isNaN(c) || isNaN(h)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[buildAvailableScales] Invalid OkLCH values from "' + oklch + '" - using fallback');
    }
    return '#808080';
  }

  const hex = oklchToHex(l, c, h);

  // Guard against NaN-based hex strings from out-of-gamut conversions
  if (hex.includes('NaN') || hex.includes('nan')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[buildAvailableScales] Out-of-gamut OkLCH "' + oklch + '" produced invalid hex - using fallback');
    }
    return '#808080';
  }

  return hex;
}

/**
 * Preset/`presetColorScales` rows store designer colors in field `steps[].oklch`.
 * Most rows are literal `oklch(...)`, but some imports (Convex, Android palettes,
 * Figma export) stash `#RRGGBB` / `#AARRGGBB` there. Parsing those as OkLCH
 * yields grey (#808080) and breaks surfaces for preset-only brands (e.g. Tira, Reliance)
 * while custom-scale brands continue to resolve.
 */
function resolveColorStopToHex(raw: string): string {
  const t = raw.trim();
  if (!t) return '#808080';
  if (t.startsWith('#')) {
    return normalizeSolidCssHex(t);
  }
  return parseOklchToHex(t);
}

const STANDARD_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500];

/**
 * Generate a color scale using the full lightness pipeline when available.
 * Applies lightnessOffsets to the lightnessScale, then uses the full generation path.
 * Falls back to flat generation if no lightness scale is available.
 *
 * When `lockBase` + `lockedBaseOklch` are supplied, both pipelines honour the
 * lock: the base step is written from the locked OkLCH so the CSS that ships
 * to production matches exactly what the editor previewed. Without this,
 * brand CSS would silently drift (the editor would show the locked hex,
 * while `useBrandCSS` would regenerate from hex and round differently).
 */
function generateScaleWithLightness(
  name: string,
  baseColor: string,
  lightnessScale?: LightnessScaleConfig | null,
  offsets?: { dark: number; light: number } | null,
  lightnessBias?: number,
  lockBase?: boolean,
  lockedBaseOklch?: LockedBaseOklch,
  scaleHue?: number,
  scaleChroma?: number,
  chromaRetention: number = 0,
): { steps: Array<{ step: number; hex: string; oklch?: string }>; baseStep: number } {
  // When locked, derive the harmonic seed (H, C, L for the base) from the
  // locked snapshot so rounding in the stored hex can't leak into CSS.
  const seedOklch = lockBase && lockedBaseOklch ? lockedBaseOklch : hexToOklch(baseColor);
  const resolvedHue = scaleHue ?? seedOklch.h;
  const resolvedChroma = scaleChroma ?? seedOklch.c;

  if (lightnessScale) {
    const modified = offsets && (offsets.dark !== 0 || offsets.light !== 0)
      ? applyLightnessOffsets(lightnessScale, offsets, 1300)
      : lightnessScale;
    const generated = generateColorScaleWithLightnessScale(
      name,
      resolvedHue,
      resolvedChroma,
      modified,
      seedOklch.l,
      chromaRetention,
      lockBase && lockedBaseOklch
        ? { lockBase: true, lockedBaseOklch }
        : undefined,
    );
    return { steps: generated.steps, baseStep: generated.config.baseStep };
  }
  const generated = generateColorScale(
    name,
    baseColor,
    'linear',
    lightnessBias ?? 0,
    chromaRetention,
    lockBase && lockedBaseOklch
      ? { lockBase: true, lockedBaseOklch, scaleChroma: resolvedChroma, scaleHue: resolvedHue }
      : scaleHue !== undefined || scaleChroma !== undefined
        ? { scaleChroma: resolvedChroma, scaleHue: resolvedHue }
      : undefined,
  );
  return { steps: generated.steps, baseStep: generated.config.baseStep };
}

/**
 * Generate the built-in neutral scale as an EngineAvailableScale.
 * Uses the brand's custom neutral baseColor if provided, otherwise defaults to #808080.
 */
function generateBuiltInNeutral(
  baseColor?: string,
  lightnessBias?: number,
  lightnessScale?: LightnessScaleConfig | null,
  offsets?: { dark: number; light: number } | null,
): EngineAvailableScale {
  const hex = baseColor || BUILT_IN_NEUTRAL_BASE_COLOR;
  const { steps, baseStep } = generateScaleWithLightness(BUILT_IN_NEUTRAL_SCALE_NAME, hex, lightnessScale, offsets, lightnessBias);
  return {
    name: BUILT_IN_NEUTRAL_SCALE_NAME,
    steps: steps.map((step: { step: number }) => step.step),
    colors: steps.map((step: { step: number; hex: string }) => ({
      step: step.step,
      hex: step.hex,
    })),
    baseStep,
  };
}

/**
 * Build available color scales from brand color config and preset selections.
 * Returns an array of scales with resolved color values.
 *
 * IMPORTANT: Always includes a Neutral scale. If the brand doesn't define one
 * explicitly, a built-in achromatic neutral (mid-gray) is injected automatically.
 */
export function buildAvailableScales(
  colorConfig: ColorFoundationConfig | undefined | null,
  presetSelection: PresetSelection | undefined | null,
): EngineAvailableScale[] {
  const results: EngineAvailableScale[] = [];

  if (colorConfig?.brandScales?.length) {
    for (const scale of colorConfig.brandScales) {
      if (scale.source === 'preset') {
        if (presetSelection?.selectedScales) {
          const presetScale = presetSelection.selectedScales.find(
            (s) => s.name === scale.name
          );
          if (presetScale) {
            if (presetScale.steps && Array.isArray(presetScale.steps)) {
              results.push({
                name: scale.name,
                steps: presetScale.steps.map((step) => parseInt(step.step, 10)),
                colors: presetScale.steps.map((step) => ({
                  step: parseInt(step.step, 10),
                  oklch: step.oklch,
                  hex: resolveColorStopToHex(step.oklch),
                })),
                baseStep: presetScale.baseStep ? parseInt(presetScale.baseStep, 10) : undefined,
              });
              continue;
            } else if (presetScale.baseColor) {
              const baseHex = resolveColorStopToHex(presetScale.baseColor);
              const generated = generateColorScale(scale.name, baseHex, 'linear', 0);
              results.push({
                name: scale.name,
                steps: STANDARD_STEPS,
                colors: generated.steps.map((step: { step: number; oklch?: string; hex: string }) => ({
                  step: step.step,
                  oklch: step.oklch,
                  hex: step.hex,
                })),
                baseStep: presetScale.baseStep ? parseInt(presetScale.baseStep, 10) : generated.config.baseStep,
              });
              continue;
            }
          }
        }
      }

      if (scale.source === 'custom' && scale.baseColor) {
        // Compatibility for brand configs saved before these fields were
        // persisted on brandScales. The color editor has historically kept
        // the full custom-scale shaping state in savedCustomScales, while
        // surfaces read brandScales. Rehydrate missing fields from the saved
        // custom copy so existing brands do not need to recreate their scales.
        const savedCustom = colorConfig.savedCustomScales?.find(
          s => s.name.toLowerCase() === scale.name.toLowerCase(),
        );
        const { steps: genSteps, baseStep } = generateScaleWithLightness(
          scale.name,
          scale.baseColor,
          colorConfig.lightnessScale,
          scale.lightnessOffsets ?? savedCustom?.lightnessOffsets,
          scale.lightnessBias,
          scale.lockBase ?? savedCustom?.lockBase,
          scale.lockedBaseOklch ?? savedCustom?.lockedBaseOklch,
          scale.scaleHue ?? savedCustom?.scaleHue,
          scale.scaleChroma ?? savedCustom?.scaleChroma,
          scale.chromaRetention ?? savedCustom?.chromaRetention ?? 0,
        );
        results.push({
          name: scale.name,
          steps: genSteps.map((step: { step: number }) => step.step),
          colors: genSteps.map((step: { step: number; hex: string }) => ({
            step: step.step,
            hex: step.hex,
          })),
          baseStep,
        });
        continue;
      }

      // Scale couldn't be resolved — skip it
    }
  }

  // Ensure a Neutral scale is always present.
  // If the brand defined one (custom or preset), it's already in results.
  const hasNeutral = results.some(
    s => s.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
  );
  if (!hasNeutral) {
    // Check if brand config has a neutral entry with custom base color
    const neutralConfig = colorConfig?.brandScales?.find(
      s => s.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
    );
    results.unshift(generateBuiltInNeutral(neutralConfig?.baseColor, neutralConfig?.lightnessBias, colorConfig?.lightnessScale, neutralConfig?.lightnessOffsets));
  }

  return results;
}
