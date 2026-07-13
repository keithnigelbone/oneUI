/**
 * pack-dist.mjs
 *
 * Runs `npm pack` from the `dist/` output directory so the resulting .tgz
 * is fully self-contained and installable without monorepo tooling.
 *
 * Usage:
 *   pnpm run pack:dist   — pack only (assumes `pnpm run build` already ran)
 *   pnpm run build:pack  — build + pack in one step
 *
 * Output: dist/packages/native-cdn/<name>-<version>.tgz
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_DIR   = path.resolve(__dirname, '..');
const OUT_DIR   = path.resolve(__dirname, '../../../dist/packages/native-cdn');

const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'));

// Ensure the dist folder exists (tsup writes to packages/native-cdn/dist/).
const distJs = path.join(PKG_DIR, 'dist');
if (!fs.existsSync(distJs)) {
  console.error(
    `\n✗  ${path.relative(process.cwd(), distJs)} not found.\n` +
    '   Run `pnpm run build` first.\n',
  );
  process.exit(1);
}

// Prepare output dir.
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`\n📦  Packing @oneui/native-cdn@${pkg.version} → dist/packages/native-cdn/ ...\n`);
execSync(`npm pack --pack-destination "${OUT_DIR}"`, { cwd: PKG_DIR, stdio: 'inherit' });
console.log(`\n✅  .tgz written to dist/packages/native-cdn/\n`);
