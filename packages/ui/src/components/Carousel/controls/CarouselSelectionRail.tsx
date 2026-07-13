'use client';

/**
 * CarouselSelectionRail.tsx — Figma `.CarouselSelectionRail/*` thumbnail rail.
 */

import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import { useCarousel } from '../core/Carousel.context';
import { tagCarouselControlPart } from './carouselControlsParts';
import {
  clampSelectionRailIndex,
  resolveCarouselSelectionRailItemSizeToken,
  resolveCarouselSelectionRailPaddingInline,
  resolveCarouselSelectionRailPeekAlignInset,
  resolveCarouselSelectionRailSize,
  resolveCarouselSelectionRailSurface,
  type CarouselSelectionRailSize,
  type CarouselSelectionRailSurface,
} from '../utils/carouselSelectionRailLayout';
import type { CarouselOpts } from '../Carousel.shared';

export type { CarouselSelectionRailSize, CarouselSelectionRailSurface };

export interface CarouselSelectionRailItemData {
  src: string;
  alt: string;
}

export interface CarouselSelectionRailItemProps {
  src: string;
  alt: string;
  active?: boolean;
  /** Defaults from parent rail `onMedia` when omitted. */
  surface?: CarouselSelectionRailSurface;
  sizeToken: string;
  onPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CarouselSelectionRailProps {
  /**
   * `true` → on-media strip (`surface=transparent`); `false` → below media.
   * Inside `Carousel.SelectionRail` this is injected from the parent
   * `Carousel.Controls` `placement` — don't set it manually there.
   */
  onMedia?: boolean;
  size?: CarouselSelectionRailSize;
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  items?: CarouselSelectionRailItemData[];
  'aria-label'?: string;
  /** When peek is on, aligns below-media rail with the active slide left edge (px). */
  peekAlignInset?: number;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

export interface CarouselSelectionRailListProps
  extends Omit<CarouselSelectionRailProps, 'activeIndex' | 'onActiveIndexChange'> {
  /** Thumbnail sources — one per slide. */
  items: CarouselSelectionRailItemData[];
}

function useSelectionRailIndex(
  props: Pick<
    CarouselSelectionRailProps,
    'activeIndex' | 'defaultActiveIndex' | 'onActiveIndexChange' | 'items'
  >,
) {
  const count = props.items?.length ?? 0;
  const isControlled = props.activeIndex !== undefined;
  const [internal, setInternal] = useState(props.defaultActiveIndex ?? 0);
  const activeIndex = isControlled ? (props.activeIndex ?? 0) : internal;
  const clamped = clampSelectionRailIndex(activeIndex, count);

  const setActive = useCallback(
    (index: number) => {
      const next = clampSelectionRailIndex(index, count);
      if (!isControlled) setInternal(next);
      props.onActiveIndexChange?.(next);
    },
    [isControlled, count, props],
  );

  return { clamped, setActive, count };
}

function SelectionRailItem({
  src,
  alt,
  active = false,
  surface = 'opaque',
  sizeToken,
  onPress,
  className,
  style,
}: CarouselSelectionRailItemProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      aria-pressed={active}
      onClick={onPress}
      className={clsx(styles.selectionRailItem, className)}
      style={{
        ...style,
        width: sizeToken,
        height: sizeToken,
      }}
      data-active={active ? 'true' : undefined}
      data-surface={surface}
    >
      <span className={styles.selectionRailImageFrame}>
        <img
          src={src}
          alt=""
          aria-hidden
          className={styles.selectionRailImage}
          loading="lazy"
          decoding="async"
        />
      </span>
      {active ? <span className={styles.selectionRailActiveRing} aria-hidden /> : null}
    </button>
  );
}

function CarouselSelectionRailRoot({
  onMedia = false,
  size = 'm',
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  items = [],
  'aria-label': ariaLabel = 'Slide thumbnails',
  peekAlignInset,
  className,
  style,
  ref,
}: CarouselSelectionRailProps) {
  const resolvedSize = resolveCarouselSelectionRailSize(size, onMedia);
  const surface = resolveCarouselSelectionRailSurface(onMedia);
  const itemSizeToken = resolveCarouselSelectionRailItemSizeToken(resolvedSize);
  const { clamped, setActive, count } = useSelectionRailIndex({
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    items,
  });

  const railStyle = useMemo<React.CSSProperties>(
    () => ({
      paddingInline: resolveCarouselSelectionRailPaddingInline(onMedia, peekAlignInset),
      ...(onMedia ? { height: 'var(--Spacing-28)' } : {}),
    }),
    [onMedia, peekAlignInset],
  );

  if (count === 0) return null;

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        styles.selectionRail,
        onMedia ? styles.selectionRailOnMedia : styles.selectionRailBelow,
        className,
      )}
      style={{ ...railStyle, ...style }}
      data-on-media={onMedia ? 'true' : undefined}
    >
      {items.map((item, index) => (
        <SelectionRailItem
          key={`${item.alt}-${index}`}
          src={item.src}
          alt={item.alt}
          active={index === clamped}
          surface={surface}
          sizeToken={itemSizeToken}
          onPress={() => setActive(index)}
        />
      ))}
    </div>
  );
}

/** Carousel-context peer of `Carousel.IndicatorList` — drives `scrollTo` from rail taps. */
export function CarouselSelectionRailList({
  items,
  onMedia = false,
  size = 'm',
  'aria-label': ariaLabel,
  className,
  style,
  ref,
}: CarouselSelectionRailListProps) {
  const { selectedIndex, scrollTo, opts, viewportWidth, slideWidth, peekColumnWidthPx } =
    useCarousel();
  const peekAlignInset = resolveCarouselSelectionRailPeekAlignInset(
    onMedia,
    opts?.peek as CarouselOpts['peek'],
    viewportWidth,
    slideWidth,
    peekColumnWidthPx,
  );
  if (items.length === 0) return null;
  return (
    <CarouselSelectionRailRoot
      ref={ref}
      onMedia={onMedia}
      size={size}
      activeIndex={selectedIndex}
      onActiveIndexChange={scrollTo}
      peekAlignInset={peekAlignInset}
      items={items}
      aria-label={ariaLabel ?? 'Slide thumbnails'}
      className={className}
      style={style}
    />
  );
}

export const CarouselSelectionRail = Object.assign(CarouselSelectionRailRoot, {
  Item: SelectionRailItem,
});

tagCarouselControlPart(CarouselSelectionRailRoot, 'selection-rail');
tagCarouselControlPart(CarouselSelectionRailList, 'selection-rail');
