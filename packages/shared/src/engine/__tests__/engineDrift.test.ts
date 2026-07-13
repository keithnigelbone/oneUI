/**
 * Engine drift snapshot test.
 *
 * Locks down the *structural* contract of `MultiRoleTokenSets` — token names,
 * role keys, surface levels — for every consumer (web CSS gen, native theme
 * builder, future Figma tokenator port). Hex values aren't pinned because
 * colour math evolves; the structural contract is what consumers depend on.
 */

import { describe, it, expect } from 'vitest';
import { resolveMultiRoleTokenSets } from '../surfaceNew';
import { buildNativeTheme } from '../buildNativeTheme';

const FIXTURE = {
  colorConfig: {
    brandScales: [
      { name: 'Brand', source: 'custom' as const, baseColor: '#0066cc' },
      { name: 'Accent', source: 'custom' as const, baseColor: '#ff6a00' },
    ],
  },
  appearanceConfig: {
    accentCount: 2,
    background: {
      scaleName: 'Neutral',
      backgroundStep: { light: 2500, dark: 200 },
    },
    accents: [
      { role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 },
      { role: 'secondary', label: 'Secondary', scaleName: 'Accent', baseStep: 1300 },
    ],
  },
};

const SURFACE_KEYS = [
  'blend',
  'bold',
  'default',
  'elevated',
  'ghost',
  'minimal',
  'moderate',
  'subtle',
] as const;

const CONTENT_KEYS = [
  'high',
  'low',
  'medium',
  'strokeLow',
  'strokeMedium',
  'tinted',
  'tintedA11y',
] as const;

const STATE_KEYS = [
  'boldHover',
  'boldPressed',
  'hover',
  'pressed',
  'subtleHover',
  'subtlePressed',
] as const;

const fixtureThemeConfig = () => buildNativeTheme(FIXTURE, { theme: 'light' })!.themeConfig;

describe('engine drift — structural contract', () => {
  it('resolveMultiRoleTokenSets exposes the documented token vocabulary', () => {
    const multiRole = resolveMultiRoleTokenSets(fixtureThemeConfig(), 2500, false);

    // synthesizeBrandBgIfMissing auto-adds `brand-bg` when the appearance
    // config declares a background scale, even if accents don't claim it —
    // that's part of the structural contract.
    expect(Object.keys(multiRole.roles).sort()).toEqual([
      'brand-bg',
      'neutral',
      'primary',
      'secondary',
    ]);

    const primary = multiRole.roles.primary;
    expect(Object.keys(primary.surfaces).sort()).toEqual([...SURFACE_KEYS]);
    expect(Object.keys(primary.content).sort()).toEqual([...CONTENT_KEYS]);
    expect(Object.keys(primary.states).sort()).toEqual([...STATE_KEYS]);
    expect(Object.keys(primary.stateLayers).sort()).toEqual([...STATE_KEYS]);
    expect(Object.keys(primary.onBoldContent).sort()).toEqual([...CONTENT_KEYS]);
    expect(Object.keys(primary.onSubtleContent).sort()).toEqual([...CONTENT_KEYS]);
  });

  it('buildNativeTheme flattens to the same vocabulary, hex values only', () => {
    const primary = buildNativeTheme(FIXTURE, { theme: 'light' })!.rootRoles.primary;
    expect(Object.keys(primary.surfaces).sort()).toEqual([...SURFACE_KEYS]);
    expect(Object.keys(primary.content).sort()).toEqual([...CONTENT_KEYS]);
    expect(Object.keys(primary.states).sort()).toEqual([...STATE_KEYS]);
    expect(Object.keys(primary.stateLayers).sort()).toEqual([...STATE_KEYS]);
  });

  it('default surface is hardcoded to step 2500 light / 200 dark', () => {
    // Dark anchor was 100; spec confirmed 2026-05-07 to match
    // OneUIColourTool reference (step 200).
    const themeConfig = fixtureThemeConfig();
    const light = resolveMultiRoleTokenSets(themeConfig, 2500, false);
    const dark = resolveMultiRoleTokenSets(themeConfig, 200, true);

    expect(light.roles.primary.surfaces.default.step).toBe(2500);
    expect(dark.roles.primary.surfaces.default.step).toBe(200);
  });

  it('elevated always offsets toward lighter, capped at 2500', () => {
    const themeConfig = fixtureThemeConfig();
    const root = resolveMultiRoleTokenSets(themeConfig, 2500, false);
    expect(root.roles.primary.surfaces.elevated.step).toBe(2500);

    const mid = resolveMultiRoleTokenSets(themeConfig, 1300, false);
    expect(mid.roles.primary.surfaces.elevated.step).toBe(1400);
  });

  it('ghost matches the parent step exactly (zero visual change, only context flip)', () => {
    const result = resolveMultiRoleTokenSets(fixtureThemeConfig(), 1700, false);
    expect(result.roles.primary.surfaces.ghost.step).toBe(1700);
  });

  it('minimal/subtle/moderate offsets are 100/200/300 against parent (light context)', () => {
    const result = resolveMultiRoleTokenSets(fixtureThemeConfig(), 2500, false);
    expect(result.roles.primary.surfaces.minimal.step).toBe(2400);
    expect(result.roles.primary.surfaces.subtle.step).toBe(2300);
    expect(result.roles.primary.surfaces.moderate.step).toBe(2200);
  });
});
