import { describe, expect, it } from 'vitest';
import {
  generateGoogleFontImports,
  generateTypographyFontCSSV2,
} from './foundationCSS';

describe('foundationCSS script typography', () => {
  it('loads one enabled script font through Google CSS2 imports', () => {
    const imports = generateGoogleFontImports({
      typographyV2: {
        scriptSupport: {
          scripts: {
            devanagari: {
              enabled: true,
              uiFontId: 'noto-sans-devanagari-ui',
              readingFontId: 'noto-sans-devanagari',
            },
            bengali: {
              enabled: false,
            },
          },
        },
      },
    });

    expect(imports).toContain('family=Noto+Sans+Devanagari+UI');
    expect(imports).toContain('family=Noto+Sans+Devanagari:');
    expect(imports).not.toContain('family=Noto+Sans+Bengali+UI');
  });

  it('emits concrete script font-family tokens for enabled scripts', () => {
    const css = generateTypographyFontCSSV2({
      typographyV2: {
        scriptSupport: {
          scripts: {
            devanagari: {
              enabled: true,
              uiFontId: 'noto-sans-devanagari-ui',
              readingFontId: 'noto-sans-devanagari',
            },
          },
        },
      },
    });

    expect(css).toContain('--Typography-Font-Script-Devanagari-UI:');
    expect(css).toContain('Noto Sans Devanagari UI');
    expect(css).toContain('--Typography-Font-Script-Devanagari-Reading:');
    expect(css).toContain('Noto Sans Devanagari');
  });
});
