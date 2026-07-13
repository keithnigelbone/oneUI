/**
 * useBrandCSS LRU stability — regression test for the Pass-2 cache-key fix.
 *
 * The hook ships a 20-slot module-level LRU keyed on (theme, mode, palette
 * hash, typography hash, motion hash, grid hash, decorations hash). The
 * outer `cssContent` useMemo gates that LRU lookup. Before the Pass-2 fix
 * the memo's dep array contained the raw `foundationData` reference, which
 * Convex churns on every subscription tick — so even when content was
 * identical, React threw the memo cache away and the hook regenerated
 * ~50KB of CSS for nothing.
 *
 * This test asserts: rendering with two structurally-equal-but-referentially-
 * new `foundationData` objects must return THE SAME `cssContent` string
 * reference. Identity equality is the strongest signal that the pipeline
 * hit the LRU rather than rebuilding.
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBrandCSS, __clearBrandCSSCacheForTests } from '../useBrandCSS';

// Test-only helper: these are engine input fixtures, not rendered UI styles.
const testHex = (value: string) => `#${value}`;

// Representative multi-accent brand foundation. Mirrors the bench-pipeline
// fixture so the engine produces a real, non-empty CSS payload.
function makeFoundationData() {
  return {
    color: {
      config: {
        brandScales: [
          { name: 'Brand', source: 'custom' as const, baseColor: testHex('ff5500') },
          { name: 'Secondary', source: 'custom' as const, baseColor: testHex('0066ff') },
          { name: 'Neutral', source: 'custom' as const, baseColor: testHex('888888') },
          { name: 'Positive', source: 'custom' as const, baseColor: testHex('00aa44') },
          { name: 'Negative', source: 'custom' as const, baseColor: testHex('cc0022') },
        ],
      },
    },
    appearanceConfig: {
      accentCount: 5,
      background: {
        scaleName: 'Neutral',
        backgroundStep: { light: 2500, dark: 200 },
      },
      accents: [
        { role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1500 },
        { role: 'secondary', label: 'Secondary', scaleName: 'Secondary', baseStep: 1500 },
        { role: 'neutral', label: 'Neutral', scaleName: 'Neutral', baseStep: 1500 },
        { role: 'positive', label: 'Positive', scaleName: 'Positive', baseStep: 1500 },
        { role: 'negative', label: 'Negative', scaleName: 'Negative', baseStep: 1500 },
      ],
    },
    presetSelection: null,
    typography: undefined,
    motion: undefined,
  };
}

describe('useBrandCSS', () => {
  beforeEach(() => {
    __clearBrandCSSCacheForTests();
  });

  it('returns the same cssContent reference across re-renders with referentially-new but structurally-identical foundationData', () => {
    const { result, rerender } = renderHook(
      ({ foundationData }) =>
        useBrandCSS({ foundationData, theme: 'light', injectionMode: 'global' }),
      { initialProps: { foundationData: makeFoundationData() } },
    );

    const first = result.current.cssContent;
    expect(first).toBeTruthy();
    expect(typeof first).toBe('string');
    expect((first as string).length).toBeGreaterThan(100);

    // Simulate a Convex tick: same content, brand-new object reference.
    rerender({ foundationData: makeFoundationData() });
    const second = result.current.cssContent;

    // Identity, not just equality — proves the LRU hit (cssContent memo bailed).
    expect(second).toBe(first);
  });

  it('returns a new cssContent when content actually changes', () => {
    const { result, rerender } = renderHook(
      ({ foundationData }) =>
        useBrandCSS({ foundationData, theme: 'light', injectionMode: 'global' }),
      { initialProps: { foundationData: makeFoundationData() } },
    );

    const first = result.current.cssContent;
    expect(first).toBeTruthy();

    // Mutate the brand colour — same shape, different content.
    const changed = makeFoundationData();
    changed.color.config.brandScales[0].baseColor = testHex('00ff00');
    rerender({ foundationData: changed });

    const second = result.current.cssContent;
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);
  });

  it('returns null when foundationData is null', () => {
    const { result } = renderHook(() =>
      useBrandCSS({ foundationData: null, theme: 'light', injectionMode: 'global' }),
    );
    expect(result.current.cssContent).toBeNull();
  });

  it('survives a null → populated → null transition without crashing', () => {
    const { result, rerender } = renderHook(
      ({ foundationData }: { foundationData: ReturnType<typeof makeFoundationData> | null }) =>
        useBrandCSS({ foundationData, theme: 'light', injectionMode: 'global' }),
      { initialProps: { foundationData: null as ReturnType<typeof makeFoundationData> | null } },
    );
    expect(result.current.cssContent).toBeNull();

    rerender({ foundationData: makeFoundationData() });
    expect(typeof result.current.cssContent).toBe('string');

    rerender({ foundationData: null });
    expect(result.current.cssContent).toBeNull();
  });
});
