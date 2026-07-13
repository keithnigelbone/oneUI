/**
 * generate.mjs
 *
 * Converts Tira SVG icons (outline + filled, 24px) to tree-shakeable React
 * components in src/generated/.
 *
 * Input:  packages/icons-tira/source/{outline,filled}/*24.svg
 * Output: packages/icons-tira/src/generated/<IconName>.tsx
 *         packages/icons-tira/src/catalog.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIRS = [
  path.join(__dirname, '../source/outline'),
  path.join(__dirname, '../source/filled'),
];
const OUT_DIR = path.join(__dirname, '../src/generated');
const CATALOG_FILE = path.join(__dirname, '../src/catalog.json');
const CATEGORIES_DIR = path.join(__dirname, '../src/categories');
const CATEGORY_INDEX_FILE = path.join(__dirname, '../src/categoryIndex.ts');
const CATEGORY_LOADERS_FILE = path.join(__dirname, '../src/categoryLoaders.ts');
const BATCH_SIZE = 50;

const SVG_ATTR_KEBAB_TO_CAMEL = {
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
};

function normalizeSvgAttributes(svgFragment) {
  let result = svgFragment;
  for (const [kebab, camel] of Object.entries(SVG_ATTR_KEBAB_TO_CAMEL)) {
    result = result.replace(new RegExp(`\\b${kebab}=`, 'g'), `${camel}=`);
  }
  return result;
}

function parseSvg(svgContent) {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) return null;

  let children = innerMatch[1].trim();
  children = children.replace(/fill="#[^"]+"/g, 'fill="currentColor"');
  children = children.replace(/fill='#[^']+'/g, "fill='currentColor'");
  children = children.replace(/stroke="#[^"]+"/g, 'stroke="currentColor"');
  children = children.replace(/stroke='#[^']+'/g, "stroke='currentColor'");
  children = normalizeSvgAttributes(children);

  return { viewBox, children };
}

function convertIcon({ viewBox, children }, iconName) {
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

function sanitizeIconName(name) {
  return name.replace(/&/g, 'And');
}

function iconNameFromFile(fileName) {
  return sanitizeIconName(fileName.replace(/24\.svg$/, ''));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const existing of fs.readdirSync(OUT_DIR)) {
  if (existing.endsWith('.tsx') || existing === 'index.ts') {
    fs.unlinkSync(path.join(OUT_DIR, existing));
  }
}

const iconNames = [];
let converted = 0;
let skipped = 0;

for (const sourceDir of SOURCE_DIRS) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`  ⚠  Source directory missing: ${sourceDir}`);
    continue;
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('24.svg'));

  for (const file of files) {
    const iconName = iconNameFromFile(file);
    if (iconNames.includes(iconName)) {
      console.warn(`  ⚠  Duplicate icon name skipped: ${iconName}`);
      skipped++;
      continue;
    }

    const src = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const parsed = parseSvg(src);
    if (!parsed) {
      console.warn(`  ⚠  Skipped (parse failed): ${file}`);
      skipped++;
      continue;
    }

    fs.writeFileSync(path.join(OUT_DIR, `${iconName}.tsx`), convertIcon(parsed, iconName), 'utf8');
    iconNames.push(iconName);
    converted++;
  }
}

iconNames.sort();

const barrelLines = iconNames.map((name) => `export { ${name} } from './${name}';`);
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `${barrelLines.join('\n')}\n`, 'utf8');
fs.writeFileSync(CATALOG_FILE, `${JSON.stringify(iconNames)}\n`, 'utf8');

fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
for (const existing of fs.readdirSync(CATEGORIES_DIR)) {
  if (existing.endsWith('.ts')) {
    fs.unlinkSync(path.join(CATEGORIES_DIR, existing));
  }
}

const categoryIds = [];
const indexEntries = [];

for (let i = 0; i < iconNames.length; i += BATCH_SIZE) {
  const batch = iconNames.slice(i, i + BATCH_SIZE);
  const categoryId = String(Math.floor(i / BATCH_SIZE)).padStart(2, '0');
  categoryIds.push(categoryId);

  const exportLines = batch.map((name) => `export { ${name} } from '../generated/${name}';`);
  fs.writeFileSync(path.join(CATEGORIES_DIR, `${categoryId}.ts`), `${exportLines.join('\n')}\n`, 'utf8');

  for (const name of batch) {
    indexEntries.push(`  ${JSON.stringify(name)}: ${JSON.stringify(categoryId)},`);
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

console.log(`\n✅  Generated ${converted} Tira icons (${skipped} skipped)`);
console.log(`   Output: ${OUT_DIR}`);
console.log(`   Catalog: ${CATALOG_FILE}`);
console.log(`   Categories: ${categoryIds.length} files\n`);
