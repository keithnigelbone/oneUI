/**
 * generate.mjs
 *
 * Converts 1,622 Jio web SVG icons (TSX, React DOM) to React Native SVG
 * components and writes them to src/generated/.
 *
 * Input:  apps/platform/src/Jio_Icons/icons/*.tsx
 * Output: packages/icons-jio-native/src/generated/<IconName>.tsx  (one per icon)
 *         packages/icons-jio-native/src/generated/index.ts        (barrel)
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
const ALIASES_FILE = path.join(REPO_ROOT, 'packages/icons-jio/src/aliases.json');

// ── RN-SVG element name mapping ───────────────────────────────────────────────
const SVG_ELEMENTS = [
  'path', 'g', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line',
  'defs', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'mask',
  'symbol', 'use', 'text', 'tspan', 'image', 'pattern', 'filter',
];

// Build lookup: lowercase element name → RN-SVG capitalized name
const RN_ELEMENT = Object.fromEntries(
  SVG_ELEMENTS.map((el) => [el, el.charAt(0).toUpperCase() + el.slice(1)]),
);

// RN-SVG named exports (the ones that come from 'react-native-svg')
const RN_SVG_NAMED = new Set(Object.values(RN_ELEMENT));

/**
 * Convert a single web-SVG TSX file to a React Native SVG component string.
 * Returns null if the file can't be parsed.
 */
function convertIcon(src, iconName) {
  // ── 1. Extract viewBox ────────────────────────────────────────────────────
  const viewBoxMatch = src.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // ── 2. Extract JSX children between `{...props}>` and last `</svg>` ───────
  // The spread `{...props}` appears on the <svg> tag, then `>` closes it.
  const spreadIdx = src.indexOf('{...props}');
  if (spreadIdx === -1) return null;

  // Find the `>` that closes the <svg> opening tag after the spread
  const openTagClose = src.indexOf('>', spreadIdx);
  if (openTagClose === -1) return null;

  // Find the last </svg> in the file
  const closeSvgIdx = src.lastIndexOf('</svg>');
  if (closeSvgIdx === -1) return null;

  const rawChildren = src.slice(openTagClose + 1, closeSvgIdx).trim();

  // ── 3. Convert element names (path → Path, circle → Circle, …) ────────────
  let children = rawChildren;

  // Replace opening tags: `<tagName` and `</tagName`
  for (const [lower, upper] of Object.entries(RN_ELEMENT)) {
    // Opening tags: <path, <g, etc. (word boundary to avoid partial matches)
    children = children.replace(new RegExp(`<${lower}([ \\n\\r\\t/>])`, 'g'), `<${upper}$1`);
    // Closing tags: </path>, </g>, etc.
    children = children.replace(new RegExp(`</${lower}>`, 'g'), `</${upper}>`);
  }

  // ── 4. Replace fill="currentColor" with {fill} prop ─────────────────────
  // Both `fill="currentColor"` and `fill={'currentColor'}` forms
  children = children.replace(/fill="currentColor"/g, 'fill={fill}');
  children = children.replace(/fill=\{'currentColor'\}/g, 'fill={fill}');

  // ── 5. Collect which RN-SVG named imports are actually used ───────────────
  const usedImports = new Set();
  for (const upper of RN_SVG_NAMED) {
    // Check for <Upper or </Upper in the converted children
    if (children.includes(`<${upper}`) || children.includes(`</${upper}>`)) {
      usedImports.add(upper);
    }
  }

  // Sort imports for deterministic output
  const namedImports = [...usedImports].sort().join(', ');
  const svgImportLine = namedImports
    ? `import Svg, { ${namedImports}, type SvgProps } from 'react-native-svg';`
    : `import Svg, { type SvgProps } from 'react-native-svg';`;

  // ── 6. Emit component ────────────────────────────────────────────────────
  return `import React from 'react';
${svgImportLine}
export function ${iconName}(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="${viewBox}" fill="none" {...props}>
      ${children.split('\n').join('\n      ').trim()}
    </Svg>
  );
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
  const iconName = file.replace('.tsx', ''); // e.g. IcAdd
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

const aliasCount = Object.keys(aliases).length;
console.log(`\n✅  Generated ${converted} icons  (${skipped} skipped, ${aliasCount} aliases)`);
console.log(`   Output: ${OUT_DIR}\n`);
