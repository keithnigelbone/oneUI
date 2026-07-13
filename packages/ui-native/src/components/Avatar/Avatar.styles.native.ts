/**
 * Avatar.styles.native.ts
 *
 * Static layout peer of `Avatar.module.css` — square sizes, pill radius,
 * icon slot dimensions. Brand paint merges inline in `Avatar.native.tsx`.
 */

import { StyleSheet } from 'react-native';

// INTENTIONAL-LITERAL: matches `--Disabled-Opacity` fallback in Avatar.module.css.
export const DISABLED_OPACITY = 0.5;

/**
 * Label role size keys for `useTypographyTokens` — maps avatar size → initials typography.
 * 2xs/xs use icon fallback in component (no text row).
 */
export const SIZE_TO_LABEL = {
  s: '3XS',
  m: '2XS',
  l: 'XS',
  xl: 'S',
  '2xl': 'M',
  custom: 'L',
} as const;

export type AvatarLabelSizeKey = keyof typeof SIZE_TO_LABEL;

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
