import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, type PluginOption } from 'vite';

import { notionBugsApiPlugin } from './scripts/lib/notionBugsApiPlugin';
import { qaComponentRunPlugin } from './scripts/lib/qaComponentRunPlugin';
import { qaReportAutoIngestPlugin } from './scripts/lib/qaReportAutoIngestPlugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const uiSrc = path.join(repoRoot, 'packages/ui/src');
const port = Number(process.env.PORT) || 5180;

/**
 * Stub plugin that satisfies Vite's import-analysis for `virtual:oneui-brands`.
 *
 * BrandProvider.tsx does `import('virtual:oneui-brands')` — even with
 * `@vite-ignore`, Vite resolves static-string dynamic imports at startup and
 * throws if nothing handles the ID. The real `@oneui/vite-plugin` ships TypeScript
 * source as its entry point, which Node's ESM loader can't execute during Vite
 * config loading (before esbuild kicks in for the app bundle).
 *
 * This stub registers the virtual module ID with empty content. The QA
 * playground uses QaBrandFoundationRoot — not BrandProvider — for its tokens,
 * so empty brand CSS is intentional here.
 */
function oneuiBrandsStub(): Plugin {
  const VIRTUAL = 'virtual:oneui-brands';
  const RESOLVED = '\0' + VIRTUAL;
  const BRAND_PREFIX = 'virtual:oneui-brand/';
  return {
    name: 'oneui-brands-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED;
      if (id.startsWith(BRAND_PREFIX)) return '\0' + id;
      return undefined;
    },
    load(id) {
      if (id === RESOLVED) {
        return [
          '// stub — QA playground uses QaBrandFoundationRoot, not BrandProvider',
          'export const brands = {};',
          'export const manifest = {};',
          'export const availableBrands = [];',
        ].join('\n');
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
  root: __dirname,
  envDir: repoRoot,
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'STORYBOOK_', 'CONVEX_'],
  plugins: [
    react() as unknown as PluginOption,
    oneuiBrandsStub(),
    qaReportAutoIngestPlugin(__dirname),
    qaComponentRunPlugin(__dirname),
    notionBugsApiPlugin(__dirname),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@oneui/icons-tira': path.join(repoRoot, 'packages/icons-tira/src/index.ts'),
      '@oneui/shared': path.join(repoRoot, 'packages/shared/src'),
      '@oneui/shared/engine': path.join(repoRoot, 'packages/shared/src/engine'),
      '@oneui-ui-internals': uiSrc,
    },
    // Single @base-ui/react instance — must match @oneui/ui (LabelableContext / Field.Label htmlFor).
    dedupe: ['react', 'react-dom', '@base-ui/react'],
  },
  server: {
    port,
    strictPort: false,
    fs: {
      allow: [repoRoot],
    },
  },
});
