import { describe, it, expect } from 'vitest';
import { buildAvailableScales } from '../buildAvailableScales';
import {
  BUILT_IN_NEUTRAL_SCALE_NAME,
  createDefaultLightnessScale,
  generateColorScaleWithLightnessScale,
  hexToOklch,
} from '../../utils/colorScale';

describe('buildAvailableScales', () => {
  it('returns only built-in neutral for null colorConfig', () => {
    const scales = buildAvailableScales(null, null);
    expect(scales).toHaveLength(1);
    expect(scales[0].name).toBe(BUILT_IN_NEUTRAL_SCALE_NAME);
  });

  it('returns only built-in neutral for undefined colorConfig', () => {
    const scales = buildAvailableScales(undefined, undefined);
    expect(scales).toHaveLength(1);
    expect(scales[0].name).toBe(BUILT_IN_NEUTRAL_SCALE_NAME);
  });

  it('returns only built-in neutral when brandScales is empty', () => {
    const scales = buildAvailableScales({ brandScales: [] }, null);
    expect(scales).toHaveLength(1);
    expect(scales[0].name).toBe(BUILT_IN_NEUTRAL_SCALE_NAME);
  });

  it('built-in neutral has 25 steps with hex colors', () => {
    const scales = buildAvailableScales(null, null);
    const neutral = scales[0];
    expect(neutral.steps).toHaveLength(25);
    expect(neutral.colors).toHaveLength(25);
    for (const color of neutral.colors!) {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('builds scale from custom source with baseColor (plus neutral)', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Brand', source: 'custom' as const, baseColor: '#ff5500' },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    // Neutral is auto-injected at the front, Brand follows
    expect(scales).toHaveLength(2);
    expect(scales[0].name).toBe(BUILT_IN_NEUTRAL_SCALE_NAME);
    expect(scales[1].name).toBe('Brand');
    expect(scales[1].steps.length).toBeGreaterThan(0);
    expect(scales[1].colors!.length).toBeGreaterThan(0);
  });

  it('custom scale colors have hex values', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Test', source: 'custom' as const, baseColor: '#0066cc' },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    const testScale = scales.find(s => s.name === 'Test')!;
    for (const color of testScale.colors!) {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof color.step).toBe('number');
    }
  });

  it('builds scale from preset source with step data', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Brand', source: 'preset' as const, presetCollectionId: 'abc' },
      ],
    };
    const presetSelection = {
      selectedScales: [
        {
          name: 'Brand',
          baseStep: '1300',
          steps: [
            { step: '100', oklch: 'oklch(95% 0.02 250)' },
            { step: '500', oklch: 'oklch(70% 0.1 250)' },
            { step: '1300', oklch: 'oklch(40% 0.15 250)' },
          ],
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, presetSelection);
    const brandScale = scales.find(s => s.name === 'Brand')!;
    expect(brandScale.steps).toEqual([100, 500, 1300]);
    expect(brandScale.colors).toHaveLength(3);
    expect(brandScale.baseStep).toBe(1300);
  });

  it('preset scale colors have hex and oklch', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Brand', source: 'preset' as const },
      ],
    };
    const presetSelection = {
      selectedScales: [
        {
          name: 'Brand',
          steps: [
            { step: '100', oklch: 'oklch(95% 0.02 250)' },
          ],
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, presetSelection);
    const brandScale = scales.find(s => s.name === 'Brand')!;
    expect(brandScale.colors![0].oklch).toBe('oklch(95% 0.02 250)');
    expect(brandScale.colors![0].hex).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('preset steps preserve hex literals stored in steps[].oklch (Convex / Android palette)', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Primary', source: 'preset' as const },
      ],
    };
    const presetSelection = {
      selectedScales: [
        {
          name: 'Primary',
          baseStep: '2400',
          steps: [
            { step: '2300', oklch: '#FF336699' }, // ambiguous 8-digit → CSS pipeline via normalizeSolidCssHex
            { step: '2400', oklch: '#FF0053c8' }, // Flutter AARRGGBB semantics for brand blues
          ],
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, presetSelection);
    const primary = scales.find((s) => s.name === 'Primary')!;
    const h2300 = primary.colors!.find((c) => c.step === 2300)!.hex;
    const h2400 = primary.colors!.find((c) => c.step === 2400)!.hex;
    expect(h2300.toLowerCase()).toBe('#336699');
    expect(h2400.toLowerCase()).toBe('#0053c8');
  });

  it('filters out unresolvable scales but keeps neutral', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Valid', source: 'custom' as const, baseColor: '#ff5500' },
        { name: 'Invalid', source: 'preset' as const }, // No matching preset
      ],
    };

    const scales = buildAvailableScales(colorConfig, { selectedScales: [] });
    expect(scales.map(s => s.name)).toEqual([BUILT_IN_NEUTRAL_SCALE_NAME, 'Valid']);
  });

  it('does not duplicate neutral when brand already defines it', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Primary', source: 'custom' as const, baseColor: '#ff5500' },
        { name: 'Neutral', source: 'custom' as const, baseColor: '#808080' },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    expect(scales).toHaveLength(2);
    expect(scales[0].name).toBe('Primary');
    expect(scales[1].name).toBe('Neutral');
  });

  it('uses brand neutral base color when defined', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Neutral', source: 'custom' as const, baseColor: '#a0a0a0' },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    expect(scales).toHaveLength(1);
    expect(scales[0].name).toBe('Neutral');
    // Scale was generated from the brand's custom base, not the default #808080
    expect(scales[0].colors!.length).toBe(25);
  });

  it('preset scale with baseColor but no steps falls back to generated scale', () => {
    const colorConfig = {
      brandScales: [
        { name: 'Brand', source: 'preset' as const },
      ],
    };
    const presetSelection = {
      selectedScales: [
        {
          name: 'Brand',
          baseColor: 'oklch(50% 0.15 30)',
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, presetSelection);
    const brandScale = scales.find(s => s.name === 'Brand')!;
    expect(brandScale.steps.length).toBeGreaterThan(0);
  });

  it('replays custom scale chroma retention, hue, and chroma cap for surfaces', () => {
    const baseColor = '#FF5500';
    const lockedBaseOklch = hexToOklch(baseColor);
    const lightnessScale = createDefaultLightnessScale();
    const colorConfig = {
      lightnessScale,
      brandScales: [
        {
          name: 'Reliance',
          source: 'custom' as const,
          baseColor,
          lockBase: true,
          lockedBaseOklch,
          scaleHue: lockedBaseOklch.h + 12,
          scaleChroma: lockedBaseOklch.c * 0.72,
          chromaRetention: 1,
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    const reliance = scales.find(s => s.name === 'Reliance')!;
    const expected = generateColorScaleWithLightnessScale(
      'Reliance',
      lockedBaseOklch.h + 12,
      lockedBaseOklch.c * 0.72,
      lightnessScale,
      lockedBaseOklch.l,
      1,
      { lockBase: true, lockedBaseOklch },
    );

    expect(reliance.baseStep).toBe(expected.config.baseStep);
    expect(reliance.colors?.find(c => c.step === 2400)?.hex).toBe(
      expected.steps.find(s => s.step === 2400)?.hex,
    );
    expect(reliance.colors?.find(c => c.step === 2300)?.hex).toBe(
      expected.steps.find(s => s.step === 2300)?.hex,
    );
  });

  it('rehydrates legacy brand scale shaping from saved custom scales', () => {
    const baseColor = '#0053C8';
    const lockedBaseOklch = hexToOklch(baseColor);
    const lightnessScale = createDefaultLightnessScale();
    const colorConfig = {
      lightnessScale,
      brandScales: [
        {
          name: 'Reliance Blue',
          source: 'custom' as const,
          baseColor,
          lockBase: true,
          lockedBaseOklch,
        },
      ],
      savedCustomScales: [
        {
          id: 'reliance-blue',
          name: 'Reliance Blue',
          baseColor,
          lightnessOffsets: { dark: 0, light: 0 },
          chromaRetention: 1,
          scaleHue: lockedBaseOklch.h,
          scaleChroma: lockedBaseOklch.c,
          lockBase: true,
          lockedBaseOklch,
        },
      ],
    };

    const scales = buildAvailableScales(colorConfig, null);
    const reliance = scales.find(s => s.name === 'Reliance Blue')!;
    const expected = generateColorScaleWithLightnessScale(
      'Reliance Blue',
      lockedBaseOklch.h,
      lockedBaseOklch.c,
      lightnessScale,
      lockedBaseOklch.l,
      1,
      { lockBase: true, lockedBaseOklch },
    );

    expect(reliance.colors?.find(c => c.step === 2400)?.hex).toBe(
      expected.steps.find(s => s.step === 2400)?.hex,
    );
  });
});
