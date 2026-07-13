/**
 * useDensityDimensionOverrides.ts
 *
 * Returns CSS custom property overrides for --Dimension-f* and --Grid-* tokens
 * at the specified preview density. Always returns a complete set of overrides,
 * ensuring the preview container is fully isolated from the global density
 * setting on <html>.
 *
 * This replaces usePlatformTokens for component preview containers where
 * the preview density (from TopBar DensitySelector) must be independent
 * of the global density (from Settings sidebar).
 */

'use client';

import { useMemo } from 'react';
import {
  computeDimensionOverrides,
  computeResponsiveDensityOverrides,
} from '@oneui/shared';
import type { PlatformEntry } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';

export type DensityMode = 'compact' | 'default' | 'open';

/**
 * Compute density-isolated dimension overrides for a component preview container.
 *
 * @param previewDensity - The density selected for the preview (from TopBar DensitySelector)
 * @param platform - The selected PlatformEntry, or null if none selected
 * @param breakpointViewport - The selected breakpoint viewport width, or null for "Responsive"
 * @param breakpointId - The S/M/L breakpoint for the current browser viewport (from PlatformContext)
 * @returns CSS custom property overrides to spread onto the preview container's style prop
 */
export function useDensityDimensionOverrides(
  previewDensity: DensityMode,
  platform: PlatformEntry | null,
  breakpointViewport: number | null,
  breakpointId: BreakpointId
): Record<string, string> {
  return useMemo(() => {
    const density = previewDensity as DensityId;

    // When a specific breakpoint + platform is selected, compute overrides
    // at that breakpoint with the preview density
    if (platform && breakpointViewport != null) {
      return computeDimensionOverrides(platform, breakpointViewport, density);
    }

    // Responsive mode (no breakpoint) or no platform selected:
    // Use the breakpointId (current browser viewport) with the preview density.
    // This ensures complete isolation from the global density on <html>.
    return computeResponsiveDensityOverrides(breakpointId, density);
  }, [previewDensity, platform, breakpointViewport, breakpointId]);
}
