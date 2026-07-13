/**
 * Checkbox.styles.native.ts
 *
 * Static layout peer of `Checkbox.module.css`. Holds the geometry that does
 * not change with the active brand: wrapper flex, indicator centring, and
 * the per-size container/icon side maps from `tokens.spacing`.
 *
 * Brand paint (border, fill, indicator colour) lives inline in
 * `Checkbox.native.tsx` via `useSurfaceTokens` — there are no colour
 * literals in this file (`pnpm check:literals`).
 *
 * Container/icon size mapping (mirrors `Checkbox.module.css` §SIZES):
 *
 *   | Size | Box                 | Icon glyph        |
 *   | ---- | ------------------- | ----------------- |
 *   | s    | Spacing-4 (16px)    | Spacing-3 (12px)  |
 *   | m    | Spacing-5 (20px)    | Spacing-4 (16px)  |
 *   | l    | Spacing-6 (24px)    | Spacing-4-5 (18)  |
 *
 * Border radii (per `Shape-1` / `Shape-1-5` / `Shape-2`) are applied at
 * runtime from `useOneUITheme().shape` — they are density-aware and the
 * 6px M-size step (`f-5`) is not addressable via the static lowercase
 * `tokens.shape.*` map.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export type CheckboxSizeKey = 's' | 'm' | 'l';

// INTENTIONAL-LITERAL: matches `--Disabled-Opacity` fallback in
// Checkbox.module.css.
export const DISABLED_OPACITY = 0.5;

/** Border thickness for unchecked / readOnly states — mirrors `--Stroke-M` (1px). */
export const STROKE_M_WIDTH = tokens.borderWidth.hairline;

/** Per-size square side length for the interactive box. */
export const BOX_SIZE: Record<CheckboxSizeKey, number> = {
  s: tokens.spacing['4'],
  m: tokens.spacing['5'],
  l: tokens.spacing['6'],
};

/** Per-size square side length for the inner check / minus glyph. */
export const ICON_GLYPH_SIZE: Record<CheckboxSizeKey, number> = {
  s: tokens.spacing['3'],
  m: tokens.spacing['4'],
  l: tokens.spacing['4-5'],
};

/**
 * Per-size body font role used by `useTypographyTokens` for the visible
 * `label` string. Matches web `--Checkbox-labelFontSize-{size}` defaults
 * which alias to `--Body-{S|M|L}-FontSize`.
 */
export const SIZE_TO_BODY = {
  s: 'S',
  m: 'M',
  l: 'L',
} as const;

/**
 * Per-size description font role — fixed to `Body-S` so the second line
 * stays smaller than the label, matching the
 * `FieldLabelStack.module.css#description` typography on web.
 */
export const DESCRIPTION_BODY_SIZE = 'S' as const;

export const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing['1'],
  },
  besideColumn: {
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing['1'],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
    width: '100%',
  },
  labelTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['0-5'],
    flex: 1,
    minWidth: 0,
  },
  labelTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
