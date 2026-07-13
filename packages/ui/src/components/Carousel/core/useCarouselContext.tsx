'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import {
  carouselIndexToPage,
  carouselPageToIndex,
  clampCarouselActivePage,
  resolveCarouselLoop,
  type CarouselOpts,
} from '../Carousel.shared';

interface UseCarouselContextArgs {
  opts?: CarouselOpts;
  autoPlay?: number | false;
  loop?: boolean;
  /** Figma 1-based page (min 1). */
  activePage?: number;
  /** Figma 1-based page (min 1). */
  defaultActivePage?: number;
  onActivePageChange?: (page: number) => void;
}

interface UseCarouselContextReturn {
  emblaRef: (node: HTMLElement | null) => void;
  selectedIndex: number;
  /** Figma `activePage` — 1-based (min 1). */
  activePage: number;
  slideCount: number;
  /** Figma `pageCount` — alias for {@link slideCount}. */
  pageCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  isPlaying: boolean;
  autoPlayEnabled: boolean;
  loop: boolean;
  opts?: CarouselOpts;
  viewportWidth: number;
  slideWidth: number;
  peekColumnWidthPx: number;
  setViewportWidth: (width: number) => void;
  play: () => void;
  pause: () => void;
  /** Scroll to Embla snap index (0-based). */
  scrollTo: (index: number) => void;
  /** Scroll to Figma page (1-based). */
  scrollToPage: (page: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
}

export function useCarouselContext({
  opts,
  autoPlay,
  loop: loopProp,
  activePage: activePageProp,
  defaultActivePage = 1,
  onActivePageChange,
}: UseCarouselContextArgs): UseCarouselContextReturn {
  const loop = resolveCarouselLoop(loopProp, opts);

  const loopOpt = loop;
  const align = opts?.align;
  const dragFree = opts?.dragFree;
  const slidesToScroll = opts?.slidesToScroll;
  const watchDrag = opts?.watchDrag;
  const direction = opts?.direction;

  const emblaOptions = useMemo<EmblaOptionsType>(() => {
    const o: EmblaOptionsType = {};
    if (loopOpt !== undefined) o.loop = loopOpt;
    if (align !== undefined) o.align = align;
    if (dragFree !== undefined) o.dragFree = dragFree;
    if (slidesToScroll !== undefined) o.slidesToScroll = slidesToScroll;
    if (watchDrag !== undefined) o.watchDrag = watchDrag;
    if (direction !== undefined) o.direction = direction;
    return o;
  }, [loopOpt, align, dragFree, slidesToScroll, watchDrag, direction]);

  const plugins = useMemo(() => {
    if (!autoPlay) return [];
    return [Autoplay({ delay: autoPlay, stopOnInteraction: true, stopOnMouseEnter: true })];
  }, [autoPlay]);

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const defaultIndex = carouselPageToIndex(defaultActivePage, 1);
  const isControlled = activePageProp !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [slideCount, setSlideCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(Boolean(autoPlay));
  const [viewportWidth, setViewportWidth] = useState(0);
  const [peekColumnWidthPx, setPeekColumnWidthPx] = useState(16);

  const peek = opts?.peek ?? 'none';
  const slideWidth = useMemo(() => {
    if (viewportWidth <= 0) return 0;
    if (peek === 'none') return viewportWidth;
    const peekTotal = peekColumnWidthPx * 2 || 48;
    return Math.max(0, viewportWidth - peekTotal);
  }, [viewportWidth, peek, peekColumnWidthPx]);

  const sync = useCallback(
    (api: EmblaCarouselType) => {
      const snapCount = api.scrollSnapList().length;
      const nodeCount = api.slideNodes().length;
      const count = snapCount || nodeCount;
      const index = clampCarouselActivePage(api.selectedScrollSnap(), count);
      const page = carouselIndexToPage(index, count);
      setSelectedIndex(index);
      if (!isControlled) setInternalIndex(index);
      onActivePageChange?.(page);
      setSlideCount(count);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    },
    [isControlled, onActivePageChange],
  );

  useEffect(() => {
    if (!emblaApi) return;
    sync(emblaApi);

    const onSelect = () => sync(emblaApi);
    const onReInit = () => sync(emblaApi);

    emblaApi.on('init', onSelect);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onReInit);

    return () => {
      emblaApi.off('init', onSelect);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, sync]);

  useEffect(() => {
    if (!emblaApi || activePageProp === undefined) return;
    const count = slideCount || emblaApi.slideNodes().length;
    const index = carouselPageToIndex(activePageProp, count);
    if (emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi, activePageProp, slideCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const probe = document.createElement('div');
    probe.style.width = 'var(--Spacing-Margin, var(--Spacing-4-5))';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    if (width > 0) setPeekColumnWidthPx(width);
    document.body.removeChild(probe);
  }, []);

  const play = useCallback(() => {
    const ap = emblaApi?.plugins().autoplay;
    if (!ap) return;
    ap.play();
    setIsPlaying(true);
  }, [emblaApi]);

  const pause = useCallback(() => {
    const ap = emblaApi?.plugins().autoplay;
    if (!ap) return;
    ap.stop();
    setIsPlaying(false);
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      const target = clampCarouselActivePage(index, slideCount);
      emblaApi?.scrollTo(target);
      if (!isControlled) setInternalIndex(target);
      onActivePageChange?.(carouselIndexToPage(target, slideCount));
    },
    [emblaApi, isControlled, onActivePageChange, slideCount],
  );

  const scrollToPage = useCallback(
    (page: number) => {
      scrollTo(carouselPageToIndex(page, slideCount));
    },
    [scrollTo, slideCount],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const activePage =
    isControlled && activePageProp !== undefined
      ? Math.min(Math.max(Math.trunc(activePageProp), 1), Math.max(slideCount, 1))
      : carouselIndexToPage(internalIndex, slideCount || 1);

  return {
    emblaRef,
    selectedIndex,
    activePage,
    slideCount,
    pageCount: slideCount,
    canScrollPrev,
    canScrollNext,
    isPlaying,
    autoPlayEnabled: Boolean(autoPlay),
    loop,
    opts,
    viewportWidth,
    slideWidth,
    peekColumnWidthPx,
    setViewportWidth,
    play,
    pause,
    scrollTo,
    scrollToPage,
    scrollPrev,
    scrollNext,
  };
}
