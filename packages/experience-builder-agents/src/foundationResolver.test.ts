/**
 * foundationResolver.test.ts
 *
 * FND-04 / FND-03 / D-09 / Pitfall 6:
 *   - configured brand + covered (web) profile → real ThemeConfig `ok: true`.
 *   - partially-configured brand (primary only) → resolves (NOT a gap) because
 *     the engine's system defaults (`ensureNeutralRole`) fill the rest (D-09).
 *   - uncovered (non-web) / unresolvable profile → typed gap with NO numeric
 *     dimensions (FND-03 / Pitfall 6).
 *
 * The resolver has NO model, so no model mock is needed here — only the brand's
 * Convex-foundations input is supplied.
 */

import { describe, it, expect } from 'vitest';
import {
  FoundationResolveResultSchema,
  type FoundationResolveInputT,
} from '@oneui/experience-builder-core';
import type { PlatformsFoundationConfig, PlatformEntry } from '@oneui/shared';
import { resolveFoundation, type BrandFoundations } from './foundationResolver';

/**
 * Minimal `outdoor` platform entry mirroring the default Platforms seed
 * (`platform-config.ts`): the `outdoor-billboard-large` breakpoint is the one
 * `billboard-landscape` maps to (PROFILE_PLATFORM_MAP, plan-01 Task 1).
 */
const OUTDOOR_PLATFORM: PlatformEntry = {
  id: 'outdoor',
  label: 'Outdoor',
  description: 'Outdoor & physical signage',
  isEnabled: true,
  category: 'physical',
  viewingDistance: 1000,
  ppi: 72,
  pixelDensity: 1,
  calculatedBaseSize: 140,
  breakpoints: [
    {
      id: 'outdoor-billboard-large',
      label: 'Billboard (Large)',
      viewportWidth: 1920,
      viewportHeight: 1080,
      units: 'px',
      isActive: true,
    },
  ],
  viewportMin: 320,
  viewportMax: 1920,
  fluidScaling: false,
  densityConfigs: [
    { density: 'default', mobile: { baseSize: 16, scaleFactor: 1.2 }, desktop: { baseSize: 140, scaleFactor: 1.2 } },
  ],
};

/** A brand Platforms foundation that DOES seed the outdoor billboard canvas. */
const PLATFORMS_WITH_OUTDOOR: PlatformsFoundationConfig = {
  platforms: [OUTDOOR_PLATFORM],
  defaultPlatform: 'outdoor',
  defaultDensity: 'default',
};

/** A brand Platforms foundation that LACKS the mapped billboard breakpoint. */
const PLATFORMS_WITHOUT_BILLBOARD: PlatformsFoundationConfig = {
  platforms: [{ ...OUTDOOR_PLATFORM, breakpoints: [] }],
  defaultPlatform: 'outdoor',
  defaultDensity: 'default',
};

/**
 * A configured-brand foundations fixture: a single custom "primary" scale with
 * a real base color, plus an appearance config that anchors `primary`. This is
 * the shape the live platform persists in Convex (`getBrandOverviewData`).
 */
const CONFIGURED_BRAND: BrandFoundations = {
  colorConfig: {
    brandScales: [
      { name: 'primary', source: 'custom', baseColor: '#1A73E8' },
    ],
  },
  presetSelection: null,
  appearanceConfig: {
    accentCount: 1,
    accents: [{ role: 'primary', scaleName: 'primary', baseStep: 1700 }],
  },
};

/**
 * A PARTIAL brand: it configures ONLY the primary accent and supplies NO
 * neutral. The engine's `ensureNeutralRole` injects the built-in neutral, so
 * this still resolves — D-09 says "used a default" is not a gap.
 */
const PARTIAL_BRAND: BrandFoundations = {
  colorConfig: {
    brandScales: [
      { name: 'primary', source: 'custom', baseColor: '#7B1FA2' },
    ],
  },
  presetSelection: null,
  appearanceConfig: {
    accentCount: 1,
    accents: [{ role: 'primary', scaleName: 'primary', baseStep: 1500 }],
  },
};

