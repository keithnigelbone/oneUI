import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  // Bundle @jds/kb-core into the workspace dist (see kb-rn tsup.config.ts
  // for the rationale). Flip back to `external` at publish-time.
  noExternal: ['@jds/kb-core'],
});
