import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, type PluginOption } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const uiSrc = path.join(repoRoot, 'packages/ui/src');
const port = Number(process.env.PORT) || 5190;

/**
 * Stub for `virtual:oneui-brands`. `@oneui/ui`'s BrandProvider does a
 * static-string `import('virtual:oneui-brands')`; Vite resolves such imports at
 * startup and throws if nothing handles the ID. We use the live-Convex theming
 * path (useBrandCSS), not BrandProvider, so empty brand CSS is intentional.
 * Mirrors apps/qa-playground/vite.config.ts.
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
          '// stub — tldraw-playground uses live Convex useBrandCSS, not BrandProvider',
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
  plugins: [react() as unknown as PluginOption, oneuiBrandsStub()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@oneui/shared': path.join(repoRoot, 'packages/shared/src'),
      '@oneui/shared/engine': path.join(repoRoot, 'packages/shared/src/engine'),
      '@oneui-ui-internals': uiSrc,
    },
    // Single React / @base-ui instance — must match @oneui/ui (LabelableContext, Field.Label).
    dedupe: ['react', 'react-dom', '@base-ui/react'],
  },
  server: {
    port,
    strictPort: false,
    fs: {
      allow: [repoRoot],
    },
    // Server-side proxy for the Anthropic API so the AI generation isn't a
    // direct browser/CORS call (the org blocks those → 401 "CORS requests are
    // not allowed"). The client uses baseURL '/anthropic' (see lib/ai/agent.ts).
    proxy: {
      '/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/anthropic/, ''),
        configure: (proxy) => {
          // Strip the headers that make Anthropic treat this as a direct
          // browser/CORS request. The SDK adds `anthropic-dangerous-direct-
          // browser-access: true` (because of dangerouslyAllowBrowser), and the
          // browser adds Origin/Referer. Forwarded upstream, these trigger
          // "CORS requests are not allowed for this Organization" when the org
          // has browser access disabled. Removing them here makes the proxied
          // request look server-side, which is the whole point of the proxy.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('anthropic-dangerous-direct-browser-access');
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },
});
