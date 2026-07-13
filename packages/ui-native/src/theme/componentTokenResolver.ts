/**
 * componentTokenResolver.ts
 *
 * Shared single-pass scalar token resolver — the native equivalent of the web's
 * `buildComponentOverrideCSS` merge pass for non-paint properties.
 *
 * Two exports:
 *   resolveComponentScalarTokens — pure function, no hooks, fully unit-testable.
 *   useResolvedComponentTokens   — hook wrapper for components that only need
 *                                   scalar overrides (no custom paint merge).
 *
 * For complex components (Button, Chip) that also need a typed paint output,
 * create a co-located `resolve{Component}Style.ts` that calls this function
 * for the scalar portion and handles paint separately.
 */

import { useMemo } from 'react';
import { Platform, type TextStyle } from 'react-native';
import {
  mergeWithJioBundledStaticDefaults,
  resolveStaticWeightFamilyForRole,
  type NativeTypography,
  type NativeShape,
} from '@oneui/shared/engine';
import { useOneUITheme } from './SurfaceContext';
import { useComponentTheme } from './ComponentThemeContext';
import { useComponentRecipe } from './RecipeContext';
import {
  resolveShapeBorderRadius,
  resolveRecipeBorderRadius,
} from './recipeCornerRadius';
import {
  resolveTypographyFontWeightRef,
  resolveTypographyDimensionRef,
  resolveTextTransformRef,
} from './recipeTypography';
import type { TypographyRole } from './useTypographyTokens';

export interface ResolvedScalarTokens {
  /** px borderRadius — tokenRef wins over recipe cornerRadius decision. */
  borderRadius?: number;
  /**
   * Static font family cut for the overridden weight (e.g. 'JioType-Bold').
   * Always paired with `fontWeight`. Apply AFTER typographyToTextStyle so the
   * base fontFamily is set first, then this replaces it.
   */
  fontFamily?: string;
  /**
   * CSS fontWeight string. 'normal' on Android when a static cut is used
   * (prevents synthetic bolding on top of the already-bold TTF file).
   */
  fontWeight?: TextStyle['fontWeight'];
  fontSize?: number;
  lineHeight?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  /**
   * Explicit dimension ref from tokenRefs (e.g. "Display-L-FontSize" → px) wins.
   * Falls back to effectiveFontSize × 0.05 when textTransform is 'uppercase'.
   */
  letterSpacing?: number;
}

/**
 * Single-pass scalar resolver. Precedence (highest first):
 *   tokenRefs (from componentTheme.tokenRefs / brand tokenOverrides)
 *     > recipe decisions (from recipeSelections)
 *       > undefined (caller keeps its own default)
 *
 * Cross-property coupling (uppercase → letterSpacing) is handled here, once,
 * so per-component code never needs to replicate it.
 *
 * @param tokenRefs   componentTheme.tokenRefs from brand tokenOverrides
 * @param recipe      useComponentRecipe() decisions (cornerRadius, textTransform, …)
 * @param typography  theme.typography (resolves token names to numbers)
 * @param shape       theme.shape (resolves Shape-* to px)
 * @param role        typography role of the component's label ('label', 'body', …)
 * @param baseFontSize labelTypo.fontSize BEFORE any override — used for letterSpacing
 *                     em→px coupling. The resolver computes effectiveFontSize internally.
 */
