'use client';

/**
 * CarouselPaginationOnMedia — convenience preset for on-media pagination chrome.
 */

import React from 'react';
import { CarouselControls } from './CarouselControls';
import { CarouselPagination } from './CarouselPagination';
import { CarouselPrevButton } from './CarouselPrevButton';
import { CarouselNextButton } from './CarouselNextButton';
import type { CarouselControlsLayout, CarouselPaginationAlign } from '../Carousel.shared';
import type { CarouselPaginationProps } from './CarouselPagination';
import type { CarouselPrevButtonProps } from './CarouselPrevButton';
import type { CarouselNextButtonProps } from './CarouselNextButton';

export interface CarouselPaginationOnMediaProps {
  layout?: CarouselControlsLayout;
  paginationAlign?: CarouselPaginationAlign;
  paginationProps?: CarouselPaginationProps;
  prevButtonProps?: CarouselPrevButtonProps;
  nextButtonProps?: CarouselNextButtonProps;
  showNav?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function CarouselPaginationOnMedia({
  layout = 'split',
  paginationAlign,
  paginationProps,
  prevButtonProps,
  nextButtonProps,
  showNav = true,
  className,
  style,
  children,
}: CarouselPaginationOnMediaProps) {
  return (
    <CarouselControls
      placement="onMedia"
      layout={layout}
      paginationAlign={paginationAlign}
      className={className}
      style={style}
    >
      <CarouselPagination {...paginationProps} />
      {showNav ? (
        <>
          <CarouselPrevButton {...prevButtonProps} />
          <CarouselNextButton {...nextButtonProps} />
        </>
      ) : null}
      {children}
    </CarouselControls>
  );
}
