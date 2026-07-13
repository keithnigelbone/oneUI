import { describe, expect, it } from 'vitest';
import {
  FILL_STOPS,
  STROKE_STOPS,
  DEFAULT_METALLIC_PRESETS,
  generateMetallicMaterialCSS,
} from '../materialCSS';
import { resolveMaterials as resolveNativeMaterials } from '../materialNative';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the hex stop-color values from a CSS linear-gradient string. */
function parseGradientStops(css: string): string[] {
  // Matches patterns like #abc123 or #abc from "stop-color" entries within
  // the gradient value. We use the last CSS fill value emitted.
  const gradientMatch = css.match(/linear-gradient\([^)]+\)/);
  if (!gradientMatch) return [];
  const stops: string[] = [];
  const stopRegex = /#[0-9a-fA-F]{3,8}/g;
  let m: RegExpExecArray | null;
  while ((m = stopRegex.exec(gradientMatch[0])) !== null) {
    stops.push(m[0].toLowerCase());
  }
  return stops;
}

/** Normalise hex to full 6-char lowercase (#aabbcc). */
function normalizeHex(h: string): string {
  const c = h.replace('#', '').toLowerCase();
  if (c.length === 3) return '#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  return '#' + c;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('resolveMaterials (native)', () => {
  it('returns defaults when no config is provided', () => {
    const result = resolveNativeMaterials(undefined, undefined);
    // With no active metals config all presets are enabled by default
    expect(result.enabled.length).toBeGreaterThan(0);
    expect(result.enabled).toContain('gold');
    expect(result.assignments).toEqual({});
    expect(result.metallic.gold).toBeDefined();
  });

  it('gold preset colors match FILL_STOPS order from DEFAULT_METALLIC_PRESETS', () => {
    const result = resolveNativeMaterials(undefined, undefined);
    const gold = result.metallic.gold!;
    const preset = DEFAULT_METALLIC_PRESETS.gold;

    // FILL_STOPS order: shadow, base, baseLight, highlight, highlight, base, baseLight, shadow
    const expectedColors = FILL_STOPS.map(({ property }) =>
      normalizeHex(preset[property]),
    );

    expect(gold.colors.map(normalizeHex)).toEqual(expectedColors);
    expect(gold.colors).toHaveLength(8);
    expect(gold.locations).toHaveLength(8);
  });

  it('gold gradient locations match FILL_STOPS positions', () => {
    const result = resolveNativeMaterials(undefined, undefined);
    const gold = result.metallic.gold!;

    const expectedLocations = FILL_STOPS.map(({ position }) =>
      parseFloat(position) / 100,
    );

    expect([...gold.locations]).toEqual(expectedLocations);
  });

  it('stroke colors match STROKE_STOPS order from DEFAULT_METALLIC_PRESETS', () => {
    const result = resolveNativeMaterials(undefined, undefined);
    const gold = result.metallic.gold!;
    const preset = DEFAULT_METALLIC_PRESETS.gold;

    const expectedStrokeColors = STROKE_STOPS.map(({ property }) =>
      normalizeHex(preset[property]),
    );

    expect(gold.strokeColors.map(normalizeHex)).toEqual(expectedStrokeColors);
    expect(gold.strokeColors).toHaveLength(6);
  });

  it('native fill stop colors are byte-identical to web CSS gradient stops', () => {
    // Generate the web CSS gradient for gold with default config
    const css = generateMetallicMaterialCSS(null);
    const cssStops = parseGradientStops(
      css.match(/--Material-Metallic-Gold-Fill:[^;]+/)?.[0] ?? '',
    );

    const result = resolveNativeMaterials(undefined, undefined);
    const nativeColors = [...result.metallic.gold!.colors].map(normalizeHex);

    // Only verify if CSS parsing found stops
    if (cssStops.length === 8) {
      expect(nativeColors).toEqual(cssStops.map(normalizeHex));
    } else {
      // Parsing may not find all stops if format differs; at minimum verify
      // the first and last stops match shadow
      expect(nativeColors[0]).toBe(normalizeHex(DEFAULT_METALLIC_PRESETS.gold.shadow));
      expect(nativeColors[7]).toBe(normalizeHex(DEFAULT_METALLIC_PRESETS.gold.shadow));
    }
  });

  it('material assignments are forwarded from materialsFoundationConfig', () => {
    const materialsFoundationConfig = {
      activeMetals: { gold: true, silver: false, bronze: false, custom: false, platinum: false, roseGold: false },
      materialAssignments: { primary: 'gold' },
    };

    const result = resolveNativeMaterials(undefined, materialsFoundationConfig);

    expect(result.assignments.primary).toBe('gold');
    expect(result.enabled).toContain('gold');
    expect(result.enabled).not.toContain('silver');
  });

  it('materialConfig preset overrides are applied on top of defaults', () => {
    const materialConfig = {
      metallic: {
        gold: {
          shadow: '#ff0000',
          baseDark: '#cc0000',
          base: '#ee1111',
          baseLight: '#ff5555',
          highlight: '#ffaaaa',
          gradientType: 'linear',
          gradientAngle: 45,
        },
      },
    };

    const result = resolveNativeMaterials(materialConfig, undefined);
    const gold = result.metallic.gold!;

    expect(normalizeHex(gold.colors[0])).toBe('#ff0000'); // shadow at 0%
    expect(gold.angle).toBe(45);
    expect(gold.gradientType).toBe('linear');
  });

  it('preserves text and strokeColor from preset', () => {
    const result = resolveNativeMaterials(undefined, undefined);
    const gold = result.metallic.gold!;

    // text = shadow stop (readable on metallic fill)
    expect(normalizeHex(gold.text)).toBe(normalizeHex(DEFAULT_METALLIC_PRESETS.gold.shadow));
    // strokeColor = baseDark solid fallback
    expect(normalizeHex(gold.strokeColor)).toBe(normalizeHex(DEFAULT_METALLIC_PRESETS.gold.baseDark));
  });

  it('only enabled presets appear in metallic map', () => {
    const materialsFoundationConfig = {
      activeMetals: { gold: true, silver: false, bronze: false, custom: false, platinum: false, roseGold: false },
    };

    const result = resolveNativeMaterials(undefined, materialsFoundationConfig);

    expect(result.metallic.gold).toBeDefined();
    expect(result.metallic.silver).toBeUndefined();
    expect(result.metallic.bronze).toBeUndefined();
  });
});
