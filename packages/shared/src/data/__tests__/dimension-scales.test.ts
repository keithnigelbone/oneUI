/**
 * dimension-scales.test.ts
 *
 * Covers the dimension lookup on the unified S/M/L breakpoint model:
 *  - getDimensionValue() returns byte-identical values for S/M/L breakpoints.
 *  - getDimensionValueFromConfig() routes S/M/L IDs through the static table.
 *  - getDimensionValueFromConfig() computes values for non-web breakpoints via
 *    DIN 1450 + SCALE_RATIOS.
 *  - getAllAvailableBreakpoints() flattens enabled platforms and filters disabled.
 *  - DIN 1450 per-breakpoint overrides are honoured (e.g., Business Card @ 30cm).
 */

import { describe, it, expect } from 'vitest';
import {
  F_STEPS,
  BREAKPOINT_IDS,
  STATIC_DIMENSION_TABLES,
  DIMENSION_SPACING_TOKENS,
  NEGATIVE_SPACING_TOKENS,
  DIMENSION_TOKEN_MULTIPLIERS,
  GRID_VALUES,
  getDimensionValue,
  getDimensionValueFromConfig,
  getAllAvailableBreakpoints,
  resolveBreakpointBaseSize,
  resolveColourToolBaseSize,
  breakpointStaticBaseSize,
  resolveColourToolDimensionTokenValue,
  viewportToBreakpointGroup,
} from '../dimension-scales';
import {
  DEFAULT_FSTEP_ASSIGNMENTS,
  applyBreakpointGroupBump,
} from '../typography-roles';
import { buildDefaultPlatformsConfig } from '../../utils/platform-config';
import type { PlatformsFoundationConfig } from '../../types/platforms';

describe('getDimensionValue — S/M/L static path', () => {
  it('returns the exact static table value for every breakpoint × density × f-step', () => {
    for (const bp of BREAKPOINT_IDS) {
      for (const density of ['default', 'compact', 'open'] as const) {
        F_STEPS.forEach((step, i) => {
          expect(getDimensionValue(bp, density, step)).toBe(
            STATIC_DIMENSION_TABLES[bp][density][i],
          );
        });
      }
    }
  });
});

describe('breakpoint groups + per-group type-scale bump (Display/Headline)', () => {
  it('maps viewport widths to 3 groups (S/M/L) on the 619/990 ladder', () => {
    expect(viewportToBreakpointGroup(360)).toBe('S');
    expect(viewportToBreakpointGroup(619)).toBe('S');
    expect(viewportToBreakpointGroup(620)).toBe('M');
    expect(viewportToBreakpointGroup(990)).toBe('M');
    expect(viewportToBreakpointGroup(991)).toBe('L');
    expect(viewportToBreakpointGroup(1920)).toBe('L');
  });

  it('bumps Display/Headline at the L group, leaves S/M unchanged', () => {
    const dispL = DEFAULT_FSTEP_ASSIGNMENTS.display.L; // f7
    const headL = DEFAULT_FSTEP_ASSIGNMENTS.headline.L; // f4
    expect(applyBreakpointGroupBump('display', 'L', dispL, 'S')).toBe('f7');
    expect(applyBreakpointGroupBump('display', 'L', dispL, 'M')).toBe('f7');
    expect(applyBreakpointGroupBump('display', 'L', dispL, 'L')).toBe('f9'); // #10 → #14
    expect(applyBreakpointGroupBump('display', 'M', DEFAULT_FSTEP_ASSIGNMENTS.display.M, 'L')).toBe('f7'); // #9 → #10
    expect(applyBreakpointGroupBump('headline', 'L', headL, 'L')).toBe('f6'); // #7 → #9
    expect(applyBreakpointGroupBump('headline', 'M', DEFAULT_FSTEP_ASSIGNMENTS.headline.M, 'L')).toBe('f3'); // #5 → #6
  });

  it('leaves flat roles unchanged at every group', () => {
    for (const g of ['S', 'M', 'L'] as const) {
      expect(applyBreakpointGroupBump('title', 'L', DEFAULT_FSTEP_ASSIGNMENTS.title.L, g)).toBe('f2');
      expect(applyBreakpointGroupBump('body', 'M', DEFAULT_FSTEP_ASSIGNMENTS.body.M, g)).toBe('f0');
      expect(applyBreakpointGroupBump('display', 'S', DEFAULT_FSTEP_ASSIGNMENTS.display.S, g)).toBe('f5');
    }
  });

  it('resolves the Figma desktop px: Display-L 70px and Headline-L 45px at the L breakpoint default', () => {
    // Display-L bumps to f9 (#14) on the L group → 20 × 3.5 = 70
    expect(getDimensionValue('L', 'default', 'f9')).toBe(70);
    // Headline-L bumps to f6 (#9) → 20 × 2.25 = 45
    expect(getDimensionValue('L', 'default', 'f6')).toBe(45);
    // At mobile (S group, base 16) they stay at the base step: Display-L f7=40, Headline-L f4=28
    expect(getDimensionValue('S', 'default', 'f7')).toBe(40);
    expect(getDimensionValue('S', 'default', 'f4')).toBe(28);
  });
});

