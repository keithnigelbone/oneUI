'use client';

/**
 * Brand-switching concerns extracted from `(platform)/layout.tsx`.
 *
 * Owns:
 *   - `handleBrandChange` (TopBar dropdown) + `handlePickerChange`
 *     (sidebar BrandPicker) + `handleSubBrandChange`
 *   - Logo SVG localStorage cache write whenever the brand changes
 *   - Sub-brand sync effect (Convex → context) so live edits in the
 *     Appearance editor propagate without stale reads.
 *
 * Returns plain handlers + props the shell wires into the relevant
 * components. Stateful ownership stays in the shell so we don't fork
 * `usePlatformContext` consumption.
 */

import { useCallback, useEffect, type MutableRefObject } from 'react';
import type { Brand } from '@oneui/shared';
import type { SubBrandConfig } from '@/contexts/PlatformContext';
import { writeBrandLogoCache } from './lib/brandLogoCache';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';

interface ConvexSubBrand {
  _id: string;
  parentBrandId: string;
  name: string;
  slug: string;
  primary: SubBrandConfig['primary'];
  secondary: SubBrandConfig['secondary'];
  sparkle: SubBrandConfig['sparkle'];
  brandBg: SubBrandConfig['brandBg'];
  materials?: SubBrandConfig['materials'];
}

interface UseBrandSwitchingArgs {
  availableBrands: Brand[];
  subBrands: ConvexSubBrand[] | undefined;
  currentBrand: Brand | null;
  currentSubBrand: SubBrandConfig | null;
  setBrand: (brand: Brand) => void;
  setSubBrand: (sub: SubBrandConfig | null) => void;
  /**
   * Sub-brand id snapshotted by `useBrandsCatalog` before the startup
   * `setBrand` call. Applied (then cleared) once this brand's sub-brands
   * load; discarded when it doesn't belong to the current brand.
   */
  pendingSubBrandIdRef: MutableRefObject<string | null>;
}

interface UseBrandSwitchingResult {
  handleBrandChange: (brandId: string) => void;
  handleSubBrandChange: (subBrandId: string | null) => void;
  handlePickerChange: (sel: { brandId: string; subBrandId: string | null }) => void;
}

export function useBrandSwitching({
  availableBrands,
  subBrands,
  currentBrand,
  currentSubBrand,
  setBrand,
  setSubBrand,
  pendingSubBrandIdRef,
}: UseBrandSwitchingArgs): UseBrandSwitchingResult {
  const { clearOptimisticPath } = usePlatformNavigation();
  // Persist the active brand's logo SVG so the preloader can render it on the
  // next page load before Convex resolves.
  useEffect(() => {
    if (currentBrand?.logoSvg) {
      writeBrandLogoCache(currentBrand.logoSvg);
    } else if (currentBrand) {
      writeBrandLogoCache(undefined);
    }
  }, [currentBrand?.id, currentBrand?.logoSvg, currentBrand]);

  // Keep currentSubBrand in sync with Convex — when a sub-brand's data changes
  // (e.g. after AppearanceContent auto-saves updated steps/scales), update the
  // context object so the next initialisation reads fresh values.
  useEffect(() => {
    if (!currentSubBrand || !subBrands) return;
    const updated = subBrands.find((s) => s._id === currentSubBrand.id);
    if (!updated) return;
    if (
      updated.primary.scaleName === currentSubBrand.primary.scaleName &&
      updated.primary.baseStep === currentSubBrand.primary.baseStep &&
      updated.secondary.scaleName === currentSubBrand.secondary.scaleName &&
      updated.secondary.baseStep === currentSubBrand.secondary.baseStep &&
      updated.sparkle.scaleName === currentSubBrand.sparkle.scaleName &&
      updated.sparkle.baseStep === currentSubBrand.sparkle.baseStep &&
      updated.brandBg.scaleName === currentSubBrand.brandBg.scaleName &&
      updated.brandBg.backgroundStep.light === currentSubBrand.brandBg.backgroundStep.light &&
      updated.brandBg.backgroundStep.dark === currentSubBrand.brandBg.backgroundStep.dark &&
      JSON.stringify(updated.materials ?? null) === JSON.stringify(currentSubBrand.materials ?? null) &&
      updated.name === currentSubBrand.name
    ) return;
    setSubBrand({
      id: updated._id,
      parentBrandId: updated.parentBrandId,
      name: updated.name,
      slug: updated.slug,
      primary: updated.primary,
      secondary: updated.secondary,
      sparkle: updated.sparkle,
      brandBg: updated.brandBg,
      materials: updated.materials,
    } as SubBrandConfig);
  }, [subBrands, currentSubBrand, setSubBrand]);

  const handleBrandChange = useCallback(
    (brandId: string) => {
      const brand = availableBrands.find((b) => b.id === brandId);
      if (brand) {
        clearOptimisticPath();
        setBrand(brand);
        writeBrandLogoCache(brand.logoSvg);
      }
    },
    [availableBrands, setBrand, clearOptimisticPath],
  );

  // Restore the persisted sub-brand once the startup brand's sub-brands load.
  // The pending id is discarded when it doesn't belong to the current brand
  // (stale pref after a revoke/delete, or a sub-brand of a different brand).
  useEffect(() => {
    const pendingId = pendingSubBrandIdRef.current;
    if (!pendingId || !currentBrand || subBrands === undefined) return;
    pendingSubBrandIdRef.current = null;
    const sub = subBrands.find(
      (s) => s._id === pendingId && s.parentBrandId === currentBrand.id,
    );
    if (!sub) return;
    setSubBrand({
      id: sub._id,
      parentBrandId: sub.parentBrandId,
      name: sub.name,
      slug: sub.slug,
      primary: sub.primary,
      secondary: sub.secondary,
      sparkle: sub.sparkle,
      brandBg: sub.brandBg,
      materials: sub.materials,
    } as SubBrandConfig);
  }, [subBrands, currentBrand, setSubBrand, pendingSubBrandIdRef]);

  const handleSubBrandChange = useCallback(
    (subBrandId: string | null) => {
      if (!subBrandId) {
        setSubBrand(null);
        return;
      }
      const sub = subBrands?.find((s) => s._id === subBrandId);
      if (sub) {
        setSubBrand({
          id: sub._id,
          parentBrandId: sub.parentBrandId,
          name: sub.name,
          slug: sub.slug,
          primary: sub.primary,
          secondary: sub.secondary,
          sparkle: sub.sparkle,
          brandBg: sub.brandBg,
          materials: sub.materials,
        } as SubBrandConfig);
      }
    },
    [subBrands, setSubBrand],
  );

  const handlePickerChange = useCallback(
    (sel: { brandId: string; subBrandId: string | null }) => {
      const brand = availableBrands.find((b) => b.id === sel.brandId);
      if (!brand) return;
      clearOptimisticPath();
      setBrand(brand);
      writeBrandLogoCache(brand.logoSvg);
      if (sel.subBrandId) {
        handleSubBrandChange(sel.subBrandId);
      }
    },
    [availableBrands, setBrand, handleSubBrandChange, clearOptimisticPath],
  );

  return { handleBrandChange, handleSubBrandChange, handlePickerChange };
}
