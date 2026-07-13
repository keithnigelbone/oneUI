'use client';

import React from 'react';
import { IconButton } from '../../IconButton/IconButton';
import { useCarousel } from '../core/Carousel.context';
import { tagCarouselControlPart } from './carouselControlsParts';
import type { IconButtonAppearance, IconButtonSize, IconButtonAttention } from '../../IconButton/IconButton.shared';

export interface CarouselPlayButtonProps {
  size?: IconButtonSize;
  attention?: IconButtonAttention;
  appearance?: IconButtonAppearance;
  /** aria-label override; defaults to "Pause autoplay" / "Start autoplay". */
  'aria-label'?: string;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export function CarouselPlayButton({
  size = 'm',
  attention = 'medium',
  appearance,
  'aria-label': ariaLabel,
  className,
  ref,
}: CarouselPlayButtonProps) {
  const { isPlaying, play, pause, autoPlayEnabled } = useCarousel();
  if (!autoPlayEnabled) return null;
  const label = ariaLabel ?? (isPlaying ? 'Pause autoplay' : 'Start autoplay');
  const icon = isPlaying ? 'pause' : 'play';
  return (
    <IconButton
      ref={ref}
      icon={icon}
      attention={attention}
      size={size}
      appearance={appearance}
      aria-label={label}
      aria-pressed={isPlaying}
      onPress={() => (isPlaying ? pause() : play())}
      className={className}
    />
  );
}

tagCarouselControlPart(CarouselPlayButton, 'play');
