/**
 * Carousel interface (native)
 *
 * Mirrors `packages/ui/src/components/Carousel/Carousel.shared.ts` and the
 * compound micropattern props on web subcomponents. Native replaces Embla
 * with a horizontal `ScrollView` pager while preserving the public API.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { ImageSourcePropType, ScrollView, ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { IconButtonAppearance, IconButtonAttention, IconButtonSize } from '../IconButton/interface';
import type { PaginationDotsAppearance } from '../PaginationDots/interface';
import type { ScrimProps } from '../Scrim/interface';
import type { CarouselPeekMode } from './carouselRootLayout.native';

export type CarouselAlign = 'start' | 'center' | 'end';

export interface CarouselOpts {
  loop?: boolean;
  align?: CarouselAlign;
  dragFree?: boolean;
  slidesToScroll?: number | 'auto';
  watchDrag?: boolean;
  direction?: 'ltr' | 'rtl';
  slidesPerView?: number;
}

/** Root `loop` prop wins over `opts.loop`. */
export function resolveCarouselLoop(loopProp?: boolean, opts?: CarouselOpts): boolean {
  return loopProp ?? opts?.loop ?? false;
}

export type CarouselAlignment =
  | 'startBottom'
  | 'startMiddle'
  | 'middleBottom'
  | 'middleMiddle'
  | 'middleTop';

export type CarouselImageAspectRatio =
  | '1:2'
  | '9:16'
  | '3:4'
  | '1:1'
  | '4:3'
  | '5:3'
  | '16:9'
  | '2:1'
  | '21:9'
  | 'flexible';

/** Figma `.CarouselImage/*` variants in design-file order (plus `flexible` = auto). */
export const CAROUSEL_IMAGE_ASPECT_RATIOS = [
  '1:2',
  '9:16',
  '3:4',
  '1:1',
  '4:3',
  '5:3',
  '16:9',
  '2:1',
  '21:9',
  'flexible',
] as const satisfies readonly CarouselImageAspectRatio[];

/** Native default — Figma mobile carousel frame (`2775:10379` / `360×480`). */
export const CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO = '3:4' as const satisfies CarouselImageAspectRatio;

/** @deprecated Use {@link CarouselImageAspectRatio} — ratios belong on `Slide.Image`, not `Slide`. */
export type CarouselAspectRatio = CarouselImageAspectRatio;

/** @deprecated Use {@link CAROUSEL_IMAGE_ASPECT_RATIOS}. */
export const CAROUSEL_ASPECT_RATIOS = CAROUSEL_IMAGE_ASPECT_RATIOS;

export type CarouselContentWidth = 'fill' | 's' | 'm' | 'l';

export type CarouselButtonOrientation = 'horizontal' | 'vertical';

export type CarouselButtonWidth = 'hug' | 'wide';

export type CarouselCornerPlacement = 'start' | 'end';

export type CarouselControlsPlacement = 'below' | 'onMedia';

export type CarouselControlsLayout = 'center' | 'split';

/** Figma `paginationDots` position — on-media only (`2775:10745`). */
export type CarouselPaginationAlign = 'start' | 'middle' | 'end';

export type CarouselSurface = SurfaceToken;

export type CarouselAppearance = ComponentAppearance;

export type { ComponentAppearance };

/** Default {@link Scrim} props for `Carousel.Item.Image` — bottom fade over media (Figma `scrim=true`). */
export const CAROUSEL_SLIDE_SCRIM_PROPS = {
  position: 'bottom',
  size: 'XL',
  attention: 'high',
  variant: 'gradient',
} as const satisfies Pick<ScrimProps, 'position' | 'size' | 'attention' | 'variant'>;

/**
 * Slide image scrim — `true` for {@link CAROUSEL_SLIDE_SCRIM_PROPS}, or any
 * {@link ScrimProps} (`position`, `size`, `attention`, `variant`, overlay, …).
 */
export type CarouselSlideScrim = boolean | ScrimProps;

export function resolveCarouselSlideScrimProps(
  scrim: CarouselSlideScrim | undefined,
): ScrimProps | null {
  if (!scrim) return null;
  if (scrim === true) return { ...CAROUSEL_SLIDE_SCRIM_PROPS };
  return scrim;
}

// ─── Root ────────────────────────────────────────────────────────────────────

