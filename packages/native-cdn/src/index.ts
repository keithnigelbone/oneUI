/**
 * @oneui/native-cdn
 *
 * Runtime brand-data loader for OneUI React Native. The web counterpart
 * (`@oneui/vite-plugin`) fetches brand CSS at build time and exposes virtual
 * modules; Metro has no virtual-module system and `<OneUIBrandProvider>`
 * consumes a `BrandData` JSON object at runtime, so this package instead
 * fetches that JSON from the CDN on the device — cache-first, revalidating in
 * the background — which also makes brand updates OTA (no app rebuild).
 *
 * CDN layout (set `cdnUrl` to the base up to, but not including, `brand-data`):
 *
 *   <cdnUrl>/brand-data/
 *     jio/
 *       latest.json
 *       sub-brands/jiomart/latest.json
 *     tira/
 *       latest.json
 *
 * Usage:
 *
 *   import AsyncStorage from '@react-native-async-storage/async-storage';
 *   import { OneUICdnProvider, useCdnBrandData, createAsyncStorageCache } from '@oneui/native-cdn';
 *   import { OneUIBrandProvider } from '@oneui/ui-native';
 *
 *   function Root() {
 *     return (
 *       <OneUICdnProvider cdnUrl="https://<host>/JDS/ReactNative" storage={createAsyncStorageCache(AsyncStorage)}>
 *         <Themed />
 *       </OneUICdnProvider>
 *     );
 *   }
 *
 *   function Themed() {
 *     // Sub-brand variant fetches BOTH the parent brandData and the sub-brand themeData.
 *     const { brandData, themeData } = useCdnBrandData('jio', 'jiomart');
 *     return (
 *       <OneUIBrandProvider
 *         brandData={brandData}
 *         themeData={themeData}
 *         themeMode="light"
 *         loadingFallback={<Spinner />}
 *       >
 *         <App />
 *       </OneUIBrandProvider>
 *     );
 *   }
 */

export { OneUICdnProvider, useCdnConfig } from './CdnProvider';
export type { OneUICdnProviderProps } from './CdnProvider';

export { useCdnBrandData } from './useCdnBrandData';
export type { UseCdnBrandDataOptions, UseCdnBrandDataResult } from './useCdnBrandData';

export {
  createMemoryStorage,
  createAsyncStorageCache,
  createFileSystemCache,
} from './storage';
export type { FileCacheBackend } from './storage';

export {
  readCachedBrandData,
  readCachedThemeData,
  fetchFreshBrandData,
  fetchFreshThemeData,
  loadBrandData,
  clearCachedBrandData,
} from './fetchBrandData';
export type { JsonIOParams } from './fetchBrandData';

export { brandDataUrl, subBrandDataUrl, resolveBrandUrl, normalizeCdnUrl } from './urls';

export type {
  BrandData,
  ThemeData,
  SubBrandFile,
  CdnConfig,
  CdnCacheStorage,
  BrandDataSource,
  BrandDataStatus,
} from './types';
