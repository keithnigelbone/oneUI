/**
 * PaginationDots.shared.ts
 *
 * Shared types and hook for PaginationDots — a windowed pagination
 * indicator (Instagram / Prime Video pattern). Pure — reusable between
 * web and any future React Native implementation.
 *
 * Exports:
 * - PaginationDotsProps — public API
 * - usePaginationDotsState — window math + state reconciliation
 */

'use client';

import type { CSSProperties } from 'react';
import { useCallback, useRef, useState, useMemo } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type PaginationDotsAppearance = ComponentAppearance;

/**
 * @deprecated Figma defines only one size (M). This type is kept for barrel
 * compatibility only and will be removed in a future major version.
 */
export type PaginationDotsSize = 'm';

/**
 * Visual state applied to each visible dot. Only three buckets:
 *   - `active`  — the elongated pill at the centre
 *   - `regular` — a standard inactive dot
 *   - `edge`    — a smaller dot at the outermost position of a sliding window
 *
 * Only `pageCount > windowSize` sequences get `edge` dots — in short sequences
 * every inactive dot is `regular`. The user-facing design (per Figma):
 *   "When in the middle, only the first and the last should be smaller."
 */
export type PaginationDotState = 'active' | 'regular' | 'edge';

/** @deprecated Alias kept for barrel-export backwards compatibility. */
export type PaginationDotScale = PaginationDotState;

export interface PaginationDotsProps {
  /** Total number of pages / items. Required. */
  pageCount: number;
  /** Controlled active index. */
  activeIndex?: number;
  /** Default active index when uncontrolled. */
  defaultActiveIndex?: number;
  /** Fires when the active index changes (via click, keyboard, or controlled update). */
  onActiveIndexChange?: (index: number) => void;
  /**
   * Loop mode. `true` = infinite windowed scroll, window always centered on active,
   * last → 0 wraps seamlessly. `false` = finite sequence, window clamps at the
   * edges, last dot grows full size when the user approaches the end.
   * Default: `false`.
   */
  loop?: boolean;
  /** Multi-accent appearance role. `auto` resolves to `primary`. Default: `primary`. */
  appearance?: PaginationDotsAppearance;
  /**
   * When true, disables all interaction (clicks, keyboard) and renders as
   * a read-only live-region indicator (`role="status"`, `aria-live="polite"`).
   * Use for components that purely mirror a parent carousel's state.
   */
  readOnly?: boolean;
  /** Accessible label for the tablist root. */
  'aria-label'?: string;
  /** Stable anchor for Playwright / QA harnesses (applied to the tablist / status root). */
  'data-testid'?: string;
  /** Additional class name applied to the root. */
  className?: string;
  /** Inline styles applied to the root. */
  style?: CSSProperties;
}

/** A single rendered dot descriptor returned from the state hook. */
export interface PaginationDotDescriptor {
  /** React key — stable within a given window layout. */
  slot: number;
  /** Absolute index within `[0, pageCount - 1]`. */
  absIdx: number;
  /** Whether this dot represents the active index. */
  isActive: boolean;
  /** Visual state bucket applied via `data-state`. */
  state: PaginationDotState;
}

export interface UsePaginationDotsStateOptions
  extends Pick<
    PaginationDotsProps,
    | 'pageCount'
    | 'activeIndex'
    | 'defaultActiveIndex'
    | 'onActiveIndexChange'
    | 'loop'
    | 'readOnly'
  > {
  /**
   * Override the window size. Clamped to `[3, min(5, pageCount)]`.
   * For internal / advanced use only — the `PaginationDots` component always
   * uses the Figma-specified maximum of 5.
   */
  windowSize?: number;
}

