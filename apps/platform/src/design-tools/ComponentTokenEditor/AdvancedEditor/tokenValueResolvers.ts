/**
 * tokenValueResolvers.ts
 *
 * Pure logic for resolving token display pixel values.
 * Zero React dependencies — can be used in any context.
 */

import { SPACING_TO_FSTEP, STROKE_SCALE_TOKENS } from '@oneui/shared';
import { DEFAULT_FSTEP_ASSIGNMENTS, DEFAULT_LINE_HEIGHT_OFFSETS, parseFStepNumber } from '@oneui/shared';
import type { TokenCategory } from '@oneui/shared';
import type { TypographyRole } from '@oneui/shared';

/**
 * Spacing aliases map to stable f-steps. Density changes the resolved
 * dimension values upstream, so this helper intentionally does not shift.
 */
export function getSpacingFStepForDensity(sizeKey: string, density?: string): string | undefined {
  const baseFStep = (SPACING_TO_FSTEP as Record<string, string>)[sizeKey];
  if (!baseFStep) return undefined;
  void density;
  return baseFStep;
}

/**
 * Typography sizes → f-step mapping.
 * V2 typography system: sizes are var(--Dimension-fN) aliases.
 * Derived from typography.css legacy size mappings:
 *   Typography-Size-X → role-size → var(--Dimension-fN)
 * Density shift is applied the same way as spacing (compact -1, open +1).
 */
export const TYPOGRAPHY_SIZE_TO_FSTEP: Record<string, string> = {
  '5XL': 'f7',  // Display-L-FontSize → Dimension-f7
  '4XL': 'f6',  // Display-M-FontSize → Dimension-f6
  '3XL': 'f5',  // Display-S-FontSize → Dimension-f5
  '2XL': 'f4',  // Headline-L-FontSize → Dimension-f4
  'XL':  'f2',  // Headline-M-FontSize → Dimension-f2
  'L':   'f1',  // Body-L-FontSize → Dimension-f1
  'M':   'f0',  // Body-M-FontSize → Dimension-f0
  'S':   'f-1', // Body-S-FontSize → Dimension-f-1
  'XS':  'f-2', // Body-XS-FontSize → Dimension-f-2
  '2XS': 'f-3', // Body-2XS-FontSize → Dimension-f-3
  '3XS': 'f-4', // Label-3XS-FontSize → Dimension-f-4
};

/**
 * Resolve typography size pixel value via f-step dimension system.
 * platformTokens already contain density-adjusted values, so no density shift is applied here.
 */
export function getTypographySizePx(
  sizeKey: string,
  platformTokens?: Record<string, string>,
): string | undefined {
  const baseFStep = TYPOGRAPHY_SIZE_TO_FSTEP[sizeKey];
  if (!baseFStep || !platformTokens) return undefined;

  // Read directly from pre-resolved dimension tokens (density already baked in)
  return platformTokens[`--Dimension-${baseFStep}`];
}

/**
 * Shape f-step mapping — shapes derive from dimension f-steps,
 * just like spacing and dynamic strokes.
 * Pill and None are standalone constants (not f-step derived).
 */
export const SHAPE_FSTEP: Record<string, string> = {
  '6XS': 'f-7', '5XS': 'f-6', '4XS': 'f-5', '3XS': 'f-4', '2XS': 'f-3',
  'XS': 'f-2', 'S': 'f-1', 'M': 'f0', 'L': 'f1', 'XL': 'f2',
  '2XL': 'f3', '3XL': 'f4', '4XL': 'f5', '5XL': 'f6', '6XL': 'f7',
};

/** Static shape values (not f-step derived). */
export const STATIC_SHAPE_PX: Record<string, string> = {
  'Pill': '9999px',
  'None': '0px',
};

/** Static stroke pixel values (fixed, not f-scale). */
export const STATIC_STROKE_PX: Record<string, string> = Object.fromEntries(
  STROKE_SCALE_TOKENS
    .filter((stroke) => stroke.kind === 'fixed')
    .map((stroke) => [stroke.key, stroke.value]),
);

/** Dynamic stroke → f-step mapping (mirrors primitives.css). */
export const DYNAMIC_STROKE_FSTEP: Record<string, string> = Object.fromEntries(
  STROKE_SCALE_TOKENS
    .filter((stroke) => stroke.kind === 'dimension')
    .map((stroke) => [stroke.key, stroke.fStep]),
);

/**
 * Resolve a token option's pixel value for display.
 * Spacing, typography & dynamic strokes resolve from platformTokens (density-aware f-step values).
 * Static strokes use fixed values. Shapes use f-steps or fixed (Pill/None).
 */
