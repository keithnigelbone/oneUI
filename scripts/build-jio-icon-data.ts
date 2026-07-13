/**
 * build-jio-icon-data.ts
 *
 * Reads all 1,622 Jio icon .tsx files and generates a single JSON bundle
 * containing SVG path data for each icon. This eliminates 1,622 separate
 * chunks in the build output.
 *
 * Usage: npx tsx scripts/build-jio-icon-data.ts
 *
 * Output: apps/platform/public/jio-icons-data.json
 *
 * Note: @oneui/icons-jio no longer ships this JSON — it uses tree-shakeable
 * components from `packages/icons-jio/scripts/generate.mjs`. This script remains
 * for the platform IconBrowser / Sandpack lazy-fetch path.
 */

import * as fs from 'fs';
import * as path from 'path';

const ICONS_DIR = path.resolve(__dirname, '../apps/platform/src/Jio_Icons/icons');
const OUTPUT_FILE = path.resolve(__dirname, '../apps/platform/public/jio-icons-data.json');

interface IconData {
  /** SVG viewBox attribute */
  v: string;
  /** SVG inner content (path elements as HTML string) */
  d: string;
}

function extractSVGData(content: string): IconData | null {
  // Extract viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) return null;

  // Extract SVG children: everything between {...props}> and </svg>
  // The pattern is: {...props}>\n    <path ... />\n  </svg>
  const childrenMatch = content.match(/\{\.\.\.props\}\s*>\s*([\s\S]*?)\s*<\/svg>/);
  if (!childrenMatch) return null;

  // Convert JSX to HTML:
  // - Replace self-closing JSX tags: <path ... /> stays as is
  // - Replace JSX attributes: fillRule -> fill-rule, clipRule -> clip-rule, strokeWidth -> stroke-width
  let children = childrenMatch[1].trim();

  // JSX to HTML attribute conversion
  children = children
    .replace(/fillRule=/g, 'fill-rule=')
    .replace(/clipRule=/g, 'clip-rule=')
    .replace(/strokeWidth=/g, 'stroke-width=')
    .replace(/strokeLinecap=/g, 'stroke-linecap=')
    .replace(/strokeLinejoin=/g, 'stroke-linejoin=')
    .replace(/fillOpacity=/g, 'fill-opacity=')
    .replace(/strokeOpacity=/g, 'stroke-opacity=')
    .replace(/clipPath=/g, 'clip-path=');

  return {
    v: viewBoxMatch[1],
    d: children,
  };
}

function main() {
  console.log(`Reading icons from: ${ICONS_DIR}`);

  const files = fs.readdirSync(ICONS_DIR).filter((f) => f.endsWith('.tsx'));
  console.log(`Found ${files.length} icon files`);

  const icons: Record<string, IconData> = {};
  let errors = 0;

  for (const file of files) {
    const name = path.basename(file, '.tsx');
    const content = fs.readFileSync(path.join(ICONS_DIR, file), 'utf-8');
    const data = extractSVGData(content);

    if (data) {
      icons[name] = data;
    } else {
      errors++;
      console.warn(`  Warning: Could not extract SVG data from ${file}`);
    }
  }

  // Write output
  const json = JSON.stringify(icons);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, json, 'utf-8');

  const sizeKB = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`\nGenerated: ${OUTPUT_FILE}`);
  console.log(`  Icons: ${Object.keys(icons).length}`);
  console.log(`  Size: ${sizeKB} KB`);
  if (errors > 0) {
    console.log(`  Errors: ${errors}`);
  }
}

main();
