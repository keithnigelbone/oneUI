/**
 * pack-dist.mjs
 *
 * Runs `npm pack` from the postbuild output directory
 * (dist/packages/ui-native/) so the resulting .tgz is self-contained and
 * installable in any Expo project without monorepo tooling.
 *
 * Usage (via package.json scripts):
 *   pnpm run pack:dist   — pack only (assumes build already ran)
 *   pnpm run build:pack  — build + pack in one step
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../dist/packages/ui-native');

if (!fs.existsSync(path.join(OUT_DIR, 'package.json'))) {
  console.error(
    '\n✗  dist/packages/ui-native/package.json not found.\n' +
    '   Run `pnpm run build` first to produce the publish output.\n',
  );
  process.exit(1);
}

console.log('\n📦  Packing dist/packages/ui-native/ ...\n');
execSync('npm pack', { cwd: OUT_DIR, stdio: 'inherit' });
console.log(`\n✅  .tgz written to ${OUT_DIR}\n`);
