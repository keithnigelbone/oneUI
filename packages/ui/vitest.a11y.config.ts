import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['**/*.a11y.test.ts', '**/*.a11y.test.tsx'],
    // Keep the WIP transparent-material path enabled in a11y tests too; the
    // public build leaves this unset (→ coerces to solid). See src/featureFlags.ts.
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