describe('f2-5 half-step rung (dimension token 5.5, ratio 1.375)', () => {
  it('is a first-class f-step appended to F_STEPS', () => {
    expect(F_STEPS).toContain('f2-5');
    expect(F_STEPS).toHaveLength(26);
  });

  it('resolves to base × 1.375 across densities at S (base 16/14/18)', () => {
    expect(getDimensionValue('S', 'default', 'f2-5')).toBe(22); // 16 × 1.375
    expect(getDimensionValue('S', 'compact', 'f2-5')).toBe(19.25); // 14 × 1.375
    expect(getDimensionValue('S', 'open', 'f2-5')).toBe(24.75); // 18 × 1.375
  });

  it('sits between f2 and f3 by value', () => {
    const f2 = getDimensionValue('S', 'default', 'f2');
    const f3 = getDimensionValue('S', 'default', 'f3');
    const f25 = getDimensionValue('S', 'default', 'f2-5');
    expect(f25).toBeGreaterThan(f2);
    expect(f25).toBeLessThan(f3);
  });
});

describe('ColourTool/platform spacing parity fixture', () => {
  // Fluid base interpolation by viewport width (continuous endpoints).
  const expectedBaseByWidth: Record<number, { compact: number; default: number; open: number }> = {
    360: { compact: 14, default: 16, open: 18 },
    768: { compact: 15.046153846153846, default: 17.046153846153846, open: 19.046153846153846 },
    1024: { compact: 15.702564102564103, default: 17.7025641025641, open: 19.702564102564103 },
    1440: { compact: 16.76923076923077, default: 18.76923076923077, open: 20.76923076923077 },
    1920: { compact: 18, default: 20, open: 22 },
  };

  // Grid values derive from the per-breakpoint static base size (Option A —
  // Min/Mid/Max: S→16, M→18, L→20 default) × the S/M/L grid-bracket
  // margin/gutter multipliers.
  const expectedGrid = {
    S: {
      compact: { margin: 10.5, gutter: 5.25 },
      default: { margin: 16, gutter: 8 },
      open: { margin: 22.5, gutter: 11.25 },
    },
    M: {
      compact: { margin: 24, gutter: 12 },
      default: { margin: 36, gutter: 18 },
      open: { margin: 50, gutter: 25 },
    },
    L: {
      compact: { margin: 36, gutter: 18 },
      default: { margin: 50, gutter: 25 },
      open: { margin: 88, gutter: 30.25 },
    },
  } as const;

  it('uses the exact ColourTool fluid base interpolation at the canonical viewport widths', () => {
    for (const [width, expected] of Object.entries(expectedBaseByWidth)) {
      for (const density of ['compact', 'default', 'open'] as const) {
        expect(resolveColourToolBaseSize(Number(width), density)).toBeCloseTo(
          expected[density],
          8,
        );
      }
    }
  });

  it('keeps the positive and negative spacing token sets in platform order', () => {
    expect(DIMENSION_SPACING_TOKENS).toEqual([
      '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5',
      '4', '4.5', '5', '5.5', '6', '7', '8', '9',
      '10', '12', '14', '16', '18', '20', '24', '28', '32', '40',
    ]);
    expect(NEGATIVE_SPACING_TOKENS).toEqual([
      '0.5', '1', '1.5', '2', '2.5', '3', '3.5',
      '4', '4.5', '5', '5.5', '6', '7', '8',
    ]);
  });

  it('matches ColourTool dimension multipliers for every positive spacing token', () => {
    expect(DIMENSION_TOKEN_MULTIPLIERS).toMatchObject({
      '0': 0,
      '0.5': 0.125,
      '4': 1,
      '5.5': 1.375,
      '10': 2.5,
      '40': 10,
    });

    for (const bp of BREAKPOINT_IDS) {
      for (const density of ['compact', 'default', 'open'] as const) {
        // Dimension token values use the DISCRETE per-breakpoint base size
        // (Figma stepped table), not the fluid interpolation.
        expect(resolveColourToolDimensionTokenValue('5.5', bp, density)).toBe(
          Math.round(
            breakpointStaticBaseSize(bp, density) *
              DIMENSION_TOKEN_MULTIPLIERS['5.5'] *
              100,
          ) / 100,
        );
      }
    }
  });

  it('matches the S/M/L grid margin and gutter values', () => {
    for (const bp of ['S', 'M', 'L'] as const) {
      expect(GRID_VALUES[bp]).toEqual(expectedGrid[bp]);
    }
  });
});

