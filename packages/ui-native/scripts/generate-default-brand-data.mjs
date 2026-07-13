/**
 * Regenerate src/brand-data/defaultJioBrandData.json from native-sample export.
 *
 *   pnpm --filter @oneui/ui-native run generate:default-brand
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const SOURCE = path.resolve(REPO_ROOT, 'apps/native-sample/brand-data/Jio/base.json');
const OUT = path.resolve(PKG_ROOT, 'src/brand-data/defaultJioBrandData.json');
const trimPath = path.resolve(__dirname, 'trimBrandData.ts');

async function main() {
  const { register } = await import('tsx/esm/api');
  register();

  const { trimBrandData } = await import(trimPath);
  const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const brandData = trimBrandData(raw);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(brandData) + '\n');

  const before = fs.statSync(SOURCE).size;
  const after = fs.statSync(OUT).size;
  console.log(`Source:  ${(before / 1024).toFixed(1)} KB`);
  console.log(`Default: ${(after / 1024).toFixed(1)} KB (saved ${((1 - after / before) * 100).toFixed(0)}%)`);
  console.log(`Written: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
