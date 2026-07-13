/**
 * useActiveBrand.test.ts
 *
 * Tests for the hook that persists/restores the active brand selection
 * via AsyncStorage and Convex.
 *
 * Strategy: we test the hook's state machine directly by calling the
 * exported function with pre-wired mocks. Because the hook uses
 * `useEffect` and `useState`, we use React's `act()` with a minimal
 * React renderer to drive state transitions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Import mocked modules so we can configure them per test
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';

// The hook under test
import { useActiveBrand } from './useActiveBrand';

// Re-usable no-op promise for setItem default behaviour
const resolvedVoid = () => Promise.resolve();

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

type Brand = { _id: string; name: string; isSystem?: boolean };

const SYSTEM_BRAND: Brand = { _id: 'sys-1', name: 'System', isSystem: true };
const BRAND_A: Brand = { _id: 'brand-a', name: 'Brand A' };
const BRAND_B: Brand = { _id: 'brand-b', name: 'Brand B' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockAsyncStorageGet(value: string | null) {
  vi.mocked(AsyncStorage.getItem).mockImplementation(async () => value);
}

function mockBrandList(brands: Brand[] | undefined) {
  vi.mocked(useQuery).mockReturnValue(brands as ReturnType<typeof useQuery>);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useActiveBrand — initial state', () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockClear();
    vi.mocked(AsyncStorage.setItem).mockImplementation(resolvedVoid as typeof AsyncStorage.setItem);
    vi.mocked(useQuery).mockReset();
  });

  it('starts with activeId null before AsyncStorage resolves', async () => {
    // AsyncStorage never resolves in this test
    vi.mocked(AsyncStorage.getItem).mockReturnValue(new Promise(() => {}));
    mockBrandList(undefined);

    const { result } = renderHook(() => useActiveBrand());
    // Before hydration, activeId is null
    expect(result.current.activeId).toBeNull();
  });

  it('returns undefined brands when the query is loading', async () => {
    mockAsyncStorageGet(null);
    mockBrandList(undefined);

    const { result } = renderHook(() => useActiveBrand());
    expect(result.current.brands).toBeUndefined();
  });
});

describe('useActiveBrand — hydration from AsyncStorage', () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockClear();
    vi.mocked(AsyncStorage.setItem).mockImplementation(resolvedVoid as typeof AsyncStorage.setItem);
    vi.mocked(useQuery).mockReset();
  });

  it('adopts stored brand ID when it exists in the brands list', async () => {
    mockAsyncStorageGet(BRAND_A._id);
    mockBrandList([BRAND_A, BRAND_B]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      // Let all microtasks (AsyncStorage promise + useEffect) settle
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.activeId).toBe(BRAND_A._id);
  });

  it('falls back to the first non-system brand when stored ID is not in the list', async () => {
    mockAsyncStorageGet('stale-id-that-does-not-exist');
    mockBrandList([SYSTEM_BRAND, BRAND_A, BRAND_B]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // SYSTEM_BRAND has isSystem = true so it's skipped; BRAND_A is first non-system
    expect(result.current.activeId).toBe(BRAND_A._id);
  });

  it('falls back to first brand (system) when all brands are system brands', async () => {
    mockAsyncStorageGet('stale-id');
    mockBrandList([SYSTEM_BRAND]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // No non-system brand → picks first (SYSTEM_BRAND)
    expect(result.current.activeId).toBe(SYSTEM_BRAND._id);
  });

  it('keeps null when brands list is empty', async () => {
    mockAsyncStorageGet(null);
    mockBrandList([]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // hydrated but brands.length === 0 → early return, activeId stays null
    expect(result.current.activeId).toBeNull();
  });

  it('keeps stored ID when null is returned from AsyncStorage', async () => {
    mockAsyncStorageGet(null);
    mockBrandList([BRAND_A, BRAND_B]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // null → setActiveIdState(null) → hydrated + no stored ID → fallback to BRAND_A
    expect(result.current.activeId).toBe(BRAND_A._id);
  });
});

describe('useActiveBrand — setActiveId', () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockClear();
    vi.mocked(AsyncStorage.setItem).mockImplementation(resolvedVoid as typeof AsyncStorage.setItem);
    vi.mocked(useQuery).mockReset();
  });

  it('updates activeId in state', async () => {
    mockAsyncStorageGet(BRAND_A._id);
    mockBrandList([BRAND_A, BRAND_B]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.setActiveId(BRAND_B._id);
    });

    expect(result.current.activeId).toBe(BRAND_B._id);
  });

  it('calls AsyncStorage.setItem with the new ID', async () => {
    mockAsyncStorageGet(BRAND_A._id);
    mockBrandList([BRAND_A, BRAND_B]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.setActiveId(BRAND_B._id);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'oneui-mobile:last-brand-id',
      BRAND_B._id,
    );
  });

  it('does not throw when AsyncStorage.setItem rejects (best-effort persistence)', async () => {
    vi.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk full'));
    mockAsyncStorageGet(null);
    mockBrandList([BRAND_A]);

    const { result } = renderHook(() => useActiveBrand());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Should not throw
    await expect(
      act(() => {
        result.current.setActiveId(BRAND_A._id);
      }),
    ).resolves.not.toThrow();
  });
});
