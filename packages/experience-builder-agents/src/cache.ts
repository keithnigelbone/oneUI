/**
 * cache.ts — D-05 Response Caching: a thin, Lab-owned DETERMINISTIC memoization
 * wrapper for the repeatable advisory steps (planner / ToV / Design).
 *
 * WHY this is hand-rolled and NOT `MastraServerCache` (Pitfall B / RESEARCH
 * lines 154-159): `@mastra/core/cache`'s `MastraServerCache` /
 * `InMemoryServerCache` is a GENERIC stream-event / temp-data KV+list store —
 * it is NOT an automatic "same prompt → cached completion" LLM-response cache at
 * the pinned `@mastra/core@1.37.1`. D-05 Response Caching is therefore a
 * Lab-owned memoization keyed on a STABLE hash of the canonical inputs
 * `{ brandId, artifactType, outputProfile, prompt, requestedComponents, model }`.
 * It serves the P2 determinism goal (identical inputs → one model call) and cuts
 * dev cost.
 *
 * The hashing mirrors the repo's existing `computeInputHash` idiom
 * (`packages/shared/src/engine/cacheKey.ts` — JSON-serialize canonical fields →
 * djb2). We re-implement the tiny djb2 here rather than import the shared one so
 * this Lab module stays node-safe and dependency-light (the shared helper is
 * tuned for brand-CSS inputs, not advisory-step inputs).
 *
 * TEST ISOLATION (no leaky singleton): the cache is a `createCache()` FACTORY
 * returning a fresh instance, and `memoize` takes a cache instance. A
 * module-level convenience cache exists for ergonomic call sites, but
 * `clearCache()` resets it so a fresh Vitest case starts with zero entries — the
 * "exactly one model call per two identical inputs" assertion is sound and
 * order-independent.
 */

/** The canonical inputs a cache key is derived from (D-05). */
export interface CacheKeyInput {
  brandId?: string;
  artifactType?: string;
  outputProfile?: string;
  prompt?: string;
  requestedComponents?: readonly string[];
  /** The model id; different models → different key (different output). */
  model?: string;
  /**
   * Optional namespace so the planner / ToV / Design steps don't collide on
   * otherwise-identical canonical inputs (e.g. same prompt, different step).
   */
  step?: string;
}

/** djb2 string hash → hex (mirrors `cacheKey.ts` in @oneui/shared). */
function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + charCode, kept in 32-bit range.
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  // Unsigned hex.
  return (hash >>> 0).toString(16);
}

/**
 * Produce a STABLE hash over the canonical inputs. Identical canonical inputs →
 * identical hash; any field change → a different hash. Field order in the
 * serialized object is fixed here so key stability does not depend on caller
 * property order. `requestedComponents` is sorted so `['a','b']` and `['b','a']`
 * (same requested set) collapse to one key.
 */
export function cacheKey(input: CacheKeyInput): string {
  const canonical = {
    step: input.step ?? null,
    brandId: input.brandId ?? null,
    artifactType: input.artifactType ?? null,
    outputProfile: input.outputProfile ?? null,
    prompt: input.prompt ?? null,
    requestedComponents: input.requestedComponents
      ? [...input.requestedComponents].sort()
      : null,
    model: input.model ?? null,
  };
  return djb2Hash(JSON.stringify(canonical));
}

/** A fresh, isolated in-memory memoization store. */
export interface ResponseCache {
  /** Read a cached value by key (undefined on miss). */
  get<T>(key: string): T | undefined;
  /** Write a value under a key. */
  set<T>(key: string, value: T): void;
  /** True if a value is cached under a key. */
  has(key: string): boolean;
  /** Drop all entries (used by `clearCache()` / test `beforeEach`). */
  clear(): void;
  /** Current entry count (for assertions/diagnostics). */
  size(): number;
}

/**
 * Create a fresh, isolated `ResponseCache` instance backed by an in-memory Map
 * (the dev/test store; a Convex durable path is a later phase). Each call
 * returns a NEW instance — no shared module-level state — so tests that build
 * their own cache are fully isolated.
 */
export function createCache(): ResponseCache {
  const store = new Map<string, unknown>();
  return {
    get<T>(key: string): T | undefined {
      return store.get(key) as T | undefined;
    },
    set<T>(key: string, value: T): void {
      store.set(key, value);
    },
    has(key: string): boolean {
      return store.has(key);
    },
    clear(): void {
      store.clear();
    },
    size(): number {
      return store.size;
    },
  };
}

/**
 * Memoize an async step against a cache instance. On a key HIT the cached value
 * is returned WITHOUT invoking `compute`; on a MISS `compute` runs once and its
 * result is stored. This is the D-05 Response-Caching primitive the planner /
 * ToV / Design steps wrap so identical inputs do not re-call the model.
 *
 * The cache instance is a parameter (not a hidden singleton) so call sites and
 * tests control lifetime explicitly.
 */
export async function memoize<T>(
  cache: ResponseCache,
  key: string,
  compute: () => Promise<T>,
): Promise<T> {
  if (cache.has(key)) {
    return cache.get<T>(key) as T;
  }
  const value = await compute();
  cache.set(key, value);
  return value;
}

// ---------------------------------------------------------------------------
// Module-level convenience cache + reset (ergonomic call sites; test-isolated)
// ---------------------------------------------------------------------------

let _sharedCache: ResponseCache = createCache();

/** The process-wide convenience cache used by the advisory steps by default. */
export function sharedCache(): ResponseCache {
  return _sharedCache;
}

/**
 * Reset the shared cache (tests call this in `beforeEach`). Replaces the
 * instance so no entry leaks across Vitest cases — the "exactly one model call"
 * assertion stays order-independent.
 */
export function clearCache(): void {
  _sharedCache = createCache();
}
