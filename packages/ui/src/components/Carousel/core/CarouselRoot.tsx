'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import { CarouselContext } from './Carousel.context';
import { useCarouselContext } from './useCarouselContext';
import {
  resolveCarouselHeightCSSValue,
  resolveCarouselHeightMode,
  resolveCarouselImageAspectRatioCSSValue,
  type CarouselFollowsAspectRatio,
  type CarouselFollowAspectRatio,
  type CarouselImageAspectRatio,
  type CarouselOpts,
} from '../Carousel.shared';

export interface CarouselRootProps {
  'aria-label': string;
  opts?: CarouselOpts;
  loop?: boolean;
  autoPlay?: number | false;
  fullWidth?: boolean;
  aspectRatio?: CarouselImageAspectRatio;
  height?: number | string;
  /**
   * Figma `followsAspectRatio` (default `true`).
   * When `false`, slides use `height` instead of aspect-ratio sizing.
   */
  followsAspectRatio?: CarouselFollowsAspectRatio;
  /** @deprecated Use {@link CarouselRootProps.followsAspectRatio}. */
  followAspectRatio?: CarouselFollowAspectRatio;
  /** Controlled active page — 1-based in React (see MIGRATION.md for Figma deviation notes). */
  activePage?: number;
  /** Uncontrolled initial page — defaults to first slide (`1`). */
  defaultActivePage?: number;
  onActivePageChange?: (page: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function CarouselRoot({
  'aria-label': ariaLabel,
  opts,
  loop,
  autoPlay = false,
  fullWidth,
  aspectRatio,
  height,
  followsAspectRatio,
  followAspectRatio,
  activePage,
  defaultActivePage,
  onActivePageChange,
  className,
  style,
  children,
  ref,
}: CarouselRootProps) {
  const resolvedFollowsAspectRatio = followsAspectRatio ?? followAspectRatio ?? true;

  const carousel = useCarouselContext({
    opts,
    autoPlay,
    loop,
    activePage,
    defaultActivePage,
    onActivePageChange,
  });

  const heightMode = resolveCarouselHeightMode(resolvedFollowsAspectRatio);
  const resolvedHeight =
    height !== undefined ? resolveCarouselHeightCSSValue(height) : undefined;
  const resolvedAspectRatio = aspectRatio ?? '16:9';
  const viewportAspectRatioCss =
    heightMode === 'followsAspectRatio'
      ? resolveCarouselImageAspectRatioCSSValue(resolvedAspectRatio)
      : undefined;

  const rootStyle = {
    ...style,
    ...(viewportAspectRatioCss
      ? ({ '--Carousel-Viewport-Aspect-Ratio': viewportAspectRatioCss } as React.CSSProperties)
      : {}),
    ...(heightMode === 'custom' && resolvedHeight
      ? ({ '--Carousel-Viewport-Height': resolvedHeight } as React.CSSProperties)
      : {}),
  };

  const ctxValue = useMemo(
    () => ({
      ...carousel,
      ariaLabel,
      aspectRatio,
      height: resolvedHeight,
      followsAspectRatio: heightMode === 'followsAspectRatio',
      followAspectRatio: heightMode === 'followsAspectRatio',
    }),
    [carousel, ariaLabel, aspectRatio, resolvedHeight, heightMode],
  );

  return (
    <CarouselContext.Provider value={ctxValue}>
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className={clsx(styles.root, className)}
        style={rootStyle}
        data-fullwidth={fullWidth ? 'true' : undefined}
        data-height-mode={heightMode}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}
