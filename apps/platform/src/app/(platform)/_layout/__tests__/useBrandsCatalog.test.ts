/**
 * useBrandsCatalog — Convex-driven brand bootstrap + auto-select.
 *
 * Strategy: drive the hook through controllable mocks of `convex/react`
 * (useQuery + useMutation) and a fixture `api` from `@oneui/convex`.
 * The hook's behaviour to verify:
 *   - while brands === undefined, no side-effects fire
 *   - brands === [] triggers seedDefaultBrands
 *   - brands === [...] triggers ensureSystemBrand once
 *   - mapped availableBrands lists the system brand first
 *   - platformBrandId auto-registers to the system brand
 *   - auto-select resolution: prefs.defaultBrandId → prefs.lastOpenedBrandId
 *     → localStorage last-brand-id → first user brand → system brand,
 *     and it waits for the prefs row to resolve (prefsLoading)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAvailableScalesForSync, useBrandsCatalog } from '../useBrandsCatalog';

// Controllable Convex query result. Every renderHook call reads the latest value.
const queryResult: { current: unknown } = { current: undefined };
const seedMutation = vi.fn().mockResolvedValue(undefined);
const ensureMutation = vi.fn().mockResolvedValue(undefined);

vi.mock('convex/react', () => ({
  useQuery: () => queryResult.current,
  useMutation: (fn: unknown) => {
    if (fn === 'seed') return seedMutation;
    if (fn === 'ensure') return ensureMutation;
    return vi.fn();
  },
}));

vi.mock('@oneui/convex', () => ({
  api: {
    brands: {
      list: 'list',
      ensureSystemBrand: 'ensure',
      seedDefaultBrands: 'seed',
    },
  },
}));

interface FixtureBrandDoc {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  logoSvg?: string;
  status: 'draft' | 'active' | 'archived';
  isSystem?: boolean;
  primaryHue?: number;
  primaryChroma?: number;
  secondaryHue?: number;
  secondaryChroma?: number;
  baseBrand?: string;
  createdAt?: number;
  updatedAt?: number;
}

const systemBrandDoc: FixtureBrandDoc = {
  _id: 'sys',
  name: 'One UI Theme',
  slug: 'oneui',
  status: 'active',
  isSystem: true,
  logoSvg: '<svg id="sys"/>',
};

const jioBrandDoc: FixtureBrandDoc = {
  _id: 'jio',
  name: 'Jio',
  slug: 'jio',
  status: 'active',
  logoSvg: '<svg id="jio"/>',
};

const acmeBrandDoc: FixtureBrandDoc = {
  _id: 'acme',
  name: 'Acme',
  slug: 'acme',
  status: 'active',
  // No logoSvg — should be filtered out of the localStorage persistence.
};

beforeEach(() => {
  queryResult.current = undefined;
  seedMutation.mockClear();
  ensureMutation.mockClear();
  localStorage.clear();
});

// Shared render helper — sensible defaults so tests only override what matters.
type Args = Parameters<typeof useBrandsCatalog>[0];
function renderCatalog(overrides: Partial<Args> = {}) {
  const defaults: Args = {
    currentBrand: null,
    setBrand: vi.fn(),
    platformBrandId: undefined,
    setPlatformBrandId: vi.fn(),
    prefs: null,
    prefsLoading: false,
    pendingSubBrandIdRef: { current: null },
  };
  const args: Args = { ...defaults, ...overrides };
  const result = renderHook(() => useBrandsCatalog(args));
  return { ...result, args };
}

function autoSelectedId(setBrandMock: unknown): string | undefined {
  const calls = (setBrandMock as ReturnType<typeof vi.fn>).mock.calls;
  if (calls.length === 0) return undefined;
  return calls[0][0].id;
}

describe('useBrandsCatalog — loading + bootstrap effects', () => {
  it('returns empty arrays while brands === undefined and fires no mutations', () => {
    queryResult.current = undefined;
    const { result, args } = renderCatalog();

    expect(result.current.brands).toBeUndefined();
    expect(result.current.availableBrands).toEqual([]);
    expect(result.current.userBrands).toEqual([]);
    expect(seedMutation).not.toHaveBeenCalled();
    expect(ensureMutation).not.toHaveBeenCalled();
    expect(args.setBrand).not.toHaveBeenCalled();
  });

  it('fires seedDefaultBrands when brands list is empty', () => {
    queryResult.current = [];
    renderCatalog();

    expect(seedMutation).toHaveBeenCalledTimes(1);
    expect(ensureMutation).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire seedDefaultBrands when at least one brand exists', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    renderCatalog();

    expect(seedMutation).not.toHaveBeenCalled();
    expect(ensureMutation).toHaveBeenCalledTimes(1);
  });
});

describe('useBrandsCatalog — derived data', () => {
  it('lists the system brand first in availableBrands', () => {
    queryResult.current = [jioBrandDoc, systemBrandDoc, acmeBrandDoc];
    const { result } = renderCatalog();

    expect(result.current.availableBrands.map((b) => b.id)).toEqual(['sys', 'jio', 'acme']);
    expect(result.current.userBrands.map((b) => b.id)).toEqual(['jio', 'acme']);
  });

  it('persists logos of brands that have logoSvg into localStorage', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    renderCatalog();

    const stored = localStorage.getItem('oneui-studio:brand-logos');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(['<svg id="sys"/>', '<svg id="jio"/>']);
  });
});

describe('useBrandsCatalog — auto-registration + auto-select', () => {
  it('registers the system brand as platformBrandId when not already set', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    const { args } = renderCatalog();
    expect(args.setPlatformBrandId).toHaveBeenCalledWith('sys');
  });

  it('does not re-register platformBrandId when already pointing at the system brand', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    const { args } = renderCatalog({ platformBrandId: 'sys' });
    expect(args.setPlatformBrandId).not.toHaveBeenCalled();
  });

  it('auto-selects the first user brand when no last-used id is stored and currentBrand is null', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    const { args } = renderCatalog();
    expect(autoSelectedId(args.setBrand)).toBe('jio');
  });

  it('auto-selects the last-used brand from localStorage when present', () => {
    localStorage.setItem('oneui-studio:last-brand-id', 'acme');
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    const { args } = renderCatalog();
    expect(autoSelectedId(args.setBrand)).toBe('acme');
  });

  it('falls back to the system brand when there are no user brands', () => {
    queryResult.current = [systemBrandDoc];
    const { args } = renderCatalog();
    expect(autoSelectedId(args.setBrand)).toBe('sys');
  });

  it('does NOT auto-select when currentBrand is already set', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    const { args } = renderCatalog({ currentBrand: { id: 'jio' } as never });
    expect(args.setBrand).not.toHaveBeenCalled();
  });

  it('waits for the prefs row before auto-selecting (no double CSS injection)', () => {
    localStorage.setItem('oneui-studio:last-brand-id', 'acme');
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    const { args } = renderCatalog({ prefsLoading: true });
    expect(args.setBrand).not.toHaveBeenCalled();
  });

  it('prefers prefs.defaultBrandId over lastOpened + localStorage', () => {
    localStorage.setItem('oneui-studio:last-brand-id', 'acme');
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    const { args } = renderCatalog({
      prefs: { defaultBrandId: 'jio', lastOpenedBrandId: 'acme' },
    });
    expect(autoSelectedId(args.setBrand)).toBe('jio');
  });

  it('restores prefs.lastOpenedBrandId cross-device (empty localStorage)', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc, acmeBrandDoc];
    const { args } = renderCatalog({ prefs: { lastOpenedBrandId: 'acme' } });
    expect(autoSelectedId(args.setBrand)).toBe('acme');
  });

  it('falls through when the preferred brand id is no longer accessible', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    const { args } = renderCatalog({
      prefs: { defaultBrandId: 'revoked', lastOpenedBrandId: 'also-gone' },
    });
    expect(autoSelectedId(args.setBrand)).toBe('jio');
  });

  it('snapshots the sub-brand to restore into the ref before setBrand', () => {
    queryResult.current = [systemBrandDoc, jioBrandDoc];
    const pendingSubBrandIdRef = { current: null as string | null };
    const { args } = renderCatalog({
      prefs: { lastOpenedBrandId: 'jio', lastOpenedSubBrandId: 'sub-1' },
      pendingSubBrandIdRef,
    });
    expect(autoSelectedId(args.setBrand)).toBe('jio');
    expect(pendingSubBrandIdRef.current).toBe('sub-1');
  });
});

describe('useAvailableScalesForSync', () => {
  it('returns [] for null/undefined foundationData', () => {
    const { result: r1 } = renderHook(() => useAvailableScalesForSync(null));
    const { result: r2 } = renderHook(() => useAvailableScalesForSync(undefined));
    expect(r1.current).toEqual([]);
    expect(r2.current).toEqual([]);
  });

  it('flattens scale names and trims/filters empty entries', () => {
    const foundationData = {
      color: {
        config: {
          brandScales: [
            { name: '  jio-blue  ' },
            { name: '' },
            { name: 'jio-green' },
            { name: 0 as unknown as string },
          ],
        },
      },
    };
    const { result } = renderHook(() => useAvailableScalesForSync(foundationData));
    expect(result.current).toEqual([{ name: 'jio-blue' }, { name: 'jio-green' }]);
  });
});
