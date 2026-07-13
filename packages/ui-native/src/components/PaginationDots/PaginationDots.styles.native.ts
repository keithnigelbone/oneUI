/**
 * PaginationDots.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/PaginationDots/PaginationDots.module.css`.
 *
 * Web defaults:
 *   --_pg-dot-size      = Spacing-1-5
 *   --_pg-edge-size     = Spacing-1
 *   --_pg-active-width  = Spacing-4
 *   --_pg-gap           = Spacing-1
 *   --_pg-hit-area      = Spacing-3
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { PaginationDotState } from './interface';

export const DOT_REGULAR = tokens.spacing['1-5'];
export const DOT_EDGE    = tokens.spacing['1'];
export const PILL_HEIGHT = tokens.spacing['1-5'];
export const PILL_WIDTH  = tokens.spacing['4'];
export const GAP         = tokens.spacing['1'];
export const HIT_AREA    = tokens.spacing['3'];

export const styles = StyleSheet.create({
  // .root — flex row, centered, gap between dots
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP,
  },
  // .root[data-state='active'] — pill
  dotActive: { width: PILL_WIDTH, height: PILL_HEIGHT, borderRadius: PILL_HEIGHT / 2 },
  // .root[data-state='edge'] — small dot (truncation indicator)
  dotEdge: { width: DOT_EDGE, height: DOT_EDGE, borderRadius: DOT_EDGE / 2 },
  // .root[data-state='regular'] — base dot
  dotRegular: { width: DOT_REGULAR, height: DOT_REGULAR, borderRadius: DOT_REGULAR / 2 },
});

export const DOT_STYLE: Record<PaginationDotState, ViewStyle> = {
  active: styles.dotActive,
  edge: styles.dotEdge,
  regular: styles.dotRegular,
};
