/**
 * surfaceNew.ts
 *
 * Next-generation surface algorithm — relative step computation.
 *
 * Core insight: every surface resolves relative to its parent step,
 * not from a pre-computed matrix. This eliminates the BG/FG distinction,
 * brand mode switch, and succession exception detection.
 *
 * Token vocabulary: 8 surface + 7 content + 4 state = 19 semantic tokens.
 * Compare to V4's 80 tokens per role (8 modes × 10 per mode).
 *
 * Algorithm ported from OneUIColourTool/packages/core/src/surfaceLogic.ts
 * and adapted to use the existing colorMath.ts utilities (hex-based, no culori).
 */

import type { ColorPalette, RGB, RGBPalette } from './colorMath';
import {
  hexToRgbTuple,
  preParseRGBPalette,
  getContrastRatioRGB,
  blendWithAlphaRGB,
  findAlphaForContrastRGB,
  getDynamicContrastDirectionRGB,
  rgbToHex,
  RGB_BLACK,
  RGB_WHITE,
} from './colorMath';

// ============================================================================
// Constants — same 25-step scale as V4
// ============================================================================

/** 25-step color scale from darkest (100) to lightest (2500) */
export const STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900,
  2000, 2100, 2200, 2300, 2400, 2500,
] as const;

export type Step = typeof STEPS[number];

/** Minimum step distance for bold to be considered "far enough" from parent */
const BOLD_MIN_DISTANCE = 7;

/** Fallback step offset when bold candidate is too close to parent (always darker). */
const BOLD_FALLBACK_OFFSET = 700;

/** Minimum result step when applying the darker fallback; below this, reverse to lighter. */
const BOLD_FALLBACK_MIN_STEP = 500;

/** Step offset for hover/pressed state derivation (per reference: bold gets larger deltas). */
const STATE_HOVER_OFFSET = 1;
const STATE_PRESSED_OFFSET = 2;
const BOLD_STATE_HOVER_OFFSET = 3;
const BOLD_STATE_PRESSED_OFFSET = 5;

/**
 * Plugin-style "state layer" overlays — a translucent fill composited over the
 * surface on hover / pressed (the Material-3-style ink overlay the native
 * renderer paints). Unlike `resolveState` (which shifts to a new solid step),
 * the overlay colour is always derived from the *parent* surface step nudged a
 * fixed distance toward contrast, then clamped; only the opacity varies by
 * surface variant. Reference: OneUIColourTool surfaceLogic state layers.
 */
const STATE_LAYER_STEP_OFFSET = 8; // ×100 steps
const STATE_LAYER_MIN_STEP = 200;
const STATE_LAYER_MAX_STEP = 2000;
const STATE_LAYER_OPACITY: Record<
  'default' | 'bold' | 'subtle',
  { hover: number; pressed: number }
> = {
  default: { hover: 0.16, pressed: 0.24 },
  bold: { hover: 0.24, pressed: 0.32 },
  subtle: { hover: 0.16, pressed: 0.24 },
};

// ============================================================================
// Types
// ============================================================================

/** Surface token names — the 8 fill levels */
export type SurfaceToken =
  | 'default'
  | 'ghost'
  | 'minimal'
  | 'subtle'
  | 'moderate'
  | 'bold'
  | 'elevated'
  | 'blend';

/** Content token names — the 7 content/on-colour types */
export type ContentToken =
  | 'high'
  | 'medium'
  | 'low'
  | 'tinted'
  | 'tintedA11y'
  | 'strokeMedium'
  | 'strokeLow';

/** State token names — interaction states for surfaces */
export type StateToken =
  | 'hover'
  | 'pressed'
  | 'boldHover'
  | 'boldPressed'
  | 'subtleHover'
  | 'subtlePressed';

/** All token names combined */
export type SemanticToken = SurfaceToken | ContentToken | StateToken;

/** Appearance roles (matches V4, extensible) */
export const APPEARANCE_ROLES = [
  'neutral', 'primary', 'secondary', 'sparkle', 'brand-bg',
  'positive', 'negative', 'warning', 'informative',
] as const;
export type AppearanceRole = typeof APPEARANCE_ROLES[number];

/** Contrast direction: toward 2500 (lighter) or toward 200 (darker) */
export type ContrastDir = 1 | -1;

/**
 * Scale definition — a named 25-step palette with base step markers.
 * Compatible with the existing AvailableScale type after palette conversion.
 */
export interface ScaleDefinition {
  /** Scale name (e.g., 'indigo', 'grey', 'saffron') */
  name: string;
  /** Designer-chosen representative step for "bold" fills */
  baseStep: number;
  /**
   * Darker variant of baseStep for bold fills when parent is already dark.
   * Computed automatically if not provided: baseStep + getBolderOffset(baseStep) * 100
   */
  darkerBaseStep: number;
  /** Full palette: step number → hex color */
  palette: ColorPalette;
  /**
   * Brand-Bg role: `bold` surfaces must use `baseStep` (authored background / Mint 2100),
   * not generic resolution from the page parent (which can offset e.g. 2100 → 1800).
   */
  anchorBoldToBaseStep?: boolean;
}

/** Optional 4th argument to {@link buildScaleDefinition} (cannot be a plain number). */
export type BuildScaleDefinitionOptions = {
  darkerBaseStep?: number;
  anchorBoldToBaseStep?: boolean;
};

/** Resolved surface value — a step number + the hex color at that step */
export interface ResolvedSurface {
  step: number;
  hex: string;
}

