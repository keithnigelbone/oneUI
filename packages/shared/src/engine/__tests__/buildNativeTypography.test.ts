import { describe, it, expect } from 'vitest';
import {
  buildNativeTypography,
  type NativeTypography,
  type NativeTypographyConfig,
} from '../buildNativeTypography';
import {
  TYPOGRAPHY_SIZES,
  DEFAULT_FSTEP_ASSIGNMENTS,
} from '../../data/typography-roles';
import { DEFAULT_FONT_FAMILIES } from '../../data/typography-roles';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPositiveNumber(v: unknown): v is number {
  return typeof v === 'number' && v > 0;
}

const VALID_FONT_WEIGHTS = new Set([100, 200, 300, 400, 500, 600, 700, 800, 900]);

function assertTypeStyle(style: unknown, label: string) {
  const s = style as Record<string, unknown>;
  expect(isPositiveNumber(s.fontSize), `${label}.fontSize should be positive`).toBe(true);
  expect(isPositiveNumber(s.lineHeight), `${label}.lineHeight should be positive`).toBe(true);
  // React Native accepts numeric font weights including non-standard values like 750, 850
  expect(typeof s.fontWeight === 'number' && s.fontWeight >= 100 && s.fontWeight <= 900,
    `${label}.fontWeight should be a number 100–900`).toBe(true);
  expect(typeof s.fontFamily, `${label}.fontFamily should be string`).toBe('string');
  expect((s.fontFamily as string).length, `${label}.fontFamily should be non-empty`).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// Default (Jio) config snapshot behaviour
// ---------------------------------------------------------------------------

describe('buildNativeTypography — default config', () => {
  let typography: NativeTypography;

  it('builds without throwing for null config', () => {
    expect(() => {
      typography = buildNativeTypography({ config: null });
    }).not.toThrow();
  });

  it('returns all 6 roles', () => {
    const t = buildNativeTypography({ config: null });
    expect(t).toHaveProperty('display');
    expect(t).toHaveProperty('headline');
    expect(t).toHaveProperty('title');
    expect(t).toHaveProperty('body');
    expect(t).toHaveProperty('label');
    expect(t).toHaveProperty('code');
  });

  it('resolves display sizes L, M, S', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.display) {
      assertTypeStyle(t.display.sizes[size], `display.${size}`);
    }
  });

  it('resolves headline sizes L, M, S', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.headline) {
      assertTypeStyle(t.headline.sizes[size], `headline.${size}`);
    }
  });

  it('resolves title sizes L, M, S', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.title) {
      assertTypeStyle(t.title.sizes[size], `title.${size}`);
    }
  });

  it('resolves all 7 body sizes', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.body) {
      assertTypeStyle(t.body.sizes[size], `body.${size}`);
    }
  });

  it('resolves all 8 label sizes', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.label) {
      assertTypeStyle(t.label.sizes[size], `label.${size}`);
    }
  });

  it('resolves all 3 code sizes', () => {
    const t = buildNativeTypography({ config: null });
    for (const size of TYPOGRAPHY_SIZES.code) {
      assertTypeStyle(t.code.sizes[size], `code.${size}`);
    }
  });

  it('exposes high/medium/low emphasis weights for body', () => {
    const t = buildNativeTypography({ config: null });
    expect(VALID_FONT_WEIGHTS.has(t.body.weights.high)).toBe(true);
    expect(VALID_FONT_WEIGHTS.has(t.body.weights.medium)).toBe(true);
    expect(VALID_FONT_WEIGHTS.has(t.body.weights.low)).toBe(true);
    // High > medium > low
    expect(t.body.weights.high).toBeGreaterThanOrEqual(t.body.weights.medium);
    expect(t.body.weights.medium).toBeGreaterThanOrEqual(t.body.weights.low);
  });

  it('exposes high/medium/low emphasis weights for label', () => {
    const t = buildNativeTypography({ config: null });
    expect(VALID_FONT_WEIGHTS.has(t.label.weights.high)).toBe(true);
    expect(VALID_FONT_WEIGHTS.has(t.label.weights.medium)).toBe(true);
    expect(VALID_FONT_WEIGHTS.has(t.label.weights.low)).toBe(true);
  });

  it('fontFamilies has primary, secondary, script, code slots', () => {
    const t = buildNativeTypography({ config: null });
    expect(typeof t.fontFamilies.primary).toBe('string');
    expect(typeof t.fontFamilies.secondary).toBe('string');
    expect(typeof t.fontFamilies.script).toBe('string');
    expect(typeof t.fontFamilies.code).toBe('string');
    expect(typeof t.fontFamilies.scripts.devanagari.ui).toBe('string');
  });

  it('fontFamilies.primary equals default primary family when no config', () => {
    const t = buildNativeTypography({ config: null });
    expect(t.fontFamilies.primary).toBe(DEFAULT_FONT_FAMILIES.primary);
    expect(t.fontFamilies.script).toBe(DEFAULT_FONT_FAMILIES.script);
  });

  it('display L fontSize > display M fontSize > display S fontSize', () => {
    const t = buildNativeTypography({ config: null });
    expect(t.display.sizes.L.fontSize).toBeGreaterThan(t.display.sizes.M.fontSize);
    expect(t.display.sizes.M.fontSize).toBeGreaterThan(t.display.sizes.S.fontSize);
  });

  it('body line height is larger than font size (offset = 3 steps)', () => {
    const t = buildNativeTypography({ config: null });
    // body has line-height offset of 3 — lh fstep > font fstep so lh > fontSize
    expect(t.body.sizes.M.lineHeight).toBeGreaterThan(t.body.sizes.M.fontSize);
  });

  it('display line height equals font size (offset = 0 for display)', () => {
    const t = buildNativeTypography({ config: null });
    // display offset = 0 → same fstep → same px value
    expect(t.display.sizes.L.lineHeight).toBe(t.display.sizes.L.fontSize);
  });

  it('customFonts defaults to empty array', () => {
    const t = buildNativeTypography({ config: null });
    expect(t.customFonts).toEqual([]);
  });

  it('passes through customFonts array', () => {
    const custom = [
      { _id: 'id1', familyName: 'JioType', fileUrl: 'https://example.com/font.woff2' },
    ];
    const t = buildNativeTypography({ config: null, customFonts: custom });
    expect(t.customFonts).toEqual(custom);
  });
});

