/**
 * Carousel.styles.native.ts
 *
 * Static geometry peer of `Carousel.module.css` — spacing via numeric
 * `tokens.spacing` keys; brand paint merges inline at render time.
 */

import { StyleSheet, type ImageStyle, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type {
  CarouselAlignment,
  CarouselButtonOrientation,
  CarouselButtonWidth,
  CarouselControlsLayout,
  CarouselControlsPlacement,
  CarouselCornerPlacement,
} from './interface';
import { isCarouselContentCentered } from './carouselContentLayout.native';

export const SLIDE_GAP = tokens.spacing['2'];
/** Figma `ItemPrev` / `ItemNext` column width — `grid/margin`. */
export const PEEK_COLUMN_WIDTH = tokens.spacing.Margin;
/** Figma `ItemPrev` `pr` / `ItemNext` `pl` — `grid/gutter`. */
export const PEEK_COLUMN_PADDING = tokens.spacing.Gutter;
/** Total viewport shrink for active slide — margin column × 2 (328px @ 360). */
export const PEEK_OFFSET = PEEK_COLUMN_WIDTH * 2;
/** Visible adjacent image in outer peek band — `Margin − Gutter` (8px @ 360). */
export const PEEK_VISIBLE_WIDTH = PEEK_COLUMN_WIDTH - PEEK_COLUMN_PADDING;
/** @deprecated Use `PEEK_COLUMN_WIDTH` — same value, kept for callers. */
export const PEEK_INSET_PER_SIDE = PEEK_COLUMN_WIDTH;
export const FLEXIBLE_MIN_HEIGHT = tokens.spacing['40'];

/** Overlay slots mirror web `data-surface` token remapping without painting a fill. */
export const surfaceOverlayStyle: ViewStyle = {
  backgroundColor: 'transparent',
};

export const styles = StyleSheet.create({
  root: {
    width: '100%',
    position: 'relative',
  },
  a11yRegionName: {
    position: 'absolute',
    width: tokens.spacing['0'],
    height: tokens.spacing['0'],
    opacity: 0,
    overflow: 'hidden',
  },
  rootWithBelowChrome: {
    flexDirection: 'column',
  },
  viewport: {
    width: '100%',
    overflow: 'hidden',
  },
  trackScroll: {
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SLIDE_GAP,
  },
  slide: {
    position: 'relative',
    overflow: 'hidden',
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  // Wrapper for loop circular-buffer clones — sizes to the inner slide and stays
  // out of the flex-shrink flow so a clone occupies exactly one slide stride.
  slideClone: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  imageMedia: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  imageMediaFlexible: {
    minHeight: FLEXIBLE_MIN_HEIGHT,
  },
  imageMediaFill: {
    ...StyleSheet.absoluteFillObject,
    minHeight: undefined,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    flexDirection: 'column',
  },
  contentColumn: {
    width: '100%',
    flexDirection: 'column',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: tokens.spacing['2'],
  },
  badgesRowCentered: {
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
  },
  contentText: {},
  contentTextCentered: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
  },
  corner: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['2-5'],
  },
  cornerStart: {
    left: 0,
  },
  cornerEnd: {
    right: 0,
  },
  buttonGroup: {
    gap: tokens.spacing['2'],
    width: '100%',
  },
  buttonGroupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  buttonGroupHorizontalCentered: {
    justifyContent: 'center',
  },
  buttonGroupVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonGroupWideChild: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['3-5'],
  },
  controlsBelow: {
    justifyContent: 'center',
  },
  controlsBelowSelectionRail: {
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: tokens.spacing['2'],
    paddingBottom: 0,
  },
  controlsBelowSelectionRailWithNav: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: tokens.spacing['2'],
    paddingBottom: tokens.spacing['3'],
  },
  controlsBelowSelectionRailChild: {
    flexGrow: 1,
    flexShrink: 1,
    alignSelf: 'stretch',
    minWidth: 0,
  },
  controlsOnMedia: {
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  controlsSplit: {
    justifyContent: 'space-between',
  },
  controlsSplitFirst: {
    marginRight: 'auto',
  },
  controlsOnMediaSplitFirst: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'center',
  },
  controlsOnMediaSelectionRail: {
    bottom: 0,
    left: tokens.spacing.Margin,
    right: tokens.spacing['0'],
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    gap: tokens.spacing['0'],
  },
  controlsChildPointer: {
    // pointerEvents applied inline where needed
  },
});

export const slideImageStyle: ImageStyle = StyleSheet.flatten(styles.image) as ImageStyle;

export { contentAlignmentStyle, isCarouselContentCentered } from './carouselContentLayout.native';

export function controlsPlacementStyle(
  placement: CarouselControlsPlacement,
  layout: CarouselControlsLayout
): ViewStyle[] {
  const base: ViewStyle[] = [styles.controls];
  if (placement === 'onMedia') {
    base.push(styles.controlsOnMedia);
  } else {
    base.push(styles.controlsBelow);
  }
  if (layout === 'split') {
    base.push(styles.controlsSplit);
  }
  return base;
}

export function cornerPlacementStyle(placement: CarouselCornerPlacement): ViewStyle {
  return placement === 'start'
    ? StyleSheet.flatten([styles.corner, styles.cornerStart])
    : StyleSheet.flatten([styles.corner, styles.cornerEnd]);
}

export function buttonGroupLayoutStyle(
  orientation: CarouselButtonOrientation,
  width: CarouselButtonWidth,
  contentAlignment?: CarouselAlignment
): { container: ViewStyle; wideChild: ViewStyle | null } {
  const centered = contentAlignment != null && isCarouselContentCentered(contentAlignment);
  const container = StyleSheet.flatten([
    styles.buttonGroup,
    orientation === 'vertical' ? styles.buttonGroupVertical : styles.buttonGroupHorizontal,
    centered && orientation === 'horizontal' ? styles.buttonGroupHorizontalCentered : null,
  ]);
  return {
    container,
    wideChild: width === 'wide' ? styles.buttonGroupWideChild : null,
  };
}
