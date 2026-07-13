/**
 * migrateBrandDataStructure.ts
 *
 * Idempotent migration that ensures brand-data/ uses the canonical layout:
 *
 *   brand-data/{brand}/latest.json                          ← base snapshot
 *   brand-data/{brand}/sub-brands/{sub-brand}/latest.json  ← theme delta
 *
 * Steps (each is skipped if already done):
 *   1. base.json → latest.json
 *   2. Flat {subbrand}.json → sub-brands/{subbrand}/latest.json
 *   3. Loose sub-brand folders (direct children of brand) → sub-brands/{subbrand}/
 *   4. Uppercase brand/sub-brand folder names → lowercase
 *
 * Usage:
 *   pnpm --filter @oneui/native-components-sample migrate:brand-data
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND_DATA_DIR = path.resolve(__dirname, '../brand-data');
const SUB_BRANDS_DIR = 'sub-brands';

/** Rename a folder to its lowercase version. Returns true if renamed. */
async function lowercaseFolder(folderPath: string): Promise<boolean> {
  const parent = path.dirname(folderPath);
  const name = path.basename(folderPath);
  const lowered = name.toLowerCase();
  if (name === lowered) return false;
  await fs.rename(folderPath, path.join(parent, lowered));
  return true;
}

async function main() {
  let renamed = 0;
  let skipped = 0;

  const brandDirs = await fs.readdir(BRAND_DATA_DIR, { withFileTypes: true });

  for (const brandEntry of brandDirs) {
    if (!brandEntry.isDirectory()) continue;
    const brandPath = path.join(BRAND_DATA_DIR, brandEntry.name);
    const subBrandsPath = path.join(brandPath, SUB_BRANDS_DIR);
    const entries = await fs.readdir(brandPath, { withFileTypes: true });

    // ── Step 1 & 2: flat JSON files
    for (const entry of entries) {
      if (entry.isDirectory() || !entry.name.endsWith('.json')) continue;
      const entryPath = path.join(brandPath, entry.name);
      const variantSlug = entry.name.replace(/\.json$/, '');

      if (variantSlug === 'base' || variantSlug === 'latest') {
        if (entry.name === 'latest.json') { skipped++; continue; }
        await fs.rename(entryPath, path.join(brandPath, 'latest.json'));
        console.log(`  ✓  ${brandEntry.name}/${entry.name} → ${brandEntry.name}/latest.json`);
        renamed++;
      } else {
        // Flat sub-brand JSON → sub-brands/{slug}/latest.json
        const dest = path.join(subBrandsPath, variantSlug, 'latest.json');
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.rename(entryPath, dest);
        console.log(`  ✓  ${brandEntry.name}/${entry.name} → ${brandEntry.name}/${SUB_BRANDS_DIR}/${variantSlug}/latest.json`);
        renamed++;
      }
    }

    // ── Step 3: move loose sub-brand folders that are direct children of the brand
    //    (i.e., not named "sub-brands") into sub-brands/
    const entries2 = await fs.readdir(brandPath, { withFileTypes: true });
    for (const entry of entries2) {
      if (!entry.isDirectory() || entry.name === SUB_BRANDS_DIR) continue;
      // This is a loose sub-brand folder sitting directly under the brand folder
      const src = path.join(brandPath, entry.name);
      const dest = path.join(subBrandsPath, entry.name.toLowerCase());
      await fs.mkdir(subBrandsPath, { recursive: true });
      try {
        await fs.access(dest);
        // Destination already exists — merge by moving latest.json if missing
        const srcLatest = path.join(src, 'latest.json');
        const destLatest = path.join(dest, 'latest.json');
        try { await fs.access(destLatest); skipped++; }
        catch {
          await fs.rename(srcLatest, destLatest);
          renamed++;
        }
        await fs.rm(src, { recursive: true, force: true });
      } catch {
        await fs.rename(src, dest);
        console.log(`  ✓  ${brandEntry.name}/${entry.name}/ → ${brandEntry.name}/${SUB_BRANDS_DIR}/${entry.name.toLowerCase()}/`);
        renamed++;
      }
    }

    // ── Step 4: lowercase sub-brand folder names inside sub-brands/
    try {
      const subEntries = await fs.readdir(subBrandsPath, { withFileTypes: true });
      for (const sub of subEntries) {
        if (!sub.isDirectory()) continue;
        const subPath = path.join(subBrandsPath, sub.name);
        const didRename = await lowercaseFolder(subPath);
        if (didRename) {
          console.log(`  ✓  ${brandEntry.name}/${SUB_BRANDS_DIR}/${sub.name} → ${sub.name.toLowerCase()}`);
          renamed++;
        } else {
          skipped++;
        }
      }
    } catch { /* sub-brands/ may not exist for brands with no sub-brands */ }
  }

  // ── Step 5: lowercase brand folder names
  const brandDirs2 = await fs.readdir(BRAND_DATA_DIR, { withFileTypes: true });
  for (const brandEntry of brandDirs2) {
    if (!brandEntry.isDirectory()) continue;
    const didRename = await lowercaseFolder(path.join(BRAND_DATA_DIR, brandEntry.name));
    if (didRename) {
      console.log(`  ✓  ${brandEntry.name}/ → ${brandEntry.name.toLowerCase()}/`);
      renamed++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone — ${renamed} item(s) renamed/moved, ${skipped} already correct`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
