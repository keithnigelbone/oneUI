/**
 * carouselSelectionRailLayout.native.ts — Figma geometry for `.CarouselSelectionRail/*`.
 */

import { tokens } from '@oneui/tokens';
import type { CarouselPeekMode } from './carouselRootLayout.native';
import { PEEK_COLUMN_WIDTH } from './Carousel.styles.native';

/** Figma rail density — `xl` / `2xl` apply only when `onMedia={false}`. */
export type CarouselSelectionRailSize = 's' | 'm' | 'l' | 'xl' | '2xl';

/** Figma item surface — `transparent` on media, `opaque` below media. */
export type CarouselSelectionRailSurface = 'opaque' | 'transparent';

const ITEM_SIZE_BY_TOKEN: Record<CarouselSelectionRailSize, number> = {
  s: tokens.spacing['16'],
  m: tokens.spacing['18'],
  l: tokens.spacing['20'],
  xl: tokens.spacing['24'],
  '2xl': tokens.spacing['28'],
};

const ON_MEDIA_SIZES: CarouselSelectionRailSize[] = ['s', 'm', 'l'];

/** Figma `spacerOnMediaSelectionRail` / rail wrapper height (`2818:51906`). */
export const ON_MEDIA_SELECTION_RAIL_HEIGHT = tokens.spacing['28'];

export function resolveOnMediaSelectionRailInset(onMedia: boolean): number {
  return onMedia ? ON_MEDIA_SELECTION_RAIL_HEIGHT : 0;
}

/**
 * Horizontal inset for the thumbnail rail.
 * On-media: page margin (`2818:50556`).
 * Below-media without peek: `grid/margin` (`2818:53153`).
 * Below-media with peek: matches active slide left edge (`2818:54349`).
 */
export function resolveCarouselSelectionRailPaddingHorizontal(
  onMedia: boolean,
  peekAlignInset?: number,
): number {
  if (onMedia) return tokens.spacing.Margin;
  if (peekAlignInset != null && peekAlignInset > 0) return peekAlignInset;
  return tokens.spacing.Margin;
}

/** Left inset of the active slide when peek reveals adjacent slides. */
export function resolveCarouselSelectionRailPeekAlignInset(
  onMedia: boolean,
  peek: CarouselPeekMode | 'prev' | 'next' | undefined,
  viewportWidth: number,
  slideWidth: number,
): number | undefined {
  if (onMedia || !peek || peek === 'none' || viewportWidth <= 0 || slideWidth <= 0) {
    return undefined;
  }
  if (peek === 'prev') return PEEK_COLUMN_WIDTH;
  if (peek === 'next') return 0;
  return (viewportWidth - slideWidth) / 2;
}

export function resolveCarouselSelectionRailSize(
  size: CarouselSelectionRailSize,
  onMedia: boolean,
): CarouselSelectionRailSize {
  if (!onMedia) return size;
  return ON_MEDIA_SIZES.includes(size) ? size : 'l';
}

export function resolveCarouselSelectionRailSurface(
  onMedia: boolean,
): CarouselSelectionRailSurface {
  return onMedia ? 'transparent' : 'opaque';
}

export function resolveCarouselSelectionRailItemSize(
  size: CarouselSelectionRailSize,
): number {
  return ITEM_SIZE_BY_TOKEN[size];
}

/**
 * Clamp a rail index into `[0, count - 1]`. Keeps the thumbnail rail's active
 * item in sync with the main carousel even when a stale/out-of-range index is
 * pushed in (e.g. after slides are added/removed). Empty rails clamp to `0`.
 */
export function clampSelectionRailIndex(index: number, count: number): number {
  const max = Math.max(0, count - 1);
  return Math.min(Math.max(index, 0), max);
}