describe('resolveFoundation (FND-04)', () => {
  it('resolves a configured brand on a covered web profile to a real ThemeConfig (FND-04)', () => {
    const input: FoundationResolveInputT & { brandFoundations: BrandFoundations } = {
      brandId: 'jio-default',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      theme: 'light',
      brandFoundations: CONFIGURED_BRAND,
    };

    const result = resolveFoundation(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.theme).toHaveProperty('appearances');
      expect(typeof result.theme.appearances).toBe('object');
      // The configured primary role is present (real resolution, not a mock).
      const primary = result.theme.appearances.primary;
      expect(primary).toBeDefined();
      expect(typeof primary.baseStep).toBe('number');
      expect(typeof primary.palette).toBe('object');
      expect(Object.keys(primary.palette).length).toBeGreaterThan(0);
    }

    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('resolves a partially-configured brand via system defaults — NOT a gap (D-09)', () => {
    const input: FoundationResolveInputT & { brandFoundations: BrandFoundations } = {
      brandId: 'jio-partial',
      artifactType: 'web-ui',
      outputProfile: 'web-mobile',
      brandFoundations: PARTIAL_BRAND,
    };

    const result = resolveFoundation(input);

    // D-09: a partial brand resolves; the engine fills the neutral default.
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.theme.appearances.primary).toBeDefined();
      // ensureNeutralRole injected the built-in neutral default.
      expect(result.theme.appearances.neutral).toBeDefined();
    }
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('returns a typed gap with NO numeric dimensions for an uncovered/unresolvable profile (FND-03 / Pitfall 6)', () => {
    const input: FoundationResolveInputT = {
      brandId: 'jio-default',
      // Non-web artifact type → coverage: 'assumed' in the output-profile table.
      artifactType: 'social-post',
      outputProfile: 'ig-square',
    };

    const result = resolveFoundation(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.gap.artifactType).toBe('social-post');
      expect(result.gap.outputProfile).toBe('ig-square');
      expect(result.gap.reason.length).toBeGreaterThan(0);

      // The CORE Pitfall-6 assertion: the gap payload must carry NO fabricated
      // dimension fields and NO numeric dimension values anywhere.
      const gapKeys = Object.keys(result.gap);
      expect(gapKeys).not.toContain('dimensions');
      expect(gapKeys).not.toContain('width');
      expect(gapKeys).not.toContain('height');
      expect(gapKeys).not.toContain('aspect');
      for (const value of Object.values(result.gap)) {
        expect(typeof value).not.toBe('number');
      }
    }

    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('resolves a covered NON-WEB profile to foundation dimensions + a Spacing-N safe-area token (FND-02 / CAMP-05)', () => {
    const input = {
      brandId: 'jio-default',
      artifactType: 'outdoor-display' as const,
      outputProfile: 'billboard-landscape' as const,
      brandFoundations: CONFIGURED_BRAND,
      brandPlatforms: PLATFORMS_WITH_OUTDOOR,
    };

    const result = resolveFoundation(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.resolvedDimensions).toBeDefined();
      const dims = result.resolvedDimensions!;
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
      expect(Number.isFinite(dims.width)).toBe(true);
      expect(Number.isFinite(dims.height)).toBe(true);
      expect(dims.units).toBe('px'); // outdoor billboard breakpoint is px
      // CR-01: ppi (for mmToPx) and pixelDensity (for deviceScaleFactor) are
      // carried as DISTINCT foundation values — ppi must be threaded, not dropped.
      expect(dims.ppi).toBe(OUTDOOR_PLATFORM.ppi); // 72, from the platform foundation
      expect(dims.pixelDensity).toBeGreaterThan(0);
      expect(dims.safeAreaInsetToken).toMatch(/^Spacing-/);
    }
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('returns a typed gap (no width/height) for an ig profile whose social canvas the brand has not seeded (D-02)', () => {
    const input = {
      brandId: 'jio-default',
      artifactType: 'social-post' as const,
      outputProfile: 'ig-square' as const,
      brandFoundations: CONFIGURED_BRAND,
      brandPlatforms: PLATFORMS_WITH_OUTDOOR,
    };

    const result = resolveFoundation(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.gap.artifactType).toBe('social-post');
      expect(result.gap.outputProfile).toBe('ig-square');
      const gapKeys = Object.keys(result.gap);
      expect(gapKeys).not.toContain('width');
      expect(gapKeys).not.toContain('height');
      expect(gapKeys).not.toContain('dimensions');
    }
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('returns a typed gap (no numbers) when the mapped breakpoint is absent from the brand foundation (D-02 honest path)', () => {
    const input = {
      brandId: 'jio-default',
      artifactType: 'outdoor-display' as const,
      outputProfile: 'billboard-landscape' as const,
      brandFoundations: CONFIGURED_BRAND,
      brandPlatforms: PLATFORMS_WITHOUT_BILLBOARD,
    };

    const result = resolveFoundation(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.gap.artifactType).toBe('outdoor-display');
      expect(result.gap.outputProfile).toBe('billboard-landscape');
      // The reason mentions the missing canvas.
      expect(result.gap.reason.toLowerCase()).toMatch(/canvas|breakpoint|platforms foundation/);
      for (const value of Object.values(result.gap)) {
        expect(typeof value).not.toBe('number');
      }
    }
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('is deterministic — same input yields an equal result', () => {
    const input: FoundationResolveInputT & { brandFoundations: BrandFoundations } = {
      brandId: 'jio-default',
      artifactType: 'web-ui',
      outputProfile: 'web-mobile',
      brandFoundations: CONFIGURED_BRAND,
    };
    expect(resolveFoundation(input)).toEqual(resolveFoundation(input));
  });
});
