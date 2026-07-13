import { describe, expect, it } from 'vitest';
import {
  generateMaterialAssignmentCSS,
  generateMaterialAssignmentTokenEntries,
  generateMetallicMaterialCSS,
  generateMetallicTokenEntries,
  getMetallicVariantSegments,
  MAX_METALLIC_VARIANTS,
  mergeMaterialConfigWithFoundationConfig,
  normalizeMetallicConfig,
  normalizeMetallicMaterials,
} from '../materialCSS';

describe('metallic material CSS', () => {
  it('emits stop, fill, stroke, stroke fallback, text, and legacy gradient tokens', () => {
    const css = generateMetallicMaterialCSS({
      metallic: {
        gold: {
          shadow: '#111111',
          baseDark: '#222222',
          base: '#333333',
          baseLight: '#444444',
          highlight: '#555555',
          gradientType: 'conic',
          gradientAngle: 90,
        },
      },
    });

    expect(css).toContain('--Material-Metallic-Gold-Shadow: #111111;');
    expect(css).toContain('--Material-Metallic-Gold-GradientType: conic;');
    expect(css).toContain('--Material-Metallic-Gold-GradientAngle: 90deg;');
    expect(css).toContain('--Material-Metallic-Gold-Fill: conic-gradient(from 90deg');
    expect(css).toContain('--Material-Metallic-Gold-Stroke: conic-gradient(from 90deg');
    expect(css).toContain('--Material-Metallic-Gold-StrokeColor: var(--Material-Metallic-Gold-BaseDark);');
    expect(css).toContain('--Material-Metallic-Gold-Text: var(--Material-Metallic-Gold-Shadow);');
    expect(css).toContain('--Material-Metallic-Gold-Gradient: var(--Material-Metallic-Gold-Fill);');
  });

  it('preserves legacy RoseGold token casing', () => {
    const entries = generateMetallicTokenEntries(null);

    expect(entries.some((entry) => entry.name === 'Material-Metallic-RoseGold-Fill')).toBe(true);
    expect(entries.some((entry) => entry.name === 'Material-Metallic-roseGold-Fill')).toBe(false);
  });

  it('filters emitted metallic presets by active metals when configured', () => {
    const entries = generateMetallicTokenEntries({
      activeMetals: {
        gold: true,
        silver: false,
        bronze: false,
        custom: false,
      },
    });
    const names = entries.map((entry) => entry.name);

    expect(names).toContain('Material-Metallic-Gold-Fill');
    expect(names).not.toContain('Material-Metallic-Silver-Fill');
    expect(names).not.toContain('Material-Metallic-Bronze-Fill');
    expect(names).not.toContain('Material-Metallic-RoseGold-Fill');
  });

  it('emits material assignment aliases only for active metals', () => {
    const entries = generateMaterialAssignmentTokenEntries(
      {
        materials: {
          materialAssignments: {
            primary: 'gold',
            logo: 'silver',
          },
        },
      },
      {
        activeMetals: {
          gold: true,
          silver: false,
          bronze: false,
          custom: false,
        },
      },
    );

    expect(entries.map((entry) => entry.name)).toEqual([
      'Primary-Material',
      'Primary-Material-Fill',
      'Primary-Material-Stroke',
      'Primary-Material-StrokeColor',
      'Primary-Material-Text',
    ]);

    expect(generateMaterialAssignmentCSS({ materialAssignments: { logo: 'gold' } })).toContain(
      '--Logo-Material-Fill: var(--Material-Metallic-Gold-Fill);',
    );
  });

  it('merges legacy appearance assignments with Materials foundation assignments', () => {
    const entries = generateMaterialAssignmentTokenEntries(
      {
        materials: {
          materialAssignments: {
            primary: 'gold',
            logo: 'silver',
          },
        },
      },
      {
        materialAssignments: {
          logo: 'bronze',
          secondary: 'custom',
        },
        activeMetals: {
          gold: true,
          silver: true,
          bronze: true,
          custom: true,
        },
      },
    );

    const valuesByName = new Map(entries.map((entry) => [entry.name, entry.value]));
    expect(valuesByName.get('Primary-Material')).toBe('gold');
    expect(valuesByName.get('Logo-Material')).toBe('bronze');
    expect(valuesByName.get('Secondary-Material')).toBe('custom');
  });

  it('emits custom material and radial gradient metadata', () => {
    const entries = generateMetallicTokenEntries({
      metallic: {
        custom: {
          shadow: '#101010',
          baseDark: '#202020',
          base: '#303030',
          baseLight: '#404040',
          highlight: '#505050',
          gradientType: 'radial',
          gradientAngle: 45,
        },
      },
    });

    expect(entries.find((entry) => entry.name === 'Material-Metallic-Custom-GradientType')?.value).toBe('radial');
    expect(entries.find((entry) => entry.name === 'Material-Metallic-Custom-GradientAngle')?.value).toBe('45deg');
    expect(entries.find((entry) => entry.name === 'Material-Metallic-Custom-Fill')?.value).toContain(
      'radial-gradient(circle at right top',
    );
  });

  it('falls back malformed stop values without dropping the preset', () => {
    const config = normalizeMetallicConfig({
      gold: {
        shadow: 'not-css',
        baseDark: '#222222',
        base: '#333333',
        baseLight: '#444444',
        highlight: '#555555',
      },
    });

    expect(config.gold.shadow).toBe('#462523');
    expect(config.gold.base).toBe('#333333');
    expect(config.gold.gradientType).toBe('linear');
    expect(config.custom.gradientType).toBe('radial');
  });
});

