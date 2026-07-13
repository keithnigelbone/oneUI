/**
 * componentRegistry.test.ts
 *
 * Tests for the component registry: slug resolution, entry lookup,
 * meta collection, and registry completeness.
 */

import { describe, it, expect } from 'vitest';
import {
  COMPONENT_REGISTRY,
  resolveComponentSlug,
  getComponentBySlug,
  getAllComponentMetas,
} from '../componentRegistry';

// ---------------------------------------------------------------------------
// resolveComponentSlug
// ---------------------------------------------------------------------------

describe('resolveComponentSlug', () => {
  it('resolves simple slugs', () => {
    expect(resolveComponentSlug('button')).toBe('Button');
    expect(resolveComponentSlug('avatar')).toBe('Avatar');
    expect(resolveComponentSlug('icon')).toBe('Icon');
    expect(resolveComponentSlug('input')).toBe('InputField');
  });

  it('resolves hyphenated slugs', () => {
    expect(resolveComponentSlug('icon-button')).toBe('IconButton');
    expect(resolveComponentSlug('icon-contained')).toBe('IconContained');
  });

  it('returns null for unknown slugs', () => {
    expect(resolveComponentSlug('nonexistent')).toBeNull();
    expect(resolveComponentSlug('')).toBeNull();
    expect(resolveComponentSlug('Button')).toBeNull(); // PascalCase not a slug
  });
});

// ---------------------------------------------------------------------------
// getComponentBySlug
// ---------------------------------------------------------------------------

describe('getComponentBySlug', () => {
  it('returns registry entry for valid slugs', () => {
    const entry = getComponentBySlug('button');
    expect(entry).not.toBeNull();
    expect(entry!.manifest).toBeDefined();
    expect(entry!.manifest.componentName).toBe('Button');
  });

  it('returns entry with recipe when available', () => {
    const entry = getComponentBySlug('button');
    expect(entry!.recipe).toBeDefined();
    expect(entry!.recipe!.componentName).toBe('Button');
  });

  it('returns entry without recipe for Icon', () => {
    const entry = getComponentBySlug('icon');
    expect(entry).not.toBeNull();
    expect(entry!.recipe).toBeUndefined();
  });

  it('returns null for unknown slugs', () => {
    expect(getComponentBySlug('unknown')).toBeNull();
  });

  it('includes meta for all registered components', () => {
    const slugs = [
      'button', 'avatar', 'icon', 'icon-button', 'icon-contained',
      'image', 'checkbox', 'radio', 'switch', 'stepper',
      'counter-badge', 'indicator-badge',
    ];
    for (const slug of slugs) {
      const entry = getComponentBySlug(slug);
      expect(entry, `missing entry for ${slug}`).not.toBeNull();
      expect(entry!.meta, `missing meta for ${slug}`).toBeDefined();
      expect(entry!.meta!.slug).toBe(slug);
    }
  });
});

// ---------------------------------------------------------------------------
// getAllComponentMetas
// ---------------------------------------------------------------------------

describe('getAllComponentMetas', () => {
  it('returns metas for every entry that has one (meta-authored tier)', () => {
    const metas = getAllComponentMetas();
    // Every entry with a meta must appear; stub entries (manifest-only, used
    // by the Design Composition Agent runtime) are excluded by design.
    const metaCount = Object.values(COMPONENT_REGISTRY).filter((e) => e.meta).length;
    expect(metas.length).toBe(metaCount);
    expect(metas.length).toBeGreaterThanOrEqual(22);
  });

  it('each meta has required fields', () => {
    const metas = getAllComponentMetas();
    for (const meta of metas) {
      expect(meta.name).toBeTruthy();
      expect(meta.slug).toBeTruthy();
      expect(meta.displayName).toBeTruthy();
      expect(meta.category).toBeTruthy();
      expect(meta.previewMatrix).toBeDefined();
      expect(meta.previewMatrix.variants.length).toBeGreaterThan(0);
      // Some layout/structural components (e.g. WebHeader) have no size axis
      if ((meta.previewMatrix.sizes?.length ?? 0) > 0) {
        expect(Object.keys(meta.previewMatrix.sizeLabels ?? {}).length).toBeGreaterThan(0);
      }
      expect(Object.keys(meta.previewMatrix.variantLabels).length).toBeGreaterThan(0);
    }
  });

  it('all slugs are unique', () => {
    const metas = getAllComponentMetas();
    const slugs = metas.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all names are unique', () => {
    const metas = getAllComponentMetas();
    const names = metas.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ---------------------------------------------------------------------------
// COMPONENT_REGISTRY completeness
// ---------------------------------------------------------------------------

describe('COMPONENT_REGISTRY', () => {
  it('has at least the legacy 22 authored components', () => {
    // Registry grows as the DCA runtime registers additional components with
    // stub manifests. Assert a lower bound rather than an exact count so new
    // additions don't require test churn.
    expect(Object.keys(COMPONENT_REGISTRY).length).toBeGreaterThanOrEqual(22);
  });

  it('every entry has a manifest', () => {
    for (const [name, entry] of Object.entries(COMPONENT_REGISTRY)) {
      expect(entry.manifest, `${name} missing manifest`).toBeDefined();
      expect(entry.manifest.componentName).toBeTruthy();
    }
  });

  it('entries that expose a meta have a meta.name matching the registry key', () => {
    // Only authored entries have a meta. Stub entries (manifest-only) are
    // registered for the DCA runtime and do not participate in editor metadata.
    for (const [name, entry] of Object.entries(COMPONENT_REGISTRY)) {
      if (!entry.meta) continue;
      expect(entry.meta.name, `${name} meta.name mismatch`).toBe(name);
    }
  });

  it('preview components are set for components that have them', () => {
    const withPreview = ['Button', 'Avatar', 'IconButton',
      'Checkbox', 'Radio', 'IconContained', 'Image', 'Switch', 'Stepper',
      'CounterBadge', 'IndicatorBadge'];
    for (const name of withPreview) {
      expect(
        COMPONENT_REGISTRY[name].previewComponent,
        `${name} missing previewComponent`,
      ).toBeDefined();
    }
  });

  it('Icon has no preview component', () => {
    expect(COMPONENT_REGISTRY.Icon.previewComponent).toBeUndefined();
  });

  it('stub entries have the stub manifest signature', () => {
    // Stub entries (registered for DCA runtime, token authoring pending) use
    // version '0.0.0-stub'. Catches accidental half-authored manifests where
    // only one field (e.g. tokens) was added without wiring the rest.
    for (const [name, entry] of Object.entries(COMPONENT_REGISTRY)) {
      if (entry.manifest.version === '0.0.0-stub') {
        expect(entry.meta, `${name} is stub but has meta — upgrade the stub to an authored entry`).toBeUndefined();
        expect(entry.recipe, `${name} is stub but has recipe — upgrade the stub to an authored entry`).toBeUndefined();
      }
    }
  });
});
