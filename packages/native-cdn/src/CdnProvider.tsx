import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CdnConfig } from './types';

const CdnConfigContext = createContext<CdnConfig | null>(null);

export interface OneUICdnProviderProps extends CdnConfig {
  children: ReactNode;
}

/**
 * Provides the CDN base URL + cache adapter to every `useCdnBrandData` below
 * it, so individual call sites only name the brand/variant.
 *
 * ```tsx
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { OneUICdnProvider, createAsyncStorageCache } from '@oneui/native-cdn';
 *
 * <OneUICdnProvider
 *   cdnUrl="https://<host>/JDS/ReactNative"
 *   storage={createAsyncStorageCache(AsyncStorage)}
 * >
 *   <App />
 * </OneUICdnProvider>
 * ```
 */
export function OneUICdnProvider({
  cdnUrl,
  storage,
  cachePrefix,
  children,
}: OneUICdnProviderProps): React.ReactElement {
  const value = useMemo<CdnConfig>(
    () => ({ cdnUrl, storage, cachePrefix }),
    [cdnUrl, storage, cachePrefix],
  );
  return <CdnConfigContext.Provider value={value}>{children}</CdnConfigContext.Provider>;
}

/** Read the nearest `<OneUICdnProvider>` config, or `null` if there is none. */
export function useCdnConfig(): CdnConfig | null {
  return useContext(CdnConfigContext);
}
