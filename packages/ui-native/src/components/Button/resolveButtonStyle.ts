/**
 * resolveButtonStyle.ts
 *
 * Pure function — no hooks, no React. The native analogue of web's
 * `buildAllComponentCSS` merge pass: takes all 4 style sources as plain values,
 * returns a single typed `ButtonResolvedStyle` struct.
 *
 * Precedence order (highest first, mirrors web's @layer cascade):
 *   tokenRefs (brand token editor)
 *     > recipe decisions (brand component recipe)
 *       > attention style/role per level (family theme — High→bold,
 *         Medium→subtle, Low→ghost; legacy emphasisStyle aliases High)
 *         > surface-engine foundation tokens (VARIANT_PAINT)
 */

import { type TextStyle } from 'react-native';
import {
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  type NativeRoleTokens,
  type NativeComponentThemeValues,
  type ResolvedMaterials,
  type OneUINativeTheme,
} from '../../theme';
import { resolveComponentScalarTokens } from '../../theme/componentTokenResolver';
import { typographyToTextStyle } from '../../theme/typographyToTextStyle';
import type { NativeTypeStyle } from '@oneui/shared/engine';
import {
  applyButtonRecipe,
  applyAttentionStyleToPaint,
  applyTokenRefsToPaint,
  VARIANT_FACTORY_ATTENTION_STYLE,
  VARIANT_PAINT,
  VARIANT_TO_MODE,
  type Paint,
} from './buttonPaint';
import type { ButtonVariant } from './interface';
import type { ButtonNumericSize } from './buttonLayout';

// ─── Output type ─────────────────────────────────────────────────────────────

export interface ButtonResolvedStyle {
  // Paint — both states pre-computed; component selects inside Pressable callback.
  paint: Paint;
  // Shape
  borderRadius: number;
  // Typography — fully merged (base typographyToTextStyle → override applied on top).
  labelFontFamily: string;
  labelFontWeight: TextStyle['fontWeight'];
  labelFontSize: number;
  labelLineHeight: number;
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none' | undefined;
  letterSpacing: number | undefined;
  // Recipe horizontal density override — keyed by sizeKey; Button.native.tsx looks up sizeKey.
  paddingHorizontal: Partial<Record<6 | 8 | 10 | 12, number>> | undefined;
  // Derived surface mode for ButtonSlot — from variant + emphasisStyle.
  slotSurfaceMode: 'bold' | 'subtle' | 'default';
  // Ornament height scale — clamped float [0.1, 2.0]; 1.0 means full button height.
  ornamentHeightScale: number;
}

// ─── Input type ──────────────────────────────────────────────────────────────

export interface ButtonStyleInputs {
  componentTheme: NativeComponentThemeValues;
  recipeDecisions: Record<string, string>;
  labelTypo: NativeTypeStyle;
  theme: OneUINativeTheme;
  role: NativeRoleTokens;
  resolvedVariant: ButtonVariant;
  resolvedRoles: Record<string, NativeRoleTokens>;
  brandMaterials: ResolvedMaterials | null;
  sizeKey: ButtonNumericSize;
}

// ─── Resolver ────────────────────────────────────────────────────────────────