/** Resolved content value — includes opacity for alpha-blended tokens */
export interface ResolvedContent {
  step: number;
  hex: string;
  /** Blended hex (composited with parent surface) — ready for direct use */
  blendedHex: string;
  /** Alpha value (0–1), 1 for solid tokens */
  opacity: number;
}

/** Resolved interaction state layer — overlay step + the opacity to composite at. */
export interface ResolvedStateLayer {
  step: number;
  hex: string;
  /** Alpha value (0–1) the overlay is painted at. */
  opacity: number;
}

/** Complete resolved token set for one appearance role at one surface level */
export interface ResolvedTokenSet {
  /** The parent surface this token set resolves against */
  parentStep: number;
  parentHex: string;
  /** Contrast direction from parent */
  contrastDir: ContrastDir;
  /** Surface fills */
  surfaces: Record<SurfaceToken, ResolvedSurface>;
  /** Content colors (resolved at parent step) */
  content: Record<ContentToken, ResolvedContent>;
  /** Content colors resolved at the bold surface step — for text on bold fills */
  onBoldContent: Record<ContentToken, ResolvedContent>;
  /** Content colors resolved at the subtle surface step — for text on subtle fills */
  onSubtleContent: Record<ContentToken, ResolvedContent>;
  /** Interaction states (solid step shift) */
  states: Record<StateToken, ResolvedSurface>;
  /** Translucent interaction overlays (ink layer composited over the surface) */
  stateLayers: Record<StateToken, ResolvedStateLayer>;
}

/** Theme configuration for multi-role resolution */
export interface ThemeConfig {
  /** Map appearance role → scale definition */
  appearances: Record<string, ScaleDefinition>;
}

// ============================================================================
// Core Algorithm — Surface Resolution
// ============================================================================

/**
 * Compute contrast direction from a parent surface.
 * Returns 1 (toward lighter/2500) or -1 (toward darker/200).
 */
export function computeContrastDir(
  parentRgb: RGB,
  rgbPalette: RGBPalette,
): ContrastDir {
  const dir = getDynamicContrastDirectionRGB(parentRgb, rgbPalette);
  return dir === 'light' ? 1 : -1;
}

/**
 * Clamp a step number to the valid range [100, 2500].
 */
function clampStep(step: number): number {
  return Math.max(100, Math.min(2500, step));
}

/**
 * Resolve a surface token to a step number.
 *
 * Each token offsets from the parent step in the contrasting direction.
 * Bold jumps to the scale's base step (or darkerBase). No pre-computation needed.
 *
 * @param token - Which surface level to resolve
 * @param parentStep - The step number of the parent container
 * @param scale - Scale definition with base step markers
 * @param dir - Contrast direction (1 = lighter, -1 = darker)
 * @param darkMode - Whether dark mode is active (only affects 'default')
 */
export function resolveSurface(
  token: SurfaceToken,
  parentStep: number,
  scale: ScaleDefinition,
  dir: ContrastDir,
  darkMode = false,
): number {
  switch (token) {
    case 'default':
      return darkMode ? 200 : 2500;

    case 'ghost':
      return parentStep;

    case 'blend':
      return parentStep;

    case 'elevated':
      // Always toward light, capped at 2500
      return Math.min(parentStep + 100, 2500);

    case 'minimal':
      return clampStep(parentStep + dir * 100);

    case 'subtle':
      return clampStep(parentStep + dir * 200);

    case 'moderate':
      return clampStep(parentStep + dir * 300);

    case 'bold': {
      // Choose base or darkerBase depending on parent position
      const candidate = parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;

      // If candidate is far enough from parent, use it directly
      if (Math.abs(parentStep - candidate) / 100 >= BOLD_MIN_DISTANCE) {
        return candidate;
      }

      // Fallback: always go darker by 700. If that would land below 500,
      // reverse direction (parent + 700). Matches reference surfaceLogic.ts
      // bold rule — bold's own fallback logic does not use the parent's dir.
      let result = parentStep - BOLD_FALLBACK_OFFSET;
      if (result < BOLD_FALLBACK_MIN_STEP) {
        result = parentStep + BOLD_FALLBACK_OFFSET;
      }
      return clampStep(result);
    }
  }
}

/**
 * Resolve a state token (hover/pressed) to a step number.
 *
 * State tokens shift from a base surface step toward the contrasting direction.
 * Clamped to valid step range.
 */
export function resolveState(
  token: StateToken,
  parentStep: number,
  boldStep: number,
  subtleStep: number,
  dir: ContrastDir,
): number {
  switch (token) {
    case 'hover':
      return clampStep(parentStep + dir * STATE_HOVER_OFFSET * 100);
    case 'pressed':
      return clampStep(parentStep + dir * STATE_PRESSED_OFFSET * 100);
    case 'boldHover':
      return clampStep(boldStep + dir * BOLD_STATE_HOVER_OFFSET * 100);
    case 'boldPressed':
      return clampStep(boldStep + dir * BOLD_STATE_PRESSED_OFFSET * 100);
    case 'subtleHover':
      return clampStep(subtleStep + dir * STATE_HOVER_OFFSET * 100);
    case 'subtlePressed':
      return clampStep(subtleStep + dir * STATE_PRESSED_OFFSET * 100);
  }
}

