import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    // Node-only brand discovery (uses node:fs/__dirname). Kept OUT of `index`
    // so the main entry stays browser-safe; published as `@jds/kb-core/node`.
    node: 'src/brands/discovery.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  // Copies the structured invariants.json + per-brand snapshots into dist.
  // Brand snapshots are produced by `scripts/snapshot-brands.ts` in OneUI CI
  // and committed to `dist/brands/<brandSlug>.json` before publish.
  onSuccess: 'node scripts/emit-invariants.mjs',
});
