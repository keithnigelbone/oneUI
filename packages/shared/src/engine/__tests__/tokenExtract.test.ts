import { describe, it, expect } from 'vitest';
import { extractResolvedTokens, sliceExportByFoundation } from '../tokenExtract';

const colorConfig = {
  brandScales: [
    { name: 'Brand', source: 'custom' as const, baseColor: '#0066cc' },
  ],
};

const appearanceConfig = {
  accentCount: 1,
  background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
  accents: [
    { role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 },
  ],
};

const foundationData = {
  color: { config: colorConfig },
  appearanceConfig,
  presetSelection: null,
  typography: null,
  motion: null,
  grid: null,
  customFonts: [],
};

describe('extractResolvedTokens', () => {
  it('emits a payload with both light and dark themes', () => {
    const out = extractResolvedTokens(foundationData);
    expect(out.$schema).toBe('oneui-tokens/v1');
    expect(out.themes.light).toBeDefined();
    expect(out.themes.dark).toBeDefined();
    expect(out.generatedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('attaches brand metadata when provided', () => {
    const out = extractResolvedTokens(foundationData, { brandId: 'b1', brandName: 'Reliance' });
    expect(out.brand).toEqual({ id: 'b1', name: 'Reliance' });
  });

  it('buckets primary role tokens into the color foundation', () => {
    const out = extractResolvedTokens(foundationData);
    const colorTokens = out.themes.light.color;
    const primaryKeys = Object.keys(colorTokens).filter(k => k.startsWith('--Primary-'));
    expect(primaryKeys.length).toBeGreaterThan(0);
    expect(colorTokens['--Primary-Bold']).toBeDefined();
  });

  it('does not place appearance-role tokens into the surface bucket', () => {
    const out = extractResolvedTokens(foundationData);
    const surfaceKeys = Object.keys(out.themes.light.surface);
    for (const key of surfaceKeys) {
      expect(key.startsWith('--Surface-') || key.startsWith('--env-')).toBe(true);
    }
  });

  it('produces light vs dark token sets that differ', () => {
    const out = extractResolvedTokens(foundationData);
    const lightBold = out.themes.light.color['--Primary-Bold'];
    const darkBold = out.themes.dark.color['--Primary-Bold'];
    expect(lightBold).toBeDefined();
    expect(darkBold).toBeDefined();

    const someDiffers = Object.keys(out.themes.light.color).some(k => {
      return out.themes.light.color[k] !== out.themes.dark.color[k];
    });
    expect(someDiffers).toBe(true);
  });

  it('exports scoped grid spacing and spacing aliases', () => {
    const result = extractResolvedTokens({
      grid: {
        config: {
          breakpoints: {
            L: { columns: 12, maxWidth: 1280 },
          },
        },
      },
    });

    // L breakpoint base = 20 (max) → margin 20×2.5=50, gutter 20×1.25=25.
    expect(result.themes.light.grid['[data-Breakpoint="L"][data-6-Density="default"] --Grid-Margin']).toBe('50px');
    expect(result.themes.light.grid['[data-Breakpoint="L"][data-6-Density="default"] --Grid-Gutter']).toBe('25px');
    expect(result.themes.light.grid['[data-Breakpoint="L"] --Grid-Columns']).toBe('12');
    expect(result.themes.light.grid['--Spacing-Margin']).toBe('var(--Grid-Margin)');
    expect(result.themes.light.grid['--Spacing-Gutter']).toBe('var(--Grid-Gutter)');
  });
});

describe('sliceExportByFoundation', () => {
  it('keeps only the requested foundation in each theme', () => {
    const full = extractResolvedTokens(foundationData);
    const sliced = sliceExportByFoundation(full, 'color');

    expect(Object.keys(sliced.themes.light.color).length).toBeGreaterThan(0);
    expect(Object.keys(sliced.themes.light.surface)).toEqual([]);
    expect(Object.keys(sliced.themes.light.typography)).toEqual([]);
    expect(Object.keys(sliced.themes.dark.surface)).toEqual([]);
  });

  it('preserves brand metadata when slicing', () => {
    const full = extractResolvedTokens(foundationData, { brandId: 'b1', brandName: 'X' });
    const sliced = sliceExportByFoundation(full, 'color');
    expect(sliced.brand).toEqual({ id: 'b1', name: 'X' });
  });
});
