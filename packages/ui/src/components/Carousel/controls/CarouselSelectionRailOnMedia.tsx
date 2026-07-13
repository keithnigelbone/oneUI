'use client';

/**
 * CarouselSelectionRailOnMedia — convenience preset for on-media thumbnail rail.
 */

import React from 'react';
import { CarouselControls } from './CarouselControls';
import {
  CarouselSelectionRailList,
  type CarouselSelectionRailListProps,
} from './CarouselSelectionRail';
import { CarouselPrevButton } from './CarouselPrevButton';
import { CarouselNextButton } from './CarouselNextButton';
import type { CarouselControlsLayout } from '../Carousel.shared';
import type { CarouselPrevButtonProps } from './CarouselPrevButton';
import type { CarouselNextButtonProps } from './CarouselNextButton';

export interface CarouselSelectionRailOnMediaProps
  extends Omit<CarouselSelectionRailListProps, 'onMedia'> {
  layout?: CarouselControlsLayout;
  prevButtonProps?: CarouselPrevButtonProps;
  nextButtonProps?: CarouselNextButtonProps;
  showNav?: boolean;
  controlsClassName?: string;
  controlsStyle?: React.CSSProperties;
}

export function CarouselSelectionRailOnMedia({
  layout = 'split',
  prevButtonProps,
  nextButtonProps,
  showNav = true,
  controlsClassName,
  controlsStyle,
  ...railProps
}: CarouselSelectionRailOnMediaProps) {
  return (
    <CarouselControls
      placement="onMedia"
      layout={layout}
      className={controlsClassName}
      style={controlsStyle}
    >
      <CarouselSelectionRailList {...railProps} />
      {showNav ? (
        <>
          <CarouselPrevButton {...prevButtonProps} />
          <CarouselNextButton {...nextButtonProps} />
        </>
      ) : null}
    </CarouselControls>
  );
}
