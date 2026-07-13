import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  // Bundle @jds/kb-core into the workspace dist so the built artefact runs
  // standalone under Node (the generator scripts await-import dist/index.js
  // directly). Pre-publish — once Changesets ships separate npm artefacts +
  // peerDep is enforced — flip `noExternal` off and switch to
  // `external: ['@jds/kb-core']` so each consumer installs kb-core once.
  // Drift safety lives in the commonKbVersion stamp on manifest.json.
  noExternal: ['@jds/kb-core'],
});
