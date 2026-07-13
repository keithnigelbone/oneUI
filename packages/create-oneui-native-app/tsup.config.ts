import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

const require = createRequire(import.meta.url);
const pkg = require('./package.json') as { version: string };

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  platform: 'node',
  clean: true,
  sourcemap: false,
  // Bundle all deps so the published tarball is self-contained — no
  // node_modules install required before npx executes the binary.
  noExternal: [/./],
  banner: { js: '#!/usr/bin/env node' },
  outExtension: () => ({ js: '.cjs' }),
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
  },
});
