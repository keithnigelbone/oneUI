/**
 * generate.mjs
 *
 * Converts Jio web SVG icons (TSX, React DOM) to tree-shakeable React
 * components in src/generated/.
 *
 * Input:  apps/platform/src/Jio_Icons/icons/*.tsx
 * Output: packages/icons-jio/src/generated/<IconName>.tsx  (one per icon)
 *         packages/icons-jio/src/generated/index.ts        (barrel)
 *         packages/icons-jio/src/catalog.json              (loader catalog)
 *
 * Usage:
 *   node scripts/generate.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const SOURCE_DIR = path.join(REPO_ROOT, 'apps/platform/src/Jio_Icons/icons');
const OUT_DIR = path.join(__dirname, '../src/generated');
const CATALOG_FILE = path.join(__dirname, '../src/catalog.json');
const ALIASES_FILE = path.join(__dirname, '../src/aliases.json');
const CATEGORIES_DIR = path.join(__dirname, '../src/categories');
const CATEGORY_INDEX_FILE = path.join(__dirname, '../src/categoryIndex.ts');
const CATEGORY_LOADERS_FILE = path.join(__dirname, '../src/categoryLoaders.ts');
const BATCH_SIZE = 50;

/**
 * Convert a platform web-SVG TSX file to a named-export IconComponent.
 * Returns null if the file can't be parsed.
 */
function convertIcon(src, iconName) {
  const viewBoxMatch = src.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  const spreadIdx = src.indexOf('{...props}');
  if (spreadIdx === -1) return null;

  const openTagClose = src.indexOf('>', spreadIdx);
  if (openTagClose === -1) return null;

  const closeSvgIdx = src.lastIndexOf('</svg>');
  if (closeSvgIdx === -1) return null;

  let children = src.slice(openTagClose + 1, closeSvgIdx).trim();

  return `import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ${iconName} = forwardRef<SVGSVGElement, IconComponentProps>(function ${iconName}(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="${viewBox}"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      ${children.split('\n').join('\n      ').trim()}
    </svg>
  );
});

${iconName}.displayName = '${iconName}';
`;
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`\n✗  Source directory not found:\n   ${SOURCE_DIR}\n`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs
  .readdirSync(SOURCE_DIR)
  .filter((f) => f.endsWith('.tsx') && f.startsWith('Ic'));

let converted = 0;
let skipped = 0;
const iconNames = [];

console.log(`\n⚙  Converting ${files.length} icons from ${SOURCE_DIR} ...\n`);

for (const file of files) {
  const iconName = file.replace('.tsx', '');
  const src = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
  const output = convertIcon(src, iconName);

  if (!output) {
    console.warn(`  ⚠  Skipped (parse failed): ${file}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(path.join(OUT_DIR, `${iconName}.tsx`), output, 'utf8');
  iconNames.push(iconName);
  converted++;
}

const canonicalNames = [...iconNames].sort();

/** @type {Record<string, string>} */
let aliases = {};
if (fs.existsSync(ALIASES_FILE)) {
  aliases = JSON.parse(fs.readFileSync(ALIASES_FILE, 'utf8'));
}

for (const [alias, canonical] of Object.entries(aliases)) {
  if (!canonicalNames.includes(canonical)) {
    console.warn(`  ⚠  Alias ${alias} → ${canonical}: canonical icon missing`);
    continue;
  }
  if (!iconNames.includes(alias)) {
    iconNames.push(alias);
  }
}

iconNames.sort();

const barrelLines = canonicalNames.map((name) => `export { ${name} } from './${name}';`);
for (const [alias, canonical] of Object.entries(aliases)) {
  if (canonicalNames.includes(canonical)) {
    barrelLines.push(`export { ${canonical} as ${alias} } from './${canonical}';`);
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `${barrelLines.join('\n')}\n`, 'utf8');
fs.writeFileSync(CATALOG_FILE, `${JSON.stringify(iconNames)}\n`, 'utf8');

// Category chunks — alphabetical batches (~50 icons each).
fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
for (const existing of fs.readdirSync(CATEGORIES_DIR)) {
  if (existing.endsWith('.ts')) {
    fs.unlinkSync(path.join(CATEGORIES_DIR, existing));
  }
}

const categoryIds = [];
const indexEntries = [];

for (let i = 0; i < canonicalNames.length; i += BATCH_SIZE) {
  const batch = canonicalNames.slice(i, i + BATCH_SIZE);
  const categoryId = String(Math.floor(i / BATCH_SIZE)).padStart(2, '0');
  categoryIds.push(categoryId);

  const exportLines = batch.map((name) => `export { ${name} } from '../generated/${name}';`);
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (batch.includes(canonical)) {
      exportLines.push(`export { ${canonical} as ${alias} } from '../generated/${canonical}';`);
    }
  }

  fs.writeFileSync(path.join(CATEGORIES_DIR, `${categoryId}.ts`), `${exportLines.join('\n')}\n`, 'utf8');

  for (const name of batch) {
    indexEntries.push(`  ${JSON.stringify(name)}: ${JSON.stringify(categoryId)},`);
  }
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (batch.includes(canonical)) {
      indexEntries.push(`  ${JSON.stringify(alias)}: ${JSON.stringify(categoryId)},`);
    }
  }
}

const categoryIndexContent = `// Generated by scripts/generate.mjs — do not edit manually.

const CATEGORY_BY_ICON: Record<string, string> = {
${indexEntries.join('\n')}
};

export function categoryFor(name: string): string | null {
  return CATEGORY_BY_ICON[name] ?? null;
}
`;

const loaderEntries = categoryIds
  .map((id) => `  ${JSON.stringify(id)}: () => import('./categories/${id}'),`)
  .join('\n');

const categoryLoadersContent = `// Generated by scripts/generate.mjs — do not edit manually.
import type { IconComponent } from './iconProps';

export const categoryLoaders: Record<
  string,
  () => Promise<Record<string, IconComponent>>
> = {
${loaderEntries}
};
`;

fs.writeFileSync(CATEGORY_INDEX_FILE, categoryIndexContent, 'utf8');
fs.writeFileSync(CATEGORY_LOADERS_FILE, categoryLoadersContent, 'utf8');

// Remove legacy monolithic manifest if present.
const legacyManifest = path.join(__dirname, '../src/manifest.ts');
if (fs.existsSync(legacyManifest)) {
  fs.unlinkSync(legacyManifest);
}

const aliasCount = Object.keys(aliases).length;
console.log(`\n✅  Generated ${converted} icons  (${skipped} skipped, ${aliasCount} aliases)`);
console.log(`   Output: ${OUT_DIR}`);
console.log(`   Catalog: ${CATALOG_FILE}`);
console.log(`   Categories: ${categoryIds.length} files in ${CATEGORIES_DIR}`);
console.log(`   Category index: ${CATEGORY_INDEX_FILE}`);
console.log(`   Category loaders: ${CATEGORY_LOADERS_FILE}\n`);

