import { describe, it, expect } from 'vitest';
import { JIO_WEB_ALPHA_COMPONENTS } from '@oneui/ui/registry/jioAlphaCatalog';
import { JioComponentRegistryItem } from '@oneui/experience-builder-core';
import {
  queryRegistry,
  getRegistryItem,
  isRegistered,
  KNOWN_DRIFT_EXCLUSIONS,
} from './queryRegistry';

describe('queryRegistry — production-shape conformance (REG-01/REG-02)', () => {
  it('returns a non-empty JioComponentRegistryItem[]', () => {
    const items = queryRegistry();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('every returned item conforms to the plan-01 JioComponentRegistryItem shape', () => {
    const items = queryRegistry();
    for (const item of items) {
      // Validate against the FROZEN contract Zod schema from -core. This proves
      // the adapter emits the exact production shape (id, importPath, props,
      // variants, slots, states, usageRules, antiPatterns, supportedBrands/
      // Profiles, tokenDependencies) — not a look-alike.
      const parsed = JioComponentRegistryItem.safeParse(item);
      expect(
        parsed.success,
        `${item.id} failed schema: ${JSON.stringify(parsed.error?.issues)}`
      ).toBe(true);
    }
  });

  it('exposes the contract field set on a known item (Button)', () => {
    const found = getRegistryItem('Button');
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    const item = found.item;
    expect(item.id).toBe('Button');
    expect(item.name).toBe('Button');
    expect(Array.isArray(item.props)).toBe(true);
    expect(Array.isArray(item.variants)).toBe(true);
    expect(Array.isArray(item.slots)).toBe(true);
    expect(Array.isArray(item.states)).toBe(true);
    expect(Array.isArray(item.usageRules)).toBe(true);
    expect(Array.isArray(item.antiPatterns)).toBe(true);
    expect(Array.isArray(item.supportedBrands)).toBe(true);
    expect(Array.isArray(item.supportedProfiles)).toBe(true);
    expect(Array.isArray(item.tokenDependencies)).toBe(true);
  });
});

describe('queryRegistry — Jio-only import paths (VAL-02 / T-01-06)', () => {
  it('every returned importPath is a @oneui/ui/components/<Folder> deep path', () => {
    const items = queryRegistry();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(
        item.importPath.startsWith('@oneui/ui/components/'),
        `${item.id} has a non-Jio importPath: ${item.importPath}`
      ).toBe(true);
    }
  });
});

describe('getRegistryItem — exact membership (REG-03 / T-01-04)', () => {
  it('returns an item for a registered id', () => {
    const result = getRegistryItem('Button');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.item.id).toBe('Button');
    }
  });

  it('returns a component gap (not a near-match) for an unregistered id', () => {
    const result = getRegistryItem('FancyHero');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe('component-gap');
      expect(result.reason).toBe('unregistered');
      expect(result.requestedId).toBe('FancyHero');
      // It must NOT have silently resolved to a similarly-named real component.
      expect(result).not.toHaveProperty('item');
    }
  });

  it('does not fuzzy-match a near-miss id to a real component', () => {
    // "Buton" is one edit away from "Button" — exact lookup must still gap.
    const result = getRegistryItem('Buton');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('unregistered');
    }
  });

  it('isRegistered is exact', () => {
    expect(isRegistered('Button')).toBe(true);
    expect(isRegistered('PrimaryNav')).toBe(true);
    expect(isRegistered('SecondaryNav')).toBe(true);
    expect(isRegistered('HeaderItem')).toBe(true);
    expect(isRegistered('Buton')).toBe(false);
    expect(isRegistered('FancyHero')).toBe(false);
  });
});

describe('WebHeader compound component registry', () => {
  it('registers WebHeader compound parts used by generated navigation specs', () => {
    const primaryNav = getRegistryItem('PrimaryNav');
    const secondaryNav = getRegistryItem('SecondaryNav');
    const headerItem = getRegistryItem('HeaderItem');

    expect(primaryNav.ok).toBe(true);
    expect(secondaryNav.ok).toBe(true);
    expect(headerItem.ok).toBe(true);
    if (!primaryNav.ok || !secondaryNav.ok || !headerItem.ok) return;

    expect(primaryNav.item.importPath).toBe('@oneui/ui/components/WebHeader');
    expect(primaryNav.item.props.map((prop) => prop.name)).toEqual(
      expect.arrayContaining(['type', 'middle', 'logo', 'end', 'activeValue', 'children'])
    );
    expect(primaryNav.item.slots).toEqual(expect.arrayContaining(['logo', 'end', 'children']));
    expect(secondaryNav.item.importPath).toBe('@oneui/ui/components/WebHeader');
    expect(secondaryNav.item.props.map((prop) => prop.name)).toEqual(
      expect.arrayContaining(['type', 'activeValue', 'children'])
    );
    expect(secondaryNav.item.slots).toEqual(expect.arrayContaining(['children']));
    expect(headerItem.item.importPath).toBe('@oneui/ui/components/WebHeader');
    expect(headerItem.item.props.map((prop) => prop.name)).toEqual(
      expect.arrayContaining(['value', 'attention', 'start', 'href', 'children'])
    );
    expect(headerItem.item.slots).toEqual(expect.arrayContaining(['start', 'children']));
  });
});

