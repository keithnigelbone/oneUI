/**
 * foundationToNativeTheme.test.ts
 *
 * Unit tests for the Convex payload → BuildNativeThemeInput adapter.
 *
 * Strategy: mock `@oneui/ui-native` completely so that the function
 * under test runs its guard/mapping logic without touching the native
 * UI package's transitive React Native dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @oneui/ui-native before any imports that pull it in.
// Use vi.hoisted so the variable is available inside the hoisted vi.mock factory.
// ---------------------------------------------------------------------------

const { mockBuildNativeTheme } = vi.hoisted(() => ({
  // Typed signature so `mock.calls[0]` is inferred as `[input, ctx]` rather
  // than `[]` — otherwise downstream destructuring trips TS2493 / TS18048.
  mockBuildNativeTheme: vi.fn(
    (_input: Record<string, unknown>, _ctx: { theme: 'light' | 'dark' }) =>
      ({ mock: 'theme' }) as unknown,
  ),
}));

vi.mock('@oneui/shared/engine', async (importOriginal) => {
  const original = await importOriginal<typeof import('@oneui/shared/engine')>();
  return { ...original, buildNativeTheme: mockBuildNativeTheme };
});

// Now we can safely import the module under test
import { foundationToNativeTheme } from '@oneui/ui-native';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const colorConfig = {
  brandScales: [
    { name: 'Brand', source: 'custom', baseColor: '#0066cc' },
  ],
};

const validFoundationData = {
  color: { config: colorConfig },
  appearanceConfig: {
    accentCount: 1,
    background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
    accents: [{ role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 }],
  },
  typography: { config: { fontSelection: { textFontId: null } } },
  customFonts: [
    { _id: 'font1', familyName: 'JioType', fileUrl: 'https://example.com/font.woff2' },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('foundationToNativeTheme', () => {
  beforeEach(() => {
    mockBuildNativeTheme.mockClear();
    mockBuildNativeTheme.mockReturnValue({ mock: 'theme' });
  });

  describe('null / missing data guards', () => {
    it('returns null for null foundationData', () => {
      expect(foundationToNativeTheme(null, 'light')).toBeNull();
    });

    it('returns null for undefined foundationData', () => {
      expect(foundationToNativeTheme(undefined, 'light')).toBeNull();
    });

    it('returns null for a non-object primitive (number)', () => {
      expect(foundationToNativeTheme(42, 'light')).toBeNull();
    });

    it('returns null for a non-object primitive (string)', () => {
      expect(foundationToNativeTheme('string', 'light')).toBeNull();
    });

    it('returns null for a non-object primitive (boolean)', () => {
      expect(foundationToNativeTheme(true, 'light')).toBeNull();
    });

    it('returns null when color is null', () => {
      expect(foundationToNativeTheme({ color: null }, 'light')).toBeNull();
    });

    it('returns null when color is present but config is absent', () => {
      expect(foundationToNativeTheme({ color: {} }, 'light')).toBeNull();
    });

    it('returns null when color.config is explicitly null', () => {
      expect(foundationToNativeTheme({ color: { config: null } }, 'light')).toBeNull();
    });

    it('does not call buildNativeTheme when returning null', () => {
      foundationToNativeTheme(null, 'light');
      expect(mockBuildNativeTheme).not.toHaveBeenCalled();
    });
  });

  describe('forwarding to buildNativeTheme', () => {
    it('calls buildNativeTheme when colorConfig is present', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      expect(mockBuildNativeTheme).toHaveBeenCalledOnce();
    });

    it('passes colorConfig as fd.color.config', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.colorConfig).toBe(colorConfig);
    });

    it('passes appearanceConfig directly (no .config wrapper)', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.appearanceConfig).toBe(validFoundationData.appearanceConfig);
    });

    it('passes typographyConfig as fd.typography.config', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.typographyConfig).toBe(validFoundationData.typography.config);
    });

    it('passes customFonts array', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.customFonts).toEqual(validFoundationData.customFonts);
    });

    it('defaults customFonts to [] when absent', () => {
      foundationToNativeTheme({ color: { config: colorConfig } }, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.customFonts).toEqual([]);
    });

    it('defaults typographyConfig to null when typography is absent', () => {
      foundationToNativeTheme({ color: { config: colorConfig } }, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.typographyConfig).toBeNull();
    });

    it('defaults appearanceConfig to null when absent', () => {
      foundationToNativeTheme({ color: { config: colorConfig } }, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.appearanceConfig).toBeNull();
    });

    it('passes the theme context correctly for light', () => {
      foundationToNativeTheme(validFoundationData, 'light');
      const [, ctx] = mockBuildNativeTheme.mock.calls[0];
      expect(ctx.theme).toBe('light');
    });

    it('passes the theme context correctly for dark', () => {
      foundationToNativeTheme(validFoundationData, 'dark');
      const [, ctx] = mockBuildNativeTheme.mock.calls[0];
      expect(ctx.theme).toBe('dark');
    });

    it('returns the result from buildNativeTheme', () => {
      const result = foundationToNativeTheme(validFoundationData, 'light');
      expect(result).toEqual({ mock: 'theme' });
    });

    it('forwards presetSelection when present', () => {
      const data = {
        ...validFoundationData,
        presetSelection: { preset: 'ocean' },
      };
      foundationToNativeTheme(data, 'light');
      const [input] = mockBuildNativeTheme.mock.calls[0];
      expect(input.presetSelection).toEqual({ preset: 'ocean' });
    });
  });
});
