/**
 * platform-tokens.test.ts
 *
 * Tests for density-aware dimension override computation.
 * Validates that computeDimensionOverrides and computeResponsiveDensityOverrides
 * return correct values per density, ensuring preview isolation from global density.
 */

import { describe, it, expect } from 'vitest';
import {
  computeDimensionOverrides,
  computeResponsiveDensityOverrides,
} from '../platform-tokens';
import { STATIC_DIMENSION_TABLES, GRID_VALUES, F_STEPS, resolveGridSpacing } from '../../data/dimension-scales';
import { computeScaleFromBase, getBaseSizesForBreakpoint } from '../dimensionCSS';
import type { PlatformEntry } from '../../types/platforms';

// Minimal PlatformEntry for testing known breakpoints
const mockPlatform = {
  id: 'web',
  label: 'Web',
  isEnabled: true,
  description: '',
  calculatedBaseSize: 16,
  viewportMin: 360,
  viewportMax: 1920,
  viewingDistance: 60,
  ppi: 96,
  pixelDensity: 1,
  fluidScaling: false,
  breakpoints: [
    { id: 'bp1', label: '360', viewportWidth: 360, isActive: true },
    { id: 'bp2', label: '1440', viewportWidth: 1440, isActive: true },
  ],
  densityConfigs: [
    {
      density: 'default' as const,
      mobile: { baseSize: 16, scaleFactor: 1.125 },
      desktop: { baseSize: 18, scaleFactor: 1.125 },
    },
    {
      density: 'compact' as const,
      mobile: { baseSize: 14, scaleFactor: 1.1 },
      desktop: { baseSize: 16, scaleFactor: 1.1 },
    },
    {
      density: 'open' as const,
      mobile: { baseSize: 18, scaleFactor: 1.15 },
      desktop: { baseSize: 20, scaleFactor: 1.15 },
    },
  ],
} satisfies PlatformEntry;

describe('computeDimensionOverrides', () => {
  it('returns empty object for null viewport (responsive mode)', () => {
    const result = computeDimensionOverrides(mockPlatform, null);
    expect(result).toEqual({});
  });

  it('returns default density values computed from brand config (not static tables)', () => {
    const result = computeDimensionOverrides(mockPlatform, 1440);
    // V4: uses brand config interpolation, NOT static tables
    const baseSizes = getBaseSizesForBreakpoint(1440, 360, 1920, mockPlatform.densityConfigs);
    const scale = computeScaleFromBase(baseSizes.default);
    const f0Value = parseFloat(scale[F_STEPS.indexOf('f0')].toFixed(2));
    expect(result['--Dimension-f0']).toBe(`${f0Value}px`);
  });

  it('returns compact density values from brand config', () => {
    const result = computeDimensionOverrides(mockPlatform, 1440, 'compact');
    const baseSizes = getBaseSizesForBreakpoint(1440, 360, 1920, mockPlatform.densityConfigs);
    const scale = computeScaleFromBase(baseSizes.compact);
    const f0Value = parseFloat(scale[F_STEPS.indexOf('f0')].toFixed(2));
    expect(result['--Dimension-f0']).toBe(`${f0Value}px`);
  });

  it('returns open density values from brand config', () => {
    const result = computeDimensionOverrides(mockPlatform, 1440, 'open');
    const baseSizes = getBaseSizesForBreakpoint(1440, 360, 1920, mockPlatform.densityConfigs);
    const scale = computeScaleFromBase(baseSizes.open);
    const f0Value = parseFloat(scale[F_STEPS.indexOf('f0')].toFixed(2));
    expect(result['--Dimension-f0']).toBe(`${f0Value}px`);
  });

  it('compact and default produce different values', () => {
    const defaultResult = computeDimensionOverrides(mockPlatform, 1440, 'default');
    const compactResult = computeDimensionOverrides(mockPlatform, 1440, 'compact');
    // The brand-config interpolation produces distinct f0 values per density.
    expect(defaultResult['--Dimension-f0']).not.toBe(compactResult['--Dimension-f0']);
  });

  it('includes all 26 dimension tokens (f-8…f16 plus f2-5)', () => {
    const result = computeDimensionOverrides(mockPlatform, 1440);
    for (const step of F_STEPS) {
      expect(result).toHaveProperty(`--Dimension-${step}`);
    }
    expect(Object.keys(result).filter(k => k.startsWith('--Dimension-'))).toHaveLength(26);
  });

  it('includes grid tokens resolved from platform and density', () => {
    const result = computeDimensionOverrides(mockPlatform, 1440, 'default');
    const baseSizes = getBaseSizesForBreakpoint(1440, 360, 1920, mockPlatform.densityConfigs);
    const grid = resolveGridSpacing('L', 'default', baseSizes.default);
    expect(result['--Grid-Margin']).toBe(`${grid.margin}px`);
    expect(result['--Grid-Gutter']).toBe(`${grid.gutter}px`);
  });

  it('grid tokens change with density', () => {
    const defaultResult = computeDimensionOverrides(mockPlatform, 1440, 'default');
    const compactResult = computeDimensionOverrides(mockPlatform, 1440, 'compact');
    expect(defaultResult['--Grid-Margin']).not.toBe(compactResult['--Grid-Margin']);
  });

  it('works for all known breakpoints', () => {
    for (const viewport of [360, 768, 1024, 1440, 1920]) {
      const result = computeDimensionOverrides(mockPlatform, viewport, 'compact');
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result['--Dimension-f0']).toBeDefined();
    }
  });
});