/**
 * Resolve a translucent interaction overlay ("state layer") for a surface.
 *
 * The overlay step is the parent surface step nudged a fixed distance toward
 * contrast (clamped to [200, 2000]); only the opacity varies by surface
 * variant. Used by {@link resolveTokenSet} to populate `stateLayers`.
 */
function resolveStateLayer(
  parentStep: number,
  dir: ContrastDir,
  surfaceToken: SurfaceToken,
  state: 'hover' | 'pressed',
  palette: Record<number, string>,
): ResolvedStateLayer {
  const { step, opacity } = resolveInteractionOverlay(state, parentStep, surfaceToken, dir);
  return { step, hex: palette[step] ?? '#808080', opacity };
}

// ============================================================================
// Core Algorithm — Content Resolution
// ============================================================================

/**
 * Solve the minimum opacity of `fgRgb` over `bgRgb` to achieve `targetContrast`.
 *
 * Uses 24-iteration binary search for sub-1% precision.
 * Models sRGB alpha compositing (not linear light).
 */
function solveOpacity(
  fgRgb: RGB,
  bgRgb: RGB,
  targetContrast: number,
): number {
  // Check if full opacity even reaches the target
  const fullContrast = getContrastRatioRGB(fgRgb, bgRgb);
  if (fullContrast < targetContrast) return 1;

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const alpha = (lo + hi) / 2;
    const { rgb: blended } = blendWithAlphaRGB(fgRgb, bgRgb, alpha);
    const contrast = getContrastRatioRGB(blended, bgRgb);
    if (contrast < targetContrast) {
      lo = alpha;
    } else {
      hi = alpha;
    }
  }
  return hi;
}

/**
 * Walk from a starting step toward the contrasting direction until
 * the step color achieves >= `threshold` contrast against the parent surface.
 */
function walkForContrast(
  startStep: number,
  parentRgb: RGB,
  rgbPalette: RGBPalette,
  dir: ContrastDir,
  threshold: number,
): number {
  let step = startStep;
  while (step >= 100 && step <= 2500) {
    const stepRgb = rgbPalette[step];
    if (stepRgb && getContrastRatioRGB(stepRgb, parentRgb) >= threshold) {
      return step;
    }
    step += dir * 100;
  }
  // Fallback to start if walk exhausted the range
  return startStep;
}

/**
 * Resolve a content token against a parent surface.
 *
 * Content tokens determine text color, accent color, and stroke opacity
 * relative to the parent surface. All guarantee WCAG compliance.
 *
 * @param token - Which content type to resolve
 * @param parentStep - Step number of the parent surface
 * @param parentRgb - Pre-parsed RGB of the parent surface
 * @param scale - Scale definition
 * @param rgbPalette - Pre-parsed RGB palette
 * @param dir - Contrast direction from parent
 */
export function resolveContent(
  token: ContentToken,
  parentStep: number,
  parentRgb: RGB,
  scale: ScaleDefinition,
  rgbPalette: RGBPalette,
  dir: ContrastDir,
): { step: number; opacity: number } {
  const contrastingStep = dir === 1 ? 2500 : 100;
  const contrastingRgb = rgbPalette[contrastingStep] ?? (dir === 1 ? RGB_WHITE : RGB_BLACK);

  // For text tokens (high/medium/low), always use pure white or pure black
  // to ensure neutral, untinted text regardless of the role's palette color.
  // This prevents colored text on brands with saturated scales (e.g., red/crimson).
  const neutralTextRgb: RGB = dir === 1 ? RGB_WHITE : RGB_BLACK;

  switch (token) {
    case 'high':
      return { step: contrastingStep, opacity: 1 };

    case 'low': {
      // Minimum opacity for 4.5:1 WCAG AA normal text — use neutral black/white
      const opacity = solveOpacity(neutralTextRgb, parentRgb, 4.5);
      return { step: contrastingStep, opacity };
    }

    case 'medium': {
      // Midpoint between low opacity and full opacity — use neutral black/white
      const lowOpacity = solveOpacity(neutralTextRgb, parentRgb, 4.5);
      return { step: contrastingStep, opacity: (lowOpacity + 1) / 2 };
    }

    case 'tinted': {
      // Walk from base step toward contrast until 3:1 (large text / UI components)
      const candidate = parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;
      const step = walkForContrast(candidate, parentRgb, rgbPalette, dir, 3.0);
      return { step, opacity: 1 };
    }

    case 'tintedA11y': {
      // Walk from base step toward contrast until 4.5:1 (normal text)
      const candidate = parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;
      let resolved = walkForContrast(candidate, parentRgb, rgbPalette, dir, 4.5);

      // If the walk went too far from the accent (>500 steps), fall back to
      // the contrasting extreme (pure white/black) for guaranteed accessibility
      if (dir === 1 && Math.abs(resolved - scale.baseStep) > 500) {
        resolved = 2500;
      }
      return { step: resolved, opacity: 1 };
    }

    case 'strokeMedium': {
      // Fixed offset stroke at reduced opacity — for borders and dividers
      const step = dir === -1
        ? Math.max(300, parentStep - 1800)
        : Math.min(2000, parentStep + 1400);
      return { step, opacity: dir === -1 ? 0.24 : 0.32 };
    }

    case 'strokeLow': {
      // Lighter stroke variant
      const step = dir === -1
        ? Math.max(300, parentStep - 1800)
        : Math.min(2000, parentStep + 1400);
      return { step, opacity: dir === -1 ? 0.12 : 0.16 };
    }
  }
}

