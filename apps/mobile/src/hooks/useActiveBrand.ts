import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';

const STORAGE_KEY = 'oneui-mobile:last-brand-id';

type Brand = NonNullable<ReturnType<typeof useQuery<typeof api.brands.list>>>[number];

interface UseActiveBrandResult {
  brands: Brand[] | undefined;
  activeId: string | null;
  setActiveId: (id: string) => void;
}

export function useActiveBrand(fallbackBrands?: Brand[]): UseActiveBrandResult {
  const wsBrands = useQuery(api.brands.list);
  const brands = wsBrands ?? fallbackBrands;
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => setActiveIdState(stored))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !brands || brands.length === 0) return;
    if (activeId && brands.some((b) => b._id === activeId)) return;
    const fallback = brands.find((b) => !b.isSystem) ?? brands[0];
    setActiveIdState(fallback._id);
  }, [hydrated, brands, activeId]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {
      // Persistence is best-effort; failure just means the next launch
      // falls back to the default brand selection.
    });
  }, []);

  return { brands, activeId, setActiveId };
}