export interface CarouselRootProps {
  'aria-label': string;
  opts?: CarouselOpts;
  /**
   * When `true`, prev/next navigation and autoplay wrap from last slide to first.
   * Takes precedence over `opts.loop` when both are set.
   */
  loop?: boolean;
  autoPlay?: number | false;
  fullWidth?: boolean;
  /**
   * Shared media aspect ratio for every slide — Figma `.CarouselImage/*`.
   * When `flexible`, use {@link CarouselRootProps.height} or {@link CarouselSlideProps.height}
   * (default {@link CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT}, min {@link CAROUSEL_FLEXIBLE_HEIGHT_MIN}).
   * Override per slide on {@link CarouselSlideImageProps.aspectRatio}.
   * Default {@link CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO}.
   */
  aspectRatio?: CarouselImageAspectRatio;
  /**
   * Shared slide height in px when `aspectRatio` is `flexible` (or custom frame for fixed ratios).
   * Slide-level `height` overrides. Validated: positive integers, min {@link CAROUSEL_FLEXIBLE_HEIGHT_MIN}.
   */
  height?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  children: ReactNode;
}

// ─── Track ─────────────────────────────────────────────────────────────────

export interface CarouselTrackProps {
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

// ─── Slide parts ───────────────────────────────────────────────────────────

export interface CarouselSlideProps {
  /**
   * Per-slide height override — falls back to Root {@link CarouselRootProps.height}.
   * When Root `aspectRatio` is `flexible`, defaults to {@link CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT}.
   */
  height?: number;
  surface?: CarouselSurface;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

export interface CarouselSlideImageProps {
  /** Remote URL or bundled `require()` asset — mirrors web `src` string paths. */
  src: string | ImageSourcePropType;
  alt: string;
  /**
   * Figma `.CarouselImage/*` aspect ratio override — defaults to {@link CarouselRootProps.aspectRatio}.
   */
  aspectRatio?: CarouselImageAspectRatio;
  /**
   * Image legibility overlay via {@link Scrim}.
   * - `true` → {@link CAROUSEL_SLIDE_SCRIM_PROPS} (bottom / XL / high)
   * - `ScrimProps` → custom position, size, attention, variant, overlay, etc.
   */
  scrim?: CarouselSlideScrim;
  style?: ViewStyle;
  testID?: string;
}

export interface CarouselSlideContentProps {
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

export interface CarouselItemBadgeRowProps {
  placement: CarouselCornerPlacement;
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

/** @deprecated Use {@link CarouselItemBadgeRowProps} */
export type CarouselSlideCornerProps = CarouselItemBadgeRowProps;

export interface CarouselSlideButtonGroupProps {
  orientation?: CarouselButtonOrientation;
  width?: CarouselButtonWidth;
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

// ─── Controls ──────────────────────────────────────────────────────────────

export interface CarouselControlsProps {
  placement?: CarouselControlsPlacement;
  layout?: CarouselControlsLayout;
  /** On-media pagination alignment — Figma `paginationDots=middle|end` (`2775:10745`). */
  paginationAlign?: CarouselPaginationAlign;
  style?: ViewStyle;
  testID?: string;
  children: ReactNode;
}

export interface CarouselIndicatorListProps {
  appearance?: PaginationDotsAppearance;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
}

export interface CarouselNavButtonProps {
  size?: IconButtonSize;
  attention?: IconButtonAttention;
  appearance?: IconButtonAppearance;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
}

export type CarouselPrevButtonProps = CarouselNavButtonProps;
export type CarouselNextButtonProps = CarouselNavButtonProps;
export type CarouselPlayButtonProps = CarouselNavButtonProps;

// ─── Geometry helpers ──────────────────────────────────────────────────────

const IMAGE_ASPECT_RATIO_MAP: Record<Exclude<CarouselImageAspectRatio, 'flexible'>, number> = {
  '1:2': 1 / 2,
  '9:16': 9 / 16,
  '3:4': 3 / 4,
  '1:1': 1,
  '4:3': 4 / 3,
  '5:3': 5 / 3,
  '16:9': 16 / 9,
  '2:1': 2 / 1,
  '21:9': 21 / 9,
};

export function resolveCarouselImageAspectRatio(
  ratio: CarouselImageAspectRatio,
): number | undefined {
  if (ratio === 'flexible') return undefined;
  return IMAGE_ASPECT_RATIO_MAP[ratio];
}

/** @deprecated Use {@link resolveCarouselImageAspectRatio}. */
export function resolveCarouselAspectRatio(
  ratio: CarouselImageAspectRatio,
): number | undefined {
  return resolveCarouselImageAspectRatio(ratio);
}

const CONTENT_WIDTH_PERCENT: Record<CarouselContentWidth, string> = {
  fill: '100%',
  s: '33%',
  m: '50%',
  l: '66%',
};

export function resolveCarouselContentMaxWidth(width: CarouselContentWidth): string {
  return CONTENT_WIDTH_PERCENT[width];
}

function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

// ─── Carousel engine — pure decision helpers ───────────────────────────────
//
// The engine hook (`useCarouselEngine`) below is a thin React shell around
// these pure functions. Extracting the risky index/offset math keeps it unit
// testable without a native renderer: the loop-boundary wrap, the momentum
// nearest-snap calculation, and the autoplay advance/stop decision are all
// exercised directly in `Carousel.test.ts`.

/**
 * Resolve the destination slide index for a navigation request.
 * `loop` wraps around both ends (last→first, first→last); otherwise clamps.
 */
export function resolveCarouselTargetIndex(
  index: number,
  slideCount: number,
  loop: boolean,
): number {
  return loop ? wrapIndex(index, slideCount) : clampIndex(index, slideCount);
}

/**
 * Number of clones rendered on EACH side of a looping rail's circular buffer.
 * A rail with 0 or 1 real slides has nothing to wrap, so it gets `0`.
 *
 * The display list becomes
 * `[clone(n-k) … clone(n-1), ...real, clone(0) … clone(k-1)]` (k = pad), so the
 * ScrollView animates a continuous wrap into a clone and then silently realigns
 * onto the matching real slide — mirroring Embla's seamless loop on web.
 *
 * When peek is active the viewport also shows a sliver of the OUTER neighbour,
 * so a single clone isn't enough: after realign the neighbour would pop in.
 * A second clone per side pre-fills that peek sliver, keeping the wrap seamless.
 */
export function resolveCarouselLoopClonePadding(
  loop: boolean,
  slideCount: number,
  hasPeek: boolean,
): number {
  if (!loop || slideCount <= 1) return 0;
  return hasPeek ? 2 : 1;
}

export interface CarouselSlideMetrics {
  /** Rendered slide width after removing the peek gutter. */
  slideWidth: number;
  /** Distance the pager travels per slide (width + gap). `0` until measured. */
  slideStride: number;
}

/** Derive per-slide width and scroll stride from the measured viewport. */
export function resolveCarouselSlideMetrics(
  viewportWidth: number,
  peekOffset: number,
  slideGap: number,
): CarouselSlideMetrics {
  const slideWidth = viewportWidth > 0 ? Math.max(0, viewportWidth - peekOffset) : 0;
  const slideStride = slideWidth > 0 ? slideWidth + slideGap : 0;
  return { slideWidth, slideStride };
}

export interface CarouselScrollGeometry {
  slideStride: number;
  slideCount: number;
  loop: boolean;
  /** Leading clone count (circular buffer). `0` = no clones (see fallback below). */
  clonePad?: number;
}

/**
 * Pixel x-offset the pager should scroll to reach `index`, or `null` when the
 * carousel is not yet measurable (no stride) or has no slides.
 *
 * With a circular buffer (`clonePad > 0`) the offset is shifted by the leading
 * clones and the index is NOT wrapped: an overshoot (`-1` or `slideCount`)
 * deliberately targets a clone so the wrap animates continuously; the realign
 * onto the real slide happens after the scroll settles (see
 * {@link resolveCarouselLoopSettle}). Without clones it falls back to the
 * wrap/clamp offset.
 */
export function resolveCarouselScrollOffset(
  index: number,
  { slideStride, slideCount, loop, clonePad = 0 }: CarouselScrollGeometry,
): number | null {
  if (slideStride <= 0 || slideCount <= 0) return null;
  if (clonePad > 0) {
    return (index + clonePad) * slideStride;
  }
  return resolveCarouselTargetIndex(index, slideCount, loop) * slideStride;
}

export interface CarouselLoopSettle {
  /** Logical selected slide index (`0 … slideCount - 1`). */
  logicalIndex: number;
  /**
   * Display-list index to instantly realign to after a wrap animation, or
   * `null` when the pager settled on a real slide (no realign needed).
   * Multiply by the slide stride for the pixel offset.
   */
  realignOffsetIndex: number | null;
}

/**
 * Resolve what to do once the pager settles on display index `displayIndex`
 * (its position in the `[clone(last), ...real, clone(first)]` list).
 *
 * Landing on a clone maps back to the matching real slide and asks the caller
 * to jump-realign there (`animated: false`) so the next drag/animation
 * continues from the correct place — the invisible half of the seamless loop.
 * Without clones (`clonePad <= 0`) the display index IS the logical index
 * (clamped), and no realign is needed.
 */
export function resolveCarouselLoopSettle(
  displayIndex: number,
  slideCount: number,
  clonePad: number,
): CarouselLoopSettle {
  if (clonePad <= 0) {
    return { logicalIndex: clampIndex(displayIndex, slideCount), realignOffsetIndex: null };
  }
  const firstRealDisplay = clonePad;
  const lastRealDisplay = clonePad + slideCount - 1;
  if (displayIndex < firstRealDisplay) {
    // Leading clone: display d shows real slide (slideCount - clonePad + d).
    const logicalIndex = slideCount - clonePad + displayIndex;
    return { logicalIndex, realignOffsetIndex: clonePad + logicalIndex };
  }
  if (displayIndex > lastRealDisplay) {
    // Trailing clone: display d shows real slide (d - clonePad - slideCount).
    const logicalIndex = displayIndex - clonePad - slideCount;
    return { logicalIndex, realignOffsetIndex: clonePad + logicalIndex };
  }
  return { logicalIndex: displayIndex - clonePad, realignOffsetIndex: null };
}

/**
 * Raw nearest slide index after a momentum scroll settles at `offsetX` — the
 * single source of truth for "which slide is the pager closest to now".
 *
 * When peek snap offsets are supplied they win (they are non-uniform once peek
 * gutters are involved, so `offsetX / stride` would be wrong); otherwise the
 * uniform stride is used. The returned index is NOT wrapped/clamped — callers
 * pass it through {@link resolveCarouselTargetIndex} (via `syncSelectedIndex`)
 * so loop/clamp behaviour stays defined in one place.
 */
export function resolveCarouselNearestSnapIndex(
  offsetX: number,
  snapOffsets: readonly number[] | undefined,
  slideStride: number,
): number {
  if (snapOffsets && snapOffsets.length > 0) {
    let nearest = 0;
    let minDistance = Infinity;
    for (let index = 0; index < snapOffsets.length; index += 1) {
      const distance = Math.abs(offsetX - snapOffsets[index]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    }
    return nearest;
  }
  if (slideStride <= 0) return 0;
  return Math.round(offsetX / slideStride);
}

export interface CarouselNavAvailability {
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

/** Whether prev/next navigation is available at `selectedIndex`. */
export function resolveCarouselNavAvailability(
  selectedIndex: number,
  slideCount: number,
  loop: boolean,
): CarouselNavAvailability {
  return {
    canScrollPrev: loop || selectedIndex > 0,
    canScrollNext: loop || (slideCount > 0 && selectedIndex < slideCount - 1),
  };
}

export type CarouselAutoPlayStep =
  | { type: 'advance'; index: number }
  | { type: 'stop' };

/**
 * Decide the next autoplay action from the currently visible slide.
 * Non-looping autoplay stops on the last slide; looping autoplay always
 * advances (wrapping is applied later by {@link resolveCarouselScrollOffset}).
 */
export function resolveCarouselAutoPlayStep(
  current: number,
  slideCount: number,
  loop: boolean,
): CarouselAutoPlayStep {
  if (!loop && current >= slideCount - 1) return { type: 'stop' };
  return { type: 'advance', index: current + 1 };
}

// ─── Carousel engine (ScrollView pager) ────────────────────────────────────

export interface CarouselEngineState {
  scrollRef: RefObject<ScrollView | null>;
  selectedIndex: number;
  slideCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  isPlaying: boolean;
  autoPlayEnabled: boolean;
  viewportWidth: number;
  slideStride: number;
  slideWidth: number;
  loop: boolean;
  /** Leading/trailing clone count for the loop circular buffer (`0` when off). */
  clonePad: number;
  peek: CarouselPeekMode;
  setViewportWidth: (width: number) => void;
  setSlideCount: (count: number) => void;
  play: () => void;
  pause: () => void;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  syncSelectedIndex: (index: number) => void;
  /** Restart the autoplay countdown from zero (call on manual interaction). */
  restartAutoPlay: () => void;
}

export interface UseCarouselEngineArgs {
  opts?: CarouselOpts;
  /** Root-level loop — overrides `opts.loop` when set. */
  loop?: boolean;
  autoPlay?: number | false;
  slideGap: number;
  peek?: CarouselPeekMode;
  peekOffset: number;
}

/**
 * Delay (ms) before autoplay's invisible clone→real realign after a loop wrap.
 * Must comfortably exceed React Native's programmatic smooth-scroll duration
 * (~250ms on Android) so the jump lands after the animation, and is capped to
 * the autoplay interval so it always completes before the next tick.
 */
const CAROUSEL_AUTOPLAY_REALIGN_MS = 400;

export function useCarouselEngine({
  opts,
  loop: loopProp,
  autoPlay = false,
  slideGap,
  peek = 'none',
  peekOffset,
}: UseCarouselEngineArgs): CarouselEngineState {
  const loop = resolveCarouselLoop(loopProp, opts);
  const scrollRef = useRef<ScrollView | null>(null);
  const selectedIndexRef = useRef(0);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(Boolean(autoPlay));
  // Bumped on manual interaction to restart the autoplay countdown from zero.
  const [autoPlayResetToken, setAutoPlayResetToken] = useState(0);

  selectedIndexRef.current = selectedIndex;

  const { slideWidth, slideStride } = resolveCarouselSlideMetrics(
    viewportWidth,
    peekOffset,
    slideGap,
  );

  const { canScrollPrev, canScrollNext } = resolveCarouselNavAvailability(
    selectedIndex,
    slideCount,
    loop,
  );

  const clonePad = resolveCarouselLoopClonePadding(loop, slideCount, peek !== 'none');

  const syncSelectedIndex = useCallback(
    (index: number) => {
      setSelectedIndex(resolveCarouselTargetIndex(index, slideCount, loop));
    },
    [loop, slideCount],
  );

  const scrollToOffset = useCallback(
    (index: number, animated = true) => {
      const x = resolveCarouselScrollOffset(index, { slideStride, slideCount, loop, clonePad });
      if (x === null) return;
      scrollRef.current?.scrollTo({ x, y: 0, animated });
    },
    [clonePad, loop, slideCount, slideStride],
  );

  // Restart the autoplay countdown. Bumping the token re-runs the interval
  // effect (fresh full-duration timer). Kept separate from `selectedIndex` so
  // autoplay's own advances don't reset the timer — only manual interaction does.
  const restartAutoPlay = useCallback(() => {
    if (!autoPlay) return;
    setAutoPlayResetToken((token) => token + 1);
  }, [autoPlay]);

  // `scrollTo` is the manual "jump to index" used by pagination dots and the
  // selection rail, so it resets the timer. Autoplay advances via
  // `scrollToOffset` directly and must NOT go through here.
  const scrollTo = useCallback(
    (index: number) => {
      restartAutoPlay();
      scrollToOffset(index, true);
    },
    [restartAutoPlay, scrollToOffset],
  );

  const scrollPrev = useCallback(() => {
    if (!canScrollPrev) return;
    restartAutoPlay();
    scrollToOffset(selectedIndex - 1, true);
  }, [canScrollPrev, restartAutoPlay, scrollToOffset, selectedIndex]);

  const scrollNext = useCallback(() => {
    if (!canScrollNext) return;
    restartAutoPlay();
    scrollToOffset(selectedIndex + 1, true);
  }, [canScrollNext, restartAutoPlay, scrollToOffset, selectedIndex]);

  const play = useCallback(() => {
    if (!autoPlay) return;
    setIsPlaying(true);
  }, [autoPlay]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    setIsPlaying(Boolean(autoPlay));
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlay || !isPlaying || slideCount <= 1) return undefined;
    let realignTimer: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      const step = resolveCarouselAutoPlayStep(selectedIndexRef.current, slideCount, loop);
      if (step.type === 'stop') {
        setIsPlaying(false);
        return;
      }
      // Animate one slide forward (into a trailing clone when wrapping).
      scrollToOffset(step.index, true);
      // Advance the logical index deterministically — do NOT wait for
      // onMomentumScrollEnd. Android does not reliably fire that event for a
      // programmatic scrollTo, so relying on `settle` to progress autoplay would
      // freeze the pager on the second slide (selectedIndex never updates).
      const nextIndex = resolveCarouselTargetIndex(step.index, slideCount, loop);
      syncSelectedIndex(nextIndex);
      // Wrap (last → first) lands on a trailing clone; realign onto the real
      // slide once the scroll settles. `settle` also does this when the momentum
      // event fires, but this timer guarantees the seamless loop on Android where
      // it may not. animated:false makes the correction invisible.
      const wrapped = nextIndex !== step.index;
      if (wrapped && clonePad > 0 && slideStride > 0) {
        const delay = Math.min(CAROUSEL_AUTOPLAY_REALIGN_MS, autoPlay);
        realignTimer = setTimeout(() => {
          scrollRef.current?.scrollTo({
            x: (nextIndex + clonePad) * slideStride,
            y: 0,
            animated: false,
          });
        }, delay);
      }
    }, autoPlay);
    return () => {
      clearInterval(id);
      if (realignTimer) clearTimeout(realignTimer);
    };
    // `autoPlayResetToken` restarts the countdown on manual interaction without
    // coupling the interval to `selectedIndex` (autoplay's own advances must not
    // reset the timer).
  }, [
    autoPlay,
    autoPlayResetToken,
    clonePad,
    isPlaying,
    loop,
    scrollToOffset,
    slideCount,
    slideStride,
    syncSelectedIndex,
  ]);

