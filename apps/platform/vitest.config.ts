import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Mirror the tsconfig path "@oneui/ui-internal/*" → packages/ui/src/* so
      // component tests that import internal UI primitives resolve under vitest.
      '@oneui/ui-internal': path.resolve(__dirname, '../../packages/ui/src'),
      '@oneui/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@oneui/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@oneui/tokens': path.resolve(__dirname, '../../packages/tokens/src'),
      '@oneui/convex': path.resolve(__dirname, '../../packages/convex/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
