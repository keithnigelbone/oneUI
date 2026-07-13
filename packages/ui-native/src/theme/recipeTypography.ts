/**
 * Shared typography token-ref → native value resolvers for components that
 * support brand-level typography overrides via `componentTheme.tokenRefs`.
 *
 * Mirrors the web pipeline where `buildAllComponentCSS` emits
 * `--Button-fontWeight: var(--Headline-M-FontWeight)` and components read it
 * via `var(--Button-fontWeight, var(--Label-FontWeight-High))`.
 *
 * On native, CSS token cascade is unavailable — these functions resolve the
 * token name string to a concrete numeric value using the pre-built theme.
 */

import { Platform, type TextStyle } from 'react-native';
import {
  mergeWithJioBundledStaticDefaults,
  resolveStaticWeightFamilyForRole,
  type NativeTypography,
  type FontWeightValue,
} from '@oneui/shared/engine';
import type { TypographyRole } from './useTypographyTokens';

const FIXED_WEIGHT_ROLES = ['display', 'headline', 'title'] as const;
const EMPHASIS_WEIGHT_ROLES = ['body', 'label', 'code'] as const;

/**
 * Resolve a typography font-weight token name to a numeric `FontWeightValue`.
 *
 * Supported patterns:
 *   "Headline-M-FontWeight"  → typography.headline.sizes.M.fontWeight
 *   "Display-L-FontWeight"   → typography.display.sizes.L.fontWeight
 *   "Body-FontWeight-High"   → typography.body.weights.high
 *   "Label-FontWeight-Medium" → typography.label.weights.medium
 *
 * Returns `undefined` for unrecognised tokens so callers fall through to
 * their default (e.g. `useTypographyTokens` result).
 */
export function resolveTypographyFontWeightRef(
  tokenRef: string | undefined,
  typography: NativeTypography,
): FontWeightValue | undefined {
  if (!tokenRef) return undefined;

  // Pattern 1: fixed-weight roles — "Headline-M-FontWeight"
  const fixedMatch = tokenRef.match(
    /^(Display|Headline|Title)-(2XL|XL|L|M|S|XS|2XS)-FontWeight$/i,
  );
  if (fixedMatch) {
    const role = fixedMatch[1]!.toLowerCase() as (typeof FIXED_WEIGHT_ROLES)[number];
    const size = fixedMatch[2]!;
    return (typography[role] as any)?.sizes?.[size]?.fontWeight;
  }

  // Pattern 2: emphasis-weight roles — "Body-FontWeight-High"
  const emphasisMatch = tokenRef.match(
    /^(Body|Label|Code)-FontWeight-(High|Medium|Low)$/i,
  );
  if (emphasisMatch) {
    const role = emphasisMatch[1]!.toLowerCase() as (typeof EMPHASIS_WEIGHT_ROLES)[number];
    const level = emphasisMatch[2]!.toLowerCase() as 'high' | 'medium' | 'low';
    return (typography[role] as any)?.weights?.[level];
  }

  return undefined;
}

/**
 * Given a resolved fontWeight override and the component's typography role,
 * return the TextStyle properties { fontFamily, fontWeight } that correctly
 * wire the override through the static-font-family system.
 *
 * On JioType (and any brand using static weight cuts), each weight maps to a
 * dedicated TTF file (e.g. 900 → JioType-ExtraBlack). Passing only fontWeight
 * to RN would apply synthetic bolding on top of the wrong font file. This
 * helper re-runs resolveStaticWeightFamilyForRole with the new weight so the
 * correct file is selected, then applies the same fontWeight suppression
 * (normal / 400) that typographyToTextStyle uses for static cuts.
 */
export function resolveTypographyFontWeightStyle(
  fontWeightOverride: FontWeightValue,
  role: TypographyRole,
  typography: NativeTypography,
): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  const staticMaps = mergeWithJioBundledStaticDefaults(typography.staticWeightFamilies);
  const staticFamily = resolveStaticWeightFamilyForRole(staticMaps, role, fontWeightOverride);

  if (staticFamily) {
    // Static cut found: switch to the correct font file and suppress numeric weight.
    return {
      fontFamily: staticFamily,
      fontWeight: Platform.OS === 'android' ? 'normal' : '400',
    };
  }

  // Variable font path: just set the weight directly.
  return { fontWeight: String(fontWeightOverride) as TextStyle['fontWeight'] };
}

/**
 * Resolve a typography dimension token name to a numeric pixel value.
 *
 * Supported patterns:
 *   "Body-M-FontSize"    → typography.body.sizes.M.fontSize
 *   "Label-S-LineHeight" → typography.label.sizes.S.lineHeight
 *
 * Returns `undefined` for unrecognised tokens.
 */
export function resolveTypographyDimensionRef(
  tokenRef: string | undefined,
  typography: NativeTypography,
  field: 'fontSize' | 'lineHeight',
): number | undefined {
  if (!tokenRef) return undefined;
  const match = tokenRef.match(
    /^(Display|Headline|Title|Body|Label|Code)-(2XL|XL|L|M|S|XS|2XS|3XS)-(FontSize|LineHeight)$/i,
  );
  if (!match) return undefined;
  const role = match[1]!.toLowerCase() as keyof NativeTypography;
  const size = match[2]!;
  return (typography[role] as any)?.sizes?.[size]?.[field];
}

/**
 * Resolve a `textTransform` tokenOverride value.
 *
 * Accepts only valid CSS textTransform string literals. Token names (e.g.
 * `"Display-L-FontSize"`) are invalid for this property and return `undefined`
 * so the caller falls back to the recipe value or no transform.
 */
export function resolveTextTransformRef(
  ref: string | undefined,
): 'uppercase' | 'lowercase' | 'capitalize' | 'none' | undefined {
  switch (ref) {
    case 'uppercase':
    case 'lowercase':
    case 'capitalize':
    case 'none':
      return ref;
    default:
      return undefined;
  }
}
