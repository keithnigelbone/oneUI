import { describe, expect, it } from 'vitest';
import { STROKE_SCALE_TOKENS } from '@oneui/shared';
import { DEFAULT_METALLIC_PRESETS } from '@oneui/shared/engine';

import { generateMaterialTokens, generateStrokeTokens } from '../tokenGenerators';

describe('generateStrokeTokens', () => {
  it('returns the full shared stroke scale as system-derived stroke tokens', async () => {
    const tokens = await generateStrokeTokens({} as never, 'brand-id' as never);

    expect(tokens).toHaveLength(13);
    expect(tokens.map((token) => [token.name, token.value, token.category])).toEqual(
      STROKE_SCALE_TOKENS.map((stroke) => [stroke.token, stroke.value, 'stroke']),
    );
    expect(tokens.find((token) => token.name === 'Stroke-2XL')?.value).toBe('3px');
    expect(tokens.at(-1)?.name).toBe('Stroke-9XL');
  });
});

describe('generateMaterialTokens', () => {
  it('emits cased metallic fill, stroke, fallback, and legacy gradient tokens', async () => {
    const materialConfig = {
      translucent: {
        light: { minimal: 0.1, subtle: 0.25, moderate: 0.5, heavy: 0.75 },
        dark: { minimal: 0.1, subtle: 0.25, moderate: 0.5, heavy: 0.75 },
      },
      frosted: {
        blur: { ultraThin: 4, thin: 8, regular: 16, thick: 24, ultraThick: 32 },
        backgroundOpacity: { ultraThin: 0.3, thin: 0.5, regular: 0.65, thick: 0.75, ultraThick: 0.85 },
      },
      glass: {
        blur: { regular: 20, clear: 12 },
        saturation: { regular: 180, clear: 150 },
        highlightIntensity: { minimal: 0.12, moderate: 0.25, strong: 0.4 },
        tintOpacity: { light: 0.45, dark: 0.45 },
      },
      metallic: DEFAULT_METALLIC_PRESETS,
    };
    const ctx = {
      db: {
        query: (table: string) => ({
          withIndex: () => ({
            collect: async () => (table === 'materialConfigs' ? [materialConfig] : []),
            first: async () => null,
          }),
        }),
      },
    };

    const tokens = await generateMaterialTokens(ctx as never, 'brand-id' as never, ['light']);
    const names = tokens.map((token) => token.name);

    expect(names).toContain('Material-Metallic-Gold-Fill');
    expect(names).toContain('Material-Metallic-Gold-Stroke');
    expect(names).toContain('Material-Metallic-Gold-StrokeColor');
    expect(names).toContain('Material-Metallic-Gold-GradientType');
    expect(names).toContain('Material-Metallic-Gold-GradientAngle');
    expect(names).toContain('Material-Metallic-Gold-Gradient');
    expect(names).toContain('Material-Metallic-Custom-Fill');
    expect(names).toContain('Material-Metallic-RoseGold-Fill');
    expect(names).not.toContain('Material-Metallic-roseGold-Fill');
  });

  it('filters metallic tokens by active metals and emits assignment aliases', async () => {
    const materialConfig = {
      translucent: {
        light: { minimal: 0.1, subtle: 0.25, moderate: 0.5, heavy: 0.75 },
        dark: { minimal: 0.1, subtle: 0.25, moderate: 0.5, heavy: 0.75 },
      },
      frosted: {
        blur: { ultraThin: 4, thin: 8, regular: 16, thick: 24, ultraThick: 32 },
        backgroundOpacity: { ultraThin: 0.3, thin: 0.5, regular: 0.65, thick: 0.75, ultraThick: 0.85 },
      },
      glass: {
        blur: { regular: 20, clear: 12 },
        saturation: { regular: 180, clear: 150 },
        highlightIntensity: { minimal: 0.12, moderate: 0.25, strong: 0.4 },
        tintOpacity: { light: 0.45, dark: 0.45 },
      },
      metallic: DEFAULT_METALLIC_PRESETS,
    };
    const ctx = {
      db: {
        query: (table: string) => ({
          withIndex: () => ({
            collect: async () => (table === 'materialConfigs' ? [materialConfig] : []),
            first: async () => {
              if (table === 'foundations') {
                return {
                  config: {
                    activeMetals: {
                      bronze: false,
                      silver: false,
                      gold: true,
                      custom: false,
                    },
                  },
                };
              }
              if (table === 'appearanceConfigs') {
                return {
                  materials: {
                    materialAssignments: {
                      primary: 'gold',
                      logo: 'silver',
                    },
                  },
                };
              }
              return null;
            },
          }),
        }),
      },
    };

    const tokens = await generateMaterialTokens(ctx as never, 'brand-id' as never, ['light']);
    const names = tokens.map((token) => token.name);

    expect(names).toContain('Material-Metallic-Gold-Fill');
    expect(names).not.toContain('Material-Metallic-Silver-Fill');
    expect(names).toContain('Primary-Material-Fill');
    expect(names).not.toContain('Logo-Material-Fill');
  });
});
