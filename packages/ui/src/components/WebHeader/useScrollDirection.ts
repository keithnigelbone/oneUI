/**
 * useScrollDirection.ts
 * Hooks for scroll-based header show/hide and responsive breakpoint detection
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebHeaderBreakpoint } from './WebHeader.shared';

/* ========================================
   useScrollDirection — scroll-based show/hide
   ======================================== */

export type ScrollDirection = 'up' | 'down' | null;

/**
 * Detects vertical scroll direction for header show/hide behavior.
 * Returns 'down' when scrolling down (hide header), 'up' when scrolling up (show header).
 *
 * @param threshold - Minimum scroll delta to trigger direction change (prevents jitter)
 */
export function useScrollDirection(threshold = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastY = useRef(0);
  const lastDirection = useRef<ScrollDirection>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (Math.abs(delta) < threshold) return;

      const newDirection: ScrollDirection = delta > 0 ? 'down' : 'up';

      if (newDirection !== lastDirection.current) {
        lastDirection.current = newDirection;
        setDirection(newDirection);
      }

      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}

/* ========================================
   useBreakpoint — responsive breakpoint detection
   ======================================== */

/** Breakpoint thresholds matching the unified S/M/L system (619/990 ladder). */
const BREAKPOINTS: [number, WebHeaderBreakpoint][] = [
  [991, 'L'],
  [620, 'M'],
  [0, 'S'],
];

function resolveBreakpoint(width: number): WebHeaderBreakpoint {
  for (const [min, id] of BREAKPOINTS) {
    if (width >= min) return id;
  }
  return 'S';
}

/**
 * Detects current platform breakpoint from window width.
 * SSR-safe: defaults to 'S' (mobile-first) on server.
 *
 * @param override - If provided, bypasses auto-detection (for Storybook/testing)
 */
export function useBreakpoint(
  override?: WebHeaderBreakpoint
): WebHeaderBreakpoint {
  const [breakpoint, setBreakpoint] = useState<WebHeaderBreakpoint>(
    override ?? 'S'
  );

  const updateBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return;
    setBreakpoint(resolveBreakpoint(window.innerWidth));
  }, []);

  useEffect(() => {
    if (override) {
      setBreakpoint(override);
      return;
    }

    // Initial measurement
    updateBreakpoint();

    window.addEventListener('resize', updateBreakpoint, { passive: true });
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [override, updateBreakpoint]);

  return breakpoint;
}

/**
 * Returns true if the current breakpoint is mobile (< 620px).
 */
export function isMobileBreakpoint(bp: WebHeaderBreakpoint): boolean {
  return bp === 'S';
}

/**
 * Returns true if the current breakpoint supports search input (≥ 991px).
 */
export function isDesktopBreakpoint(bp: WebHeaderBreakpoint): boolean {
  return bp === 'L';
}
