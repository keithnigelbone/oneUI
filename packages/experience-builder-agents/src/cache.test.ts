/**
 * cache.test.ts — D-05 Response Caching behaviors (credential-free, no model).
 *
 *   1. cacheKey is identical for identical canonical inputs.
 *   2. cacheKey differs when ANY canonical field changes.
 *   3. memoize calls the underlying compute EXACTLY ONCE for two identical-input
 *      invocations (cache hit on the second).
 *   4. Cache state does NOT leak across cases: a fresh createCache() instance
 *      (and clearCache() in beforeEach for the shared cache) means each case
 *      starts with zero entries — the "exactly one call" assertion is sound and
 *      order-independent.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cacheKey,
  createCache,
  memoize,
  sharedCache,
  clearCache,
  type CacheKeyInput,
} from './cache';

const BASE: CacheKeyInput = {
  brandId: 'jio-default',
  artifactType: 'web-ui',
  outputProfile: 'web-desktop',
  prompt: 'a hero landing page',
  requestedComponents: ['Button', 'Badge'],
  model: 'claude-sonnet-4-6',
};

// No leaky singleton across cases (D-05 / acceptance): reset the shared cache.
beforeEach(() => {
  clearCache();
});

describe('cacheKey — stable hash over canonical inputs', () => {
  it('produces an identical hash for identical canonical inputs', () => {
    expect(cacheKey(BASE)).toBe(cacheKey({ ...BASE }));
  });

  it('is order-independent for requestedComponents (same set → same key)', () => {
    const a = cacheKey({ ...BASE, requestedComponents: ['Button', 'Badge'] });
    const b = cacheKey({ ...BASE, requestedComponents: ['Badge', 'Button'] });
    expect(a).toBe(b);
  });

  it('produces a different hash when ANY canonical field changes', () => {
    const base = cacheKey(BASE);
    expect(cacheKey({ ...BASE, brandId: 'other-brand' })).not.toBe(base);
    expect(cacheKey({ ...BASE, artifactType: 'app-screen' })).not.toBe(base);
    expect(cacheKey({ ...BASE, outputProfile: 'web-mobile' })).not.toBe(base);
    expect(cacheKey({ ...BASE, prompt: 'a different prompt' })).not.toBe(base);
    expect(cacheKey({ ...BASE, requestedComponents: ['Button'] })).not.toBe(base);
    expect(cacheKey({ ...BASE, model: 'claude-haiku' })).not.toBe(base);
    expect(cacheKey({ ...BASE, step: 'planner' })).not.toBe(base);
  });
});

describe('memoize — one compute per two identical-input invocations', () => {
  it('serves the cached result on the second identical-key call (compute runs once)', async () => {
    const cache = createCache();
    let calls = 0;
    const compute = async () => {
      calls += 1;
      return { value: 'computed' };
    };

    const key = cacheKey(BASE);
    const first = await memoize(cache, key, compute);
    const second = await memoize(cache, key, compute);

    expect(first).toEqual({ value: 'computed' });
    expect(second).toEqual(first);
    // Cache HIT on the second call — underlying compute invoked EXACTLY ONCE.
    expect(calls).toBe(1);
    expect(cache.size()).toBe(1);
  });

  it('re-computes for a different key (different canonical input)', async () => {
    const cache = createCache();
    let calls = 0;
    const compute = async () => {
      calls += 1;
      return calls;
    };

    await memoize(cache, cacheKey(BASE), compute);
    await memoize(cache, cacheKey({ ...BASE, prompt: 'other' }), compute);

    expect(calls).toBe(2);
    expect(cache.size()).toBe(2);
  });
});

describe('no leaky singleton — fresh instance per case', () => {
  it('a fresh createCache() starts empty', () => {
    const cache = createCache();
    expect(cache.size()).toBe(0);
    expect(cache.has(cacheKey(BASE))).toBe(false);
  });

  it('the shared cache is reset between cases (cleared in beforeEach)', async () => {
    // beforeEach ran clearCache(); the shared cache starts empty here regardless
    // of any prior case that may have written to it.
    expect(sharedCache().size()).toBe(0);

    let calls = 0;
    const compute = async () => {
      calls += 1;
      return 'x';
    };
    await memoize(sharedCache(), cacheKey(BASE), compute);
    await memoize(sharedCache(), cacheKey(BASE), compute);
    expect(calls).toBe(1);
  });
});
