/**
 * Carousel Slide.Content layout — Figma ContentBlock variants (2775:11738–2775:11890).
 * Token-only geometry; paint stays in Carousel.native.tsx.
 */

import type { ViewStyle } from 'react-native';
import type { CarouselAlignment, CarouselContentWidth } from './interface';
import { resolveCarouselContentMaxWidth } from './interface';

export function isCarouselHorizontalCenter(alignment: CarouselAlignment): boolean {
  return alignment === 'middleBottom' || alignment === 'middleMiddle' || alignment === 'middleTop';
}

export function isCarouselBadgeRowCentered(alignment: CarouselAlignment): boolean {
  return isCarouselHorizontalCenter(alignment);
}

/** All Figma content blocks hoist badges into a top row. */
export function usesCarouselTopBadgesRow(_alignment: CarouselAlignment): boolean {
  return true;
}

/**
 * Outer absolute shell — anchors the overlay to slide edges.
 * Horizontal centring for `middle*` uses `alignItems: 'center'` (RN ignores `margin: auto` on absolute views).
 */
export function resolveCarouselSlideContentShellStyle(
  alignment: CarouselAlignment,
  width: CarouselContentWidth
): ViewStyle {
  const fill = width === 'fill';

  switch (alignment) {
    case 'startMiddle':
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        ...(fill ? { right: 0 } : null),
        justifyContent: 'center',
        alignItems: 'flex-start',
      };
    case 'middleBottom':
      return { left: 0, right: 0, bottom: 0, alignItems: 'center' };
    case 'middleMiddle':
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      };
    case 'middleTop':
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
      };
    case 'startBottom':
    default:
      return {
        left: 0,
        right: 0,
        bottom: 0,
        ...(fill ? { right: 0 } : null),
        alignItems: 'flex-start',
      };
  }
}

/** Inner column — width cap + stretch; centred via parent `alignItems: 'center'`. */
export function resolveCarouselSlideContentInnerStyle(
  alignment: CarouselAlignment,
  width: CarouselContentWidth
): ViewStyle {
  const fill = width === 'fill';
  const fullHeight = usesCarouselFullHeightContentOverlay(alignment);

  if (fill) {
    return {
      width: '100%',
      alignSelf: 'stretch',
      ...(fullHeight ? { flex: 1 } : null),
    };
  }

  const maxWidth = resolveCarouselContentMaxWidth(width) as `${number}%`;

  if (isCarouselHorizontalCenter(alignment)) {
    return { maxWidth, width: '100%', alignSelf: 'center', alignItems: 'center' };
  }

  return { maxWidth, width: '100%', alignSelf: 'flex-start' };
}

/** @deprecated Use shell + inner styles — merged for legacy callers only. */
export function resolveCarouselSlideContentOverlayStyle(
  alignment: CarouselAlignment,
  width: CarouselContentWidth
): ViewStyle {
  return {
    ...resolveCarouselSlideContentShellStyle(alignment, width),
    ...resolveCarouselSlideContentInnerStyle(alignment, width),
  };
}

/** @deprecated Prefer {@link resolveCarouselSlideContentInnerStyle}. */
export function resolveCarouselContentWidthStyle(
  width: CarouselContentWidth,
  alignment: CarouselAlignment
): Pick<ViewStyle, 'left' | 'right' | 'maxWidth' | 'alignSelf' | 'width'> {
  const inner = resolveCarouselSlideContentInnerStyle(alignment, width);
  const shell = resolveCarouselSlideContentShellStyle(alignment, width);
  return {
    ...(shell.left != null ? { left: shell.left } : null),
    ...(shell.right != null ? { right: shell.right } : null),
    ...(inner.maxWidth != null ? { maxWidth: inner.maxWidth } : null),
    ...(inner.alignSelf != null ? { alignSelf: inner.alignSelf } : null),
    ...(inner.width != null ? { width: inner.width } : null),
  };
}

/** @deprecated Prefer {@link resolveCarouselSlideContentShellStyle}. */
export function contentAlignmentStyle(alignment: CarouselAlignment): ViewStyle {
  return resolveCarouselSlideContentShellStyle(alignment, 'fill');
}

/** Full-height overlay — vertical distribution via internal flex rows. */
export function usesCarouselFullHeightContentOverlay(alignment: CarouselAlignment): boolean {
  return alignment === 'middleMiddle' || alignment === 'middleTop';
}

export function isCarouselContentCentered(alignment: CarouselAlignment): boolean {
  return isCarouselHorizontalCenter(alignment);
}

export type CarouselContentClusterJustify = 'flex-start' | 'center' | 'flex-end';

export interface CarouselContentBlockLayout {
  /** Badges row grows to absorb top space (middleMiddle). */
  badgesRowFlex: number;
  /** Flexible wrapper around title cluster + buttons. */
  contentWrapperFlex: number;
  contentClusterJustify: CarouselContentClusterJustify;
  /** Bottom spacer row (startMiddle, middleMiddle). */
  trailingSpacerFlex: number;
}

/** Maps each Figma ContentBlock structure to flex rows. */
export function resolveCarouselContentBlockLayout(
  alignment: CarouselAlignment
): CarouselContentBlockLayout {
  switch (alignment) {
    case 'startMiddle':
      return {
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-end',
        trailingSpacerFlex: 1,
      };
    case 'middleMiddle':
      return {
        badgesRowFlex: 1,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-end',
        trailingSpacerFlex: 1,
      };
    case 'middleTop':
      return {
        badgesRowFlex: 0,
        contentWrapperFlex: 1,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      };
    case 'middleBottom':
      return {
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      };
    case 'startBottom':
    default:
      return {
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      };
  }
}
