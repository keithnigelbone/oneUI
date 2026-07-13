/**
 * Mirrors Storybook `PlatformDensityScope` in preview.ts — sets dimension cascade
 * attributes on `<html>` from toolbar breakpoint + density (not inline styles).
 *
 * Resolves the canonical data-Breakpoint (S/M/L) via resolveBreakpointRange on the
 * unified 619/990 ladder, matching the live platform app so brand grid/dimension
 * overrides (keyed on data-Breakpoint) resolve identically.
 */

import { useLayoutEffect, useState, type ReactNode } from 'react';
import type { DensityId, BreakpointId } from '@oneui/shared';
import { resolveBreakpointRange } from '@oneui/shared';

function breakpointFromToolbar(breakpointValue: string): BreakpointId | null {
  if (breakpointValue === 'responsive') return null;
  if (breakpointValue === 'S' || breakpointValue === 'M' || breakpointValue === 'L') {
    return breakpointValue;
  }
  const width = parseInt(breakpointValue, 10);
  if (Number.isNaN(width)) return null;
  return resolveBreakpointRange(width);
}

export function QaPlatformDensityScope({
  density,
  breakpointValue,
  children,
}: {
  density: DensityId;
  breakpointValue: string;
  children: ReactNode;
}) {
  const [liveViewportBreakpoint, setLiveViewportBreakpoint] = useState<BreakpointId>(() => {
    if (typeof window === 'undefined') return 'L';
    return resolveBreakpointRange(window.innerWidth);
  });

  useLayoutEffect(() => {
    if (breakpointValue !== 'responsive' || typeof window === 'undefined') return;
    const update = () => setLiveViewportBreakpoint(resolveBreakpointRange(window.innerWidth));
    update();
    const breakpoints = [620, 991];
    const mediaQueries = breakpoints.map((bp) => window.matchMedia(`(min-width: ${bp}px)`));
    mediaQueries.forEach((mq) => mq.addEventListener('change', update));
    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener('change', update));
    };
  }, [breakpointValue]);

  const breakpoint: BreakpointId =
    breakpointFromToolbar(breakpointValue) ?? liveViewportBreakpoint;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-Breakpoint', breakpoint);
    root.setAttribute('data-6-Density', density);
    root.setAttribute('data-density', density);
  }, [breakpoint, density]);

  return (
    <div className="platform-scope" data-density={density}>
      {children}
    </div>
  );
}
