import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: false },
  clean: true,
  sourcemap: true,
  target: 'node18',
  external: ['next', '@oneui/webpack-plugin'],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
});
