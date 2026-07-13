/**
 * usePlatformTokens.ts
 *
 * React hook that returns CSS custom property overrides for a given platform
 * and breakpoint viewport. Spread the returned object onto a container's
 * `style` prop to freeze dimension tokens at the platform's computed values.
 *
 * "Responsive" (null viewport) returns an empty object and leaves the active
 * `[data-Breakpoint][data-6-Density]` cascade in control.
 */

'use client';

import { useMemo } from 'react';
import { computeDimensionOverrides } from '@oneui/shared';
import type { PlatformEntry } from '@oneui/shared';

export function usePlatformTokens(
  platform: PlatformEntry | null,
  breakpointViewport: number | null
): Record<string, string> {
  return useMemo(() => {
    if (!platform) return {};
    return computeDimensionOverrides(platform, breakpointViewport);
  }, [platform, breakpointViewport]);
}