describe('resolveGridSpacing', () => {
  it('returns exact grid values for every breakpoint and density', () => {
    for (const bp of ['S', 'M', 'L'] as const) {
      for (const density of ['default', 'compact', 'open'] as const) {
        expect(resolveGridSpacing(bp, density)).toEqual(GRID_VALUES[bp][density]);
      }
    }
  });

  it('scales custom base sizes from the breakpoint-specific grid value', () => {
    expect(resolveGridSpacing('L', 'default', 20)).toEqual({ margin: 50, gutter: 25 });
    expect(resolveGridSpacing('L', 'compact', 20)).toEqual({ margin: 40, gutter: 20 });
  });
});

describe('computeResponsiveDensityOverrides', () => {
  it('returns dimension overrides for default density', () => {
    const result = computeResponsiveDensityOverrides('L', 'default');
    const expected = STATIC_DIMENSION_TABLES['L'].default;
    expect(result['--Dimension-f0']).toBe(`${expected[F_STEPS.indexOf('f0')]}px`);
  });

  it('returns compact overrides', () => {
    const result = computeResponsiveDensityOverrides('L', 'compact');
    const expected = STATIC_DIMENSION_TABLES['L'].compact;
    expect(result['--Dimension-f0']).toBe(`${expected[F_STEPS.indexOf('f0')]}px`);
  });

  it('returns open overrides', () => {
    const result = computeResponsiveDensityOverrides('L', 'open');
    const expected = STATIC_DIMENSION_TABLES['L'].open;
    expect(result['--Dimension-f0']).toBe(`${expected[F_STEPS.indexOf('f0')]}px`);
  });

  it('always returns full set of overrides (never empty)', () => {
    const result = computeResponsiveDensityOverrides('L', 'default');
    expect(Object.keys(result).filter(k => k.startsWith('--Dimension-'))).toHaveLength(26);
    expect(result['--Grid-Margin']).toBeDefined();
    expect(result['--Grid-Gutter']).toBeDefined();
  });

  it('values match static tables exactly', () => {
    for (const bp of ['S', 'M', 'L'] as const) {
      for (const density of ['default', 'compact', 'open'] as const) {
        const result = computeResponsiveDensityOverrides(bp, density);
        const table = STATIC_DIMENSION_TABLES[bp][density];
        for (let i = 0; i < F_STEPS.length; i++) {
          expect(result[`--Dimension-${F_STEPS[i]}`]).toBe(`${table[i]}px`);
        }
        const grid = GRID_VALUES[bp][density];
        expect(result['--Grid-Margin']).toBe(`${grid.margin}px`);
        expect(result['--Grid-Gutter']).toBe(`${grid.gutter}px`);
      }
    }
  });

  it('includes numeric spacing tokens resolved to f-step values', () => {
    const result = computeResponsiveDensityOverrides('L', 'default');
    const table = STATIC_DIMENSION_TABLES['L'].default;
    expect(result['--Spacing-4']).toBe(`${table[8]}px`);
    expect(result['--Spacing-3-5']).toBe(`${table[7]}px`);
    expect(result['--Spacing-5']).toBe(`${table[10]}px`);
    expect(result['--Spacing-40']).toBe(`${table[24]}px`);
    expect(result['--Spacing-0']).toBe('0px');
    expect(result['--Spacing-5-5']).toBe(`${(table[10] + table[11]) / 2}px`);
    expect(result['--Spacing-Negative-0-5']).toBe(`-${table[1]}px`);
    expect(result['--Spacing-Negative-5-5']).toBe(`-${(table[10] + table[11]) / 2}px`);
    expect(result['--Spacing-Negative-8']).toBe(`-${table[13]}px`);
    const removedAlias = '--Spacing-' + 'M';
    expect(result).not.toHaveProperty(removedAlias);
  });

  it('includes shape alias tokens resolved to f-step values', () => {
    const result = computeResponsiveDensityOverrides('L', 'default');
    const table = STATIC_DIMENSION_TABLES['L'].default;
    // --Shape-4 maps to f0 (index 8)
    expect(result['--Shape-4']).toBe(`${table[8]}px`);
    // --Shape-2 maps to f-4 (index 4)
    expect(result['--Shape-2']).toBe(`${table[4]}px`);
  });

  it('includes typography alias tokens resolved to f-step values', () => {
    const result = computeResponsiveDensityOverrides('L', 'default');
    const table = STATIC_DIMENSION_TABLES['L'].default;
    // --Label-M-FontSize maps to f0 (index 8)
    expect(result['--Label-M-FontSize']).toBe(`${table[8]}px`);
    // --Label-S-FontSize maps to f-1 (index 7)
    expect(result['--Label-S-FontSize']).toBe(`${table[7]}px`);
    // --Body-M-FontSize maps to f0 (index 8)
    expect(result['--Body-M-FontSize']).toBe(`${table[8]}px`);
    // --Body-M-LineHeight maps to f3 (index 11)
    expect(result['--Body-M-LineHeight']).toBe(`${table[11]}px`);
  });

  it('alias tokens change with density', () => {
    const defaultResult = computeResponsiveDensityOverrides('L', 'default');
    const compactResult = computeResponsiveDensityOverrides('L', 'compact');
    // Spacing-4 at default vs compact should differ (f0: 18 vs 16)
    expect(defaultResult['--Spacing-4']).not.toBe(compactResult['--Spacing-4']);
    // Label-M-FontSize at default vs compact should differ
    expect(defaultResult['--Label-M-FontSize']).not.toBe(compactResult['--Label-M-FontSize']);
  });
});
