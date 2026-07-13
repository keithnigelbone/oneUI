import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: false },
  clean: true,
  sourcemap: true,
  target: 'node18',
  external: ['webpack'],
  // @oneui/shared/cdn is bundled into dist/ so end users only install the
  // 3 published packages they already expect.
  noExternal: [/^@oneui\//],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
});
