'use client';

import { createContext, useContext } from 'react';
import type { CarouselImageAspectRatio, CarouselOpts } from '../Carousel.shared';

export interface CarouselContextValue {
  emblaRef: (node: HTMLElement | null) => void;
  selectedIndex: number;
  /** Figma `activePage` — 1-based (min 1). */
  activePage: number;
  slideCount: number;
  /** Figma `pageCount` — alias for {@link slideCount}. */
  pageCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  isPlaying: boolean;
  autoPlayEnabled: boolean;
  loop: boolean;
  opts?: CarouselOpts;
  aspectRatio?: CarouselImageAspectRatio;
  height?: string;
  /** Figma `followsAspectRatio` boolean. */
  followsAspectRatio: boolean;
  /** @deprecated Use {@link followsAspectRatio}. */
  followAspectRatio: boolean;
  viewportWidth: number;
  slideWidth: number;
  peekColumnWidthPx: number;
  setViewportWidth: (width: number) => void;
  play: () => void;
  pause: () => void;
  scrollTo: (index: number) => void;
  scrollToPage: (page: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  ariaLabel: string;
}

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error(
      'Carousel parts must be rendered inside <Carousel.Root>. Wrap your Viewport / Track / Slide / Controls in <Carousel.Root aria-label="...">.',
    );
  }
  return ctx;
}
