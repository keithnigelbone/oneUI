import { defineConfig } from 'tsup';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const categoriesDir = join(__dirname, 'src/categories');
const categoryEntries = readdirSync(categoriesDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => join('src/categories', f));

export default defineConfig({
  entry: ['src/index.ts', 'src/register.ts', ...categoryEntries],
  format: ['esm', 'cjs'],
  dts: { resolve: false },
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  // Bundle iconRegistry helpers so consumers aren't required to install @oneui/shared.
  external: ['react'],
  loader: {
    '.json': 'json',
  },
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
});
