'use client';

import React, { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import type {
  CarouselControlsLayout,
  CarouselControlsPlacement,
  CarouselPaginationAlign,
} from '../Carousel.shared';
import {
  hasNavArrowChild,
  hasSelectionRailChild,
  isCarouselSelectionRailChild,
  orderOnMediaControlChildren,
} from './carouselControlsParts';

export interface CarouselControlsProps {
  placement?: CarouselControlsPlacement;
  /**
   * `center` (default): all children grouped, centered.
   * `split`: first child anchored to start, the rest grouped at the end —
   * use to put indicators on the left and prev/next on the right.
   */
  layout?: CarouselControlsLayout;
  /** On-media pagination alignment — Figma `paginationDots=middle|end`. */
  paginationAlign?: CarouselPaginationAlign;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function resolveCarouselControlsLayout(
  layout: CarouselControlsLayout,
  hasNavButtons: boolean,
): CarouselControlsLayout {
  if (layout === 'split' && !hasNavButtons) return 'center';
  return layout;
}

function resolveCarouselPaginationAlign(
  placement: CarouselControlsPlacement,
  align: CarouselPaginationAlign | undefined,
): CarouselPaginationAlign {
  if (placement === 'onMedia') return align ?? 'middle';
  return align ?? 'start';
}

export function CarouselControls({
  placement = 'below',
  layout = 'center',
  paginationAlign,
  className,
  style,
  children,
  ref,
}: CarouselControlsProps) {
  const isOnMedia = placement === 'onMedia';
  const controlChildren = Children.toArray(children);
  const hasNavButtons = hasNavArrowChild(controlChildren);
  const effectiveLayout = resolveCarouselControlsLayout(layout, hasNavButtons);
  const resolvedPaginationAlign = resolveCarouselPaginationAlign(placement, paginationAlign);
  const hasRail = hasSelectionRailChild(controlChildren);
  const hasOnMediaRail = isOnMedia && hasRail;
  const hasBelowMediaRail = !isOnMedia && hasRail;
  const childArray = hasOnMediaRail
    ? orderOnMediaControlChildren(controlChildren)
    : controlChildren;

  const controlsStyle: React.CSSProperties = {
    ...(hasBelowMediaRail && effectiveLayout === 'split' && hasNavButtons
      ? { gap: 'var(--Spacing-1)' }
      : {}),
    ...style,
  };

  const decorated = childArray.map((child, index) => {
    if (!isValidElement(child)) return child;
    const renderedChild = isCarouselSelectionRailChild(child)
      ? cloneElement(child as React.ReactElement<{ onMedia?: boolean }>, { onMedia: isOnMedia })
      : child;

    const childClass = clsx(
      hasBelowMediaRail && isCarouselSelectionRailChild(child)
        ? styles.controlsBelowSelectionRailChild
        : undefined,
      effectiveLayout === 'split' && index === 0
        ? isOnMedia
          ? styles.controlsOnMediaSplitFirst
          : styles.controlsSplitFirst
        : undefined,
    );

    if (!childClass) return renderedChild;
    return (
      <div key={child.key ?? `ctrl-${index}`} className={childClass}>
        {renderedChild}
      </div>
    );
  });

  return (
    <div
      ref={ref}
      className={clsx(
        styles.controls,
        hasOnMediaRail ? styles.controlsOnMediaSelectionRail : undefined,
        hasBelowMediaRail
          ? hasNavButtons && effectiveLayout === 'split'
            ? styles.controlsBelowSelectionRailWithNav
            : styles.controlsBelowSelectionRail
          : undefined,
        className,
      )}
      style={controlsStyle}
      data-placement={placement}
      data-layout={effectiveLayout}
      data-pagination-align={isOnMedia ? resolvedPaginationAlign : undefined}
      data-surface={isOnMedia ? 'bold' : undefined}
    >
      {decorated}
    </div>
  );
}
