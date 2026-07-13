import { describe, it, expect } from 'vitest';
import {
  buildNativeTheme,
  resolveNativeContextRoles,
  validateNativeTheme,
} from '../buildNativeTheme';
import { JIO_MOTION_EASINGS } from '../../utils/motion';

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

describe('buildNativeTheme', () => {
  it('falls back to a neutral-only theme when no brand colorConfig is supplied', () => {
    // buildAvailableScales auto-injects the built-in Neutral scale, and
    // buildThemeConfig auto-injects the neutral role — so even an empty
    // brand still produces a renderable theme.
    const theme = buildNativeTheme({ colorConfig: null }, { theme: 'light' });
    expect(theme).not.toBeNull();
    expect(theme!.meta.configuredRoles).toEqual(['neutral']);
  });

  it('produces a theme with primary + neutral roles for a minimal brand', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    );

    expect(theme).not.toBeNull();
    expect(theme!.meta.theme).toBe('light');
    expect(theme!.meta.density).toBe('default');
    expect(theme!.meta.platform).toBe('mobile');
    expect(theme!.meta.brandHash).toMatch(/.+:light/);
    expect(theme!.meta.configuredRoles).toContain('primary');
    expect(theme!.meta.configuredRoles).toContain('neutral');
    expect(theme!.darkMode).toBe(false);
    expect(theme!.rootParentStep).toBe(2500);
  });

  it('flattens role tokens to hex strings on every surface/content/state slot', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const primary = theme.rootRoles.primary;

    // 8 surface fills
    for (const key of [
      'default',
      'ghost',
      'minimal',
      'subtle',
      'moderate',
      'bold',
      'elevated',
      'blend',
    ] as const) {
      expect(primary.surfaces[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }

    // 7 content tokens — must use blendedHex (composited against parent)
    for (const key of [
      'high',
      'medium',
      'low',
      'tinted',
      'tintedA11y',
      'strokeMedium',
      'strokeLow',
    ] as const) {
      expect(primary.content[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(primary.onBoldContent[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(primary.onSubtleContent[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }

    // 6 state tokens
    for (const key of [
      'hover',
      'pressed',
      'boldHover',
      'boldPressed',
      'subtleHover',
      'subtlePressed',
    ] as const) {
      expect(primary.states[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(primary.stateLayers[key]).toMatch(/^(rgba\([^)]+\)|#[0-9a-fA-F]{6}|transparent)$/);
    }
  });

  it('flips rootParentStep to 200 in dark mode', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'dark' },
    )!;
    expect(theme.darkMode).toBe(true);
    expect(theme.rootParentStep).toBe(200);
  });

  it('produces a stable brandHash for identical inputs', () => {
    const a = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const b = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    expect(a.meta.brandHash).toBe(b.meta.brandHash);
  });

  it('produces a different brandHash when theme changes', () => {
    const light = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const dark = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'dark' },
    )!;
    expect(light.meta.brandHash).not.toBe(dark.meta.brandHash);
  });

  it('exposes themeConfig for runtime Surface context resolution', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    expect(theme.themeConfig.appearances.primary).toBeDefined();
    expect(theme.themeConfig.appearances.neutral).toBeDefined();
  });

  it('attaches resolved motion and elevation (Jio defaults when omitted)', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    expect(theme.motion.duration.moderate.l).toBe(300);
    expect(theme.elevation.byLevel[0]).toBeDefined();
    expect(theme.elevation.levels).toContain(0);
  });

  it('changes brandHash when motion baseDuration changes', () => {
    const base = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const custom = buildNativeTheme(
      {
        colorConfig,
        appearanceConfig,
        motionConfig: { baseDuration: 400, easings: JIO_MOTION_EASINGS },
      },
      { theme: 'light' },
    )!;
    expect(custom.meta.brandHash).not.toBe(base.meta.brandHash);
    expect(custom.motion.duration.moderate.l).toBe(400);
  });
});

describe('resolveNativeContextRoles', () => {
  it('resolves role tokens against a non-root parent step', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;

    // Surface mode "bold" anchors child resolution to the bold step (~600).
    const contextRoles = resolveNativeContextRoles(theme.themeConfig, 600, false);
    expect(contextRoles.primary.surfaces.default).toMatch(/^#[0-9a-fA-F]{6}$/);

    // The same token at root should differ from inside a bold context.
    const rootBoldDefault = theme.rootRoles.primary.surfaces.default;
    const contextBoldDefault = contextRoles.primary.surfaces.default;
    // 'default' is hardcoded to step 2500 light regardless of parent — the
    // values should match for default. Try a context-sensitive token instead.
    expect(rootBoldDefault).toBe(contextBoldDefault);

    const rootMinimal = theme.rootRoles.primary.surfaces.minimal;
    const contextMinimal = contextRoles.primary.surfaces.minimal;
    expect(rootMinimal).not.toBe(contextMinimal);
  });
});

describe('validateNativeTheme', () => {
  it('passes for a theme with only known appearance roles', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const result = validateNativeTheme(theme);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('reports unknown roles injected into configuredRoles', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;

    const tampered: typeof theme = {
      ...theme,
      meta: {
        ...theme.meta,
        configuredRoles: [...theme.meta.configuredRoles, 'superAdmin', 'brandX'],
      },
    };

    const result = validateNativeTheme(tampered);
    expect(result.valid).toBe(false);
    expect(result.violations).toContain('superAdmin');
    expect(result.violations).toContain('brandX');
    expect(result.violations).not.toContain('primary');
    expect(result.violations).not.toContain('neutral');
  });

  it('treats casing as significant — `Primary` is not the same as `primary`', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const tampered = {
      ...theme,
      meta: { ...theme.meta, configuredRoles: ['Primary'] },
    };
    const result = validateNativeTheme(tampered);
    expect(result.valid).toBe(false);
    expect(result.violations).toContain('Primary');
  });

  it('returns valid:true for every canonical role individually', () => {
    const theme = buildNativeTheme(
      { colorConfig, appearanceConfig },
      { theme: 'light' },
    )!;
    const allKnown = [
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'brand-bg',
      'positive',
      'negative',
      'warning',
      'informative',
    ];
    for (const role of allKnown) {
      const single = { ...theme, meta: { ...theme.meta, configuredRoles: [role] } };
      const result = validateNativeTheme(single);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    }
  });
});
