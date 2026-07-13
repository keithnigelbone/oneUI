/**
 * Header.styles.native.ts — layout geometry for Figma HeaderNative.
 *
 * Layout is driven by PrimaryNav `type` (homeBar | contextBar | searchBar),
 * not web-only concepts like `middle`.
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { HeaderItemSlotSize } from './interface';

const S = tokens.spacing;

export const ROW_HEIGHT = S['14'];

const SECONDARY_NAV_GAP = S['4'];
const ITEM_MIN_HEIGHT = S['6'];
const PADDING_INLINE = S.Margin;
const ITEM_PILL_HEIGHT = S['6'];
const INDICATOR_HEIGHT = S['0-5'];
const INDICATOR_RADIUS = S['0-5'];
const SLOT_GAP = S['1'];
const SLOT_SIZE_M = S['4'];

export const styles = StyleSheet.create({
  root: {
    width: '100%',
    zIndex: tokens.zIndex.sticky,
    position: 'relative',
  },
  rootColumn: {
    flexDirection: 'column',
  },
  headerExpanded: {
    minHeight: ROW_HEIGHT * 2,
  },
  headerDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  primaryNav: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flexShrink: 0,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: PADDING_INLINE,
    paddingVertical: S['1'],
    overflow: 'hidden',
  },
  primaryNavExpanded: {
    minHeight: ROW_HEIGHT + S['2'],
  },
  primaryNavColumn: {
    width: '100%',
    flexDirection: 'column',
    flexShrink: 0,
  },
  /** searchBar row — gap between start, field, end */
  primaryNavSearchBar: {
    gap: S['2'],
    justifyContent: 'flex-start',
  },
  primaryNavStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S['2'],
    flexShrink: 0,
    paddingEnd: S['3'],
  },
  /** searchBar start — back only; row gap handles spacing */
  primaryNavStartSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  /** contextBar start — back + TitleWrapper (flex 1) */
  primaryNavStartContext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S['2'],
    minWidth: 0,
    paddingEnd: S['3'],
  },
  contextBarTitleWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: S['1'],
    minWidth: 0,
  },
  contextBarTitleLine: {
    flexShrink: 1,
  },
  contextBarSecondaryLine: {
    flexShrink: 1,
  },
  /** homeBar middle — flex spacer or search field host */
  homeBarMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: S['9'],
  },
  /** homeBar expanded — Row 2 large title (shared with contextBar expanded) */
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexShrink: 0,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: PADDING_INLINE,
    paddingVertical: S['1'],
    overflow: 'hidden',
  },
  expandedTitleText: {
    flex: 1,
    minWidth: 0,
  },
  /** contextBar expanded — Row 1 back only (title moves to Row 2) */
  primaryNavStartContextExpanded: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingEnd: S['3'],
  },
  primaryNavEndHomeBar: {
    paddingStart: 0,
  },
  /** searchBar — expanded search field */
  searchBarField: {
    flex: 1,
    justifyContent: 'center',
    minHeight: ROW_HEIGHT,
  },
  navItemMeasure: {
    flexShrink: 0,
  },
  primaryNavEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S['3'],
    flexShrink: 0,
    paddingStart: S['1-5'],
  },
  primaryNavEndContext: {
    paddingStart: 0,
  },
  primaryNavEndSearch: {
    paddingStart: 0,
    gap: 0,
  },
  primaryNavEndSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S['1-5'],
  },
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    minHeight: ITEM_MIN_HEIGHT,
    flexShrink: 0,
  },
  itemStateLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ITEM_MIN_HEIGHT,
    borderRadius: tokens.shape['2'],
    position: 'relative',
  },

  itemStateLayerPill: {
    height: ITEM_PILL_HEIGHT,
    borderRadius: tokens.shape.Pill,
  },
  itemContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SLOT_GAP,
    position: 'relative',
  },
  itemIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_RADIUS,
  },
  itemSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemSlotM: {
    width: SLOT_SIZE_M,
    height: SLOT_SIZE_M,
    overflow: 'hidden',
  },
  secondaryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexShrink: 0,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: PADDING_INLINE,
    overflow: 'hidden',
  },
  secondaryNavItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SECONDARY_NAV_GAP,
    height: ROW_HEIGHT,
    flex: 1,
    justifyContent: 'flex-start',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
});

export { SLOT_BADGE_INSET, SLOT_ICON_INSET, SLOT_OUTER_PADDING } from './HeaderItem.layout.native';
export function slotSizeStyle(size: HeaderItemSlotSize | undefined): ViewStyle {
  if (size === 'M') return styles.itemSlotM;
  return {};
}
