import { computeDimensionOverrides } from '@oneui/shared';
import type { DensityId, PlatformEntry } from '@oneui/shared';

/**
 * When ContentBlock props include `foundationPlatformId` but no (or empty) inline
 * `foundationDimensionOverrides`, compute overrides from the brand's Density & Platforms
 * entries (same as canvas / PropPanel).
 */
export function enrichContentBlockPropsWithFoundation(
  props: Record<string, unknown> | undefined,
  enabledPlatforms: PlatformEntry[] | undefined,
  canvasWidth: number,
): Record<string, unknown> {
  const p = props ?? {};
  if (!enabledPlatforms?.length) return p;

  const id = p.foundationPlatformId;
  if (!id || typeof id !== 'string' || !id.trim()) return p;

  const rawOv = p.foundationDimensionOverrides;
  if (
    rawOv &&
    typeof rawOv === 'object' &&
    !Array.isArray(rawOv) &&
    Object.keys(rawOv as object).length > 0
  ) {
    return p;
  }

  const entry = enabledPlatforms.find((e) => e.id === id && e.isEnabled);
  if (!entry) return p;

  const d = p.density;
  const density: DensityId =
    d === 'compact' || d === 'open' || d === 'default' ? d : 'default';
  const overrides = computeDimensionOverrides(entry, canvasWidth, density);
  return { ...p, foundationDimensionOverrides: overrides };
}
