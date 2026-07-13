/**
 * SegmentedControl.styles.native.ts
 *
 * Geometry peer of SegmentedControl.module.css — track padding, per-size ×
 * track-emphasis item metrics, icon-cell squares, slot gaps, and icon glyph
 * sizes. Colour / paint is inline in `SegmentedControl.native.tsx` via
 * `useSurfaceTokens`. Border radius (pill vs rectangular) is brand-responsive
 * and resolved there from `theme.shape`.
 *
 * Zero literals for spacing / sizing — verified by `pnpm check:literals`.
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type {
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
} from './interface';

const S = tokens.spacing;

/** Item padding / min-height by size, split base (high|medium) vs low emphasis. */
export interface SegmentItemMetrics {
  minHeight: number;
  paddingVertical: number;
  paddingHorizontal: number;
}

type ItemMetricsKey = `${SegmentedControlSize}:${'base' | 'low'}`;

const ITEM_METRICS: Record<ItemMetricsKey, SegmentItemMetrics> = {
  's:base': { minHeight: S['6'], paddingVertical: S['0-5'], paddingHorizontal: S['2-5'] },
  'm:base': { minHeight: S['8'], paddingVertical: S['0-5'], paddingHorizontal: S['3'] },
  'l:base': { minHeight: S['10'], paddingVertical: S['1'], paddingHorizontal: S['6'] },
  's:low': { minHeight: S['8'], paddingVertical: S['0-5'], paddingHorizontal: S['3'] },
  'm:low': { minHeight: S['10'], paddingVertical: S['1'], paddingHorizontal: S['4'] },
  'l:low': { minHeight: S['12'], paddingVertical: S['2'], paddingHorizontal: S['6'] },
};

/** Icon-only fixed square cell size by size × track emphasis. */
const ICON_ITEM_SIZE: Record<ItemMetricsKey, number> = {
  's:base': S['6'],
  'm:base': S['8'],
  'l:base': S['10'],
  's:low': S['8'],
  'm:low': S['10'],
  'l:low': S['12'],
};

const CONTENT_GAP: Record<SegmentedControlSize, number> = {
  s: S['1'],
  m: S['1-5'],
  l: S['2'],
};

/** Icon glyph pixel size by segment size — peer of `.item[data-size] .start svg`. */
const ICON_GLYPH_SIZE: Record<SegmentedControlSize, number> = {
  s: S['4'],
  m: S['5'],
  l: S['6'],
};

/** Label typography size key by segment size — peer of `.item[data-size] .label`. */
export const LABEL_SIZE: Record<SegmentedControlSize, 'S' | 'M' | 'L'> = {
  s: 'S',
  m: 'M',
  l: 'L',
};

export interface SegmentGeometry {
  item: SegmentItemMetrics;
  iconItemSize: number;
  contentGap: number;
  iconGlyphSize: number;
  labelSize: 'S' | 'M' | 'L';
}

export function resolveSegmentGeometry(
  size: SegmentedControlSize,
  trackEmphasis: SegmentedControlTrackEmphasis,
): SegmentGeometry {
  const key: ItemMetricsKey = `${size}:${trackEmphasis === 'low' ? 'low' : 'base'}`;
  return {
    item: ITEM_METRICS[key],
    iconItemSize: ICON_ITEM_SIZE[key],
    contentGap: CONTENT_GAP[size],
    iconGlyphSize: ICON_GLYPH_SIZE[size],
    labelSize: LABEL_SIZE[size],
  };
}

/** Track outer padding — peer of `--SegmentedControl-trackPadding` / `--Spacing-1`. */
export const TRACK_PADDING = S['1'];
/** Gap between segments — peer of `--SegmentedControl-trackGap` / `--Spacing-0`. */
export const TRACK_GAP = S['0'];
/** Track border width — peer of `--Stroke-M` (1px). */
export const TRACK_BORDER_WIDTH = tokens.borderWidth.hairline;

// INTENTIONAL-LITERAL: matches web `--Disabled-Opacity`.
export const DISABLED_OPACITY = 0.38;

export const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'flex-start',
    padding: TRACK_PADDING,
    gap: TRACK_GAP,
    borderWidth: TRACK_BORDER_WIDTH,
    borderColor: 'transparent',
  } as ViewStyle,
  /** equalWidth text track fills its parent. */
  trackFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  item: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    // No `overflow: 'hidden'` — the high-attention selected segment casts an
    // Elevation-1 shadow that iOS clips when the layer masks to bounds.
  },
  /** equalWidth text segments share the row equally. */
  itemEqual: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  /** hug-content segments size to their content. */
  itemHug: {
    flexGrow: 0,
    flexShrink: 0,
  },
  stateLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // No `width: '100%'` — in hug mode the item has no definite width, so a
    // percentage here resolves against an indefinite parent and blows the
    // segment up to full-screen width. `flexShrink` lets equal-width segments
    // truncate instead. The fill spans the segment because the background is
    // painted on the item (Pressable), not this layer.
    flexShrink: 1,
    minWidth: 0,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  label: {
    textAlign: 'center',
    flexShrink: 1,
  },
  slot: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
