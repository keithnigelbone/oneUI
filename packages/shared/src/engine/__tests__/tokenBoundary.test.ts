import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterBrandDeclarations, BRAND_ALLOWED_PREFIXES } from '../tokenBoundary';

describe('BRAND_ALLOWED_PREFIXES', () => {
  it('contains expected surface prefix', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Surface-');
  });

  it('contains expected text prefix', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Text-');
  });

  it('contains all 9 appearance role prefixes', () => {
    const roleNames = [
      '--Primary-', '--Secondary-',
      '--Neutral-', '--Sparkle-', '--Brand-Bg-',
      '--Positive-', '--Negative-', '--Warning-', '--Informative-',
    ];
    for (const role of roleNames) {
      expect(BRAND_ALLOWED_PREFIXES).toContain(role);
    }
  });

  it('contains typography prefixes', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Typography-Font-');
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Typography-Weight-');
  });

  it('contains border prefix', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Border-');
  });

  it('contains motion prefixes (duration, offset, easing)', () => {
    // Motion is brand-overridable since the Jio motion foundation system (2026-04-03)
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Motion-Duration-');
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Motion-Offset-');
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Motion-Easing-');
  });

  it('contains material prefix for brand-configurable material tokens', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Material-');
  });

  it('has exactly 33 prefix families', () => {
    expect(BRAND_ALLOWED_PREFIXES).toHaveLength(33);
  });

  it('contains --Elevation- family for brand-configurable shadow levels', () => {
    // Elevation is brand-overridable since the elevation pipeline fix (2026-06) —
    // the foundation editor's baseOpacity/darkModeMultiplier now emit
    // --Elevation-0..5 overrides via generateElevationCSS.
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Elevation-');
  });

  it('contains --Logo- family for brand logo color override', () => {
    expect(BRAND_ALLOWED_PREFIXES).toContain('--Logo-');
  });

  it('does NOT contain structural token prefixes', () => {
    // Motion and Elevation are intentionally NOT in this list — brands now
    // inject their own Motion-* and Elevation-* overrides. Shape/Spacing/
    // Dimension stay protected: their values are density/platform responsive
    // and raw per-brand overrides would break layout integrity.
    const forbidden = ['--Shape-', '--Spacing-', '--Dimension-'];
    for (const prefix of forbidden) {
      expect(BRAND_ALLOWED_PREFIXES).not.toContain(prefix);
    }
  });
});

describe('filterBrandDeclarations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows Surface declarations', () => {
    const declarations = ['--Surface-Bold: #333;', '--Surface-Default: #fff;'];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('allows Text declarations', () => {
    const declarations = ['--Text-High: #111;', '--Text-OnBold-High: #fff;'];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('allows appearance role declarations', () => {
    const declarations = [
      '--Primary-FG-Bold: #ff5500;',
      '--Secondary-Default: #0066cc;',
      '--Neutral-BG-Subtle: #f5f5f5;',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('allows typography declarations', () => {
    const declarations = [
      '--Typography-Font-Family: Inter, sans-serif;',
      '--Typography-Weight-Bold: 700;',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('allows Material declarations', () => {
    const declarations = [
      '--Material-Metallic-Gold-Fill: linear-gradient(135deg, #111111 0%, #ffffff 100%);',
      '--Material-Metallic-Gold-StrokeColor: #111111;',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('allows per-role FontFamily declarations', () => {
    // Role-scoped --{Role}-FontFamily tokens for the per-role font slot feature
    // are covered by the existing --Display-/--Headline-/--Title-/--Body-/--Label-
    // prefixes in the token manifest.
    const declarations = [
      '--Display-FontFamily: var(--Typography-Font-Secondary);',
      '--Headline-FontFamily: var(--Typography-Font-Secondary);',
      '--Title-FontFamily: var(--Typography-Font-Secondary);',
      '--Body-FontFamily: var(--Typography-Font-Secondary);',
      '--Label-FontFamily: var(--Typography-Font-Secondary);',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('drops Shape tokens', () => {
    const declarations = [
      '--Surface-Bold: #333;',
      '--Shape-4: 8px;',
    ];
    const result = filterBrandDeclarations(declarations);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('--Surface-Bold');
  });

  it('drops Spacing tokens', () => {
    const declarations = [
      '--Surface-Bold: #333;',
      '--Spacing-4: 16px;',
    ];
    const result = filterBrandDeclarations(declarations);
    expect(result).toHaveLength(1);
  });

  it('drops Dimension tokens', () => {
    const declarations = [
      '--Text-High: #111;',
      '--Dimension-f0: 16px;',
    ];
    const result = filterBrandDeclarations(declarations);
    expect(result).toHaveLength(1);
  });

  it('passes through comments', () => {
    const declarations = [
      '/* Surface tokens */',
      '--Surface-Bold: #333;',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('passes through empty lines', () => {
    const declarations = [
      '--Surface-Bold: #333;',
      '',
      '--Text-High: #111;',
    ];
    expect(filterBrandDeclarations(declarations)).toEqual(declarations);
  });

  it('returns empty array for empty input', () => {
    expect(filterBrandDeclarations([])).toEqual([]);
  });

  it('warns in development when declarations are dropped', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    filterBrandDeclarations(['--Shape-4: 8px;']);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('[tokenBoundary]');

    process.env.NODE_ENV = originalEnv;
    warnSpy.mockRestore();
  });
});
