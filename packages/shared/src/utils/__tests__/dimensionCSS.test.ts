import { describe, expect, it } from 'vitest';
import { generateDimensionCSS, buildStructuredDimensionContexts } from '../dimensionCSS';
import { buildDefaultPlatformsConfig } from '../platform-config';
import { resolveBreakpointRange, BREAKPOINT_IDS } from '../../data/dimension-scales';
import type { PlatformsFoundationConfig } from '../../types/platforms';

describe('generateDimensionCSS', () => {
  it('does not emit overrides for the default ColourTool/platform web config', () => {
    expect(generateDimensionCSS(buildDefaultPlatformsConfig())).toBe('');
  });

  it('emits grid spacing scaled from the platform table for custom bases', () => {
    const config: PlatformsFoundationConfig = {
      defaultPlatform: 'web',
      defaultDensity: 'default',
      platforms: [
        {
          id: 'web',
          label: 'Web',
          description: '',
          isEnabled: true,
          calculatedBaseSize: 20,
          viewportMin: 1440,
          viewportMax: 1440,
          viewingDistance: 60,
          ppi: 96,
          pixelDensity: 1,
          fluidScaling: false,
          breakpoints: [{ id: 'l', label: 'L', viewportWidth: 1440, isActive: true }],
          densityConfigs: [
            { density: 'compact', mobile: { baseSize: 16, scaleFactor: 1 }, desktop: { baseSize: 16, scaleFactor: 1 } },
            { density: 'default', mobile: { baseSize: 20, scaleFactor: 1 }, desktop: { baseSize: 20, scaleFactor: 1 } },
            { density: 'open', mobile: { baseSize: 20, scaleFactor: 1 }, desktop: { baseSize: 20, scaleFactor: 1 } },
          ],
        },
      ],
    };

    const css = generateDimensionCSS(config);

    // base 20 everywhere overrides the smaller S (16) and M (18) defaults via
    // the unified [data-Breakpoint] selectors. L's default base is already 20,
    // so the L block matches the static table and is NOT emitted.
    expect(css).toContain('[data-Breakpoint="M"][data-6-Density="default"]');
    expect(css).toContain('--Dimension-f2-5: 27.5px;'); // 20 × 1.375
    expect(css).toContain('--Grid-Margin: 40px;'); // M margin token '8' × base 20
    expect(css).toContain('--Grid-Gutter: 20px;'); // M gutter token '4' × base 20
    // L's DEFAULT base is already 20 (matches static) → no L default override.
    // (L compact/open still differ from static and are emitted.)
    expect(css).not.toContain('[data-Breakpoint="L"][data-6-Density="default"]');
  });
});

/**
 * Guard against breakpoint-threshold drift: every consumer that maps a viewport
 * to a tier must agree with the single `resolveBreakpointRange` ladder (619/990)
 * so the legacy 5-platform thresholds (767/1023/1439/1919) can never silently
 * creep back in. See PR #437 review.
 */
describe('resolveBreakpointRange — canonical breakpoint ladder', () => {
  it('resolves the S/M/L boundaries at 619/620 and 990/991', () => {
    expect(resolveBreakpointRange(619)).toBe('S');
    expect(resolveBreakpointRange(620)).toBe('M');
    expect(resolveBreakpointRange(990)).toBe('M');
    expect(resolveBreakpointRange(991)).toBe('L');
  });

  it('only ever returns the three canonical S/M/L breakpoints', () => {
    const seen = new Set<string>();
    for (let w = 200; w <= 2200; w += 1) seen.add(resolveBreakpointRange(w));
    expect([...seen].sort()).toEqual([...BREAKPOINT_IDS].sort());
  });
});

/**
 * Shape token vocabulary in the structured native payload (Android / iOS /
 * Flutter). `generateDimensionCSS` emits only `--Dimension-*` / `--Grid-*` —
 * web resolves `--Shape-N` through `primitives.css`. Native clients have no
 * `primitives.css`, so the payload must carry every shape token itself.
 *
 * It must publish the canonical numeric scale, and — until
 * `pnpm check:shape-tokens` reports an empty allowlist — the deprecated t-shirt
 * aliases at byte-identical values.
 */
describe('buildStructuredDimensionContexts — shape token vocabulary', () => {
  const shapesFor = (config: PlatformsFoundationConfig): Record<string, string> => {
    const [first] = buildStructuredDimensionContexts(config);
    return Object.fromEntries(
      Object.entries(first.dimensions)
        .filter(([k]) => k.startsWith('--Shape-'))
        .map(([k, v]) => [k.replace('--Shape-', ''), v]),
    );
  };

  it('emits the full canonical numeric scale plus Pill', () => {
    const shapes = shapesFor(buildDefaultPlatformsConfig());
    const expected = [
      '0', '0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4',
      '4-5', '5', '5-5', '6', '7', '8', '9', '10', 'Pill',
    ];
    for (const step of expected) {
      expect(shapes[step], `--Shape-${step} must be emitted`).toBeDefined();
    }
    expect(shapes.Pill).toBe('9999px');
    expect(shapes['0']).toBe('0px');
  });

  // ── Deprecated t-shirt aliases — delete with LEGACY_SHAPE_ALIASES ──────────
  it('emits t-shirt aliases at values identical to their numeric counterpart', () => {
    const shapes = shapesFor(buildDefaultPlatformsConfig());
    const pairs: [string, string][] = [
      ['None', '0'], ['6XS', '0-5'], ['5XS', '1'], ['4XS', '1-5'],
      ['3XS', '2'], ['2XS', '2-5'], ['XS', '3'], ['S', '3-5'],
      ['M', '4'], ['L', '4-5'], ['XL', '5'], ['2XL', '6'],
      ['3XL', '7'], ['4XL', '8'], ['5XL', '9'], ['6XL', '10'],
    ];
    for (const [legacy, canonical] of pairs) {
      expect(shapes[legacy], `--Shape-${legacy}`).toBe(shapes[canonical]);
    }
  });

  it('--Shape-M is f0, NOT the 8px f-4 of static tokens.shape.m', () => {
    const shapes = shapesFor(buildDefaultPlatformsConfig());
    expect(shapes.M).toBe(shapes['4']);
    expect(shapes.M).not.toBe(shapes['2']);
    expect(shapes['2']).toBe('8px'); // f-4 @ base 16 — where lowercase `m` lives
    expect(shapes['4']).toBe('16px'); // f0
  });
});
