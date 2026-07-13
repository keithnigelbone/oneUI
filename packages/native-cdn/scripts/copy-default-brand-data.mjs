#!/usr/bin/env node
/**
 * Postbuild step: copy src/defaultBrandData → dist/defaultBrandData so the
 * bundled fallback JSON sits next to the compiled prefetch.cjs/.mjs at the
 * same relative path in both dev and the published package. Run by
 * tsup.config.ts's `onSuccess` after every build.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const SRC = join(PKG, 'src', 'defaultBrandData');
const DEST = join(PKG, 'dist', 'defaultBrandData');

if (!existsSync(SRC)) {
  console.warn('[copy-default-brand-data] src/defaultBrandData missing — run scripts/generate-default-brand-data.mjs first');
  process.exit(0);
}

rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });
console.log('[copy-default-brand-data] dist/defaultBrandData refreshed');
