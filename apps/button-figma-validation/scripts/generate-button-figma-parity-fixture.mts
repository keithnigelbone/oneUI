/**
 * Parses Framelink `get_figma_data` YAML export for COMPONENT_SET `373:5376` (Button),
 * resolves globalVars fill / text styles, and writes `fixtures/figma-parity.fixture.json`.
 *
 *   pnpm --filter @oneui/button-figma-validation run generate:figma-parity-fixture -- /absolute/path/to/get_figma_data.txt
 */

import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SET_ID = '373:5376';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '').trim();
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return hex;
}

function fillToRgb(fillVal: string, fills: Map<string, string[]>): string {
  const v = fillVal.trim();
  if (v.startsWith('fill_')) {
    const arr = fills.get(v);
    if (!arr?.[0]) return 'rgb(0, 0, 0)';
    const c = arr[0];
    if (c.startsWith('#')) return hexToRgb(c);
    if (c.startsWith('rgba') || c.startsWith('rgb')) return c.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const p = inner.split(',').map((x: string) => x.trim());
      if (p.length === 4) {
        const [r, g, b, a] = p.map(Number);
        return `rgb(${Math.round(r * a + 255 * (1 - a))}, ${Math.round(g * a + 255 * (1 - a))}, ${Math.round(b * a + 255 * (1 - a))})`;
      }
      return `rgb(${p.join(', ')})`;
    });
  }
  return v;
}

function parseFigmaName(name: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of name.split(',').map((s) => s.trim())) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

function attentionToVariant(att: string): 'bold' | 'subtle' | 'ghost' {
  if (att === 'high') return 'bold';
  if (att === 'medium') return 'subtle';
  return 'ghost';
}

function figmaSizeToToken(s: string): string {
  return s.toLowerCase();
}

function parseGlobalFills(text: string): Map<string, string[]> {
  const fills = new Map<string, string[]>();
  const gv = text.indexOf('globalVars:');
  if (gv === -1) return fills;
  const sub = text.slice(gv);
  const re = /^    (fill_[A-Z0-9]+):\n((?:      - [^\n]+\n)+)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sub))) {
    const lines = m[2]
      .split('\n')
      .map((l) => l.replace(/^\s*-\s*'?(.*?)'?\s*$/, '$1').replace(/^"(.*)"$/, '$1'))
      .filter(Boolean);
    fills.set(m[1], lines);
  }
  return fills;
}

function parseTextStyles(text: string): Map<string, { fontSize: number }> {
  const m = new Map<string, { fontSize: number }>();
  const gv = text.indexOf('globalVars:');
  if (gv === -1) return m;
  const sub = text.slice(gv);
  const re = /^    (Label\/[^\n]+):\n((?:      [^\n]+\n)+)/gm;
  let x: RegExpExecArray | null;
  while ((x = re.exec(sub))) {
    const block = x[2];
    const fsMatch = block.match(/fontSize:\s*(\d+)/);
    if (fsMatch) m.set(x[1].trim(), { fontSize: Number(fsMatch[1]) });
  }
  return m;
}

function extractComponentBlocks(nodesSection: string): string[] {
  const marker = `- id: ${SET_ID}`;
  const i = nodesSection.indexOf(marker);
  if (i === -1) return [];
  const after = nodesSection.slice(i);
  const childrenIdx = after.indexOf('    children:');
  if (childrenIdx === -1) return [];
  const fromChildren = after.slice(childrenIdx + '    children:'.length);
  const parts = fromChildren.split(/\n      - id: /);
  const blocks: string[] = [];
  for (const p of parts.slice(1)) {
    const head = p.slice(0, 500);
    if (head.includes('\n        type: COMPONENT\n')) blocks.push(p);
  }
  return blocks;
}

function extractField(block: string, field: string): string | undefined {
  const re = new RegExp(`^        ${field}: (.+)$`, 'm');
  const m = block.match(re);
  return m?.[1]?.trim();
}

function extractLabelTextStyle(block: string): string | undefined {
  const m = block.match(/\n                name: Label\n[\s\S]*?textStyle: ([^\n]+)/);
  return m?.[1]?.trim();
}

function extractLabelFill(block: string): string | undefined {
  const m = block.match(/\n                name: Label\n[\s\S]*?fills: (fill_[A-Z0-9]+)/);
  return m?.[1]?.trim();
}

function parseLayoutDimensions(text: string): Map<string, { width: number; height: number }> {
  const m = new Map<string, { width: number; height: number }>();
  const gv = text.indexOf('globalVars:');
  if (gv === -1) return m;
  const sub = text.slice(gv);
  const re = /\n    (layout_[A-Z0-9]+):\n([\s\S]*?)(?=\n    (?:layout_|fill_|Label\/|focus ))/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(sub))) {
    const dm = x[2].match(/dimensions:\n        width: (\d+)\n        height: (\d+)/);
    if (dm) m.set(x[1], { width: Number(dm[1]), height: Number(dm[2]) });
  }
  return m;
}

