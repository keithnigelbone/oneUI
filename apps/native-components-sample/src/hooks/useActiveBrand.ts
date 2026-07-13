import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { BrandDataSource } from './useBrandDataSource';
import * as OfflineBrandModule from '../brand-data/offlineBrandData.generated';

const getOfflineSubBrandNames = OfflineBrandModule.getOfflineSubBrandNames;

const STORAGE_KEY = 'oneui-native-components-sample:last-brand-id';
const SUB_BRAND_STORAGE_KEY = 'oneui-native-components-sample:last-sub-brand-id';

/** Brand name we prefer to land on when no previous selection is stored. */
const DEFAULT_BRAND_NAME = 'Jio';

/** Convert a slug like "native-test" or "one-ui-theme" into a display name. */
function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type ConvexBrand = NonNullable<ReturnType<typeof useQuery<typeof api.brands.list>>>[number];
export type SubBrandConfig = NonNullable<ReturnType<typeof useQuery<typeof api.subBrandConfigs.getByParentBrand>>>[number];

/** Shape shared between Convex brands and synthetic offline brands. */
export interface NativeBrand {
  _id: string;
  name: string;
  isSystem?: boolean | null;
}

interface UseActiveBrandResult {
  brands: NativeBrand[] | undefined;
  activeId: string | null;
  setActiveId: (id: string) => void;
  subBrands: SubBrandConfig[] | undefined;
  activeSubBrandId: string | null;
  setActiveSubBrandId: (id: string | null) => void;
}

/**
 * Manages the active brand selection.
 *
 * When `brandDataSource` is `'offline'`, a synthetic brand list is built
 * immediately from `offlineBrandNames` — no Convex connection required.
 * Sub-brand support is only available in `'convex'` mode.
 */
export function useActiveBrand(
  brandDataSource: BrandDataSource,
  offlineBrandNames: string[] = [],
): UseActiveBrandResult {
  const isOffline = brandDataSource === 'offline';

  // Only hit Convex when in live mode — suppresses WebSocket errors in offline mode.
  const convexBrands = useQuery(
    api.brands.list,
    isOffline ? 'skip' : undefined,
  );

  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeSubBrandId, setActiveSubBrandIdState] = useState<string | null>(null);

  // Build synthetic brand list for offline mode — available immediately, no waiting.
  const offlineBrands = useMemo<NativeBrand[]>(
    () =>
      (offlineBrandNames ?? []).map((slug) => ({
        _id: slug,
        name: slugToDisplayName(slug),
        isSystem: null,
      })),
    [offlineBrandNames],
  );

  // Effective brand list: synthetic offline list or Convex list.
  const brands: NativeBrand[] | undefined = isOffline
    ? offlineBrands
    : (convexBrands as NativeBrand[] | undefined);

  // Sub-brands from Convex (live mode only).
  const convexSubBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    !isOffline && activeId
      ? { parentBrandId: activeId as Id<'brands'> }
      : 'skip',
  );

  // Offline sub-brands — derive from bundled theme data keys for the active brand.
  // Synthetic objects carry only `_id` and `name`; the Convex accent-field path in
  // ThemedShell is never reached in offline mode (it uses getOfflineThemeData instead).
  const offlineSubBrands = useMemo<SubBrandConfig[] | undefined>(() => {
    if (!isOffline || !activeId) return undefined;
    const names = getOfflineSubBrandNames?.(activeId) ?? [];
    if (names.length === 0) return undefined;
    return names.map((name) => ({
      _id: `${activeId}::${name}`,
      name,
    })) as unknown as SubBrandConfig[];
  }, [isOffline, activeId]);

  const subBrands = isOffline ? offlineSubBrands : convexSubBrands;

  // Hydrate activeId from AsyncStorage on first mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => setActiveIdState(stored))
      .finally(() => setHydrated(true));
  }, []);

  // Auto-select a brand when the list becomes available or when the stored ID
  // no longer belongs to the current list (e.g. switching offline ↔ convex).
  useEffect(() => {
    if (!hydrated || !brands || brands.length === 0) return;
    if (activeId && brands.some((b) => b._id === activeId)) return;
    const fallback =
      brands.find((b) => b.name === DEFAULT_BRAND_NAME || b._id === DEFAULT_BRAND_NAME.toLowerCase()) ??
      brands.find((b) => !b.isSystem) ??
      brands[0];
    setActiveIdState(fallback._id);
  }, [hydrated, brands, activeId]);

  // Restore persisted sub-brand selection (brand-scoped key).
  useEffect(() => {
    if (!activeId) return;
    AsyncStorage.getItem(`${SUB_BRAND_STORAGE_KEY}:${activeId}`)
      .then((stored) => setActiveSubBrandIdState(stored))
      .catch(() => {});
  }, [activeId]);

  // Clear sub-brand if it no longer belongs to the active brand.
  useEffect(() => {
    if (!subBrands || !activeSubBrandId) return;
    if (!subBrands.some((s) => s._id === activeSubBrandId)) {
      setActiveSubBrandIdState(null);
    }
  }, [subBrands, activeSubBrandId]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    setActiveSubBrandIdState(null);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  }, []);

  const setActiveSubBrandId = useCallback(
    (id: string | null) => {
      setActiveSubBrandIdState(id);
      if (activeId) {
        const key = `${SUB_BRAND_STORAGE_KEY}:${activeId}`;
        if (id) {
          AsyncStorage.setItem(key, id).catch(() => {});
        } else {
          AsyncStorage.removeItem(key).catch(() => {});
        }
      }
    },
    [activeId],
  );

  return { brands, activeId, setActiveId, subBrands, activeSubBrandId, setActiveSubBrandId };
}
