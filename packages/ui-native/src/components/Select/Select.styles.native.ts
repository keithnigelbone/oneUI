/**
 * Select.styles.native.ts — static geometry only (token-driven). All paint is
 * applied inline in `Select.native.tsx` from `useSurfaceTokens(appearance)` so
 * Surface context + brand foundation resolve automatically. No colour literals.
 */
import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { SelectSize } from './interface';

/** Trigger min-height per size — aligns with Input/Button (S/M/L → 8/10/12 f-steps). */
export const TRIGGER_MIN_HEIGHT: Record<SelectSize, number> = {
  s: tokens.spacing['9'], // 36
  m: tokens.spacing['10'], // 40
  l: tokens.spacing['12'], // 48
};

/** Menu width clamps. */
export const MENU_MIN_WIDTH = tokens.spacing['40']; // 160-ish floor
export const MENU_MAX_HEIGHT = tokens.spacing['40'] * 8; // scrollable cap

/** Gap between trigger and menu (Figma SelectMenuWrapper py = Spacing-2). */
export const MENU_OFFSET = tokens.spacing['2']; // 8

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    gap: tokens.spacing['2'], // 8 — label/trigger/feedback stack
    alignSelf: 'stretch',
  },
  // ── input-trigger label/description/feedback rows ──────────────────────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'], // 4
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },
  // ── trigger wrapper (anchor) ───────────────────────────────────────────────
  triggerWrap: {
    alignSelf: 'stretch',
  },
  triggerInline: {
    alignSelf: 'flex-start',
  },
  // ── overlay ────────────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuAbsolute: {
    position: 'absolute',
  },
  // ── menu container (Figma ContextMenu: radius Shape-4 = 16, elevation1) ─────
  menu: {
    borderRadius: tokens.shape['4'], // 16
    overflow: 'hidden',
    paddingVertical: tokens.spacing['0'],
  },
  menuScroll: {
    maxHeight: MENU_MAX_HEIGHT,
  },
  // ── search header (Figma Search py = Spacing-3-5, px = Spacing-3-5) ─────────
  searchHeader: {
    paddingTop: tokens.spacing['3-5'], // 14
    paddingHorizontal: tokens.spacing['3-5'],
    paddingBottom: tokens.spacing['0'],
  },
  // ── section header (Figma SectionDivider.Top label) ────────────────────────
  sectionHeader: {
    paddingTop: tokens.spacing['5-5'], // 22
    paddingBottom: tokens.spacing['2'], // 8
    paddingHorizontal: tokens.spacing['4'], // 16
  },
  // ── list item row (Figma ListItem StateLayer) ──────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['3'], // 12
    paddingLeft: tokens.spacing['4'], // 16
    paddingRight: tokens.spacing['3-5'], // 14
    minHeight: tokens.spacing['14'], // ~56, Figma rows are 60/62
  },
  rowContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacing['0-5'], // 2
    paddingVertical: tokens.spacing['3'], // 12
  },
  rowStart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEnd: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tokens.spacing['6'], // 24 — check/icon slot
  },
  // ── divider between rows ────────────────────────────────────────────────────
  divider: {
    height: tokens.borderWidth.hairline,
    alignSelf: 'stretch',
  },
  // shared text ellipsis helper
  ellipsis: {
    flexShrink: 1,
  } as ViewStyle,
});
