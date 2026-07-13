/**
 * PaginationDots interface (native)
 */

import { useCallback, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

export type PaginationDotsAppearance = ComponentAppearance;
/** @deprecated Figma defines only one size (M). */
export type PaginationDotsSize = 'm';
export type PaginationDotState = 'active' | 'regular' | 'edge';
/** @deprecated Alias for barrel compatibility. */
export type PaginationDotScale = PaginationDotState;

export interface PaginationDotsProps {
  count: number;
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  loop?: boolean;
  appearance?: PaginationDotsAppearance;
  readOnly?: boolean;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
}

export interface PaginationDotDescriptor {
  slot: number;
  absIdx: number;
  isActive: boolean;
  state: PaginationDotState;
}

export interface UsePaginationDotsStateOptions
  extends Pick<
    PaginationDotsProps,
    'count' | 'activeIndex' | 'defaultActiveIndex' | 'onActiveIndexChange' | 'loop' | 'readOnly'
  > {
  windowSize?: number;
}

export interface UsePaginationDotsStateResult {
  clampedActive: number;
  visibleDots: PaginationDotDescriptor[];
  setActive: (index: number) => void;
  step: (delta: number) => void;
  goTo: (index: number) => void;
  effectiveWindowSize: number;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function devWarn(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[PaginationDots] ${message}`);
  }
}

export function usePaginationDotsState(
  opts: UsePaginationDotsStateOptions,
): UsePaginationDotsStateResult {
  const {
    count,
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    loop = false,
    windowSize,
    readOnly = false,
  } = opts;

  const isControlled = activeIndex !== undefined;
  const [internalActive, setInternalActive] = useState<number>(defaultActiveIndex ?? 0);

  const rawActive = isControlled ? activeIndex : internalActive;
  const maxIndex = Math.max(0, count - 1);
  const clampedActive = clamp(rawActive ?? 0, 0, maxIndex);

  if (process.env.NODE_ENV !== 'production' && rawActive !== undefined && rawActive !== clampedActive) {
    devWarn(`activeIndex ${rawActive} is out of range [0, ${maxIndex}] — clamped to ${clampedActive}.`);
  }

  // Effective window: clamp to [3, min(5, count)].
  // The Figma spec defines only one window size (5 dots max).
  const WINDOW_MAX = 5;
  let effectiveWindowSize = windowSize ?? WINDOW_MAX;
  if (effectiveWindowSize < 3) {
    if (process.env.NODE_ENV !== 'production' && windowSize !== undefined) {
      devWarn(`windowSize ${windowSize} < 3 — clamped to 3.`);
    }
    effectiveWindowSize = 3;
  }
  if (effectiveWindowSize > WINDOW_MAX) {
    if (process.env.NODE_ENV !== 'production' && windowSize !== undefined) {
      devWarn(`windowSize ${windowSize} > ${WINDOW_MAX} — clamped to ${WINDOW_MAX} (Figma spec maximum).`);
    }
    effectiveWindowSize = WINDOW_MAX;
  }
  if (count > 0 && effectiveWindowSize > count) {
    effectiveWindowSize = count;
  }

  const setActive = useCallback(
    (index: number) => {
      if (readOnly) return;
      if (count <= 0) return;
      const next = clamp(index, 0, Math.max(0, count - 1));
      if (!isControlled) {
        setInternalActive(next);
      }
      onActiveIndexChange?.(next);
    },
    [readOnly, isControlled, count, onActiveIndexChange],
  );

  const step = useCallback(
    (delta: number) => {
      if (readOnly) return;
      if (count <= 0) return;
      const nextRaw = clampedActive + delta;
      const next = loop
        ? mod(nextRaw, count)
        : clamp(nextRaw, 0, Math.max(0, count - 1));
      if (!isControlled) {
        setInternalActive(next);
      }
      onActiveIndexChange?.(next);
    },
    [readOnly, loop, count, clampedActive, isControlled, onActiveIndexChange],
  );

  const goTo = useCallback(
    (index: number) => setActive(index),
    [setActive],
  );

  const visibleDots = useMemo<PaginationDotDescriptor[]>(() => {
    if (count <= 0) return [];
    if (count === 1) {
      return [{ slot: 0, absIdx: 0, isActive: true, state: 'active' }];
    }

    const W = effectiveWindowSize;
    const half = Math.floor(W / 2);

    // Short-sequence branch — render all dots at regular size, no edge state.
    // (Figma: when count <= windowSize, only the active dot changes shape.)
    if (count <= W) {
      return Array.from({ length: count }, (_, i) => ({
        slot: i,
        absIdx: i,
        isActive: i === clampedActive,
        state: (i === clampedActive ? 'active' : 'regular') as PaginationDotState,
      }));
    }

    // Three-state classifier: active pill, edge dot, or regular dot.
    // Figma spec: only the first and last visible slots in a sliding window
    // are `edge` (smaller, signalling "more content this way"); every
    // middle slot is `regular`; the active slot is `active` (pill).
    const stateFor = (
      isActive: boolean,
      isWindowEdge: boolean,
    ): PaginationDotState => {
      if (isActive) return 'active';
      if (isWindowEdge) return 'edge';
      return 'regular';
    };

    if (loop) {
      // Window always centered on active; indices wrap via modulo.
      // The component keys each <button> by absIdx, so the shape-morph
      // CSS transition fires on in-window steps (e.g., active=5→6: the
      // absIdx=5 node transitions regular→active and absIdx=6 goes the
      // other way). At the count boundary (active=last→0) the active key
      // changes, so no morph fires for that specific transition — this is
      // an acceptable trade-off for the infinite-loop pattern.
      const dots: PaginationDotDescriptor[] = [];
      for (let slot = 0; slot < W; slot++) {
        const offset = slot - half;
        const absIdx = mod(clampedActive + offset, count);
        const isActive = offset === 0;
        const isWindowEdge = slot === 0 || slot === W - 1;
        dots.push({
          slot,
          absIdx,
          isActive,
          state: stateFor(isActive, isWindowEdge),
        });
      }
      return dots;
    }

    // Non-loop: slide the window then clamp at the edges.
    const rawStart = clampedActive - half;
    const start = clamp(rawStart, 0, count - W);
    const end = start + W - 1;
    const dots: PaginationDotDescriptor[] = [];
    for (let slot = 0; slot < W; slot++) {
      const absIdx = start + slot;
      const isActive = absIdx === clampedActive;

      // In non-loop mode the "edge" state only applies when there is more
      // content beyond that side. If we're clamped against the start, the
      // leftmost visible dot is absolutely the first item — it should not
      // be smaller (nothing is hidden to its left). Same at the end.
      let isWindowEdge = false;
      if (slot === 0 && start > 0) isWindowEdge = true;
      if (slot === W - 1 && end < count - 1) isWindowEdge = true;

      dots.push({
        slot,
        absIdx,
        isActive,
        state: stateFor(isActive, isWindowEdge),
      });
    }
    return dots;
  }, [count, effectiveWindowSize, loop, clampedActive]);

  return {
    clampedActive,
    visibleDots,
    setActive,
    step,
    goTo,
    effectiveWindowSize,
  };
}

/**
 * @deprecated Kept for barrel compatibility — the three-state model
 * ('active' | 'regular' | 'edge') has superseded the numeric scale
 * buckets. Returns `'active'` for d=0 and `'edge'` for d>=half, else
 * `'regular'`.
 */
export function scaleForDistance(d: number, half: number): PaginationDotState {
  if (d === 0) return 'active';
  if (d >= half) return 'edge';
  return 'regular';
}

/**
 * Utility re-export for tests / consumers that need the modulo behaviour.
 * @internal
 */
export const _internal = { mod, clamp };

export function getPaginationDotsRootAccessibilityProps(
  props: Pick<PaginationDotsProps, 'aria-label'>,
  state: { readOnly: boolean; count: number; resolvedActive: number },
): {
  accessible: true;
  accessibilityRole: 'progressbar' | 'tablist';
  accessibilityLabel?: string;
  accessibilityValue?: { min: number; max: number; now: number };
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
} {
  if (state.readOnly) {
    return {
      accessible: true,
      accessibilityRole: 'progressbar',
      accessibilityLabel: props['aria-label'],
      accessibilityValue: {
        min: 0,
        max: Math.max(0, state.count - 1),
        now: state.resolvedActive,
      },
      'aria-valuemin': 0,
      'aria-valuemax': state.count - 1,
      'aria-valuenow': state.resolvedActive,
    };
  }
  return {
    accessible: true,
    accessibilityRole: 'tablist',
    accessibilityLabel: props['aria-label'],
  };
}

export function getPaginationDotReadOnlyAccessibilityProps(): {
  'aria-hidden': true;
} {
  return { 'aria-hidden': true };
}

export function getPaginationDotTabAccessibilityProps(
  dot: Pick<PaginationDotDescriptor, 'isActive' | 'absIdx'>,
): {
  accessible: true;
  accessibilityRole: 'tab';
  accessibilityState: { selected: boolean };
  accessibilityLabel: string;
  'aria-selected': boolean;
} {
  return {
    accessible: true,
    accessibilityRole: 'tab',
    accessibilityState: { selected: dot.isActive },
    accessibilityLabel: `Go to page ${dot.absIdx + 1}`,
    'aria-selected': dot.isActive,
  };
}
