import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const uiSrc = path.join(repoRoot, 'packages/ui/src');

export default defineConfig({
  root: __dirname,
  envDir: repoRoot,
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'STORYBOOK_', 'CONVEX_'],
  plugins: [react() as unknown as PluginOption],
  resolve: {
    alias: {
      '@oneui/tokens': path.join(repoRoot, 'packages/tokens/src'),
      '@oneui/shared': path.join(repoRoot, 'packages/shared/src'),
      '@oneui/shared/engine': path.join(repoRoot, 'packages/shared/src/engine'),
      '@oneui-ui-internals': uiSrc,
    },
  },
  server: {
    port: 3333,
    strictPort: true,
    fs: {
      allow: [repoRoot],
    },
  },
});
