/**
 * pack-dist.mjs
 *
 * Runs `npm pack` from the package root (using `files` in package.json to
 * control what goes into the tgz) and writes the output to:
 *   dist/packages/icons-jio-native/<name>-<version>.tgz
 *
 * Usage (via package.json scripts):
 *   pnpm run pack:dist   — pack only (assumes build already ran)
 *   pnpm run build:pack  — generate + build + pack in one step
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname, '../../../dist/packages/icons-jio-native');

const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'));

if (!fs.existsSync(path.join(PKG_DIR, 'dist', 'index.cjs'))) {
  console.error(
    '\n✗  dist/index.cjs not found.\n' +
    '   Run `pnpm run build` first to produce the compiled output.\n',
  );
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`\n📦  Packing @oneui/icons-jio-native@${pkg.version} → dist/packages/icons-jio-native/ ...\n`);
execSync(`npm pack --pack-destination "${OUT_DIR}"`, { cwd: PKG_DIR, stdio: 'inherit' });
console.log(`\n✅  .tgz written to dist/packages/icons-jio-native/\n`);
