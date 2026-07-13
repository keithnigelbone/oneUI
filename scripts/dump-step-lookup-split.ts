#!/usr/bin/env tsx
/**
 * Dump the static + dynamic slices from generateSurfaceStepLookupCSSSplit
 * for each fixture brand. Lets us measure real per-brand injection size
 * after the static/dynamic split.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { generateSurfaceStepLookupCSSSplit } from '@oneui/shared/engine';

import { BRANDS, buildFixturePalette } from './verify-theme-redundancy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(REPO_ROOT, 'temp/surface-step-lookup-split');
mkdirSync(OUT_DIR, { recursive: true });

const pad = (s: string | number, n: number) => String(s).padEnd(n);

console.log(
  pad('fixture', 16),
  pad('static (B)', 12),
  pad('dynamic (B)', 14),
  pad('combined (B)', 14),
  pad('static %', 10),
);

let totalStatic = 0;
let totalDynamic = 0;

for (const brand of BRANDS) {
  const palette = buildFixturePalette(brand);
  const { staticCSS, dynamicCSS } = generateSurfaceStepLookupCSSSplit(palette.themeConfig);
  const staticB = Buffer.byteLength(staticCSS, 'utf8');
  const dynamicB = Buffer.byteLength(dynamicCSS, 'utf8');
  const combined = staticB + dynamicB;

  writeFileSync(resolve(OUT_DIR, `${brand.name}--static.css`), staticCSS);
  writeFileSync(resolve(OUT_DIR, `${brand.name}--dynamic.css`), dynamicCSS);

  totalStatic += staticB;
  totalDynamic += dynamicB;

  console.log(
    pad(brand.name, 16),
    pad(staticB, 12),
    pad(dynamicB, 14),
    pad(combined, 14),
    pad(((staticB / combined) * 100).toFixed(1) + '%', 10),
  );
}

const avgStatic = totalStatic / BRANDS.length;
const avgDyn = totalDynamic / BRANDS.length;
console.log(`\nAverage static slice: ${avgStatic.toFixed(0)} B`);
console.log(`Average dynamic slice: ${avgDyn.toFixed(0)} B`);
console.log(`Average per-brand injection (dynamic only): ${avgDyn.toFixed(0)} B`);
