import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

function oneuiBrandsStub(): Plugin {
  const VIRTUAL = 'virtual:oneui-brands';
  const BRAND_LOADER = '@oneui/ui/brand-loader';
  const RESOLVED = '\0' + VIRTUAL;
  const BRAND_PREFIX = 'virtual:oneui-brand/';
  const stubIndex = [
    'export const brands = {};',
    'export const themes = {};',
    'export const manifest = {};',
    'export const themeManifest = {};',
    'export const availableBrands = [];',
    'export const availableThemes = [];',
  ].join('\n');
  return {
    name: 'oneui-brands-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL || id === BRAND_LOADER) return RESOLVED;
      if (id.startsWith(BRAND_PREFIX)) return '\0' + id;
      return undefined;
    },
    load(id) {
      if (id === RESOLVED) {
        return stubIndex;
      }
      if (id.startsWith('\0' + BRAND_PREFIX)) {
        return [
          "export default '';",
          'export const decorations = [];',
          'export const themeConfig = null;',
          'export const materialsFoundation = null;',
          'export const branding = {};',
          'export const fontsFoundation = null;',
        ].join('\n');
      }
      return undefined;
    },
  };
}

export default defineConfig({
  plugins: [react(), oneuiBrandsStub()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Exercise the WIP transparent-material path in unit tests; the public
    // build leaves this unset (→ coerces to solid). See src/featureFlags.ts.
    env: {
      ONEUI_EXPERIMENTAL_MATERIAL_TRANSPARENT: 'true',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
