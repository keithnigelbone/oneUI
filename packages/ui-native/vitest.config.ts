import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Resolve .native.tsx before .tsx so RN-specific files are picked up
    alias: {
      'react-native': new URL(
        '../../node_modules/react-native/index.js',
        import.meta.url,
      ).pathname,
    },
  },
  resolve: {
    conditions: ['react-native', 'require', 'default'],
  },
});
