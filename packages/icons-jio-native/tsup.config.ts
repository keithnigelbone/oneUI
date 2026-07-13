import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  // 'node' prevents esbuild from wrapping require() in a shim —
  // Metro's static analyzer needs literal require() calls.
  platform: 'node',
  target: 'es2022',
  dts: false,
  clean: true,
  outDir: './dist',
  splitting: false,
  treeshake: true,
  minify: true,
  sourcemap: false,
  outExtension: () => ({ js: '.cjs' }),
  // react, react-native, react-native-svg stay external — provided by the consumer app.
  // @oneui/shared must be bundled: it's a workspace-only package, not on npm.
  external: ['react', 'react-native', 'react-native-svg'],
  noExternal: ['@oneui/shared'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
