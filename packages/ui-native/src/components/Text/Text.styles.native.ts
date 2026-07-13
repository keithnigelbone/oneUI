/**
 * Text.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/text/Text.module.css`.
 *
 * Geometry only — text colour, font family, size, weight, and line-height
 * flow inline through `useSurfaceTokens` + `useTypographyTokens` (see
 * `Text.native.tsx`). Web's `--_text-*` intermediate variables collapse to
 * native StyleSheet entries here for `textAlign`, `fontStyle`, and
 * `textDecorationLine` (italic / underline / strikethrough).
 *
 * Verified by: `pnpm check:literals`.
 */

import { StyleSheet } from 'react-native';
import type { TextVariant, TextSize } from './interface';

/** Web `var(--{Role}-FontFamily)` slot keys. Maps to `OneUINativeTheme.typography[role]`. */
export type TextTypographyRole = 'body' | 'label' | 'title' | 'headline' | 'display' | 'code';

/**
 * Variant → typography role. 1:1 with web `--{Role}-FontFamily` selectors in
 * `Text.module.css`; kept here so callers can switch role lookup atomically.
 */
export const VARIANT_TO_ROLE: Record<TextVariant, TextTypographyRole> = {
  body: 'body',
  label: 'label',
  title: 'title',
  headline: 'headline',
  display: 'display',
  code: 'code',
};

/** Sizes valid per role — narrower than `TextSize` because `useTypographyTokens` is role-typed. */
export type SizeFor = {
  body: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS';
  label: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS';
  title: 'L' | 'M' | 'S';
  headline: 'L' | 'M' | 'S';
  display: 'L' | 'M' | 'S';
  code: 'M' | 'S' | 'XS';
};

/**
 * Narrow a resolved `TextSize` to the per-role size union. `resolveTextSize`
 * already clamps invalid combinations; this is a typed cast at the boundary.
 */
export function sizeForRole<R extends TextTypographyRole>(
  role: R,
  size: TextSize,
): SizeFor[R] {
  return size as unknown as SizeFor[R];
}

export const styles = StyleSheet.create({
  // `.root` baseline. Colour, font, and per-size paint flow inline.
  root: {},

  // text-align variants — applied when `textAlign` is set.
  alignLeft: { textAlign: 'left' },
  alignCenter: { textAlign: 'center' },
  alignRight: { textAlign: 'right' },

  // Decoration variants. Italic flips `fontStyle`; underline / strikethrough
  // combine cleanly via RN's `textDecorationLine` enum.
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  strikethrough: { textDecorationLine: 'line-through' },
  underlineStrikethrough: { textDecorationLine: 'underline line-through' },

  // `.linkSlot` — Layers `_linkText-slot`. Inherits inline flow.
  linkSlot: {},
});

export const ALIGN_STYLE = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
} as const;
