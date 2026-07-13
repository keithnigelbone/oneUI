import { defineConfig } from 'tsup';

export default defineConfig([
  // Runtime entry — consumed by React Native (Metro reads ./src directly in the
  // workspace). No Node APIs; keep `react` external.
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2022',
    external: ['react'],
    outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
  },
  // Node-only entries — build-time prefetch core + CLI. Never imported by the
  // RN runtime, so Node built-ins stay out of the app bundle.
  {
    entry: ['src/prefetch.ts', 'src/cli.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    target: 'node18',
    platform: 'node',
    outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
    // Bundled default brand-data (CDN-404 fallback) must sit next to the
    // compiled prefetch.cjs/.mjs at the same relative path as in dev
    // (src/prefetch.ts ↔ src/defaultBrandData) — see prefetch.ts's
    // DEFAULT_BRAND_DATA_DIR resolution.
    onSuccess: 'node scripts/copy-default-brand-data.mjs',
  },
]);
