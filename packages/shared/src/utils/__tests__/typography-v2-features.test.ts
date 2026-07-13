/**
 * typography-v2-features.test.ts
 *
 * Covers the new V2 typography features — per-font OpenType feature settings
 * (ligatures, contextual alternates), per-role letter-spacing, and the global
 * font rendering block.
 */

import { describe, it, expect } from 'vitest';
import {
  generateTypographyCSSV2,
  generateFontRenderingCSS,
  generateTypographyScriptContextCSS,
  type TypographyConfigV2,
} from '../typography';
import { resolveTypographyScriptSupport } from '../../data/typography-scripts';

describe('generateTypographyCSSV2 — font features', () => {
  it('emits nothing when fontFeatures is undefined', () => {
    const css = generateTypographyCSSV2({});
    expect(css).not.toContain('--Typography-Features-');
  });

  it('emits "liga" 0, "clig" 0 when primary ligatures and contextual alternates are disabled', () => {
    const config: TypographyConfigV2 = {
      fontFeatures: {
        primary: { ligatures: false, contextualAlternates: false },
      },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Typography-Features-Primary: "liga" 0, "clig" 0;');
  });

  it('emits "liga" 1 when only ligatures is set (true) and contextualAlternates omitted', () => {
    const config: TypographyConfigV2 = {
      fontFeatures: {
        secondary: { ligatures: true },
      },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Typography-Features-Secondary: "liga" 1;');
    expect(css).not.toContain('"clig"');
  });

  it('emits per-slot tokens for each configured font slot', () => {
    const config: TypographyConfigV2 = {
      fontFeatures: {
        primary: { ligatures: false },
        code: { ligatures: false, contextualAlternates: true },
      },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Typography-Features-Primary: "liga" 0;');
    expect(css).toContain('--Typography-Features-Code: "liga" 0, "clig" 1;');
    expect(css).not.toContain('--Typography-Features-Secondary');
  });
});

describe('generateTypographyCSSV2 — letter spacing', () => {
  it('emits nothing when letterSpacing is undefined', () => {
    const css = generateTypographyCSSV2({});
    expect(css).not.toContain('LetterSpacing');
  });

  it('skips roles with value 0 (default)', () => {
    const config: TypographyConfigV2 = {
      letterSpacing: { display: 0, body: 0 },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).not.toContain('LetterSpacing');
  });

  it('emits --{Role}-LetterSpacing tokens in em units', () => {
    const config: TypographyConfigV2 = {
      letterSpacing: {
        display: -0.02,
        label: 0.015,
      },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Display-LetterSpacing: -0.02em;');
    expect(css).toContain('--Label-LetterSpacing: 0.015em;');
  });
});

describe('generateTypographyCSSV2 — role font slots', () => {
  it('emits nothing when roleFontSlots is undefined', () => {
    const css = generateTypographyCSSV2({});
    expect(css).not.toContain('-FontFamily');
  });

  it('emits --Body-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary))) when body is set to secondary', () => {
    const config: TypographyConfigV2 = {
      roleFontSlots: { body: 'secondary' },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Body-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary)));');
  });

  it('skips emission for roles assigned to primary (primary is the :root default)', () => {
    const config: TypographyConfigV2 = {
      roleFontSlots: { body: 'primary', label: 'primary' },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).not.toContain('-FontFamily');
  });

  it('emits one declaration per non-code role assigned to secondary', () => {
    const config: TypographyConfigV2 = {
      roleFontSlots: {
        display: 'secondary',
        headline: 'primary',
        body: 'secondary',
        label: 'secondary',
      },
    };
    const css = generateTypographyCSSV2(config);
    expect(css).toContain('--Display-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary)));');
    expect(css).toContain('--Body-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary)));');
    expect(css).toContain('--Label-FontFamily: var(--Typography-Font-Heading, var(--Typography-Font-Display, var(--Typography-Font-Secondary)));');
    expect(css).not.toContain('--Headline-FontFamily');
    expect(css).not.toContain('--Code-FontFamily');
  });
});

describe('generateTypographyCSSV2 — script support', () => {
  it('emits India core script font token fallbacks', () => {
    const css = generateTypographyCSSV2({});

    expect(css).toContain('--Typography-Font-Script-Devanagari-UI: var(--Typography-Font-Script);');
    expect(css).toContain('--Typography-Font-Script-Devanagari-Reading: var(--Typography-Font-Script-Devanagari-UI);');
    expect(css).toContain('--Typography-Font-Script-Arabic-UI: var(--Typography-Font-Script);');
  });

  it('preserves explicit reading font IDs while resolving script support', () => {
    const [devanagari] = resolveTypographyScriptSupport({
      scripts: {
        devanagari: {
          uiFontId: 'noto-sans-devanagari-ui',
          readingFontId: 'noto-sans-devanagari',
        },
      },
    });

    expect(devanagari?.uiFontId).toBe('noto-sans-devanagari-ui');
    expect(devanagari?.readingFontId).toBe('noto-sans-devanagari');
  });

  it('emits script context selectors for data-script and mapped language tags', () => {
    const css = generateTypographyScriptContextCSS({});

    expect(css).toContain('[data-script="devanagari"]');
    expect(css).toContain(':lang(hi)');
    expect(css).toContain('--Body-FontFamily: var(--Typography-Font-Script-Devanagari-UI');
    expect(css).not.toContain('--Code-FontFamily');
  });

  it('remaps non-code line-height tokens when a script profile requires it', () => {
    const css = generateTypographyScriptContextCSS({
      scriptSupport: {
        scripts: {
          devanagari: {
            enabled: true,
            lineHeightMode: 'reading',
          },
        },
      },
    });

    expect(css).toContain('--Body-M-LineHeight: var(--Dimension-f4);');
    expect(css).toContain('--Title-M-LineHeight: var(--Dimension-f2);');
    expect(css).not.toContain('--Code-M-LineHeight');
  });

  it('resolves custom script rows into script tokens and context selectors', () => {
    const config: TypographyConfigV2 = {
      scriptSupport: {
        preset: 'custom',
        scripts: {
          'custom-brahmi': {
            label: 'Custom Brahmi',
            cssName: 'CustomBrahmi',
            enabled: true,
            uiFontId: 'noto-sans',
            readingFontId: 'noto-sans',
            langTags: ['brah'],
          },
        },
      },
    };

    expect(generateTypographyCSSV2(config)).toContain('--Typography-Font-Script-CustomBrahmi-UI');
    const contextCSS = generateTypographyScriptContextCSS(config);
    expect(contextCSS).toContain('[data-script="custom-brahmi"]');
    expect(contextCSS).toContain(':lang(brah)');
  });
});

describe('generateFontRenderingCSS — global html block', () => {
  it('returns empty string when no rendering config is set', () => {
    expect(generateFontRenderingCSS({})).toBe('');
  });

  it('emits a complete html block with only the declarations that are set', () => {
    const css = generateFontRenderingCSS({
      rendering: {
        textRendering: 'optimizeLegibility',
        fontSynthesis: 'none',
      },
    });
    expect(css).toContain('html {');
    expect(css).toContain('text-rendering: optimizeLegibility;');
    expect(css).toContain('font-synthesis: none;');
    expect(css).not.toContain('-webkit-font-smoothing');
  });

  it('pairs -webkit-font-smoothing: antialiased with -moz-osx-font-smoothing: grayscale', () => {
    const css = generateFontRenderingCSS({
      rendering: { webkitFontSmoothing: 'antialiased' },
    });
    expect(css).toContain('-webkit-font-smoothing: antialiased;');
    expect(css).toContain('-moz-osx-font-smoothing: grayscale;');
  });

  it('reinforces font-variant-ligatures: no-common-ligatures when primary ligatures are disabled', () => {
    const css = generateFontRenderingCSS({
      fontFeatures: { primary: { ligatures: false } },
      rendering: { textRendering: 'optimizeLegibility' },
    });
    expect(css).toContain('font-variant-ligatures: no-common-ligatures;');
  });

  it('does not emit font-variant-ligatures when primary ligatures are enabled', () => {
    const css = generateFontRenderingCSS({
      fontFeatures: { primary: { ligatures: true } },
      rendering: { textRendering: 'optimizeLegibility' },
    });
    expect(css).not.toContain('font-variant-ligatures');
  });

  it('returns empty string when only fontFeatures is set but rendering is empty and primary ligatures are on', () => {
    // Purely a feature config — no rendering overrides — should produce no html block.
    expect(
      generateFontRenderingCSS({
        fontFeatures: { code: { ligatures: false } },
      }),
    ).toBe('');
  });
});
