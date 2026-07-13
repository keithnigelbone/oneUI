/**
 * resolveChipStyle.ts
 *
 * Pure function — no hooks, no React. The native analogue of web's
 * `buildAllComponentCSS` merge pass for Chip: takes all style sources as
 * plain values, returns a single typed `ChipResolvedStyle` struct.
 */

import { type TextStyle } from 'react-native';
import {
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  type NativeRoleTokens,
  type NativeComponentThemeValues,
  type ResolvedMaterials,
  type ResolvedMetallicGradient,
  type OneUINativeTheme,
} from '../../theme';
import { resolveComponentScalarTokens } from '../../theme/componentTokenResolver';
import { typographyToTextStyle } from '../../theme/typographyToTextStyle';
import { resolveRecipeBorderRadius } from '../../theme/recipeCornerRadius';
import { resolveMetallicPaintFromTokenRefs } from '../../utils/metallicPaint';
import type { NativeTypeStyle } from '@oneui/shared/engine';
import { getBasePaint, getPressedPaint, type ChipPaint } from './chipPaint';
import type { ChipVariant } from './interface';

export interface ChipResolvedStyle {
  // Paint — base and pressed; component selects inside Pressable callback.
  basePaint: ChipPaint;
  pressedPaint: ChipPaint;
  // Shape
  borderRadius: number;
  // Typography
  labelFontFamily: string;
  labelFontWeight: TextStyle['fontWeight'];
  labelFontSize: number;
  labelLineHeight: number;
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none' | undefined;
  letterSpacing: number | undefined;
}

export interface ChipStyleInputs {
  componentTheme: NativeComponentThemeValues;
  recipeDecisions: Record<string, string>;
  labelTypo: NativeTypeStyle;
  theme: OneUINativeTheme;
  role: NativeRoleTokens;
  neutral: NativeRoleTokens;
  resolvedVariant: ChipVariant;
  resolvedRoles: Record<string, NativeRoleTokens>;
  brandMaterials: ResolvedMaterials | null;
  isSelected: boolean;
}

export function resolveChipStyle(inputs: ChipStyleInputs): ChipResolvedStyle {
  const {
    componentTheme,
    recipeDecisions,
    labelTypo,
    theme,
    role,
    neutral,
    resolvedVariant,
    resolvedRoles,
    brandMaterials,
    isSelected,
  } = inputs;

  // ── Paint cascade ──────────────────────────────────────────────────────────
  const rawBasePaint = getBasePaint(resolvedVariant, isSelected, role, neutral);

  // Metallic override — only on bold+selected (the "filled" state).
  const metallicOverride =
    resolvedVariant === 'bold' && isSelected
      ? resolveMetallicPaintFromTokenRefs({
          variant: 'bold',
          tokenRefs: componentTheme.tokenRefs,
          resolvedRoles,
          materials: brandMaterials,
        })
      : {};

  const basePaint: ChipPaint = {
    ...rawBasePaint,
    ...(metallicOverride.bg != null ? { bg: metallicOverride.bg } : {}),
    ...(metallicOverride.text != null ? { text: metallicOverride.text } : {}),
    ...(metallicOverride.borderColor != null ? { borderColor: metallicOverride.borderColor } : {}),
    bgGradient: (metallicOverride.bgGradient as ResolvedMetallicGradient | undefined) ?? null,
  };

  // Chip uses StrokeColor (solid) not gradient stroke.
  if (basePaint.bgGradient && !metallicOverride.borderColor) {
    basePaint.borderColor = basePaint.bgGradient.strokeColor ?? basePaint.borderColor;
  }
  if (basePaint.bgGradient && !metallicOverride.text) {
    basePaint.text = basePaint.bgGradient.text ?? basePaint.text;
  }

  const pressedPaint = getPressedPaint(resolvedVariant, isSelected, role, neutral);

  // ── Shape: tokenRef > recipe > shapeLanguage > Shape-Pill ─────────────────
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, theme.shape);
  const borderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, theme.shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, theme.shape, 'actions') ??
    theme.shape.Pill;

  // ── Scalar tokens ──────────────────────────────────────────────────────────
  const scalar = resolveComponentScalarTokens(
    componentTheme.tokenRefs,
    recipeDecisions,
    theme.typography,
    theme.shape,
    'label',
    labelTypo.fontSize,
  );

  const baseLabelStyle = typographyToTextStyle(labelTypo);

  return {
    basePaint,
    pressedPaint,
    borderRadius,
    labelFontFamily: scalar.fontFamily ?? baseLabelStyle.fontFamily!,
    labelFontWeight: scalar.fontWeight ?? baseLabelStyle.fontWeight!,
    labelFontSize: scalar.fontSize ?? baseLabelStyle.fontSize!,
    labelLineHeight: scalar.lineHeight ?? baseLabelStyle.lineHeight!,
    textTransform: scalar.textTransform,
    letterSpacing: scalar.letterSpacing,
  };
}