describe('metallic material variants', () => {
  const goldWithVariants = {
    metallic: {
      gold: {
        variants: [
          {
            id: 'gold',
            name: 'Gold',
            shadow: '#111111',
            baseDark: '#222222',
            base: '#333333',
            baseLight: '#444444',
            highlight: '#555555',
            gradientType: 'linear',
            gradientAngle: 135,
          },
          {
            id: 'gold-2',
            name: 'Radial Gold',
            shadow: '#101010',
            baseDark: '#202020',
            base: '#303030',
            baseLight: '#404040',
            highlight: '#505050',
            gradientType: 'radial',
            gradientAngle: 45,
          },
        ],
      },
    },
  };

  it('wraps a legacy single-preset metal into one base variant', () => {
    const materials = normalizeMetallicMaterials({
      metallic: {
        gold: {
          shadow: '#111111',
          baseDark: '#222222',
          base: '#333333',
          baseLight: '#444444',
          highlight: '#555555',
        },
      },
    });

    expect(materials.gold.variants).toHaveLength(1);
    expect(materials.gold.variants[0].id).toBe('gold');
    expect(materials.gold.variants[0].name).toBe('Gold');
    expect(materials.gold.variants[0].shadow).toBe('#111111');
  });

  it('keeps the base variant on the legacy unsuffixed tokens and suffixes extra variants', () => {
    const css = generateMetallicMaterialCSS(goldWithVariants);

    // Base variant: unsuffixed (back-compat).
    expect(css).toContain('--Material-Metallic-Gold-Shadow: #111111;');
    expect(css).toContain('--Material-Metallic-Gold-Fill: linear-gradient(135deg');
    // Second variant: PascalCase segment from its name.
    expect(css).toContain('--Material-Metallic-Gold-RadialGold-Shadow: #101010;');
    expect(css).toContain('--Material-Metallic-Gold-RadialGold-Fill: radial-gradient(circle at');
  });

  it('emits token entries for every variant of a metal', () => {
    const names = generateMetallicTokenEntries(goldWithVariants).map((entry) => entry.name);

    expect(names).toContain('Material-Metallic-Gold-Fill');
    expect(names).toContain('Material-Metallic-Gold-RadialGold-Fill');
  });

  it('caps variants at MAX_METALLIC_VARIANTS', () => {
    const tooMany = Array.from({ length: MAX_METALLIC_VARIANTS + 2 }, (_, i) => ({
      id: `gold-${i}`,
      name: `Gold ${i}`,
      shadow: '#111111',
      baseDark: '#222222',
      base: '#333333',
      baseLight: '#444444',
      highlight: '#555555',
      gradientType: 'linear' as const,
      gradientAngle: 135,
    }));
    const materials = normalizeMetallicMaterials({ metallic: { gold: { variants: tooMany } } });

    expect(materials.gold.variants).toHaveLength(MAX_METALLIC_VARIANTS);
  });

  it('derives a unique, non-empty segment per non-base variant', () => {
    const materials = normalizeMetallicMaterials({
      metallic: {
        gold: {
          variants: [
            { name: 'Gold', shadow: '#111111', baseDark: '#222', base: '#333', baseLight: '#444', highlight: '#555' },
            { name: 'Brushed', shadow: '#111111', baseDark: '#222', base: '#333', baseLight: '#444', highlight: '#555' },
            { name: 'Brushed', shadow: '#111111', baseDark: '#222', base: '#333', baseLight: '#444', highlight: '#555' },
          ],
        },
      },
    });
    const segments = getMetallicVariantSegments(materials.gold);

    expect(segments[0]).toBe('');
    expect(segments[1]).toBe('Brushed');
    expect(segments[2]).not.toBe('Brushed');
    expect(segments[2]).not.toBe('');
  });

  it('preserves variants through a base-only foundation override merge', () => {
    const merged = mergeMaterialConfigWithFoundationConfig(goldWithVariants.metallic, {
      metallic: { gold: { shadow: '#abcabc' } },
    });
    const materials = normalizeMetallicMaterials(merged);

    // Override applied to base variant only…
    expect(materials.gold.variants[0].shadow).toBe('#abcabc');
    // …while the extra variant survives untouched.
    expect(materials.gold.variants).toHaveLength(2);
    expect(materials.gold.variants[1].name).toBe('Radial Gold');
    expect(materials.gold.variants[1].shadow).toBe('#101010');
  });

  it('returns the base variant from normalizeMetallicConfig for legacy consumers', () => {
    const config = normalizeMetallicConfig(goldWithVariants);

    expect(config.gold.shadow).toBe('#111111');
    expect(config.gold.gradientType).toBe('linear');
    expect((config.gold as unknown as Record<string, unknown>).id).toBeUndefined();
    expect((config.gold as unknown as Record<string, unknown>).name).toBeUndefined();
  });
});
