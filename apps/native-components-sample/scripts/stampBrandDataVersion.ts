/**
 * stampBrandDataVersion.ts
 *
 * Stamps the current BRAND_DATA_VERSION into every `latest.json` under
 * `brand-data/`. Run this after bumping BRAND_DATA_VERSION in
 * `brandDataConstants.ts` without needing a full Convex re-export.
 *
 * Handles the nested layout:
 *   brand-data/{brand}/latest.json                         → base snapshot
 *   brand-data/{brand}/sub-brands/{subbrand}/latest.json  → theme delta
 *
 * Usage:
 *   pnpm --filter @oneui/native-components-sample stamp:version
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BRAND_DATA_VERSION } from './brandDataConstants';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND_DATA_DIR = path.resolve(__dirname, '../brand-data');

async function stampFile(filePath: string): Promise<'updated' | 'skipped'> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw) as Record<string, unknown>;
  if (data.version === BRAND_DATA_VERSION) return 'skipped';

  const { version: _removed, ...rest } = data;
  await fs.writeFile(filePath, JSON.stringify({ version: BRAND_DATA_VERSION, ...rest }, null, 2), 'utf-8');
  return 'updated';
}

async function main() {
  let updated = 0;
  let skipped = 0;

  const brandDirs = await fs.readdir(BRAND_DATA_DIR, { withFileTypes: true });

  for (const brandDirEntry of brandDirs) {
    if (!brandDirEntry.isDirectory()) continue;
    const brandPath = path.join(BRAND_DATA_DIR, brandDirEntry.name);
    const entries = await fs.readdir(brandPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === 'sub-brands') {
        // Stamp all sub-brand latest.json files
        const subBrandsPath = path.join(brandPath, 'sub-brands');
        const subEntries = await fs.readdir(subBrandsPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (!sub.isDirectory()) continue;
          const latestPath = path.join(subBrandsPath, sub.name, 'latest.json');
          try {
            const result = await stampFile(latestPath);
            if (result === 'updated') {
              console.log(`  ✓ ${brandDirEntry.name}/sub-brands/${sub.name}/latest.json → v${BRAND_DATA_VERSION}`);
              updated++;
            } else {
              skipped++;
            }
          } catch { /* latest.json missing */ }
        }
      } else if (entry.name === 'latest.json') {
        // Base brand file
        const result = await stampFile(path.join(brandPath, 'latest.json'));
        if (result === 'updated') {
          console.log(`  ✓ ${brandDirEntry.name}/latest.json → v${BRAND_DATA_VERSION}`);
          updated++;
        } else {
          skipped++;
        }
      }
    }
  }

  console.log(`\nDone — ${updated} file(s) updated, ${skipped} already at v${BRAND_DATA_VERSION}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
