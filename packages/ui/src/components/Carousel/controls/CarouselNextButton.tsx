'use client';

import React from 'react';
import { IconButton } from '../../IconButton/IconButton';
import { useCarousel } from '../core/Carousel.context';
import { tagCarouselControlPart } from './carouselControlsParts';
import type { IconButtonAppearance, IconButtonSize, IconButtonAttention } from '../../IconButton/IconButton.shared';

export interface CarouselNextButtonProps {
  size?: IconButtonSize;
  attention?: IconButtonAttention;
  appearance?: IconButtonAppearance;
  'aria-label'?: string;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function CarouselNextButton({
  size = 'm',
  attention = 'medium',
  appearance,
  'aria-label': ariaLabel,
  className,
  ref,
}: CarouselNextButtonProps) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <IconButton
      ref={ref}
      icon="chevronRight"
      attention={attention}
      size={size}
      appearance={appearance}
      aria-label={ariaLabel ?? 'Next slide'}
      aria-disabled={!canScrollNext}
      disabled={!canScrollNext}
      onPress={scrollNext}
      className={className}
    />
  );
}

tagCarouselControlPart(CarouselNextButton, 'nav-next');
