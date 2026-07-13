'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import { useCarousel } from './Carousel.context';
import type { CarouselOpts } from '../Carousel.shared';

export interface CarouselViewportProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  /**
   * Optional peek hint propagated to data-attr for CSS to size the slide
   * flex-basis. The runtime peek behaviour itself is controlled by the
   * `Root.opts.peek` flag.
   */
  peek?: CarouselOpts['peek'];
}

// No forwardRef: Embla's emblaRef must be the sole ref on the overflow container.
export function CarouselViewport({ className, style, children, peek }: CarouselViewportProps) {
  const { emblaRef, setViewportWidth, slideWidth, opts } = useCarousel();
  const localRef = useRef<HTMLDivElement | null>(null);
  const resolvedPeek = peek ?? opts?.peek ?? 'none';

  const measureViewport = (node: HTMLDivElement | null) => {
    if (!node) return;
    const width = node.getBoundingClientRect().width;
    if (width > 0) setViewportWidth(width);
  };

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node;
    emblaRef(node);
    measureViewport(node);
  };

  useLayoutEffect(() => {
    measureViewport(localRef.current);
  }, [setViewportWidth]);

  useEffect(() => {
    const node = localRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setViewportWidth(width);
    });
    observer.observe(node);
    measureViewport(node);

    return () => observer.disconnect();
  }, [setViewportWidth]);

  const viewportStyle = {
    ...style,
    ...(slideWidth > 0
      ? ({ '--Carousel-Slide-Width': `${slideWidth}px` } as React.CSSProperties)
      : {}),
  };

  return (
    <div
      ref={setRefs}
      className={clsx(styles.viewport, className)}
      style={viewportStyle}
      data-peek={resolvedPeek}
    >
      {children}
    </div>
  );
}
