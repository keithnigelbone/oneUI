import { defineConfig } from 'vitest/config';
import path from 'path';

const root = new URL('../../', import.meta.url).pathname;

export default defineConfig({
  test: {
    globals: true,
    // jsdom provides the DOM environment needed by @testing-library/react's renderHook
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      // Ensure all packages use the same React instance to avoid
      // "invalid hook call" errors when multiple React copies are in the tree.
      react: path.resolve(root, 'node_modules/react'),
      'react-dom': path.resolve(root, 'node_modules/react-dom'),
    },
  },
});
