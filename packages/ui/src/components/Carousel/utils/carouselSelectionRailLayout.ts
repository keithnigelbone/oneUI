/**
 * carouselSelectionRailLayout.ts — Figma geometry for `.CarouselSelectionRail/*`.
 */

import type { CarouselOpts } from '../Carousel.shared';

/** Figma rail density — `xl` / `2xl` apply only when `onMedia={false}`. */
export type CarouselSelectionRailSize = 's' | 'm' | 'l' | 'xl' | '2xl';

/** Figma item surface — `transparent` on media, `opaque` below media. */
export type CarouselSelectionRailSurface = 'opaque' | 'transparent';

const ITEM_SIZE_TOKEN: Record<CarouselSelectionRailSize, string> = {
  s: 'var(--Spacing-16)',
  m: 'var(--Spacing-18)',
  l: 'var(--Spacing-20)',
  xl: 'var(--Spacing-24)',
  '2xl': 'var(--Spacing-28)',
};

const ON_MEDIA_SIZES: CarouselSelectionRailSize[] = ['s', 'm', 'l'];

/** Figma `spacerOnMediaSelectionRail` / rail wrapper height (`2818:51906`). */
export const ON_MEDIA_SELECTION_RAIL_HEIGHT = 'var(--Spacing-28)';

/** Figma `ItemPrev` / `ItemNext` column width — `grid/margin`. */
export const PEEK_COLUMN_WIDTH_CSS = 'var(--Spacing-Margin, var(--Spacing-4-5))';

export function resolveOnMediaSelectionRailInset(onMedia: boolean): string {
  return onMedia ? ON_MEDIA_SELECTION_RAIL_HEIGHT : '0';
}

/**
 * Horizontal inset for the thumbnail rail (CSS value).
 * On-media: page margin (`2818:50556`).
 * Below-media without peek: `grid/margin` (`2818:53153`).
 * Below-media with peek: matches active slide left edge (`2818:54349`).
 */
export function resolveCarouselSelectionRailPaddingInline(
  onMedia: boolean,
  peekAlignInsetPx?: number,
): string {
  if (onMedia) return 'var(--Spacing-Margin, var(--Spacing-4-5))';
  if (peekAlignInsetPx != null && peekAlignInsetPx > 0) {
    return `${peekAlignInsetPx}px`;
  }
  return 'var(--Spacing-Margin, var(--Spacing-4-5))';
}

/** Left inset of the active slide when peek reveals adjacent slides (px). */
export function resolveCarouselSelectionRailPeekAlignInset(
  onMedia: boolean,
  peek: CarouselOpts['peek'] | undefined,
  viewportWidth: number,
  slideWidth: number,
  peekColumnWidthPx: number,
): number | undefined {
  if (onMedia || !peek || peek === 'none' || viewportWidth <= 0 || slideWidth <= 0) {
    return undefined;
  }
  if (peek === 'prev') return peekColumnWidthPx;
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

export function resolveCarouselSelectionRailItemSizeToken(
  size: CarouselSelectionRailSize,
): string {
  return ITEM_SIZE_TOKEN[size];
}

export function clampSelectionRailIndex(index: number, count: number): number {
  const max = Math.max(0, count - 1);
  return Math.min(Math.max(index, 0), max);
}
