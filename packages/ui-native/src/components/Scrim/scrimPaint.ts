/**
 * Scrim paint resolution — maps attention / variant / tone to existing tokens.
 *
 * Full-coverage mode (`center` | `size=full` | `variant=overlay`): flat rgba tint.
 * Edge mode: 7-stop `.box.scrim` SVG gradient on neutral palette extremes.
 */


import type { OneUINativeTheme } from '@oneui/shared/engine';
import {
  isScrimFullCoverageMode,
  type ScrimAttention,
  type ScrimPosition,
  type ScrimSize,
  type ScrimTone,
  type ScrimVariant,
} from './interface';

const NEUTRAL_DARK_STEP = 200;
const NEUTRAL_LIGHT_STEP = 2500;

// INTENTIONAL-LITERAL: edge band whole-SVG opacity (25% / 50% / 95%).
const EDGE_GRADIENT_ATTENTION_SCALE: Record<ScrimAttention, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.95,
};

// INTENTIONAL-LITERAL: full-coverage flat tint (17% / 33% / 50%).
const FULL_COVERAGE_ATTENTION_SCALE: Record<ScrimAttention, number> = {
  low: 0.17,
  medium: 0.33,
  high: 0.5,
};

// INTENTIONAL-LITERAL: `.box.scrim` multi-stop curve (black alphas, `to top`).
const SCRIM_GRADIENT_CURVE: ReadonlyArray<{ offset: string; opacity: number }> = [
  { offset: '0', opacity: 1 },
  { offset: '0.5', opacity: 0.3 },
  { offset: '0.65', opacity: 0.15 },
  { offset: '0.75', opacity: 0.08 },
  { offset: '0.83', opacity: 0.04 },
  { offset: '0.88', opacity: 0.02 },
  { offset: '1', opacity: 0 },
];

export interface ScrimGradientStop {
  offset: string;
  stopColor: string;
  stopOpacity: number;
}

export interface ScrimPaint {
  variant: ScrimVariant;
  /** Uniform flat tint — full-coverage mode only. */
  flatColor?: string;
  /** Multi-stop edge gradient — edge mode only. */
  gradientStops: ScrimGradientStop[];
}

function resolveGradientStops(strongHex: string, attention: ScrimAttention): ScrimGradientStop[] {
  const scale = EDGE_GRADIENT_ATTENTION_SCALE[attention];
  return SCRIM_GRADIENT_CURVE.map(({ offset, opacity }) => ({
    offset,
    stopColor: strongHex,
    stopOpacity: opacity * scale,
  }));
}

// INTENTIONAL-LITERAL: flat full-coverage scrim — black/white rgba at attention scale.
function resolveFlatScrimColor(tone: ScrimTone, attention: ScrimAttention): string {
  const opacity = FULL_COVERAGE_ATTENTION_SCALE[attention];
  return tone === 'dark' ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;
}

function neutralPalette(theme: OneUINativeTheme) {
  return theme.themeConfig.appearances.neutral ?? theme.themeConfig.appearances.primary;
}

function paletteStep(theme: OneUINativeTheme, step: number, fallback: string): string {
  const palette = neutralPalette(theme)?.palette;
  return palette?.[step] ?? fallback;
}

export function resolveScrimPaint(
  theme: OneUINativeTheme,
  tone: ScrimTone,
  attention: ScrimAttention,
  variant: ScrimVariant,
  position: ScrimPosition = 'bottom',
  size: ScrimSize = 'XS'
): ScrimPaint {
  if (isScrimFullCoverageMode(position, size, variant)) {
    return {
      variant,
      flatColor: resolveFlatScrimColor(tone, attention),
      gradientStops: [],
    };
  }

  const darkHex = paletteStep(theme, NEUTRAL_DARK_STEP, '#000000');
  const lightHex = paletteStep(theme, NEUTRAL_LIGHT_STEP, '#ffffff');
  const strongHex = tone === 'dark' ? darkHex : lightHex;

  return {
    variant,
    gradientStops: resolveGradientStops(strongHex, attention),
  };
}