// ============================================================================
// Validation-table resolvers — reference-compatible signatures
//
// These adapters match OneUIColourTool's surfaceLogic.ts API surface so the
// SurfaceValidationTable UI can consume our engine without translating calls.
// They do NOT add new surface algorithms — they wrap the existing primitives.
// ============================================================================

export type InteractionState = 'idle' | 'hover' | 'pressed' | 'focus';

/** Map any surface token to its state-layer opacity variant. */
function stateLayerVariant(surfaceToken: SurfaceToken): 'default' | 'bold' | 'subtle' {
  if (surfaceToken === 'bold') return 'bold';
  if (surfaceToken === 'subtle') return 'subtle';
  return 'default';
}

/**
 * Resolve the translucent interaction overlay ("state layer") for a surface.
 *
 * The overlay colour step is the surface step nudged a fixed distance toward
 * contrast (clamped to [200, 2000]); the opacity varies by surface variant.
 * `idle` / `focus` render no overlay (opacity 0). Matches reference
 * `resolveInteractionOverlay` and is consumed by both `SurfaceValidationTable`
 * and `resolveTokenSet`'s `stateLayers`.
 */
export function resolveInteractionOverlay(
  state: InteractionState,
  surfaceStep: number,
  surfaceToken: SurfaceToken,
  dir: ContrastDir,
): { step: number; opacity: number } {
  const raw = surfaceStep + dir * STATE_LAYER_STEP_OFFSET * 100;
  const step = Math.max(STATE_LAYER_MIN_STEP, Math.min(STATE_LAYER_MAX_STEP, raw));
  if (state === 'idle' || state === 'focus') return { step, opacity: 0 };
  return { step, opacity: STATE_LAYER_OPACITY[stateLayerVariant(surfaceToken)][state] };
}

export type FocusRingToken = 'focusRing' | 'focusRingOffset';

/**
 * Resolve the focus-ring step against an informative scale.
 * `focusRingOffset` returns the parent step (halo gap matches container).
 * `focusRing` walks from the informative scale's base until contrast ≥ 4.5.
 * Mirrors reference `resolveFocusRing`.
 */
export function resolveFocusRing(
  token: FocusRingToken,
  parentStep: number,
  parentRgb: RGB,
  informativeScale: ScaleDefinition,
  dir: ContrastDir,
): { step: number; scaleName: string } {
  if (token === 'focusRingOffset') {
    return { step: parentStep, scaleName: 'parent' };
  }
  const informativePalette = preParseRGBPalette(informativeScale.palette);
  const candidate =
    parentStep >= 1300 ? informativeScale.baseStep : informativeScale.darkerBaseStep;
  let resolved = walkForContrast(candidate, parentRgb, informativePalette, dir, 4.5);
  if (dir === 1 && Math.abs(resolved - informativeScale.baseStep) > 500) {
    resolved = 2500;
  }
  return { step: resolved, scaleName: informativeScale.name };
}

/**
 * WCAG contrast direction against two scale extremes.
 * Reference-compatible signature: takes the parent hex and the two extreme
 * hexes (scale 2500 and scale 200) and returns 1 (toward lighter) or -1.
 */
export function contrastDir(parentHex: string, step2500Hex: string, step200Hex: string): ContrastDir {
  const parentRgb = hexToRgbTuple(parentHex);
  const lightRgb = hexToRgbTuple(step2500Hex);
  const darkRgb = hexToRgbTuple(step200Hex);
  const cLight = getContrastRatioRGB(parentRgb, lightRgb);
  const cDark = getContrastRatioRGB(parentRgb, darkRgb);
  return cLight >= cDark ? 1 : -1;
}

/**
 * Pick the readable text colour against a given surface hex.
 * Returns pure white or near-black, matching the reference behaviour.
 */
export function textOnBg(bgHex: string): string {
  const parentRgb = hexToRgbTuple(bgHex);
  const whiteContrast = getContrastRatioRGB(parentRgb, RGB_WHITE);
  const blackContrast = getContrastRatioRGB(parentRgb, RGB_BLACK);
  return whiteContrast >= blackContrast ? '#ffffff' : '#0c0d10';
}

// ============================================================================
// Composite Resolution — Full Token Set
// ============================================================================

/**
 * Compute the darkerBase step for a scale if not explicitly provided.
 * Uses the same offset logic as OneUIColourTool.
 */
export function computeDarkerBaseStep(baseStep: number): number {
  let offset: number;
  if (baseStep >= 1900) offset = 0;
  else if (baseStep >= 1300) offset = 100;
  else if (baseStep >= 700) offset = 200;
  else offset = 300;
  return Math.min(baseStep + offset, 2500);
}

/**
 * Build a ScaleDefinition from a palette and base step.
 * Convenience for bridging from the existing AvailableScale type.
 */
export function buildScaleDefinition(
  name: string,
  palette: ColorPalette,
  baseStep: number,
  darkerBaseStep?: number,
): ScaleDefinition;
export function buildScaleDefinition(
  name: string,
  palette: ColorPalette,
  baseStep: number,
  options: BuildScaleDefinitionOptions,
): ScaleDefinition;
export function buildScaleDefinition(
  name: string,
  palette: ColorPalette,
  baseStep: number,
  fourth?: number | BuildScaleDefinitionOptions,
): ScaleDefinition {
  let darkerBase: number | undefined;
  let anchorBold = false;
  if (fourth !== undefined && typeof fourth === 'object') {
    darkerBase = fourth.darkerBaseStep;
    anchorBold = fourth.anchorBoldToBaseStep ?? false;
  } else {
    darkerBase = fourth as number | undefined;
  }
  return {
    name,
    baseStep,
    darkerBaseStep: darkerBase ?? computeDarkerBaseStep(baseStep),
    palette,
    anchorBoldToBaseStep: anchorBold || undefined,
  };
}

