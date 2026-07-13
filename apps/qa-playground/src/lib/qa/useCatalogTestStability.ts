import { useCallback, useEffect, useState } from 'react';
import {
  type ComponentTestStability,
  fetchCatalogStabilityIndex,
} from './componentTestStability';

const REFRESH_INTERVAL_MS = 15_000;

export function useCatalogTestStability() {
  const [stabilityBySlug, setStabilityBySlug] = useState<Map<string, ComponentTestStability>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const index = await fetchCatalogStabilityIndex();
    setStabilityBySlug(index);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return { stabilityBySlug, loading, refresh };
}