export function resolveButtonStyle(inputs: ButtonStyleInputs): ButtonResolvedStyle {
  const {
    componentTheme,
    recipeDecisions,
    labelTypo,
    theme,
    role,
    resolvedVariant,
    resolvedRoles,
    brandMaterials,
  } = inputs;

  // ── Per-level attention style/role for this variant ───────────────────────
  // Levels map onto variants: High→bold, Medium→subtle, Low→ghost. The legacy
  // emphasisStyle key aliases the High level.
  const attentionStyle =
    resolvedVariant === 'bold'
      ? componentTheme.highAttentionStyle ?? componentTheme.emphasisStyle
      : resolvedVariant === 'subtle'
        ? componentTheme.mediumAttentionStyle
        : componentTheme.lowAttentionStyle;
  const attentionRoleName =
    resolvedVariant === 'bold'
      ? componentTheme.highAttentionRole
      : resolvedVariant === 'subtle'
        ? componentTheme.mediumAttentionRole
        : componentTheme.lowAttentionRole;
  const paintRole =
    attentionRoleName && attentionRoleName !== 'inherit'
      ? resolvedRoles[attentionRoleName] ?? role
      : role;

  // ── Paint cascade: foundation → attention style/role → tokenRefs ───────────
  const basePaint =
    paintRole === role
      ? VARIANT_PAINT[resolvedVariant](role)
      : VARIANT_PAINT[resolvedVariant](paintRole);
  const attentionPaint = applyAttentionStyleToPaint(
    basePaint,
    attentionStyle,
    paintRole,
    resolvedVariant,
  );
  const paint = applyTokenRefsToPaint(
    attentionPaint,
    resolvedVariant,
    componentTheme.tokenRefs,
    resolvedRoles,
    brandMaterials,
  );

  // ── Shape: tokenRef > recipe > shapeLanguage > Shape-Pill default ──────────
  // Pass effective fontSize to recipe so em-based letterSpacing is correct when
  // a font-size tokenRef also overrides the label size.
  const baseFontSize = labelTypo.fontSize;
  const recipe = applyButtonRecipe(recipeDecisions, baseFontSize, theme.shape, theme.spacing);
  const borderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, theme.shape) ??
    recipe.borderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, theme.shape, 'actions') ??
    theme.shape.Pill;

  // ── Scalar tokens (fontWeight, fontSize, lineHeight, textTransform, letterSpacing) ──
  // Delegates to the shared resolver so the uppercase→letterSpacing coupling is
  // handled once, not duplicated per component.
  const scalar = resolveComponentScalarTokens(
    componentTheme.tokenRefs,
    recipeDecisions,
    theme.typography,
    theme.shape,
    'label',
    baseFontSize,
  );

  // ── Label typography — base from typographyToTextStyle, overrides on top ───
  const baseLabelStyle = typographyToTextStyle(labelTypo);

  // ── Slot surface mode — derived from the variant's EFFECTIVE style ─────────
  let slotSurfaceMode: 'bold' | 'subtle' | 'default' = VARIANT_TO_MODE[resolvedVariant];
  const effectiveStyle = attentionStyle ?? VARIANT_FACTORY_ATTENTION_STYLE[resolvedVariant];
  if (effectiveStyle === 'solid') {
    slotSurfaceMode = 'bold';
  } else if (effectiveStyle === 'tonal') {
    slotSurfaceMode = 'subtle';
  } else if (effectiveStyle === 'outline' || effectiveStyle === 'quiet') {
    slotSurfaceMode = 'default';
  }

  const ornamentScaleRef = componentTheme.tokenRefs?.ornamentHeightScale;
  const ornamentHeightScaleRaw =
    ornamentScaleRef != null
      ? Math.max(0.1, Math.min(2, parseFloat(String(ornamentScaleRef))))
      : 1.0;
  const ornamentHeightScale = isFinite(ornamentHeightScaleRaw) ? ornamentHeightScaleRaw : 1.0;

  return {
    paint,
    borderRadius,
    labelFontFamily: scalar.fontFamily ?? baseLabelStyle.fontFamily!,
    labelFontWeight: scalar.fontWeight ?? baseLabelStyle.fontWeight!,
    labelFontSize: scalar.fontSize ?? baseLabelStyle.fontSize!,
    labelLineHeight: scalar.lineHeight ?? baseLabelStyle.lineHeight!,
    textTransform: scalar.textTransform,
    letterSpacing: scalar.letterSpacing,
    paddingHorizontal: recipe.paddingHorizontal,
    slotSurfaceMode,
    ornamentHeightScale,
  };
}
