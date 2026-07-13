'use client';

import React from 'react';
import { PaginationDots } from '../../PaginationDots/PaginationDots';
import type { PaginationDotsAppearance } from '../../PaginationDots/PaginationDots.shared';
import { useCarousel } from '../core/Carousel.context';
import { tagCarouselControlPart } from './carouselControlsParts';

export interface CarouselIndicatorListProps {
  /** Multi-accent appearance role. Default: 'primary'. */
  appearance?: PaginationDotsAppearance;
  /** Window-style loop indicator (Instagram pattern). */
  loop?: boolean;
  /** aria-label for the indicator group. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

export function CarouselIndicatorList({
  appearance = 'auto',
  loop,
  'aria-label': ariaLabel,
  className,
  style,
  ref,
}: CarouselIndicatorListProps) {
  const { slideCount, selectedIndex, scrollTo, loop: carouselLoop } = useCarousel();
  if (slideCount === 0) return null;
  return (
    <PaginationDots
      ref={ref}
      pageCount={slideCount}
      activeIndex={selectedIndex}
      onActiveIndexChange={scrollTo}
      appearance={appearance}
      loop={loop ?? carouselLoop}
      aria-label={ariaLabel ?? 'Slide indicators'}
      className={className}
      style={style}
    />
  );
}

tagCarouselControlPart(CarouselIndicatorList, 'pagination');