export function resolveTokenPixelValue(
  token: string,
  category: TokenCategory,
  platformTokens?: Record<string, string>,
  density?: string
): string | null {
  if (category === 'spacing') {
    if (!platformTokens) return null;
    // platformTokens already contains pre-resolved --Spacing-* values at the
    // correct density (built by computeDimensionOverrides with density baked in).
    // Read directly instead of re-deriving via f-step + density shift, which
    // would double-apply the density adjustment.
    const directValue = platformTokens[`--${token}`];
    if (directValue) return directValue;
    // Fallback: derive via base f-step (no density shift — already in tokens)
    const sizeKey = token.replace('Spacing-', '');
    const baseFStep = (SPACING_TO_FSTEP as Record<string, string>)[sizeKey];
    if (baseFStep) {
      const pxValue = platformTokens[`--Dimension-${baseFStep}`];
      if (pxValue) return pxValue;
    }
  }

  if (category === 'stroke') {
    const sizeKey = token.replace('Stroke-', '');
    // Static strokes have fixed values
    if (sizeKey in STATIC_STROKE_PX) return STATIC_STROKE_PX[sizeKey];
    // Dynamic strokes resolve via f-scale
    const fStep = DYNAMIC_STROKE_FSTEP[sizeKey];
    if (fStep && platformTokens) {
      const pxValue = platformTokens[`--Dimension-${fStep}`];
      if (pxValue) return pxValue;
    }
  }

  if (category === 'typography') {
    // V2 role-based font size: {Role}-{Size}-FontSize → resolve via f-step
    // No density shift needed — platformTokens already contain density-adjusted values
    if (token.endsWith('-FontSize')) {
      return resolveV2TypographyPx(token, '-FontSize', platformTokens);
    }
    // V2 role-based line height: {Role}-{Size}-LineHeight → resolve via f-step + offset
    if (token.endsWith('-LineHeight')) {
      return resolveV2TypographyPx(token, '-LineHeight', platformTokens);
    }
    // Legacy fallback: Typography-Size-* tokens
    if (token.startsWith('Typography-Size-')) {
      const sizeKey = token.replace('Typography-Size-', '');
      return getTypographySizePx(sizeKey, platformTokens) ?? null;
    }
  }

  if (category === 'shape') {
    if (token.startsWith('Shape-')) {
      const sizeKey = token.replace('Shape-', '');
      // Static shapes (Pill, None) have fixed values
      if (sizeKey in STATIC_SHAPE_PX) return STATIC_SHAPE_PX[sizeKey];
      // Scale shapes resolve via f-step (density-aware)
      const fStep = SHAPE_FSTEP[sizeKey];
      if (fStep && platformTokens) {
        const pxValue = platformTokens[`--Dimension-${fStep}`];
        if (pxValue) return pxValue;
      }
    }
  }

  return null;
}

/**
 * Resolve a V2 typography token ({Role}-{Size}-FontSize or {Role}-{Size}-LineHeight)
 * to a pixel value via the f-step dimension system.
 *
 * Parses the role and size from the token name, looks up the f-step from
 * DEFAULT_FSTEP_ASSIGNMENTS, and resolves the dimension value from platformTokens.
 * No density shift is applied — platformTokens already contain density-adjusted values.
 */
function resolveV2TypographyPx(
  token: string,
  suffix: '-FontSize' | '-LineHeight',
  platformTokens?: Record<string, string>,
): string | null {
  if (!platformTokens) return null;

  // Parse: "{Role}-{Size}-{Suffix}" → role, size
  const withoutSuffix = token.replace(suffix, '');
  const dashIndex = withoutSuffix.indexOf('-');
  if (dashIndex < 0) return null;

  const role = withoutSuffix.slice(0, dashIndex).toLowerCase() as TypographyRole;
  const size = withoutSuffix.slice(dashIndex + 1);

  const assignments = DEFAULT_FSTEP_ASSIGNMENTS[role];
  if (!assignments) return null;

  const baseFStep = assignments[size];
  if (!baseFStep) return null;

  let fStepNum = parseFStepNumber(baseFStep);

  // For line height, add the role's line height offset
  if (suffix === '-LineHeight') {
    const offset = DEFAULT_LINE_HEIGHT_OFFSETS[role] ?? 0;
    fStepNum += offset;
  }

  // Clamp to f-8..f16
  fStepNum = Math.max(-8, Math.min(16, fStepNum));

  return platformTokens[`--Dimension-f${fStepNum}`] ?? null;
}