/**
 * Resolve a single content token to its full output (hex + blended hex).
 */
/** Tokens that use neutral black/white for their hex output */
const NEUTRAL_TEXT_TOKENS: Set<ContentToken> = new Set(['high', 'medium', 'low']);

function resolveContentFull(
  token: ContentToken,
  parentStep: number,
  parentRgb: RGB,
  scale: ScaleDefinition,
  rgbPalette: RGBPalette,
  palette: ColorPalette,
  dir: ContrastDir,
  /**
   * When true, high/medium/low content tokens emit the scale's palette extreme
   * (step 100 / 2500) instead of pure #000/#fff. Used for on-bold and on-subtle
   * content, where the underlying surface is already branded and a pure-extreme
   * on-colour reads as a disconnected "cut-out" against the branded fill
   * (reference: OneUIColourTool surfaceLogic.ts returns stepMap[contrastingStep]).
   */
  allowScalePalette = false,
): ResolvedContent {
  const { step, opacity } = resolveContent(
    token, parentStep, parentRgb, scale, rgbPalette, dir,
  );

  // For text tokens (high/medium/low), use pure white/black by default to
  // prevent tinted text bleeding through on saturated brand scales (e.g. on a
  // white page background). Inside branded contexts (on-bold / on-subtle),
  // callers opt into the scale's own extreme via `allowScalePalette` so the
  // on-colour stays tonally connected to the branded surface.
  let hex: string;
  let stepRgb: RGB;
  if (NEUTRAL_TEXT_TOKENS.has(token) && !allowScalePalette) {
    hex = dir === 1 ? '#ffffff' : '#000000';
    stepRgb = dir === 1 ? RGB_WHITE : RGB_BLACK;
  } else {
    hex = palette[step] ?? '#808080';
    stepRgb = rgbPalette[step] ?? [128, 128, 128] as RGB;
  }

  let blendedHex: string;
  if (opacity >= 1) {
    blendedHex = hex;
  } else {
    const { hex: blended } = blendWithAlphaRGB(stepRgb, parentRgb, opacity);
    blendedHex = blended;
  }

  return { step, hex, blendedHex, opacity };
}

/**
 * Resolve the complete token set for one appearance role at a given parent step.
 *
 * This is the primary API for CSS generation and editor previews.
 * Returns all 21 tokens (8 surface + 7 content + 6 state) resolved
 * against the parent surface.
 *
 * @param scale - The scale definition for this appearance role
 * @param parentStep - Step number of the parent container
 * @param darkMode - Whether dark mode is active
 */
export function resolveTokenSet(
  scale: ScaleDefinition,
  parentStep: number,
  darkMode = false,
): ResolvedTokenSet {
  const { palette } = scale;
  const rgbPalette = preParseRGBPalette(palette);
  const parentHex = palette[parentStep] ?? '#808080';
  const parentRgb = rgbPalette[parentStep] ?? hexToRgbTuple(parentHex);
  const dir = computeContrastDir(parentRgb, rgbPalette);

  // Resolve all 8 surface tokens
  const surfaceTokens: SurfaceToken[] = [
    'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
  ];
  const surfaces = {} as Record<SurfaceToken, ResolvedSurface>;
  for (const token of surfaceTokens) {
    const step =
      scale.anchorBoldToBaseStep && token === 'bold'
        ? scale.baseStep
        : resolveSurface(token, parentStep, scale, dir, darkMode);
    surfaces[token] = { step, hex: palette[step] ?? '#808080' };
  }

  // Resolve all 7 content tokens
  const contentTokens: ContentToken[] = [
    'high', 'medium', 'low', 'tinted', 'tintedA11y', 'strokeMedium', 'strokeLow',
  ];
  const content = {} as Record<ContentToken, ResolvedContent>;
  for (const token of contentTokens) {
    content[token] = resolveContentFull(
      token, parentStep, parentRgb, scale, rgbPalette, palette, dir,
    );
  }

  // Resolve 6 state tokens (hover/pressed for default, bold, and subtle surfaces)
  const boldStep = surfaces.bold.step;
  const subtleStep = surfaces.subtle.step;
  const stateTokens: StateToken[] = [
    'hover', 'pressed', 'boldHover', 'boldPressed', 'subtleHover', 'subtlePressed',
  ];
  const states = {} as Record<StateToken, ResolvedSurface>;
  for (const token of stateTokens) {
    const step = resolveState(token, parentStep, boldStep, subtleStep, dir);
    states[token] = { step, hex: palette[step] ?? '#808080' };
  }

  // Translucent interaction overlays — overlay colour always derived from the
  // parent step (not bold/subtle step); only the opacity changes per variant.
  const stateLayers: Record<StateToken, ResolvedStateLayer> = {
    hover: resolveStateLayer(parentStep, dir, 'default', 'hover', palette),
    pressed: resolveStateLayer(parentStep, dir, 'default', 'pressed', palette),
    boldHover: resolveStateLayer(parentStep, dir, 'bold', 'hover', palette),
    boldPressed: resolveStateLayer(parentStep, dir, 'bold', 'pressed', palette),
    subtleHover: resolveStateLayer(parentStep, dir, 'subtle', 'hover', palette),
    subtlePressed: resolveStateLayer(parentStep, dir, 'subtle', 'pressed', palette),
  };

  // Resolve content tokens at the BOLD surface step — for text/icons on bold fills.
  // The contrast direction may be different from the parent (e.g., bold is dark,
  // so text on bold needs light colors even when the page is also light).
  const boldHex = palette[boldStep] ?? '#808080';
  const boldRgb = rgbPalette[boldStep] ?? hexToRgbTuple(boldHex);
  const boldDir = computeContrastDir(boldRgb, rgbPalette);
  const onBoldContent = {} as Record<ContentToken, ResolvedContent>;
  for (const token of contentTokens) {
    onBoldContent[token] = resolveContentFull(
      token, boldStep, boldRgb, scale, rgbPalette, palette, boldDir, true,
    );
  }

  // Resolve content tokens at the SUBTLE surface step — for text/icons on subtle fills.
  const subtleHex = palette[subtleStep] ?? '#808080';
  const subtleRgb = rgbPalette[subtleStep] ?? hexToRgbTuple(subtleHex);
  const subtleDir = computeContrastDir(subtleRgb, rgbPalette);
  const onSubtleContent = {} as Record<ContentToken, ResolvedContent>;
  for (const token of contentTokens) {
    onSubtleContent[token] = resolveContentFull(
      token, subtleStep, subtleRgb, scale, rgbPalette, palette, subtleDir, true,
    );
  }

  return {
    parentStep,
    parentHex,
    contrastDir: dir,
    surfaces,
    content,
    onBoldContent,
    onSubtleContent,
    states,
    stateLayers,
  };
}

