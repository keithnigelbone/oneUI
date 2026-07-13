'use client';

import React from 'react';
import { IconButton } from '../../IconButton/IconButton';
import { useCarousel } from '../core/Carousel.context';
import { tagCarouselControlPart } from './carouselControlsParts';
import type { IconButtonAppearance, IconButtonSize, IconButtonAttention } from '../../IconButton/IconButton.shared';

export interface CarouselPrevButtonProps {
  size?: IconButtonSize;
  attention?: IconButtonAttention;
  appearance?: IconButtonAppearance;
  /** Override the default "Previous slide" aria-label. */
  'aria-label'?: string;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function CarouselPrevButton({
  size = 'm',
  attention = 'medium',
  appearance,
  'aria-label': ariaLabel,
  className,
  ref,
}: CarouselPrevButtonProps) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <IconButton
      ref={ref}
      icon="chevronLeft"
      attention={attention}
      size={size}
      appearance={appearance}
      aria-label={ariaLabel ?? 'Previous slide'}
      aria-disabled={!canScrollPrev}
      disabled={!canScrollPrev}
      onPress={scrollPrev}
      className={className}
    />
  );
}

tagCarouselControlPart(CarouselPrevButton, 'nav-prev');