export function resolveComponentScalarTokens(
  tokenRefs: Record<string, string> | undefined,
  recipe: Record<string, string>,
  typography: NativeTypography,
  shape: NativeShape,
  role: TypographyRole,
  baseFontSize: number,
): ResolvedScalarTokens {
  const out: ResolvedScalarTokens = {};

  // ── Shape ──────────────────────────────────────────────────────────────────
  // tokenRef (manual) wins over recipe cornerRadius decision.
  out.borderRadius =
    resolveShapeBorderRadius(tokenRefs?.borderRadius, shape) ??
    resolveRecipeBorderRadius(recipe, shape);

  // ── Font weight + static font family ───────────────────────────────────────
  // Must resolve together: weight 700 → JioType-Bold, not numeric weight on top
  // of the wrong TTF. Android suppresses numeric fontWeight on static cuts to
  // prevent synthetic bolding (see typographyToTextStyle.staticFontTextWeight).
  const fontWeightValue = resolveTypographyFontWeightRef(tokenRefs?.fontWeight, typography);
  if (fontWeightValue != null) {
    const staticMaps = mergeWithJioBundledStaticDefaults(typography.staticWeightFamilies);
    const staticFamily = resolveStaticWeightFamilyForRole(staticMaps, role, fontWeightValue);
    if (staticFamily) {
      out.fontFamily = staticFamily;
      out.fontWeight = Platform.OS === 'android' ? 'normal' : '400';
    } else {
      out.fontWeight = String(fontWeightValue) as TextStyle['fontWeight'];
    }
  }

  // ── Font size / line height ─────────────────────────────────────────────────
  const fontSizeOverride = resolveTypographyDimensionRef(tokenRefs?.fontSize, typography, 'fontSize');
  out.fontSize = fontSizeOverride;
  out.lineHeight = resolveTypographyDimensionRef(tokenRefs?.lineHeight, typography, 'lineHeight');

  // ── Text transform ──────────────────────────────────────────────────────────
  // tokenRef wins over recipe. Both paths feed into the letterSpacing coupling below.
  const textTransformFromRef = resolveTextTransformRef(tokenRefs?.textTransform);
  const textTransformFromRecipe =
    recipe.textTransform === 'uppercase' ? ('uppercase' as const) : undefined;
  out.textTransform = textTransformFromRef ?? textTransformFromRecipe;

  // ── Letter spacing ──────────────────────────────────────────────────────────
  // Explicit tokenRef (resolves as a typography dimension ref, same parser as
  // fontSize) wins over the uppercase-derived value.
  // e.g. tokenRefs.letterSpacing = "Display-L-FontSize" → resolves to the
  // Display-L px value and uses that as the letter-spacing.
  const letterSpacingFromRef = resolveTypographyDimensionRef(
    tokenRefs?.letterSpacing,
    typography,
    'fontSize',
  );
  if (letterSpacingFromRef != null) {
    out.letterSpacing = letterSpacingFromRef;
  } else if (out.textTransform === 'uppercase') {
    // Fallback: derive proportional tracking from effective font size.
    out.letterSpacing = (fontSizeOverride ?? baseFontSize) * 0.05;
  }

  return out;
}

/**
 * Hook wrapper around `resolveComponentScalarTokens` for components that only
 * need scalar overrides and don't require a custom paint merge.
 *
 * Usage:
 *   const scalar = useResolvedComponentTokens('badge', 'label', labelTypo.fontSize);
 *
 * Apply to a Text element (after typographyToTextStyle for the base):
 *   style={[
 *     typographyToTextStyle(labelTypo),
 *     scalar.fontFamily    ? { fontFamily: scalar.fontFamily }       : null,
 *     scalar.fontWeight    ? { fontWeight: scalar.fontWeight }       : null,
 *     scalar.fontSize      ? { fontSize: scalar.fontSize }           : null,
 *     scalar.lineHeight    ? { lineHeight: scalar.lineHeight }       : null,
 *     scalar.textTransform ? { textTransform: scalar.textTransform } : null,
 *     scalar.letterSpacing != null ? { letterSpacing: scalar.letterSpacing } : null,
 *   ]}
 *
 * For components that also need paint overrides (Button, Chip), create a
 * co-located resolve{Component}Style.ts that calls resolveComponentScalarTokens
 * for the scalar portion and handles paint separately.
 */
export function useResolvedComponentTokens(
  slug: string,
  typographyRole: TypographyRole,
  baseFontSize: number,
): ResolvedScalarTokens {
  const { typography, shape } = useOneUITheme();
  const componentTheme = useComponentTheme(slug);
  const recipeDecisions = useComponentRecipe(slug);

  return useMemo(
    () =>
      resolveComponentScalarTokens(
        componentTheme.tokenRefs,
        recipeDecisions,
        typography,
        shape,
        typographyRole,
        baseFontSize,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [componentTheme.tokenRefs, recipeDecisions, typography, shape, typographyRole, baseFontSize],
  );
}
