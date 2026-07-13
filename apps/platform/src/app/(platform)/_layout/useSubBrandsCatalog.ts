'use client';

/**
 * Sub-brand data layer for the platform shell.
 *
 *   - `subBrands` — sub-brand configs for the active brand only (used by
 *     brand-switching effects).
 *   - `allSubBrandConfigs` — every sub-brand across every parent brand,
 *     mapped into the `BrandPickerSubBrandConfig` shape consumed by the
 *     unified BrandPicker.
 */

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { BrandPickerSubBrandConfig } from '@oneui/ui/components/Platform';

interface UseSubBrandsCatalogArgs {
  currentBrandId: string | undefined;
}

interface UseSubBrandsCatalogResult {
  subBrands: ReturnType<typeof useQuery<typeof api.subBrandConfigs.getByParentBrand>>;
  allSubBrandConfigs: Record<string, BrandPickerSubBrandConfig[]>;
}

export function useSubBrandsCatalog({
  currentBrandId,
}: UseSubBrandsCatalogArgs): UseSubBrandsCatalogResult {
  const subBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    currentBrandId ? { parentBrandId: currentBrandId as Id<'brands'> } : 'skip',
  );
  const allSubBrandConfigsRaw = useQuery(api.subBrandConfigs.listAll);

  const allSubBrandConfigs: Record<string, BrandPickerSubBrandConfig[]> = useMemo(() => {
    if (!allSubBrandConfigsRaw) return {};
    const result: Record<string, BrandPickerSubBrandConfig[]> = {};
    for (const [parentId, configs] of Object.entries(allSubBrandConfigsRaw)) {
      result[parentId] = (
        configs as Array<{ _id: string; parentBrandId: string; name: string; slug: string }>
      ).map((c) => ({
        id: c._id,
        parentBrandId: c.parentBrandId,
        name: c.name,
        slug: c.slug,
      }));
    }
    return result;
  }, [allSubBrandConfigsRaw]);

  return { subBrands, allSubBrandConfigs };
}
