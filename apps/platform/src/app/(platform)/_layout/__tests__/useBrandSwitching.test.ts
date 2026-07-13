/**
 * useBrandSwitching — handlers + side-effects for brand / sub-brand switching.
 *
 * Mocks the brandLogoCache module's writeBrandLogoCache so we can assert
 * the cache is updated whenever the brand changes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const writeLogoCache = vi.fn();
vi.mock('../lib/brandLogoCache', () => ({
  writeBrandLogoCache: (svg: string | undefined) => writeLogoCache(svg),
}));

const clearOptimisticPathMock = vi.fn();
vi.mock('@/contexts/PlatformNavigationContext', () => ({
  usePlatformNavigation: () => ({
    clearOptimisticPath: clearOptimisticPathMock,
  }),
}));

import { useBrandSwitching } from '../BrandSwitching';

beforeEach(() => {
  writeLogoCache.mockClear();
  clearOptimisticPathMock.mockClear();
});

// Shared render helper — applies sensible defaults so each test only writes
// the props that matter to it. Returns the same shape as renderHook.
type Args = Parameters<typeof useBrandSwitching>[0];
function renderSwitching(overrides: Partial<Args> = {}) {
  const defaults: Args = {
    availableBrands: [],
    subBrands: [],
    currentBrand: null,
    currentSubBrand: null,
    setBrand: vi.fn(),
    setSubBrand: vi.fn(),
    pendingSubBrandIdRef: { current: null },
  };
  const args = { ...defaults, ...overrides };
  const result = renderHook(() => useBrandSwitching(args));
  return { ...result, args };
}

function makeCurrentSubBrand(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-a',
    parentBrandId: 'jio',
    name: 'Jio Mart',
    slug: 'jio-mart',
    primary: subA.primary,
    secondary: subA.secondary,
    sparkle: subA.sparkle,
    brandBg: subA.brandBg,
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const jio = {
  id: 'jio',
  name: 'Jio',
  slug: 'jio',
  status: 'active',
  isSystem: false,
  logoSvg: '<svg id="jio"/>',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const acme = {
  id: 'acme',
  name: 'Acme',
  slug: 'acme',
  status: 'active',
  isSystem: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const subA = {
  _id: 'sub-a',
  parentBrandId: 'jio',
  name: 'Jio Mart',
  slug: 'jio-mart',
  primary: { scaleName: 'jio-blue', baseStep: 600 },
  secondary: { scaleName: 'jio-orange', baseStep: 500 },
  sparkle: { scaleName: 'jio-cyan', baseStep: 500 },
  brandBg: { scaleName: 'neutral', backgroundStep: { light: 100, dark: 2400 } },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const subB = {
  _id: 'sub-b',
  parentBrandId: 'jio',
  name: 'Jio Cinema',
  slug: 'jio-cinema',
  primary: { scaleName: 'red', baseStep: 600 },
  secondary: { scaleName: 'orange', baseStep: 500 },
  sparkle: { scaleName: 'pink', baseStep: 500 },
  brandBg: { scaleName: 'neutral', backgroundStep: { light: 100, dark: 2400 } },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('useBrandSwitching — logo cache effect', () => {
  it('writes logoSvg to cache when currentBrand has one', () => {
    renderSwitching({ availableBrands: [jio], currentBrand: jio });
    expect(writeLogoCache).toHaveBeenCalledWith('<svg id="jio"/>');
  });

  it('writes undefined to cache when currentBrand has no logoSvg', () => {
    renderSwitching({ availableBrands: [acme], currentBrand: acme });
    expect(writeLogoCache).toHaveBeenCalledWith(undefined);
  });

  it('does not write to cache when there is no current brand', () => {
    renderSwitching();
    expect(writeLogoCache).not.toHaveBeenCalled();
  });
});

describe('useBrandSwitching — handleBrandChange', () => {
  it('selects a known brand and clears optimistic path', () => {
    const { result, args } = renderSwitching({ availableBrands: [jio, acme] });

    act(() => {
      result.current.handleBrandChange('acme');
    });

    expect(args.setBrand).toHaveBeenCalledWith(acme);
    expect(clearOptimisticPathMock).toHaveBeenCalled();
    expect(writeLogoCache).toHaveBeenCalledWith(undefined);
  });

  it('ignores an unknown brandId', () => {
    const { result, args } = renderSwitching({ availableBrands: [jio] });

    act(() => {
      result.current.handleBrandChange('does-not-exist');
    });

    expect(args.setBrand).not.toHaveBeenCalled();
    expect(clearOptimisticPathMock).not.toHaveBeenCalled();
  });
});

describe('useBrandSwitching — handleSubBrandChange', () => {
  const baseArgs = { availableBrands: [jio], subBrands: [subA, subB], currentBrand: jio };

  it('clears the sub-brand when subBrandId is null', () => {
    const { result, args } = renderSwitching(baseArgs);
    act(() => result.current.handleSubBrandChange(null));
    expect(args.setSubBrand).toHaveBeenCalledWith(null);
  });

  it('selects a known sub-brand by id', () => {
    const { result, args } = renderSwitching(baseArgs);
    act(() => result.current.handleSubBrandChange('sub-b'));
    const calls = (args.setSubBrand as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const last = calls[calls.length - 1][0];
    expect(last.id).toBe('sub-b');
    expect(last.name).toBe('Jio Cinema');
  });

  it('ignores an unknown sub-brand id', () => {
    const { result, args } = renderSwitching({ ...baseArgs, subBrands: [subA] });
    act(() => result.current.handleSubBrandChange('not-here'));
    expect(args.setSubBrand).not.toHaveBeenCalled();
  });
});

describe('useBrandSwitching — handlePickerChange', () => {
  it('switches brand and sub-brand together when both are provided', () => {
    const { result, args } = renderSwitching({
      availableBrands: [jio, acme],
      subBrands: [subA, subB],
    });

    act(() => result.current.handlePickerChange({ brandId: 'jio', subBrandId: 'sub-a' }));

    expect(args.setBrand).toHaveBeenCalledWith(jio);
    expect(clearOptimisticPathMock).toHaveBeenCalled();
    const subCalls = (args.setSubBrand as ReturnType<typeof vi.fn>).mock.calls;
    expect(subCalls[subCalls.length - 1][0].id).toBe('sub-a');
  });

  it('switches brand only when subBrandId is null', () => {
    const { result, args } = renderSwitching({
      availableBrands: [jio, acme],
      subBrands: [subA],
    });

    act(() => result.current.handlePickerChange({ brandId: 'acme', subBrandId: null }));

    expect(args.setBrand).toHaveBeenCalledWith(acme);
    expect(args.setSubBrand).not.toHaveBeenCalled();
  });

  it('ignores an unknown brandId in picker change', () => {
    const { result, args } = renderSwitching({
      availableBrands: [jio],
      subBrands: [subA],
    });

    act(() => result.current.handlePickerChange({ brandId: 'nope', subBrandId: 'sub-a' }));

    expect(args.setBrand).not.toHaveBeenCalled();
    expect(args.setSubBrand).not.toHaveBeenCalled();
  });
});

describe('useBrandSwitching — pending sub-brand restore effect', () => {
  it('restores the pending sub-brand once sub-brands load and clears the ref', () => {
    const pendingSubBrandIdRef = { current: 'sub-b' as string | null };
    const { args } = renderSwitching({
      availableBrands: [jio],
      subBrands: [subA, subB],
      currentBrand: jio,
      pendingSubBrandIdRef,
    });
    const calls = (args.setSubBrand as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1][0].id).toBe('sub-b');
    expect(pendingSubBrandIdRef.current).toBeNull();
  });

  it('discards a pending sub-brand that belongs to a different brand', () => {
    const foreignSub = { ...subA, _id: 'sub-x', parentBrandId: 'acme' };
    const pendingSubBrandIdRef = { current: 'sub-x' as string | null };
    const { args } = renderSwitching({
      availableBrands: [jio],
      subBrands: [foreignSub],
      currentBrand: jio,
      pendingSubBrandIdRef,
    });
    expect(args.setSubBrand).not.toHaveBeenCalled();
    expect(pendingSubBrandIdRef.current).toBeNull();
  });

  it('keeps the pending id while sub-brands are still loading', () => {
    const pendingSubBrandIdRef = { current: 'sub-a' as string | null };
    const { args } = renderSwitching({
      availableBrands: [jio],
      subBrands: undefined,
      currentBrand: jio,
      pendingSubBrandIdRef,
    });
    expect(args.setSubBrand).not.toHaveBeenCalled();
    expect(pendingSubBrandIdRef.current).toBe('sub-a');
  });
});

describe('useBrandSwitching — sub-brand sync effect', () => {
  const baseArgs = { availableBrands: [jio], subBrands: [subA], currentBrand: jio };

  it('updates context sub-brand when Convex copy diverges', () => {
    const currentSubBrand = makeCurrentSubBrand({ name: 'Old Name' });
    const { args } = renderSwitching({ ...baseArgs, currentSubBrand });
    const calls = (args.setSubBrand as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1][0].name).toBe('Jio Mart');
  });

  it('does not update when Convex copy matches the current sub-brand', () => {
    const currentSubBrand = makeCurrentSubBrand({ name: subA.name, slug: subA.slug });
    const { args } = renderSwitching({ ...baseArgs, currentSubBrand });
    expect(args.setSubBrand).not.toHaveBeenCalled();
  });

  it('does not update when current sub-brand id is missing from Convex list', () => {
    const currentSubBrand = makeCurrentSubBrand({ id: 'orphan', name: 'Orphan', slug: 'orphan' });
    const { args } = renderSwitching({ ...baseArgs, currentSubBrand });
    expect(args.setSubBrand).not.toHaveBeenCalled();
  });
});