describe('known-drift exclusion (CONCERNS.md / Pitfall 5)', () => {
  it('Modal remains excluded while Text is generatable', () => {
    const ids = new Set(queryRegistry().map((i) => i.id));
    expect(ids.has('Modal')).toBe(false);
    expect(ids.has('Text')).toBe(true);
    expect(KNOWN_DRIFT_EXCLUSIONS).toContain('Modal');
    expect(KNOWN_DRIFT_EXCLUSIONS).not.toContain('Text');
  });

  it('looking up an excluded component yields a typed exclusion gap, not an item', () => {
    const result = getRegistryItem('Modal');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe('component-gap');
      expect(result.reason).toBe('excluded-known-drift');
    }
  });

  it('Text resolves with generated typography props', () => {
    const result = getRegistryItem('Text');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.item.props.map((prop) => prop.name)).toEqual(
        expect.arrayContaining(['text', 'variant', 'size', 'weight', 'attention'])
      );
    }
  });
});

describe('derivation traceability — no hand-authored parallel (Pitfall 5 / T-01-05)', () => {
  it('items are derived from jioAlphaCatalog (count traces to catalog minus exclusions)', () => {
    const catalogNames = JIO_WEB_ALPHA_COMPONENTS.map((c) => c.name);
    const excludedInCatalog = catalogNames.filter((n) => KNOWN_DRIFT_EXCLUSIONS.includes(n));
    const expectedCount = catalogNames.length - excludedInCatalog.length;
    expect(queryRegistry().length).toBe(expectedCount);
  });

  it('a known catalog entry surfaces in the registry with catalog-traced facts', () => {
    // Surface is a documented catalog entry — assert it surfaces, proving the
    // ids/flags come from the catalog rather than a parallel list.
    const catalogSurface = JIO_WEB_ALPHA_COMPONENTS.find((c) => c.name === 'Surface');
    expect(catalogSurface).toBeDefined();
    const result = getRegistryItem('Surface');
    expect(result.ok).toBe(true);
    if (result.ok && catalogSurface) {
      expect(result.item.importPath).toBe(catalogSurface.importPath);
      expect(result.item.surfaceAware).toBe(catalogSurface.surfaceAware);
      expect(result.item.multiAccent).toBe(catalogSurface.multiAccent);
      expect(result.item.status).toBe(catalogSurface.status);
    }
  });

  it('derives structural component props from checked-in component metadata', () => {
    const surface = getRegistryItem('Surface');
    expect(surface.ok).toBe(true);
    if (surface.ok) {
      const mode = surface.item.props.find((prop) => prop.name === 'mode');
      expect(mode).toMatchObject({
        name: 'mode',
        required: true,
      });
      expect(mode?.values).toEqual(
        expect.arrayContaining(['default', 'subtle', 'bold', 'elevated'])
      );
    }

    const container = getRegistryItem('Container');
    expect(container.ok).toBe(true);
    if (container.ok) {
      expect(container.item.props.map((prop) => prop.name)).toEqual(
        expect.arrayContaining(['children', 'layout', 'surface'])
      );
    }
  });

  it('Button variants trace to the real generated meta', () => {
    const result = getRegistryItem('Button');
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Generated Button meta declares variant ∈ bold/subtle/ghost.
      expect(result.item.variants).toEqual(['bold', 'subtle', 'ghost']);
    }
  });
});

describe('queryRegistry — deterministic filters (REG-02)', () => {
  it('filters by surfaceAware', () => {
    const surfaceAware = queryRegistry({ surfaceAware: true });
    expect(surfaceAware.length).toBeGreaterThan(0);
    expect(surfaceAware.every((i) => i.surfaceAware === true)).toBe(true);
  });

  it('filters by multiAccent', () => {
    const multi = queryRegistry({ multiAccent: true });
    expect(multi.length).toBeGreaterThan(0);
    expect(multi.every((i) => i.multiAccent === true)).toBe(true);
  });

  it('returns a fresh copy each call (no shared mutable state)', () => {
    const a = queryRegistry();
    const b = queryRegistry();
    expect(a).not.toBe(b);
    a.pop();
    expect(b.length).toBeGreaterThan(a.length);
  });
});
