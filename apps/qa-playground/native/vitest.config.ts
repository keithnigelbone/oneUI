import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
    include: ['./tests/**/*.test.{ts,tsx}'],
    // react-native → plain CJS mock (avoids Flow 'import typeof' syntax).
    // react / react/jsx-* → react-test-renderer's own nested react so both
    // the component code and react-test-renderer share ONE React instance —
    // prevents "Invalid hook call". react-test-renderer@19.1.0 ships a nested
    // react@19.1.0 (because apps/qa-native pins react@19.1.0 and pnpm keeps a
    // separate copy). Aliasing to that nested copy keeps versions in sync.
    alias: {
      'react-native': resolve(__dirname, './__mocks__/react-native.cjs'),
      'react': resolve(__dirname, '../../../node_modules/react-test-renderer/node_modules/react'),
      'react/jsx-runtime': resolve(__dirname, '../../../node_modules/react-test-renderer/node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(__dirname, '../../../node_modules/react-test-renderer/node_modules/react/jsx-dev-runtime.js'),
      // @ui-native → packages/ui-native/src — used by all test imports
      '@ui-native': resolve(__dirname, '../../../packages/ui-native/src'),
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/native-all.json',
    },
  },
  resolve: {
    conditions: ['react-native', 'require', 'default'],
    dedupe: ['react', 'react-test-renderer'],
  },
});
