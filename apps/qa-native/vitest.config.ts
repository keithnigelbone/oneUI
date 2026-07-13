import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Component tests live in @oneui/ui-native; run them from here.
    include: ['../../packages/ui-native/src/**/*.test.{ts,tsx}'],
    // Alias map for Vite's ESM pipeline.
    // react-native → plain CJS mock (avoids Flow 'import typeof' syntax in the real source).
    // react / react/jsx-(dev-)runtime → the single root react@19.1.0, which both the
    // component code and react-test-renderer resolve to (deduped). Pointing every
    // import at one instance prevents "Invalid hook call".
    alias: {
      'react-native': resolve(__dirname, './__mocks__/react-native.js'),
      'react': resolve(__dirname, '../../node_modules/react'),
      'react/jsx-runtime': resolve(__dirname, '../../node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(__dirname, '../../node_modules/react/jsx-dev-runtime.js'),
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/native-all.json',
    },
  },
  resolve: {
    conditions: ['react-native', 'require', 'default'],
    // Deduplicate React so Vite only resolves one instance across all packages.
    dedupe: ['react', 'react-test-renderer'],
  },
});
