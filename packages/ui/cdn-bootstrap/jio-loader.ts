/**
 * Normalizes baked `cdn-bootstrap/jio.ts` exports to the CDN brand-module shape
 * (`generateBrandModuleSource`) that BrandProvider expects.
 */
import css, {
  jioThemeConfig,
  jioBranding,
  jioMaterials,
  jioFonts,
  jioDecorations,
} from './jio';

export default css;
export const themeConfig = jioThemeConfig;
export const decorations = jioDecorations;
export const materialsFoundation = jioMaterials;
export const branding = jioBranding;
export const fontsFoundation = jioFonts;
