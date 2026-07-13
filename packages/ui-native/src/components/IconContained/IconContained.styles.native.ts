/**
 * IconContained.styles.native.ts
 *
 * Static layout peer of `IconContained.module.css`. Contains the size lookup
 * tables (container side + icon glyph side) and the root flex geometry.
 *
 * Brand paint (background, icon colour, opacity) is applied inline in
 * `IconContained.native.tsx` via `useSurfaceTokens` — there are no colour
 * literals in this file (`pnpm check:literals`).
 *
 * Container/icon size mapping (mirrors `IconContained.module.css`):
 *
 *   | Size | Container        | Icon (svg)       |
 *   | ---- | ---------------- | ---------------- |
 *   | xs   | Spacing-3 (12px) | Spacing-2  (8px) |
 *   | s    | Spacing-4 (16px) | Spacing-2-5 (10) |
 *   | m    | Spacing-5 (20px) | Spacing-3 (12px) |
 *   | l    | Spacing-6 (24px) | Spacing-4 (16px) |
 *   | xl   | Spacing-8 (32px) | Spacing-5 (20px) |
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { IconContainedSize } from './interface';

// INTENTIONAL-LITERAL: matches `--Disabled-Opacity` fallback in
// IconContained.module.css.
export const DISABLED_OPACITY = 0.5;

/** Per-size container side length (square). Maps web `--IconContained-size-*`. */
export const CONTAINER_SIZE: Record<IconContainedSize, number> = {
  xs: tokens.spacing['3'],
  s: tokens.spacing['4'],
  m: tokens.spacing['5'],
  l: tokens.spacing['6'],
  xl: tokens.spacing['8'],
};

/** Per-size inner icon glyph side. Maps web `--IconContained-iconSize-*`. */
export const ICON_GLYPH_SIZE: Record<IconContainedSize, number> = {
  xs: tokens.spacing['2'],
  s: tokens.spacing['2-5'],
  m: tokens.spacing['3'],
  l: tokens.spacing['4'],
  xl: tokens.spacing['5'],
};

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
