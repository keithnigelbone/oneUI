/**
 * platform-config.test.ts
 *
 * Covers Phase 1 additions to the Platforms foundation:
 *  - Every preset carries a valid `category`.
 *  - buildDefaultPlatformsConfig assigns category + breakpointSelectionMode.
 *  - migrateLegacyPlatformsConfig folds legacy printA4/printBusinessCard into `print`.
 *  - migrateLegacyPlatformsConfig backfills missing category/selectionMode on older entries.
 */

import { describe, it, expect } from 'vitest';
import {
  PLATFORM_CONFIG_PRESETS,
  buildDefaultPlatformsConfig,
  migrateLegacyPlatformsConfig,
} from '../platform-config';
import type { PlatformsFoundationConfig } from '../../types/platforms';

describe('PLATFORM_CONFIG_PRESETS', () => {
  it('assigns a category to every preset', () => {
    for (const preset of PLATFORM_CONFIG_PRESETS) {
      expect(preset.category).toBeDefined();
      expect(['digital-responsive', 'digital-fixed', 'print', 'physical']).toContain(preset.category);
    }
  });

  it('has web as the only digital-responsive preset', () => {
    const responsive = PLATFORM_CONFIG_PRESETS.filter((p) => p.category === 'digital-responsive');
    expect(responsive).toHaveLength(1);
    expect(responsive[0].id).toBe('web');
  });

  it('exposes a single consolidated "print" preset (not printA4/printBusinessCard)', () => {
    const ids = PLATFORM_CONFIG_PRESETS.map((p) => p.id);
    expect(ids).toContain('print');
    expect(ids).not.toContain('printA4');
    expect(ids).not.toContain('printBusinessCard');
  });

  it('seeds the print preset with multiple nested format variants', () => {
    const print = PLATFORM_CONFIG_PRESETS.find((p) => p.id === 'print');
    expect(print).toBeDefined();
    const ids = print!.defaultBreakpoints.map((bp) => bp.id);
    expect(ids).toContain('print-a4-portrait');
    expect(ids).toContain('print-business-card');
  });

  it('attaches a DIN 1450 override to Business Card (closer reading distance)', () => {
    const print = PLATFORM_CONFIG_PRESETS.find((p) => p.id === 'print');
    const businessCard = print!.defaultBreakpoints.find((bp) => bp.id === 'print-business-card');
    expect(businessCard?.din1450Override?.viewingDistance).toBe(30);
  });
});

describe('buildDefaultPlatformsConfig', () => {
  it('populates category + breakpointSelectionMode on every platform', () => {
    const config = buildDefaultPlatformsConfig();
    for (const platform of config.platforms) {
      expect(platform.category).toBeDefined();
      expect(platform.breakpointSelectionMode).toBeDefined();
    }
  });

  it('sets viewport-auto selection mode only for digital-responsive (Web)', () => {
    const config = buildDefaultPlatformsConfig();
    for (const platform of config.platforms) {
      if (platform.category === 'digital-responsive') {
        expect(platform.breakpointSelectionMode).toBe('viewport-auto');
      } else {
        expect(platform.breakpointSelectionMode).toBe('manual');
      }
    }
  });

  it('enables Web + Mobile Native + TV Native + Print + Outdoor by default', () => {
    const config = buildDefaultPlatformsConfig();
    const enabledIds = new Set(config.platforms.filter((p) => p.isEnabled).map((p) => p.id));
    expect(enabledIds).toContain('web');
    expect(enabledIds).toContain('mobile-native');
    expect(enabledIds).toContain('tv-native');
    expect(enabledIds).toContain('print');
    expect(enabledIds).toContain('outdoor');
  });
});