  return useMemo(
    () => ({
      scrollRef,
      selectedIndex,
      slideCount,
      canScrollPrev,
      canScrollNext,
      isPlaying,
      autoPlayEnabled: Boolean(autoPlay),
      viewportWidth,
      slideStride,
      slideWidth,
      loop,
      clonePad,
      peek,
      setViewportWidth,
      setSlideCount,
      play,
      pause,
      scrollTo,
      scrollPrev,
      scrollNext,
      syncSelectedIndex,
      restartAutoPlay,
    }),
    [
      autoPlay,
      canScrollNext,
      canScrollPrev,
      clonePad,
      syncSelectedIndex,
      restartAutoPlay,
      isPlaying,
      loop,
      pause,
      peek,
      play,
      scrollNext,
      scrollPrev,
      scrollTo,
      selectedIndex,
      slideCount,
      slideStride,
      slideWidth,
      viewportWidth,
    ],
  );
}

// ─── Accessibility ─────────────────────────────────────────────────────────

/**
 * Root container props — excluded from the a11y tree WITHOUT hiding descendants.
 *
 * `accessible: true` here would collapse the entire carousel (slides, nav, and
 * play buttons) into a single node, making the controls unreachable to
 * VoiceOver / TalkBack. `importantForAccessibility: 'no'` (NOT
 * `'no-hide-descendants'`) keeps every child independently reachable. The region
 * name is announced on the SR-only node from
 * {@link getCarouselRootNameAccessibilityProps}.
 */
export function getCarouselRootAccessibilityProps(
  _props?: Pick<CarouselRootProps, 'aria-label' | 'accessibilityHint'>,
): {
  accessible: false;
  importantForAccessibility: 'no';
} {
  return {
    accessible: false,
    importantForAccessibility: 'no',
  };
}

/** Screen-reader-only carousel region name. Null when no `aria-label` is set. */
export function getCarouselRootNameAccessibilityProps(
  props: Partial<Pick<CarouselRootProps, 'aria-label' | 'accessibilityHint'>>,
): {
  accessible: true;
  accessibilityRole: 'header';
  accessibilityLabel: string;
  accessibilityHint?: string;
} | null {
  if (!props['aria-label']) return null;
  return {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}

/**
 * Accessibility props for the slide's IMAGE node — not the slide container.
 *
 * The slide container must stay `accessible={false}` so the headline, body copy,
 * and any CTA buttons remain independently reachable to screen readers. The
 * positional "N of M" label (`aria-label`) is combined with the image `alt` and
 * announced on the single image element instead.
 */
export function getCarouselSlideAccessibilityProps(
  props: Pick<CarouselSlideProps, 'aria-label'> & { alt?: string },
): {
  accessible: true;
  accessibilityRole: 'image';
  accessibilityLabel: string;
} {
  const label = [props['aria-label'], props.alt]
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(', ');
  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: label,
  };
}

export function getCarouselTrackLiveRegionProps(isPlaying: boolean): {
  accessibilityLiveRegion?: 'polite' | 'none';
} {
  return {
    accessibilityLiveRegion: isPlaying ? 'none' : 'polite',
  };
}

export function formatCarouselSlidePosition(position: number, total: number): string {
  return `${position} of ${total}`;
}

/** Mirrors web `useCarouselContext` naming in native `interface.ts`. */
export const useCarouselState = useCarouselEngine;

/** Umbrella export — root region label helper (SR-only region name). */
export const getCarouselAccessibilityProps = getCarouselRootNameAccessibilityProps;
