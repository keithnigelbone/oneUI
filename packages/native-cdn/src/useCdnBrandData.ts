import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BrandData,
  BrandDataSource,
  BrandDataStatus,
  CdnCacheStorage,
  ThemeData,
} from './types';
import { brandDataUrl, subBrandDataUrl } from './urls';
import { createMemoryStorage } from './storage';
import {
  fetchFreshBrandData,
  fetchFreshThemeData,
  readCachedBrandData,
  readCachedThemeData,
} from './fetchBrandData';
import { useCdnConfig } from './CdnProvider';

export interface UseCdnBrandDataOptions {
  /** Override the provider's `cdnUrl`. Required if there is no `<OneUICdnProvider>`. */
  cdnUrl?: string;
  /** CDN file version stem. Default `'latest'` (→ `latest.json`). */
  version?: string;
  /** Override the provider's cache adapter. */
  storage?: CdnCacheStorage;
  /** Override the provider's cache-key prefix. Default `'oneui-cdn:'`. */
  cachePrefix?: string;
  /**
   * After serving cached payloads, revalidate from the network and swap to the
   * fresh copies when they arrive (stale-while-revalidate). Default `true`. Set
   * `false` to use cache as long as it exists and only hit the network on a miss.
   */
  revalidate?: boolean;
  /** Skip loading entirely — e.g. while the brand selection is undecided. Default `true`. */
  enabled?: boolean;
}

export interface UseCdnBrandDataResult {
  /** Parent-brand payload — pass to `<OneUIBrandProvider brandData={…}>`. */
  brandData: BrandData | undefined;
  /**
   * Sub-brand accent delta — pass to `<OneUIBrandProvider themeData={…}>`.
   * `null` for the parent brand, or when the sub-brand delta is unavailable
   * (in which case the brand renders with its parent accents).
   */
  themeData: ThemeData | null;
  status: BrandDataStatus;
  /** Where `brandData` currently came from. `undefined` until first resolution. */
  source: BrandDataSource | undefined;
  /**
   * Latest failure. If `brandData` is also present it's a stale-while-error /
   * partial state (e.g. parent shown but the sub-brand delta refresh failed).
   */
  error: Error | undefined;
  /** Force a fresh network revalidation. */
  refetch: () => void;
}

interface InternalState {
  brandData: BrandData | undefined;
  themeData: ThemeData | null;
  status: BrandDataStatus;
  source: BrandDataSource | undefined;
  error: Error | undefined;
}

const INITIAL: InternalState = {
  brandData: undefined,
  themeData: null,
  status: 'loading',
  source: undefined,
  error: undefined,
};

// Shared process-lifetime fallback so every hook without an explicit adapter
// reads/writes the same in-memory cache.
let sharedMemoryStorage: CdnCacheStorage | undefined;
function defaultStorage(): CdnCacheStorage {
  if (!sharedMemoryStorage) sharedMemoryStorage = createMemoryStorage();
  return sharedMemoryStorage;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Load a brand from the CDN at runtime, cache-first with background
 * revalidation, and feed `<OneUIBrandProvider>`.
 *
 * For a sub-brand variant this fetches BOTH the parent `latest.json`
 * (`brandData`) and the sub-brand `latest.json` (`themeData`) — the provider
 * needs both to merge the accent delta onto the parent foundation.
 *
 * ```tsx
 * const { brandData, themeData, status } = useCdnBrandData('jio', 'jiomart');
 *
 * return (
 *   <OneUIBrandProvider
 *     brandData={brandData}
 *     themeData={themeData}
 *     themeMode="light"
 *     loadingFallback={<Spinner />}
 *   >
 *     <App />
 *   </OneUIBrandProvider>
 * );
 * ```
 *
 * @param brand   Parent brand slug (e.g. `'jio'`, `'tira'`).
 * @param variant Sub-brand slug (e.g. `'jiomart'`). Omit / `'base'` for the parent.
 */
export function useCdnBrandData(
  brand: string,
  variant?: string,
  options: UseCdnBrandDataOptions = {},
): UseCdnBrandDataResult {
  const cfg = useCdnConfig();

  const cdnUrl = options.cdnUrl ?? cfg?.cdnUrl;
  const storage = options.storage ?? cfg?.storage ?? defaultStorage();
  const cachePrefix = options.cachePrefix ?? cfg?.cachePrefix ?? 'oneui-cdn:';
  const version = options.version ?? 'latest';
  const revalidate = options.revalidate ?? true;
  const enabled = options.enabled ?? true;

  const isSub = !!variant && variant !== 'base';
  const parentUrl = useMemo(
    () => (cdnUrl && brand ? brandDataUrl(cdnUrl, brand, version) : undefined),
    [cdnUrl, brand, version],
  );
  const subUrl = useMemo(
    () => (cdnUrl && brand && isSub ? subBrandDataUrl(cdnUrl, brand, variant!, version) : undefined),
    [cdnUrl, brand, isSub, variant, version],
  );

  const [state, setState] = useState<InternalState>(INITIAL);

  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  // Latest brandData, visible to the effect without being a dependency.
  const brandDataRef = useRef<BrandData | undefined>(undefined);
  brandDataRef.current = state.brandData;

  useEffect(() => {
    if (!enabled) return;

    if (!cdnUrl) {
      setState({
        ...INITIAL,
        status: 'error',
        error: new Error(
          '[@oneui/native-cdn] cdnUrl is not set — wrap the app in <OneUICdnProvider cdnUrl=…> or pass { cdnUrl } to useCdnBrandData.',
        ),
      });
      return;
    }
    if (!parentUrl) return;

    let cancelled = false;
    const controller = new AbortController();
    const io = { storage, cachePrefix, signal: controller.signal };

    // New target: reset to loading, drop stale data.
    setState(INITIAL);

    (async () => {
      // 1. Serve cache immediately if present.
      const [cachedBrand, cachedTheme] = await Promise.all([
        readCachedBrandData({ url: parentUrl, ...io }),
        subUrl ? readCachedThemeData({ url: subUrl, ...io }) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (cachedBrand) {
        setState({
          brandData: cachedBrand,
          themeData: cachedTheme,
          status: 'success',
          source: 'cache',
          error: undefined,
        });
        if (!revalidate) return;
      }

      // 2. Revalidate from the network. Parent is required; sub-brand delta is
      //    optional — if it fails we keep the cached delta (or null) so the
      //    brand still renders with parent accents.
      const [brandRes, themeRes] = await Promise.allSettled([
        fetchFreshBrandData({ url: parentUrl, ...io }),
        subUrl ? fetchFreshThemeData({ url: subUrl, ...io }) : Promise.resolve<ThemeData | null>(null),
      ]);
      if (cancelled || controller.signal.aborted) return;

      if (brandRes.status === 'rejected') {
        const error = toError(brandRes.reason);
        // Keep showing cache if we have it; otherwise fail.
        if (brandDataRef.current) {
          setState((s) => ({ ...s, error }));
        } else {
          setState({ ...INITIAL, status: 'error', error });
        }
        return;
      }

      const themeData = themeRes.status === 'fulfilled' ? themeRes.value : cachedTheme;
      const themeError = themeRes.status === 'rejected' ? toError(themeRes.reason) : undefined;
      setState({
        brandData: brandRes.value,
        themeData: themeData ?? null,
        status: 'success',
        source: 'network',
        error: themeError,
      });
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // brandDataRef is a mutable ref, intentionally not a dependency.
  }, [parentUrl, subUrl, cdnUrl, storage, cachePrefix, revalidate, enabled, nonce]);

  return { ...state, refetch };
}