// ============================================================================
// Multi-Role Resolution
// ============================================================================

/** Result of resolving all appearance roles at a given surface level */
export interface MultiRoleTokenSets {
  /** Theme mode used */
  darkMode: boolean;
  /** Parent step all roles were resolved against */
  parentStep: number;
  /** Per-role token sets */
  roles: Record<string, ResolvedTokenSet>;
}

/**
 * Resolve tokens for all appearance roles at a given parent step.
 *
 * @param themeConfig - Maps appearance role names → scale definitions
 * @param parentStep - Step number of the parent container (typically 2500 for light, 200 for dark)
 * @param darkMode - Whether dark mode is active
 */
export function resolveMultiRoleTokenSets(
  themeConfig: ThemeConfig,
  parentStep: number,
  darkMode = false,
): MultiRoleTokenSets {
  const roles: Record<string, ResolvedTokenSet> = {};

  for (const [role, scale] of Object.entries(themeConfig.appearances)) {
    roles[role] = resolveTokenSet(scale, parentStep, darkMode);
  }

  return { darkMode, parentStep, roles };
}

// ============================================================================
// Surface Context — Token remapping for [data-surface] blocks
// ============================================================================

/**
 * Names of surface levels that trigger context remapping.
 * 'default', 'ghost', and 'blend' don't get mode-keyed remap blocks — default
 * is the base context, and ghost/blend are visually identical to the parent.
 */
export const CONTEXT_SURFACE_TOKENS: SurfaceToken[] = [
  'minimal', 'subtle', 'moderate', 'bold', 'elevated',
];

/**
 * Light-weight step-only resolver for the JSX bridge (RFC-0003 Phase 1).
 *
 * Wraps `resolveSurface` with the contrast-direction computation and the
 * `anchorBoldToBaseStep` policy that React-side Surface needs but
 * shouldn't have to re-implement.
 *
 * Policy:
 *   - At root (`isRoot = true`): respect `scale.anchorBoldToBaseStep`. The
 *     brand authored an explicit "this is my bold step at root" pin
 *     (Brand-Bg role), and the JSX should honour it.
 *   - Below root: strip the anchor and let `resolveSurface` compute the
 *     contrast-walked step. Mirrors `resolveContextTokenSet`.
 *
 * Used by `<Surface>` to write `data-surface-step` matching the brand's
 * actual resolved step. Returns the same value the cssGenNew step lookup
 * keys its blocks on, so the cascade and JSX agree.
 *
 * @param scale - The role's scale definition (per `themeConfig.appearances[role]`).
 * @param parentStep - Step number the parent surface resolved to.
 * @param mode - Surface mode being rendered.
 * @param darkMode - Whether the page is in dark theme.
 * @param isRoot - Whether the calling Surface has no Surface ancestor.
 *   Drives the `anchorBoldToBaseStep` policy above.
 */
export function resolveSurfaceStep(
  scale: ScaleDefinition,
  parentStep: number,
  mode: SurfaceToken,
  darkMode: boolean,
  isRoot: boolean,
): number {
  // Strip the anchor below root, mirroring resolveContextTokenSet.
  const effectiveScale =
    isRoot || !scale.anchorBoldToBaseStep
      ? scale
      : { ...scale, anchorBoldToBaseStep: undefined };

  // Honour the anchor at root for bold (and only for bold).
  if (effectiveScale.anchorBoldToBaseStep && mode === 'bold') {
    return effectiveScale.baseStep;
  }

  // Direction depends on the parent's colour position in the scale.
  const palette = effectiveScale.palette;
  const rgbPalette = preParseRGBPalette(palette);
  const parentRgb =
    rgbPalette[parentStep] ?? hexToRgbTuple(palette[parentStep] ?? '#808080');
  const dir = computeContrastDir(parentRgb, rgbPalette);

  return resolveSurface(mode, parentStep, effectiveScale, dir, darkMode);
}

