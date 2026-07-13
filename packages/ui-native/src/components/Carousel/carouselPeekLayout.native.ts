/**
 * carouselPeekLayout.native.ts — Figma `ItemPrev` / `ItemNext` peek geometry.
 *
 * Column = `Margin` (16 @ 360). Inner `pr`/`pl` = `Gutter` (8). Visible image strip = 8px.
 */

import type { ViewStyle } from 'react-native';
import {
  PEEK_COLUMN_WIDTH,
  styles,
} from './Carousel.styles.native';
import type { CarouselPeekMode } from './carouselRootLayout.native';

export { PEEK_VISIBLE_WIDTH } from './Carousel.styles.native';

export type PeekSlideRole = 'prev' | 'next' | 'current' | 'hidden';

/** Internal layout modes — public API only uses {@link CarouselPeekMode}. */
export type CarouselPeekLayoutMode = CarouselPeekMode | 'prev' | 'next';

/** Viewport width reserved for peek columns — one margin column per exposed side. */
export function resolvePeekViewportInset(
  peek: CarouselPeekLayoutMode | undefined,
): number {
  if (!peek || peek === 'none') return 0;
  if (peek === 'both') return PEEK_COLUMN_WIDTH * 2;
  return PEEK_COLUMN_WIDTH;
}

export function resolvePeekTrackPaddingHorizontal(
  peek: CarouselPeekLayoutMode | undefined,
): ViewStyle {
  if (!peek || peek === 'none') return {};
  if (peek === 'both') return { paddingHorizontal: PEEK_COLUMN_WIDTH };
  if (peek === 'prev') return { paddingLeft: PEEK_COLUMN_WIDTH, paddingRight: 0 };
  return { paddingRight: PEEK_COLUMN_WIDTH, paddingLeft: 0 };
}

/** Peek adds margin-column padding; inter-slide gap stays {@link SLIDE_GAP}. */
export function resolveCarouselTrackContentStyle(
  peek: CarouselPeekLayoutMode | undefined,
): ViewStyle {
  if (!peek || peek === 'none') {
    return styles.track;
  }
  return {
    ...styles.track,
    ...resolvePeekTrackPaddingHorizontal(peek),
  };
}

export function resolveCarouselSnapOffset(index: number, slideStride: number): number {
  return index * slideStride;
}
