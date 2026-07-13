import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'oneui-native-components-sample:brand-data-source';

export type BrandDataSource = 'offline' | 'convex';

const BRAND_DATA_SOURCE_LABELS: Record<BrandDataSource, string> = {
  offline: 'Offline JSON',
  convex: 'Convex (live)',
};

export const BRAND_DATA_SOURCE_OPTIONS = Object.values(BRAND_DATA_SOURCE_LABELS);

export function brandDataSourceFromLabel(label: string): BrandDataSource | undefined {
  const entry = Object.entries(BRAND_DATA_SOURCE_LABELS).find(([, l]) => l === label);
  return entry ? (entry[0] as BrandDataSource) : undefined;
}

export function labelForBrandDataSource(source: BrandDataSource): string {
  return BRAND_DATA_SOURCE_LABELS[source];
}

function isBrandDataSource(value: string): value is BrandDataSource {
  return value === 'offline' || value === 'convex';
}

interface UseBrandDataSourceResult {
  brandDataSource: BrandDataSource;
  setBrandDataSource: (source: BrandDataSource) => void;
}

export function useBrandDataSource(): UseBrandDataSourceResult {
  const [brandDataSource, setBrandDataSourceState] = useState<BrandDataSource>('offline');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        // Only restore 'offline' — never auto-restore 'convex' on cold boot
        // because a local Convex server may not be running, causing WebSocket
        // "Chain validation failed" errors that block the app.
        if (stored === 'offline') {
          setBrandDataSourceState('offline');
        }
      })
      .catch(() => {});
  }, []);

  const setBrandDataSource = useCallback((source: BrandDataSource) => {
    setBrandDataSourceState(source);
    AsyncStorage.setItem(STORAGE_KEY, source).catch(() => {});
  }, []);

  return { brandDataSource, setBrandDataSource };
}
