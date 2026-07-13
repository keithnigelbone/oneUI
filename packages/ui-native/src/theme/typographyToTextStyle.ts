/**
 * Maps resolved `NativeTypeStyle` tokens to React Native `TextStyle`.
 *
 * When `weightViaFontFamily` is set, omits `fontWeight` so Android does not
 * apply synthetic bolding on top of an already-bold static face.
 */

import { Platform, type TextStyle } from 'react-native';
import type { NativeTypeStyle } from '@oneui/shared/engine';

/**
 * Static per-weight TTF cuts carry weight in the file. Never pass a numeric
 * `fontWeight` alongside them — Android especially will synthetic-bold the face.
 */
export function staticFontTextWeight(
  typography: Pick<NativeTypeStyle, 'weightViaFontFamily'>,
): TextStyle['fontWeight'] | undefined {
  if (!typography.weightViaFontFamily) return undefined;
  return Platform.OS === 'android' ? 'normal' : ('400' as TextStyle['fontWeight']);
}

/** Core typography fields for `<Text>`. */
export function typographyToTextStyle(typography: NativeTypeStyle): TextStyle {
  const style: TextStyle = {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
  };

  const staticWeight = staticFontTextWeight(typography);
  if (staticWeight != null) {
    style.fontWeight = staticWeight;
  } else {
    style.fontWeight = String(typography.fontWeight) as TextStyle['fontWeight'];
  }

  if (typography.letterSpacing != null) {
    style.letterSpacing = typography.letterSpacing;
  }

  return style;
}

/** Merge typography base with paint/decoration overrides (color, underline, etc.). */
export function mergeTypographyTextStyle(
  typography: NativeTypeStyle,
  overrides?: TextStyle | null,
): TextStyle {
  return { ...typographyToTextStyle(typography), ...overrides };
}
