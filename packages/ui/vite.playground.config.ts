/**
 * vite.playground.config.ts
 *
 * Builds a single self-contained ESM bundle of the curated `@oneui/playground`
 * surface for the Sandpack iframe. Differs from the main `vite.config.ts` in
 * three key ways:
 *
 *   1. Single entry → single output file. No `preserveModules`. We want one
 *      `oneui-playground.mjs` we can drop into Sandpack's virtual node_modules.
 *
 *   2. React / ReactDOM are external (Sandpack provides them). Everything
 *      else — @base-ui/react, lucide-react, phosphor-icons, tabler-icons,
 *      hugeicons-react, embla-carousel, @oneui/shared, @oneui/tokens — is
 *      INLINED. The iframe must boot without hitting any external CDN.
 *
 *   3. CSS Modules are emitted to a sibling stylesheet `oneui-playground.css`
 *      that the Sandpack template imports alongside the bundle.
 *
 * Output: `dist/playground/oneui-playground.mjs` + `oneui-playground.css`.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    outDir: 'dist/playground',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/playground/entry.tsx'),
      formats: ['es'],
      fileName: () => 'oneui-playground.mjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        inlineDynamicImports: true,
        assetFileNames: (asset) => {
          if (asset.name && asset.name.endsWith('.css')) return 'oneui-playground.css';
          return '[name][extname]';
        },
      },
    },
  },
});
