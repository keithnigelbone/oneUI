'use client';

/**
 * CarouselPagination — semantic alias for `Carousel.IndicatorList` (Figma `pagination`).
 */

import { CarouselIndicatorList } from './CarouselIndicatorList';
import type { CarouselIndicatorListProps } from './CarouselIndicatorList';
import { CarouselPlayButton } from './CarouselPlayButton';
import { tagCarouselControlPart } from './carouselControlsParts';

export interface CarouselPaginationProps extends CarouselIndicatorListProps {
  /** Figma `autoplay` — render play/pause beside indicators when root `autoPlay` is set. */
  autoplay?: boolean;
}

export function CarouselPagination({ autoplay, ...props }: CarouselPaginationProps) {
  if (!autoplay) return <CarouselIndicatorList {...props} />;
  return (
    <>
      <CarouselIndicatorList {...props} />
      <CarouselPlayButton />
    </>
  );
}

tagCarouselControlPart(CarouselPagination, 'pagination');
