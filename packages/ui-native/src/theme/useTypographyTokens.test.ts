/**
 * useTypographyTokens.test.ts
 *
 * Tests for the typography token selector hook. We test the logic by constructing
 * a real `OneUINativeTheme` via `buildNativeTheme` and asserting that the hook's
 * selector functions return the correct values.
 *
 * The hook itself wraps `useMemo` — we test the underlying selection logic
 * directly to avoid needing a React renderer and RN native bridge.
 */

import { describe, it, expect } from 'vitest';
import { buildNativeTheme } from '@oneui/shared/engine';
import {
  mergeTypographyLanguageOptions,
  selectTypographyTokens,
} from './useTypographyTokens';

// ---------------------------------------------------------------------------
// Build a minimal theme to drive assertions
// ---------------------------------------------------------------------------

const colorConfig = {
  brandScales: [
    { name: 'Brand', source: 'custom' as const, baseColor: '#0066cc' },
  ],
};
const appearanceConfig = {
  accentCount: 1,
  background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
  accents: [{ role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 }],
};

const theme = buildNativeTheme({ colorConfig, appearanceConfig }, { theme: 'light' })!;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTypographyTokens — selector logic', () => {
  describe('fixed-weight roles', () => {
    it('returns a NativeTypeStyle for display L', () => {
      const t = selectTypographyTokens(theme, 'display', 'L');
      expect(t.fontSize).toBeGreaterThan(0);
      expect(t.lineHeight).toBeGreaterThan(0);
      expect(typeof t.fontWeight).toBe('number');
      expect(typeof t.fontFamily).toBe('string');
    });

    it('returns a NativeTypeStyle for headline M', () => {
      const t = selectTypographyTokens(theme, 'headline', 'M');
      expect(t.fontSize).toBeGreaterThan(0);
      expect(t.lineHeight).toBeGreaterThan(0);
    });

    it('returns a NativeTypeStyle for title S', () => {
      const t = selectTypographyTokens(theme, 'title', 'S');
      expect(t.fontSize).toBeGreaterThan(0);
      expect(t.lineHeight).toBeGreaterThan(0);
    });

    it('display L has a larger fontSize than display S', () => {
      const l = selectTypographyTokens(theme, 'display', 'L');
      const s = selectTypographyTokens(theme, 'display', 'S');
      expect(l.fontSize).toBeGreaterThan(s.fontSize);
    });

    it('ignores emphasis option for fixed-weight roles (display)', () => {
      const base = selectTypographyTokens(theme, 'display', 'L');
      const withEmphasis = selectTypographyTokens(theme, 'display', 'L', 'high');
      // emphasisWeight is null for display → result must be the same base object
      expect(withEmphasis.fontWeight).toBe(base.fontWeight);
    });
  });

  describe('emphasis-weight roles', () => {
    it('returns medium emphasis fontWeight by default for body M', () => {
      const base = selectTypographyTokens(theme, 'body', 'M');
      const medium = selectTypographyTokens(theme, 'body', 'M', 'medium');
      // Without explicit emphasis, the base uses the medium weight (buildNativeTypography default)
      expect(base.fontWeight).toBe(medium.fontWeight);
    });

    it('overrides fontWeight to high emphasis for body M', () => {
      const high = selectTypographyTokens(theme, 'body', 'M', 'high');
      const low = selectTypographyTokens(theme, 'body', 'M', 'low');
      expect(high.fontWeight).toBeGreaterThan(low.fontWeight);
    });

    it('high emphasis label weight > low emphasis label weight', () => {
      const high = selectTypographyTokens(theme, 'label', 'S', 'high');
      const low = selectTypographyTokens(theme, 'label', 'S', 'low');
      expect(high.fontWeight).toBeGreaterThan(low.fontWeight);
    });

    it('code role respects emphasis weight', () => {
      const high = selectTypographyTokens(theme, 'code', 'M', 'high');
      const low = selectTypographyTokens(theme, 'code', 'M', 'low');
      expect(high.fontWeight).toBeGreaterThan(low.fontWeight);
    });

    it('preserves fontSize and lineHeight when overriding emphasis', () => {
      const base = selectTypographyTokens(theme, 'label', 'S');
      const high = selectTypographyTokens(theme, 'label', 'S', 'high');
      expect(high.fontSize).toBe(base.fontSize);
      expect(high.lineHeight).toBe(base.lineHeight);
      expect(high.fontFamily).toBe(base.fontFamily);
    });
  });

  describe('size selection', () => {
    it('body sizes are ordered: 2XL > XL > L > M > S > XS > 2XS', () => {
      const sizes = ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS'] as const;
      const fontSizes = sizes.map((s) => selectTypographyTokens(theme, 'body', s).fontSize);
      for (let i = 1; i < fontSizes.length; i++) {
        expect(fontSizes[i - 1]).toBeGreaterThanOrEqual(fontSizes[i]);
      }
    });

    it('label sizes include 3XS (smallest)', () => {
      const t = selectTypographyTokens(theme, 'label', '3XS');
      expect(t.fontSize).toBeGreaterThan(0);
    });

    it('unknown size falls back to M then L', () => {
      const fallback = selectTypographyTokens(theme, 'body', 'INVALID_SIZE');
      const m = selectTypographyTokens(theme, 'body', 'M');
      expect(fallback.fontSize).toBe(m.fontSize);
    });
  });

  describe('theme independence', () => {
    it('dark theme typography sizes match light theme (sizes are theme-independent)', () => {
      const darkTheme = buildNativeTheme(
        { colorConfig, appearanceConfig },
        { theme: 'dark' },
      )!;
      const lightBody = selectTypographyTokens(theme, 'body', 'M');
      const darkBody = selectTypographyTokens(darkTheme, 'body', 'M');
      expect(darkBody.fontSize).toBe(lightBody.fontSize);
      expect(darkBody.lineHeight).toBe(lightBody.lineHeight);
    });
  });

  describe('static weight families', () => {
    const staticTheme = buildNativeTheme(
      {
        colorConfig,
        appearanceConfig,
        typographyConfig: {
          staticWeightFamilyPrefix: { primary: 'JioTypeUI', secondary: 'JioTypeUI' },
        },
      },
      { theme: 'light' },
    )!;

    it('resolves label medium to JioTypeUI-Medium with weightViaFontFamily', () => {
      const t = selectTypographyTokens(staticTheme, 'label', 'S', 'medium');
      expect(t.fontFamily).toBe('JioTypeUI-Medium');
      expect(t.fontWeight).toBe(500);
      expect(t.weightViaFontFamily).toBe(true);
    });

    it('resolves label high to JioTypeUI-Bold', () => {
      const t = selectTypographyTokens(staticTheme, 'label', 'S', 'high');
      expect(t.fontFamily).toBe('JioTypeUI-Bold');
      expect(t.fontWeight).toBe(700);
    });

    it('resolves label low to JioTypeUI-Regular', () => {
      const t = selectTypographyTokens(staticTheme, 'label', 'S', 'low');
      expect(t.fontFamily).toBe('JioTypeUI-Regular');
    });

    it('resolves display L (secondary slot, weight 900) to JioTypeUI-Black', () => {
      const t = selectTypographyTokens(staticTheme, 'display', 'L');
      expect(t.fontFamily).toBe('JioTypeUI-Black');
      expect(t.weightViaFontFamily).toBe(true);
    });
  });

  describe('script variants', () => {
    const scriptTheme = buildNativeTheme(
      {
        colorConfig,
        appearanceConfig,
        typographyConfig: {
          scriptSupport: {
            scripts: {
              devanagari: {
                enabled: true,
                readingFontId: 'noto-sans-devanagari',
                lineHeightMode: 'reading',
              },
            },
          },
        },
      },
      { theme: 'light' },
    )!;

    it('applies script font and reading line-height for non-code roles', () => {
      const base = selectTypographyTokens(scriptTheme, 'body', 'M');
      const scripted = selectTypographyTokens(scriptTheme, 'body', 'M', undefined, 'devanagari', 'reading');

      expect(scripted.fontFamily).toBe('Noto Sans Devanagari');
      expect(scripted.lineHeight).toBeGreaterThan(base.lineHeight);
      expect(scripted.fontSize).toBe(base.fontSize);
    });

    it('keeps code role out of script remapping', () => {
      const base = selectTypographyTokens(scriptTheme, 'code', 'M');
      const scripted = selectTypographyTokens(scriptTheme, 'code', 'M', undefined, 'devanagari', 'reading');

      expect(scripted.fontFamily).toBe(base.fontFamily);
      expect(scripted.lineHeight).toBe(base.lineHeight);
    });

    it('mergeTypographyLanguageOptions applies hi context to devanagari reading', () => {
      const { script, scriptMode } = mergeTypographyLanguageOptions(
        {},
        { scriptId: 'devanagari', scriptMode: 'reading' },
      );
      const fromContext = selectTypographyTokens(
        scriptTheme,
        'body',
        'M',
        undefined,
        script,
        scriptMode,
      );
      const explicit = selectTypographyTokens(
        scriptTheme,
        'body',
        'M',
        undefined,
        'devanagari',
        'reading',
      );
      expect(fromContext.fontFamily).toBe(explicit.fontFamily);
      expect(fromContext.lineHeight).toBe(explicit.lineHeight);
    });
  });
});