export interface UsePaginationDotsStateResult {
  /** Clamped active index (always within `[0, max(0, pageCount - 1)]`). */
  clampedActive: number;
  /** Resolved visible dot descriptors — length = min(windowSize, pageCount). */
  visibleDots: PaginationDotDescriptor[];
  /** Setter that honours readOnly + emits onActiveIndexChange. */
  setActive: (index: number) => void;
  /** Step by delta (positive = next, negative = prev). Wraps in loop mode. */
  step: (delta: number) => void;
  /** Jump to first / last — arguments 0 or pageCount-1. */
  goTo: (index: number) => void;
  /** Effective window size after clamping to `[3, pageCount]`. */
  effectiveWindowSize: number;
}

/**
 * Modulo that always returns a non-negative remainder.
 * `mod(-1, 5)` → `4` (JS `%` returns `-1`).
 */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function devWarn(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[PaginationDots] ${message}`);
  }
}

/**
 * Resolve controlled/uncontrolled active state, clamp to range, compute the
 * visible window, and derive per-dot scale buckets from distance-to-active.
 */
export function usePaginationDotsState(
  opts: UsePaginationDotsStateOptions,
): UsePaginationDotsStateResult {
  const {
    pageCount,
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
  const maxIndex = Math.max(0, pageCount - 1);
  const clampedActive = clamp(rawActive ?? 0, 0, maxIndex);

  if (process.env.NODE_ENV !== 'production' && rawActive !== undefined && rawActive !== clampedActive) {
    devWarn(`activeIndex ${rawActive} is out of range [0, ${maxIndex}] — clamped to ${clampedActive}.`);
  }

  // Effective window: clamp to [3, min(5, pageCount)].
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
  if (pageCount > 0 && effectiveWindowSize > pageCount) {
    effectiveWindowSize = pageCount;
  }

  const setActive = useCallback(
    (index: number) => {
      if (readOnly) return;
      if (pageCount <= 0) return;
      const next = clamp(index, 0, Math.max(0, pageCount - 1));
      if (!isControlled) {
        setInternalActive(next);
      }
      onActiveIndexChange?.(next);
    },
    [readOnly, isControlled, pageCount, onActiveIndexChange],
  );

  const step = useCallback(
    (delta: number) => {
      if (readOnly) return;
      if (pageCount <= 0) return;
      const nextRaw = clampedActive + delta;
      const next = loop
        ? mod(nextRaw, pageCount)
        : clamp(nextRaw, 0, Math.max(0, pageCount - 1));
      if (!isControlled) {
        setInternalActive(next);
      }
      onActiveIndexChange?.(next);
    },
    [readOnly, loop, pageCount, clampedActive, isControlled, onActiveIndexChange],
  );

  const goTo = useCallback(
    (index: number) => setActive(index),
    [setActive],
  );

  const visibleDots = useMemo<PaginationDotDescriptor[]>(() => {
    if (pageCount <= 0) return [];
    if (pageCount === 1) {
      return [{ slot: 0, absIdx: 0, isActive: true, state: 'active' }];
    }

    const W = effectiveWindowSize;
    const half = Math.floor(W / 2);

    // Short-sequence branch — render all dots at regular size, no edge state.
    // (Figma: when pageCount <= windowSize, only the active dot changes shape.)
    if (pageCount <= W) {
      return Array.from({ length: pageCount }, (_, i) => ({
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
      // other way). At the pageCount boundary (active=last→0) the active key
      // changes, so no morph fires for that specific transition — this is
      // an acceptable trade-off for the infinite-loop pattern.
      const dots: PaginationDotDescriptor[] = [];
      for (let slot = 0; slot < W; slot++) {
        const offset = slot - half;
        const absIdx = mod(clampedActive + offset, pageCount);
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
    const start = clamp(rawStart, 0, pageCount - W);
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
      if (slot === W - 1 && end < pageCount - 1) isWindowEdge = true;

      dots.push({
        slot,
        absIdx,
        isActive,
        state: stateFor(isActive, isWindowEdge),
      });
    }
    return dots;
  }, [pageCount, effectiveWindowSize, loop, clampedActive]);

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