function extractLoadingLayoutKey(block: string): string | undefined {
  const m = block.match(/\n                name: Loading\n                type: IMAGE-SVG\n                layout: (layout_[A-Z0-9]+)/);
  return m?.[1];
}

function extractFirstDimensions(
  block: string,
  layoutDims: Map<string, { width: number; height: number }>,
): { width: number; height: number } | null {
  const lk = extractLoadingLayoutKey(block);
  if (lk) {
    const d = layoutDims.get(lk);
    if (d && d.width >= 48 && d.height >= 24) return d;
  }
  return null;
}

function main() {
  const src = process.argv[2];
  if (!src || !fs.existsSync(src)) {
    console.error(
      'Usage: tsx scripts/generate-button-figma-parity-fixture.mts <path-to-get_figma_data.txt>',
    );
    process.exit(1);
  }
  const text = fs.readFileSync(src, 'utf8');
  const fills = parseGlobalFills(text);
  const textStyles = parseTextStyles(text);
  const layoutDims = parseLayoutDimensions(text);

  const nodesIdx = text.indexOf('\nnodes:');
  const nodesSection = nodesIdx === -1 ? text : text.slice(nodesIdx);
  const blocks = extractComponentBlocks(nodesSection);

  type Row = {
    id: string;
    props: Record<string, string | boolean>;
    expect: Record<string, string>;
  };

  const rows: Row[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const name = extractField(block, 'name');
    if (!name) continue;
    const fp = parseFigmaName(name);
    if (fp.start !== 'false' || fp.end !== 'false') continue;
    if (fp.contained !== 'true' || fp.condensed !== 'false' || fp.fullWidth !== 'false') continue;

    const size = fp.size;
    const attention = fp.attention;
    if (!size || !attention) continue;

    const groupKey = `${size}|${attention}|${fp.contained}|${fp.condensed}|${fp.fullWidth}`;
    if (seen.has(groupKey)) continue;
    seen.add(groupKey);

    const fillKey = extractField(block, 'fills');
    const borderRadius = extractField(block, 'borderRadius') ?? '0px';
    const strokeLine = block.match(/\n        strokes: (fill_[A-Z0-9]+|[^\n]+)/);
    const strokes = strokeLine?.[1];
    const strokeWeight = extractField(block, 'strokeWeight');

    const bg = fillKey ? fillToRgb(fillKey, fills) : 'rgb(0, 0, 0)';
    const border =
      strokes && strokes.startsWith('fill_')
        ? `${strokeWeight ?? '1px'} solid ${fillToRgb(strokes, fills)}`
        : 'none';

    const labelFillKey = extractLabelFill(block);
    const textStyle = extractLabelTextStyle(block);
    const fontPx = textStyle ? textStyles.get(textStyle)?.fontSize ?? 16 : 16;
    const color = labelFillKey ? fillToRgb(labelFillKey, fills) : 'rgb(0, 0, 0)';

    const dim = extractFirstDimensions(block, layoutDims) ?? { width: 0, height: 0 };

    const variant = attentionToVariant(attention);
    const st = figmaSizeToToken(size);
    const vid = `button-${st}-${variant}-${attention}-default`;

    rows.push({
      id: vid,
      props: {
        size,
        variant,
        attention,
        state: 'default',
        condensed: fp.condensed === 'true',
        contained: fp.contained === 'true',
        fullWidth: fp.fullWidth === 'true',
        start: fp.start === 'true',
        end: fp.end === 'true',
      },
      expect: {
        backgroundColor: bg,
        borderRadius,
        border,
        width: `${dim.width}px`,
        height: `${dim.height}px`,
        color,
        fontSize: `${fontPx}px`,
        opacity: '1',
      },
    });
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));

  const out = {
    meta: {
      figmaUrl:
        'https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/%E2%9D%96--Backup-2026-05-04--OneUI-Components?node-id=373-5376',
      componentName: 'Button',
      componentSetId: SET_ID,
      fetchedAt: new Date().toISOString(),
      totalVariants: rows.length,
      note: 'Representative subset: start=false,end=false,contained=true,condensed=false,fullWidth=false for each unique size×attention in Figma COMPONENT_SET.',
    },
    variants: rows,
  };

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dest = join(__dirname, '..', 'fixtures', 'figma-parity.fixture.json');
  fs.mkdirSync(dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${rows.length} variants → ${dest}`);
}

main();
