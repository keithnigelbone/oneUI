import type { CdnCacheStorage } from './types';

/**
 * In-memory cache adapter. Survives for the lifetime of the JS runtime only —
 * cleared on app cold start. This is the default when no `storage` is supplied,
 * so the loader works out of the box; pass a persistent adapter (below) for
 * offline-survivable caching.
 */
export function createMemoryStorage(): CdnCacheStorage {
  const map = new Map<string, string>();
  return {
    async getItem(key) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

/**
 * Adapt an AsyncStorage-compatible module for persistent caching.
 *
 * The interface already matches, so this is a typed pass-through — its purpose
 * is to make the wiring explicit and to give a single place to add key
 * namespacing later if needed.
 *
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * const storage = createAsyncStorageCache(AsyncStorage);
 * ```
 */
export function createAsyncStorageCache(asyncStorage: CdnCacheStorage): CdnCacheStorage {
  return {
    getItem: (key) => asyncStorage.getItem(key),
    setItem: (key, value) => asyncStorage.setItem(key, value),
    removeItem: asyncStorage.removeItem
      ? (key) => asyncStorage.removeItem!(key)
      : undefined,
  };
}

/**
 * Normalized file I/O surface for `createFileSystemCache`. Map whichever
 * filesystem library your app already uses (`expo-file-system`,
 * `react-native-fs`, …) onto these three methods — the package keeps no hard
 * dependency on any of them, so the same adapter serves Expo and bare CLI.
 */
export interface FileCacheBackend {
  /** Absolute directory the cache may write into (e.g. a docs/cache dir). */
  directory: string;
  /** Read a file's UTF-8 text, or `null` if it doesn't exist. Must not throw on a missing file. */
  readText(path: string): Promise<string | null>;
  /** Write UTF-8 text, creating parent directories as needed. */
  writeText(path: string, contents: string): Promise<void>;
  /** Delete a file; no-op if absent. */
  remove(path: string): Promise<void>;
}

/** Stable 32-bit FNV-1a-ish hash → base36, to disambiguate truncated filenames. */
function hashKey(key: string): string {
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/** Turn a cache key (a URL) into a safe, collision-resistant filename. */
function keyToFilename(key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  return `${safe}.${hashKey(key)}.json`;
}

/**
 * Persistent cache backed by the device filesystem — the right choice for Expo
 * apps that don't ship AsyncStorage. Cache files live under
 * `<directory>/oneui-cdn/`; keys (URLs) are sanitized + hashed into filenames.
 *
 * Wire it to `expo-file-system` (legacy API):
 *
 * ```ts
 * import * as FileSystem from 'expo-file-system/legacy';
 *
 * const storage = createFileSystemCache({
 *   directory: FileSystem.documentDirectory!,
 *   async readText(path) {
 *     const info = await FileSystem.getInfoAsync(path);
 *     return info.exists ? FileSystem.readAsStringAsync(path) : null;
 *   },
 *   async writeText(path, contents) {
 *     await FileSystem.makeDirectoryAsync(path.slice(0, path.lastIndexOf('/')), { intermediates: true });
 *     await FileSystem.writeAsStringAsync(path, contents);
 *   },
 *   remove: (path) => FileSystem.deleteAsync(path, { idempotent: true }),
 * });
 * ```
 */
export function createFileSystemCache(backend: FileCacheBackend): CdnCacheStorage {
  const dir = `${backend.directory.replace(/\/+$/, '')}/oneui-cdn`;
  const pathFor = (key: string): string => `${dir}/${keyToFilename(key)}`;
  return {
    getItem: (key) => backend.readText(pathFor(key)),
    setItem: (key, value) => backend.writeText(pathFor(key), value),
    removeItem: (key) => backend.remove(pathFor(key)),
  };
}