/**
 * Resolve the complete token set for a surface context — what tokens
 * should look like INSIDE a container with a given surface fill.
 *
 * Used to generate `[data-surface="bold"] { ... }` CSS blocks.
 *
 * @param scale - Scale definition for this appearance role
 * @param surfaceToken - Which surface level the container is set to
 * @param outerParentStep - Step of the container's own parent (to compute the container's fill step)
 * @param darkMode - Whether dark mode is active
 */
export function resolveContextTokenSet(
  scale: ScaleDefinition,
  surfaceToken: SurfaceToken,
  outerParentStep: number,
  darkMode = false,
): ResolvedTokenSet {
  const { palette } = scale;
  const rgbPalette = preParseRGBPalette(palette);
  const outerParentRgb = rgbPalette[outerParentStep] ?? hexToRgbTuple(palette[outerParentStep] ?? '#808080');
  const outerDir = computeContrastDir(outerParentRgb, rgbPalette);

  const containerStep =
    scale.anchorBoldToBaseStep && surfaceToken === 'bold'
      ? scale.baseStep
      : resolveSurface(surfaceToken, outerParentStep, scale, outerDir, darkMode);

  // Strip anchorBoldToBaseStep for the context-level resolution.
  // At root, anchorBoldToBaseStep pins the brand fill (e.g. --Primary-Bold = baseStep).
  // Inside a bold container the bold fill must contrast against the container, not repeat
  // the same step — so we disable the anchor and let resolveSurface compute a contrasting
  // offset (e.g., base 600 → context bold 1600 via the 1000-step fallback).
  const contextScale = scale.anchorBoldToBaseStep
    ? { ...scale, anchorBoldToBaseStep: undefined }
    : scale;

  return resolveTokenSet(contextScale, containerStep, darkMode);
}

// ============================================================================
// Transparent Material — surfaces over arbitrary media (images, video)
//
// Mirrors OneUIColourTool/packages/core/src/surfaceLogic.ts §Transparent material.
// A second material for surfaces that sit on top of unknown / dark / light
// backgrounds. No contrast walking — everything is a static lookup that chooses
// a base colour (neutral light or neutral dark) and an opacity step.
// ============================================================================

/** Media contexts for transparent material surfaces. */
export type MediaContext = 'dynamic' | 'dark' | 'light';

/** Which neutral extreme to use as the transparent base colour. */
export type MaterialVariant = 'light' | 'dark';

/** Interaction states on transparent material. `idle` / `focus` render fully transparent (opacityStep 2500). */
export type MediaInteractionState = 'idle' | 'hover' | 'pressed' | 'focus';

/** Resolved transparent surface — a base variant + an opacity step + a content-variant hint. */
export interface TransparentMaterial {
  /** Which neutral extreme drives the surface colour (light = neutral step 2500, dark = neutral step 200). */
  variant: MaterialVariant;
  /** Opacity step (100–2500). Convert via {@link opacityFromStep}. */
  opacityStep: number;
  /** Which neutral extreme drives content (text / icons) sitting on this surface. */
  contentVariant: MaterialVariant;
}

/** Interaction overlay on transparent material — a variant + an opacityStep. */
export interface MediaInteractionOverlay {
  variant: MaterialVariant;
  opacityStep: number;
}

/** Private constructor — keeps the table below tight. */
const tm = (
  variant: MaterialVariant,
  opacityStep: number,
  contentVariant: MaterialVariant,
): TransparentMaterial => ({ variant, opacityStep, contentVariant });

/**
 * Surface lookup table — for each (media context, surface token), the base
 * variant, the opacity step, and the content variant. Static values direct
 * from the reference spec (no contrast walking).
 */
const MEDIA_SURFACE: Record<MediaContext, Record<SurfaceToken, TransparentMaterial>> = {
  dynamic: {
    default:  tm('dark',  2500, 'light'),
    ghost:    tm('dark',  2500, 'light'),
    minimal:  tm('dark',  2000, 'light'),
    subtle:   tm('dark',  1400, 'light'),
    moderate: tm('dark',  1000, 'light'),
    bold:     tm('light',  100, 'dark'),
    elevated: tm('light', 2000, 'light'),
    blend:    tm('dark',   100, 'light'),
  },
  dark: {
    default:  tm('light', 2500, 'light'),
    ghost:    tm('light', 2500, 'light'),
    minimal:  tm('light', 2200, 'light'),
    subtle:   tm('light', 2000, 'light'),
    moderate: tm('dark',  1000, 'light'),
    bold:     tm('light',  100, 'dark'),
    elevated: tm('light', 2000, 'light'),
    blend:    tm('dark',   100, 'light'),
  },
  light: {
    default:  tm('dark',  2500, 'dark'),
    ghost:    tm('dark',  2500, 'dark'),
    minimal:  tm('dark',  2200, 'dark'),
    subtle:   tm('dark',  2000, 'dark'),
    moderate: tm('light', 1000, 'dark'),
    bold:     tm('dark',   100, 'light'),
    elevated: tm('light', 2000, 'dark'),
    blend:    tm('light',  100, 'dark'),
  },
};

/**
 * Content token → opacity step. Same mapping for both variants — the caller
 * picks light or dark based on the surface's contentVariant.
 */