// ---------------------------------------------------------------------------
// Deterministic output (snapshot-style)
// ---------------------------------------------------------------------------

describe('buildNativeTypography — deterministic output', () => {
  it('produces identical results for the same input (pure function)', () => {
    const a = buildNativeTypography({ config: null });
    const b = buildNativeTypography({ config: null });
    // Check a representative sample
    expect(a.body.sizes.M.fontSize).toBe(b.body.sizes.M.fontSize);
    expect(a.label.sizes.S.lineHeight).toBe(b.label.sizes.S.lineHeight);
    expect(a.display.sizes.L.fontWeight).toBe(b.display.sizes.L.fontWeight);
    expect(a.fontFamilies.primary).toBe(b.fontFamilies.primary);
  });

  it('produces different font sizes for different platforms', () => {
    const mobile = buildNativeTypography({ config: null, platform: 'S' });
    const desktop = buildNativeTypography({ config: null, platform: 'L' });
    // Large viewport typically produces larger pixel values
    expect(desktop.display.sizes.L.fontSize).not.toBe(mobile.display.sizes.L.fontSize);
  });
});

// ---------------------------------------------------------------------------
// Config overrides
// ---------------------------------------------------------------------------

describe('buildNativeTypography — config overrides', () => {
  it('respects custom f-step assignment for display L', () => {
    const config: NativeTypographyConfig = {
      displayFSteps: { L: 'f8' }, // one step larger than default f7
    };
    const withOverride = buildNativeTypography({ config });
    const withDefault = buildNativeTypography({ config: null });
    // f8 > f7 → larger fontSize
    expect(withOverride.display.sizes.L.fontSize).toBeGreaterThan(
      withDefault.display.sizes.L.fontSize,
    );
  });

  it('respects custom line height offset', () => {
    const config: NativeTypographyConfig = {
      lineHeightOffsets: { body: 0 }, // reduce body LH offset from default 3 to 0
    };
    const withOverride = buildNativeTypography({ config });
    const withDefault = buildNativeTypography({ config: null });
    // Smaller offset → smaller (or equal) line height
    expect(withOverride.body.sizes.M.lineHeight).toBeLessThanOrEqual(
      withDefault.body.sizes.M.lineHeight,
    );
  });

  it('respects letterSpacing config for a role', () => {
    const config: NativeTypographyConfig = {
      letterSpacing: { label: 0.05 },
    };
    const t = buildNativeTypography({ config });
    // letterSpacing in px = 0.05 * fontSize
    const expected = 0.05 * t.label.sizes.M.fontSize;
    expect(t.label.sizes.M.letterSpacing).toBeCloseTo(expected, 5);
  });

  it('omits letterSpacing when not configured', () => {
    const t = buildNativeTypography({ config: null });
    expect(t.label.sizes.M.letterSpacing).toBeUndefined();
  });

  it('respects Convex-style weight override keys without CSS variable prefix', () => {
    const config: NativeTypographyConfig = {
      weightOverrides: {
        'Body-FontWeight-High': 600,
        'Label-FontWeight-Medium': 450,
        'Code-FontWeight-Low': 300,
        'Title-S-FontWeight': 700,
      },
    };

    const t = buildNativeTypography({ config });

    expect(t.body.weights.high).toBe(600);
    expect(t.label.weights.medium).toBe(450);
    expect(t.code.weights.low).toBe(300);
    expect(t.title.sizes.S.fontWeight).toBe(700);
  });

  it('keeps backwards compatibility with prefixed weight override keys', () => {
    const config: NativeTypographyConfig = {
      weightOverrides: {
        '--Body-FontWeight-Medium': 600,
      },
    };

    const t = buildNativeTypography({ config });

    expect(t.body.weights.medium).toBe(600);
  });

  it('unwraps Convex-style nested typographyV2 config', () => {
    const nested = buildNativeTypography({
      config: {
        typographyV2: {
          bodyFSteps: { M: 'f2' },
        },
      },
    });
    const direct = buildNativeTypography({
      config: {
        bodyFSteps: { M: 'f2' },
      },
    });

    expect(nested.body.sizes.M.fontSize).toBe(direct.body.sizes.M.fontSize);
    expect(nested.body.sizes.M.fontSize).toBeGreaterThan(
      buildNativeTypography({ config: null }).body.sizes.M.fontSize,
    );
  });

  it('bakes static weight cuts into size styles (not brand variable family name)', () => {
    const t = buildNativeTypography({
      config: {
        fontSelection: { textFontId: 'preset:jiotype-var', headingFontId: 'preset:jiotype-var' },
        staticWeightFamilies: {
          primary: {
            400: 'JioType',
            500: 'JioType-Medium',
            700: 'JioType-Bold',
            900: 'JioType-Black',
          },
          secondary: {
            400: 'JioType',
            500: 'JioType-Medium',
            700: 'JioType-Bold',
            800: 'JioType-ExtraBlack',
            900: 'JioType-Black',
          },
        },
      },
    });

    expect(t.fontFamilies.primary).toContain('JioType');
    expect(t.display.sizes.L.fontFamily).toBe('JioType-Black');
    expect(t.display.sizes.L.weightViaFontFamily).toBe(true);
    expect(t.body.sizes.M.fontFamily).toBe('JioType-Medium');
    expect(t.title.sizes.M.fontFamily).toBe('JioType-ExtraBlack');
  });

  it('builds script-aware native typography variants and keeps code exempt', () => {
    const t = buildNativeTypography({
      config: {
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
    });

    expect(t.fontFamilies.scripts.devanagari.ui).toBe('Noto Sans Devanagari UI');
    expect(t.fontFamilies.scripts.devanagari.reading).toBe('Noto Sans Devanagari');
    expect(t.scriptVariants.devanagari.ui.body!.M.fontFamily).toBe('Noto Sans Devanagari UI');
    expect(t.scriptVariants.devanagari.reading.body!.M.fontFamily).toBe('Noto Sans Devanagari');
    expect(t.scriptVariants.devanagari.reading.body!.M.lineHeight).toBeGreaterThan(
      t.body.sizes.M.lineHeight,
    );
    expect(t.scriptVariants.devanagari.ui).not.toHaveProperty('code');
  });
});