describe('getDimensionValueFromConfig — fast paths', () => {
  const config = buildDefaultPlatformsConfig();

  it('routes S/M/L breakpoint IDs through the static table (byte-identical)', () => {
    // Call shape: platformId = 'S', breakpointId = 'S'
    expect(getDimensionValueFromConfig(config, 'S', 'S', 'default', 'f0')).toBe(
      getDimensionValue('S', 'default', 'f0'),
    );
  });

  it('routes (web, <breakpoint-id>) lookups through the static table', () => {
    for (const id of BREAKPOINT_IDS) {
      expect(getDimensionValueFromConfig(config, 'web', id, 'default', 'f0')).toBe(
        getDimensionValue(id, 'default', 'f0'),
      );
    }
  });

  it('falls back to Web static value when config is null/undefined', () => {
    expect(getDimensionValueFromConfig(null, 'S', 'S', 'default', 'f0')).toBe(
      getDimensionValue('S', 'default', 'f0'),
    );
  });
});

describe('getDimensionValueFromConfig — dynamic path', () => {
  const config = buildDefaultPlatformsConfig();

  it('computes a non-zero base size for Mobile Native from DIN 1450 params', () => {
    const value = getDimensionValueFromConfig(
      config,
      'mobile-native',
      'mobile-native-reference',
      'default',
      'f0',
    );
    expect(value).toBeGreaterThan(0);
  });

  it('Mobile Native and TV Native produce distinct, DIN-driven base sizes', () => {
    const mobileBase = getDimensionValueFromConfig(
      config,
      'mobile-native',
      'mobile-native-reference',
      'default',
      'f0',
    );
    const tvBase = getDimensionValueFromConfig(
      config,
      'tv-native',
      'tv-native-4k',
      'default',
      'f0',
    );
    // Both should be > 0 (proves the DIN path is live).
    expect(mobileBase).toBeGreaterThan(0);
    expect(tvBase).toBeGreaterThan(0);
    // They should differ (proves the lookup distinguishes platforms).
    // Note: TV's long viewing distance is partially offset by its low PPI (50 vs 458),
    // so the raw delta is smaller than intuition suggests — but must be measurable.
    expect(Math.abs(tvBase - mobileBase)).toBeGreaterThan(1);
  });

  it('routes custom Web breakpoint IDs through the static table (no DIN drift)', () => {
    // Invariant: the Web path is byte-identical to getDimensionValue() even
    // when a brand has renamed their Web breakpoints. This test guards
    // against a future regression that would route custom Web breakpoint
    // IDs through `densityBaseSizesForBreakpoint` and produce interpolated
    // values that differ from the ColourTool/platform static table.
    const customWeb: PlatformsFoundationConfig = {
      platforms: [
        {
          id: 'web',
          label: 'Web',
          description: '',
          isEnabled: true,
          category: 'digital-responsive',
          viewingDistance: 50,
          ppi: 100,
          pixelDensity: 1,
          calculatedBaseSize: 19.5,
          breakpoints: [
            { id: 'my-mobile', label: 'Mobile', viewportWidth: 360, isActive: true },
            { id: 'my-desktop', label: 'Desktop', viewportWidth: 1920, isActive: true },
          ],
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: true,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    };

    // Custom id 'my-mobile' with viewportWidth 360 must route to the S
    // static table entry.
    const mobileF0 = getDimensionValueFromConfig(customWeb, 'web', 'my-mobile', 'default', 'f0');
    expect(mobileF0).toBe(getDimensionValue('S', 'default', 'f0'));

    // Custom id 'my-desktop' with viewportWidth 1920 must route to the L breakpoint.
    const desktopF0 = getDimensionValueFromConfig(customWeb, 'web', 'my-desktop', 'default', 'f0');
    expect(desktopF0).toBe(getDimensionValue('L', 'default', 'f0'));
  });

  it('applies the digital-responsive guard (never dynamic-computes Web values)', () => {
    // Same as above but asserts the CRITICAL invariant more explicitly:
    // a custom Web breakpoint that would otherwise hit the dynamic DIN path
    // must instead short-circuit to the static table. If the guard in
    // densityBaseSizesForBreakpoint is ever removed, this test fails first.
    const customWebWithOddDIN: PlatformsFoundationConfig = {
      platforms: [
        {
          id: 'web',
          label: 'Web',
          description: '',
          isEnabled: true,
          category: 'digital-responsive',
          // Deliberately weird DIN params — if the dynamic path took over,
          // we'd get a completely different value than the static table.
          viewingDistance: 999,
          ppi: 999,
          pixelDensity: 1,
          calculatedBaseSize: 3882,
          breakpoints: [
            { id: 'custom-mobile', label: 'Mobile', viewportWidth: 360, isActive: true },
          ],
          viewportMin: 360,
          viewportMax: 360,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    };

    const value = getDimensionValueFromConfig(
      customWebWithOddDIN,
      'web',
      'custom-mobile',
      'default',
      'f0',
    );
    // The garbage DIN params are ignored — Web always routes through the
    // static table, so f0 at the S breakpoint default density is still 16.
    expect(value).toBe(getDimensionValue('S', 'default', 'f0'));
  });

  it('falls back to the Web default when given an unknown platformId', () => {
    const value = getDimensionValueFromConfig(
      config,
      'nonexistent-platform',
      'nonexistent-breakpoint',
      'default',
      'f0',
    );
    // Falls through to getDimensionValue('S', 'default', 'f0')
    expect(value).toBe(getDimensionValue('S', 'default', 'f0'));
  });
});

describe('resolveBreakpointBaseSize — DIN 1450 override handling', () => {
  const config = buildDefaultPlatformsConfig();
  const print = config.platforms.find((p) => p.id === 'print')!;

  it('business-card override produces a different base than default print viewing distance', () => {
    const a4 = print.breakpoints.find((bp) => bp.id === 'print-a4-portrait')!;
    const businessCard = print.breakpoints.find((bp) => bp.id === 'print-business-card')!;

    const a4Base = resolveBreakpointBaseSize(print, a4);
    const bcBase = resolveBreakpointBaseSize(print, businessCard);

    // A4 inherits the parent platform's calculatedBaseSize (no override)
    expect(a4Base).toBe(print.calculatedBaseSize);
    // Business Card is read at 30cm instead of 40cm, so its base is smaller
    expect(bcBase).toBeLessThan(a4Base);
    expect(bcBase).toBeGreaterThan(0);
  });
});

describe('getAllAvailableBreakpoints', () => {
  it('returns a flat list grouped by enabled platforms with category metadata', () => {
    const config = buildDefaultPlatformsConfig();
    const list = getAllAvailableBreakpoints(config);

    // Web has 5 active breakpoints; Mobile Native has 1; Print has 4; Outdoor has 3; TV has 1.
    // Tablet/Desktop Native are disabled by default per seed.
    const webCount = list.filter((bp) => bp.platformId === 'web').length;
    expect(webCount).toBe(5);

    const printCount = list.filter((bp) => bp.platformId === 'print').length;
    expect(printCount).toBe(4);

    // All entries carry category + units
    for (const bp of list) {
      expect(bp.category).toBeDefined();
      expect(['px', 'mm']).toContain(bp.units);
    }
  });

  it('excludes disabled platforms', () => {
    const config = buildDefaultPlatformsConfig();
    // Tablet Native is disabled by default — shouldn't appear
    const list = getAllAvailableBreakpoints(config);
    expect(list.some((bp) => bp.platformId === 'tablet-native')).toBe(false);
  });

  it('excludes inactive breakpoints from enabled platforms', () => {
    const config = buildDefaultPlatformsConfig();
    // Deactivate one of Web's breakpoints
    const web = config.platforms.find((p) => p.id === 'web')!;
    const target = web.breakpoints.find((bp) => bp.id === 'desktop-1920')!;
    const modified: PlatformsFoundationConfig = {
      ...config,
      platforms: config.platforms.map((p) =>
        p.id === 'web'
          ? {
              ...p,
              breakpoints: p.breakpoints.map((bp) =>
                bp.id === target.id ? { ...bp, isActive: false } : bp,
              ),
            }
          : p,
      ),
    };

    const list = getAllAvailableBreakpoints(modified);
    expect(list.some((bp) => bp.breakpointId === 'desktop-1920')).toBe(false);
  });

  it('falls back to the three Web S/M/L breakpoints when config is null', () => {
    const list = getAllAvailableBreakpoints(null);
    expect(list).toHaveLength(BREAKPOINT_IDS.length);
    for (const bp of list) {
      expect(bp.platformId).toBe('web');
      expect(bp.isResponsive).toBe(true);
    }
  });

  it('falls back to the three Web S/M/L breakpoints when config has no enabled platforms', () => {
    const disabled: PlatformsFoundationConfig = {
      ...buildDefaultPlatformsConfig(),
      platforms: buildDefaultPlatformsConfig().platforms.map((p) => ({ ...p, isEnabled: false })),
    };
    const list = getAllAvailableBreakpoints(disabled);
    expect(list).toHaveLength(BREAKPOINT_IDS.length);
  });

  it('converts mm widths to px for print breakpoints', () => {
    const config = buildDefaultPlatformsConfig();
    const list = getAllAvailableBreakpoints(config);
    const a4Portrait = list.find((bp) => bp.breakpointId === 'print-a4-portrait');
    expect(a4Portrait).toBeDefined();
    expect(a4Portrait!.units).toBe('mm');
    // 210mm @ 96 dpi ≈ 794 px
    expect(a4Portrait!.widthPx).toBeGreaterThan(790);
    expect(a4Portrait!.widthPx).toBeLessThan(800);
  });
});