const MEDIA_CONTENT_OPACITY: Record<ContentToken, number> = {
  high:         100,
  medium:       500,
  low:         1000,
  tinted:       100,
  tintedA11y:   100,
  strokeMedium: 1400,
  strokeLow:   2000,
};

interface MediaInteractionLayer {
  variant: MaterialVariant;
  hover: number;
  pressed: number;
}

const mil = (variant: MaterialVariant, hover: number, pressed: number): MediaInteractionLayer => ({
  variant, hover, pressed,
});

/**
 * Interaction overlay lookup. `idle` and `focus` both render fully transparent
 * (opacityStep 2500 — no overlay beyond the surface's own fill); only `hover`
 * and `pressed` draw a visible layer at the tabulated opacity.
 */
const MEDIA_INTERACTION: Record<MediaContext, Record<SurfaceToken, MediaInteractionLayer>> = {
  dynamic: {
    default:  mil('dark',  2200, 2000),
    ghost:    mil('dark',  2200, 2000),
    minimal:  mil('dark',  2200, 2000),
    subtle:   mil('dark',  2200, 2000),
    moderate: mil('light', 2300, 2000),
    bold:     mil('dark',  2200, 2000),
    elevated: mil('dark',  2200, 2000),
    blend:    mil('light', 2100, 1800),
  },
  dark: {
    default:  mil('light', 2300, 2100),
    ghost:    mil('light', 2300, 2100),
    minimal:  mil('light', 2300, 2100),
    subtle:   mil('light', 2300, 2100),
    moderate: mil('light', 2300, 2100),
    bold:     mil('dark',  2300, 2100),
    elevated: mil('light', 2300, 2100),
    blend:    mil('light', 2100, 1800),
  },
  light: {
    default:  mil('dark',  2300, 2100),
    ghost:    mil('dark',  2300, 2100),
    minimal:  mil('dark',  2300, 2100),
    subtle:   mil('dark',  2300, 2100),
    moderate: mil('dark',  2300, 2100),
    bold:     mil('light', 2100, 1800),
    elevated: mil('dark',  2300, 2100),
    blend:    mil('dark',  2300, 2100),
  },
};

/** All three media contexts — iteration helper for CSS emit. */
export const MEDIA_CONTEXTS: readonly MediaContext[] = ['dynamic', 'dark', 'light'];

/**
 * Convert an opacity step (100 = fully opaque → 2500 = fully transparent) to
 * a CSS alpha value in [0, 1]. Linear mapping: `1 - (step - 100) / 2400`.
 */
export function opacityFromStep(step: number): number {
  return 1 - (step - 100) / 2400;
}

/** Resolve a surface token to its transparent material entry. */
export function resolveMediaSurface(
  context: MediaContext,
  token: SurfaceToken,
): TransparentMaterial {
  return MEDIA_SURFACE[context][token];
}

/** Resolve a content token to its opacity step. */
export function resolveMediaContent(token: ContentToken): number {
  return MEDIA_CONTENT_OPACITY[token];
}

/**
 * Resolve a hover/pressed/idle/focus overlay for a transparent surface.
 * `idle` and `focus` both return `opacityStep: 2500` (fully transparent —
 * the surface's own fill is what shows).
 */
export function resolveMediaInteraction(
  state: MediaInteractionState,
  token: SurfaceToken,
  context: MediaContext,
): MediaInteractionOverlay {
  const layer = MEDIA_INTERACTION[context][token];
  switch (state) {
    case 'idle':
    case 'focus':
      return { variant: layer.variant, opacityStep: 2500 };
    case 'hover':
      return { variant: layer.variant, opacityStep: layer.hover };
    case 'pressed':
      return { variant: layer.variant, opacityStep: layer.pressed };
  }
}

/** Focus ring result for a transparent surface. */
export interface MediaFocusRingResult {
  /** Halo offset — matches the bold transparent surface for this context. */
  offset: MediaInteractionOverlay;
  /** The ring itself — always a solid colour from the informative scale. */
  ring: { step: number; scaleName: string };
}

/**
 * Resolve focus ring for a transparent surface.
 *
 * Reference rule: the ring is always solid (no opacity) from the informative
 * scale. Light mode → `informativeScale.baseStep`. Dark mode →
 * `informativeScale.darkerBaseStep`. Global colour mode picks base/darkerBase,
 * NOT the media context — media only affects the offset/halo gap which
 * matches the bold transparent surface for the current context.
 */
export function resolveMediaFocusRing(
  context: MediaContext,
  informativeScale: ScaleDefinition,
  darkMode: boolean,
): MediaFocusRingResult {
  const bold = MEDIA_SURFACE[context].bold;
  const ringStep = darkMode ? informativeScale.darkerBaseStep : informativeScale.baseStep;
  return {
    offset: { variant: bold.variant, opacityStep: bold.opacityStep },
    ring: { step: ringStep, scaleName: informativeScale.name },
  };
}

/**
 * Base hex for a transparent surface — looks up the neutral palette at the
 * appropriate extreme (2500 = light, 200 = dark). The caller composites this
 * with `opacityFromStep(opacityStep)` to get the final rgba value.
 */
export function getTransparentBaseHex(
  variant: MaterialVariant,
  neutralPalette: ColorPalette,
): string {
  return variant === 'light'
    ? neutralPalette[2500] ?? '#ffffff'
    : neutralPalette[200] ?? '#000000';
}
