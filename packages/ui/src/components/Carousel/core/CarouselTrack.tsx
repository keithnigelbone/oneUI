'use client';

import React, { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import { useCarousel } from './Carousel.context';

export interface CarouselTrackProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function CarouselTrack({ className, style, children, ref }: CarouselTrackProps) {
  const { isPlaying, slideCount } = useCarousel();

  // Inject `aria-label="N of M"` into each Slide child so assistive tech
  // can announce position. Consumer-supplied aria-label always wins.
  const childArray = Children.toArray(children);
  const total = slideCount || childArray.filter(isValidElement).length;
  let position = 0;
  const decorated = childArray.map((child) => {
    if (!isValidElement(child)) return child;
    position += 1;
    const existing = (child.props as { 'aria-label'?: string })['aria-label'];
    return cloneElement(child as React.ReactElement<{ 'aria-label'?: string }>, {
      'aria-label': existing ?? `${position} of ${total}`,
    });
  });

  return (
    <div
      ref={ref}
      className={clsx(styles.track, className)}
      style={style}
      aria-live={isPlaying ? 'off' : 'polite'}
      aria-atomic="false"
    >
      {decorated}
    </div>
  );
}
