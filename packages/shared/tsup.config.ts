import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'engine/index': 'src/engine/index.ts',
    'meta/index': 'src/meta/index.ts',
    'codegen/index': 'src/codegen/index.ts',
    'templates/index': 'src/templates/index.ts',
    'agent/index': 'src/agent/index.ts',
    'cdn/index': 'src/cdn/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
  dts: { tsconfig: 'tsconfig.build.json' },
  tsconfig: 'tsconfig.build.json',
  clean: true,
  outDir: 'dist',
  treeshake: true,
  external: ['react', 'react-dom', 'zod'],
});