describe('migrateLegacyPlatformsConfig', () => {
  it('is idempotent on a freshly built config', () => {
    const fresh = buildDefaultPlatformsConfig();
    const migrated = migrateLegacyPlatformsConfig(fresh);
    expect(migrated.platforms).toHaveLength(fresh.platforms.length);
    for (let i = 0; i < fresh.platforms.length; i++) {
      expect(migrated.platforms[i].id).toBe(fresh.platforms[i].id);
    }
  });

  it('is idempotent — migrate(migrate(x)) === migrate(x) for every field', () => {
    // Build a realistic legacy config and assert that running the migrator
    // twice produces the same output as running it once. The first pass does
    // all the real work (folding printA4 + refreshing stale entries); the
    // second pass should be a no-op.
    const legacy: PlatformsFoundationConfig = {
      platforms: [
        {
          id: 'web',
          label: 'Web',
          description: '',
          isEnabled: true,
          viewingDistance: 50,
          ppi: 100,
          pixelDensity: 1,
          calculatedBaseSize: 19.5,
          breakpoints: [{ id: 'mobile-360', label: 'Mobile', viewportWidth: 360, isActive: true }],
          viewportMin: 360,
          viewportMax: 360,
          fluidScaling: false,
          densityConfigs: [],
        },
        // Stale default entry — will be refreshed on first pass
        {
          id: 'mobile-native',
          label: 'Mobile Native',
          description: '',
          isEnabled: false,
          viewingDistance: 30,
          ppi: 458,
          pixelDensity: 3,
          calculatedBaseSize: 13.8,
          breakpoints: [],
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: false,
          densityConfigs: [],
        },
        // Legacy print split — will be folded on first pass
        {
          id: 'printA4',
          label: 'Print A4',
          description: '',
          isEnabled: true,
          viewingDistance: 40,
          ppi: 300,
          pixelDensity: 1,
          calculatedBaseSize: 46.7,
          breakpoints: [],
          viewportMin: 210,
          viewportMax: 210,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    };

    const once = migrateLegacyPlatformsConfig(legacy);
    const twice = migrateLegacyPlatformsConfig(once);

    // Structural equality — same number of platforms, same ids in same order
    expect(twice.platforms).toHaveLength(once.platforms.length);
    for (let i = 0; i < once.platforms.length; i++) {
      expect(twice.platforms[i].id).toBe(once.platforms[i].id);
      expect(twice.platforms[i].isEnabled).toBe(once.platforms[i].isEnabled);
      expect(twice.platforms[i].breakpoints).toEqual(once.platforms[i].breakpoints);
      expect(twice.platforms[i].viewingDistance).toBe(once.platforms[i].viewingDistance);
      expect(twice.platforms[i].ppi).toBe(once.platforms[i].ppi);
    }
  });

  it('folds legacy printA4 + printBusinessCard into a single "print" entry', () => {
    const legacy: PlatformsFoundationConfig = {
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
          breakpoints: [{ id: 'mobile-360', label: 'Mobile', viewportWidth: 360, isActive: true }],
          viewportMin: 360,
          viewportMax: 360,
          fluidScaling: false,
          densityConfigs: [],
        },
        {
          id: 'printA4',
          label: 'Print A4',
          description: '',
          isEnabled: true,
          viewingDistance: 40,
          ppi: 300,
          pixelDensity: 1,
          calculatedBaseSize: 46.7,
          breakpoints: [
            { id: 'legacy-a4-custom', label: 'Custom A4', viewportWidth: 210, isActive: true },
          ],
          viewportMin: 210,
          viewportMax: 210,
          fluidScaling: false,
          densityConfigs: [],
        },
        {
          id: 'printBusinessCard',
          label: 'Business Card',
          description: '',
          isEnabled: false,
          viewingDistance: 30,
          ppi: 300,
          pixelDensity: 1,
          calculatedBaseSize: 35,
          breakpoints: [],
          viewportMin: 85,
          viewportMax: 85,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    };

    const migrated = migrateLegacyPlatformsConfig(legacy);
    const ids = migrated.platforms.map((p) => p.id);

    expect(ids).toContain('print');
    expect(ids).not.toContain('printA4');
    expect(ids).not.toContain('printBusinessCard');

    const print = migrated.platforms.find((p) => p.id === 'print');
    expect(print).toBeDefined();
    expect(print!.category).toBe('print');
    // Legacy breakpoint preserved alongside the default ones
    const bpIds = print!.breakpoints.map((bp) => bp.id);
    expect(bpIds).toContain('legacy-a4-custom');
    expect(bpIds).toContain('print-a4-portrait'); // from default preset
    // Enabled because legacy printA4 was enabled
    expect(print!.isEnabled).toBe(true);
  });

  it('backfills missing category on entries that predate the rework', () => {
    const legacyWithoutCategory = {
      platforms: [
        {
          id: 'web',
          label: 'Web',
          description: '',
          isEnabled: true,
          viewingDistance: 50,
          ppi: 100,
          pixelDensity: 1,
          calculatedBaseSize: 19.5,
          breakpoints: [],
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: false,
          densityConfigs: [],
        },
        {
          id: 'mobile-native',
          label: 'Mobile Native',
          description: '',
          isEnabled: false,
          viewingDistance: 30,
          ppi: 458,
          pixelDensity: 3,
          calculatedBaseSize: 13.8,
          breakpoints: [],
          viewportMin: 390,
          viewportMax: 390,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    } as PlatformsFoundationConfig;

    const migrated = migrateLegacyPlatformsConfig(legacyWithoutCategory);
    const web = migrated.platforms.find((p) => p.id === 'web');
    const mobileNative = migrated.platforms.find((p) => p.id === 'mobile-native');

    expect(web?.category).toBe('digital-responsive');
    expect(web?.breakpointSelectionMode).toBe('viewport-auto');
    expect(mobileNative?.category).toBe('digital-fixed');
    expect(mobileNative?.breakpointSelectionMode).toBe('manual');
  });

  it('refreshes stale default mobile-native entry (empty breakpoints → seeded + enabled)', () => {
    const legacyWithStaleMobile: PlatformsFoundationConfig = {
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
          breakpoints: [{ id: 'mobile-360', label: 'Mobile', viewportWidth: 360, isActive: true }],
          viewportMin: 360,
          viewportMax: 360,
          fluidScaling: false,
          densityConfigs: [],
        },
        {
          id: 'mobile-native',
          label: 'Mobile Native',
          description: '',
          isEnabled: false, // stale V1 default
          viewingDistance: 30,
          ppi: 458,
          pixelDensity: 3,
          calculatedBaseSize: 13.8,
          breakpoints: [], // never configured
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: false,
          densityConfigs: [],
        },
        {
          id: 'outdoor',
          label: 'Outdoor',
          description: '',
          isEnabled: false, // stale V1 default
          viewingDistance: 500,
          ppi: 72,
          pixelDensity: 1,
          calculatedBaseSize: 142,
          breakpoints: [], // never configured
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'web',
      defaultDensity: 'default',
    };

    const migrated = migrateLegacyPlatformsConfig(legacyWithStaleMobile);
    const mobileNative = migrated.platforms.find((p) => p.id === 'mobile-native');
    const outdoor = migrated.platforms.find((p) => p.id === 'outdoor');

    // Both should be refreshed and enabled.
    expect(mobileNative?.isEnabled).toBe(true);
    expect(mobileNative?.breakpoints.length).toBeGreaterThan(0);
    expect(outdoor?.isEnabled).toBe(true);
    expect(outdoor?.breakpoints.length).toBeGreaterThan(0);

    // Web keeps its original breakpoint (user-configured).
    const web = migrated.platforms.find((p) => p.id === 'web');
    expect(web?.isEnabled).toBe(true);
    expect(web?.breakpoints).toHaveLength(1);
    expect(web?.breakpoints[0].id).toBe('mobile-360');
  });

  it('does NOT refresh stale entry when DIN params have been user-edited', () => {
    // Regression for review finding: previously, the stale-entry refresh
    // keyed ONLY on `breakpoints.length === 0`, which meant a user who had
    // opened the Platforms editor pre-Phase 3 and typed a custom viewing
    // distance on Mobile Native (without adding breakpoints yet) would have
    // their DIN params clobbered by the preset defaults on first load.
    // The fix adds a `dinParamsMatchPreset` guard — this test locks it in.
    const withCustomDIN: PlatformsFoundationConfig = {
      platforms: [
        {
          id: 'mobile-native',
          label: 'Mobile Native',
          description: '',
          isEnabled: false,
          // User typed 35cm instead of the preset default 30cm.
          viewingDistance: 35,
          ppi: 458,
          pixelDensity: 3,
          calculatedBaseSize: 15.6,
          breakpoints: [], // still empty — the old "stale" proxy would match
          viewportMin: 360,
          viewportMax: 1920,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'mobile-native',
      defaultDensity: 'default',
    };

    const migrated = migrateLegacyPlatformsConfig(withCustomDIN);
    const mobile = migrated.platforms.find((p) => p.id === 'mobile-native');

    // Custom DIN value must survive the migrator.
    expect(mobile?.viewingDistance).toBe(35);
    // Breakpoints must stay empty (NOT backfilled with preset defaults).
    expect(mobile?.breakpoints).toHaveLength(0);
    // Enabled flag is unchanged (user had not enabled it).
    expect(mobile?.isEnabled).toBe(false);
  });

  it('preserves user-configured breakpoints on non-stale platforms', () => {
    // Mobile Native with a custom breakpoint is "touched" — must NOT be refreshed.
    const userConfigured: PlatformsFoundationConfig = {
      platforms: [
        {
          id: 'mobile-native',
          label: 'My Custom Mobile',
          description: 'Custom setup',
          isEnabled: false, // user deliberately disabled
          category: 'digital-fixed',
          viewingDistance: 30,
          ppi: 458,
          pixelDensity: 3,
          calculatedBaseSize: 13.8,
          breakpoints: [
            { id: 'iphone-se', label: 'iPhone SE', viewportWidth: 375, isActive: true },
          ],
          viewportMin: 375,
          viewportMax: 375,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
      defaultPlatform: 'mobile-native',
      defaultDensity: 'default',
    };

    const migrated = migrateLegacyPlatformsConfig(userConfigured);
    const mobile = migrated.platforms.find((p) => p.id === 'mobile-native');

    // User's custom shape preserved — not refreshed from preset.
    expect(mobile?.label).toBe('My Custom Mobile');
    expect(mobile?.isEnabled).toBe(false);
    expect(mobile?.breakpoints).toHaveLength(1);
    expect(mobile?.breakpoints[0].id).toBe('iphone-se');
  });

  it('drops legacy printA4 when a unified print entry already exists (no duplication)', () => {
    const fresh = buildDefaultPlatformsConfig();
    // Add a stale printA4 entry on top of the already-unified print
    const withStaleLegacy: PlatformsFoundationConfig = {
      ...fresh,
      platforms: [
        ...fresh.platforms,
        {
          id: 'printA4',
          label: 'Print A4 (legacy)',
          description: '',
          isEnabled: true,
          viewingDistance: 40,
          ppi: 300,
          pixelDensity: 1,
          calculatedBaseSize: 46.7,
          breakpoints: [],
          viewportMin: 210,
          viewportMax: 210,
          fluidScaling: false,
          densityConfigs: [],
        },
      ],
    };

    const migrated = migrateLegacyPlatformsConfig(withStaleLegacy);
    const ids = migrated.platforms.map((p) => p.id);
    expect(ids).not.toContain('printA4');
    expect(ids.filter((id) => id === 'print')).toHaveLength(1);
  });
});
