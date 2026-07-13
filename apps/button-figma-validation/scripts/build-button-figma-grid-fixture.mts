/**
 * Build figma-parity.fixture.json from a Framelink `get_figma_data` YAML dump.
 *
 *   pnpm --filter @oneui/button-figma-validation run build:figma-grid-fixture -- /path/to/get_figma_data.txt
 *
 * Optionally copies `expect` blobs from the existing fixture when props match
 * the default layout row (condensed=false, contained=true, fullWidth=false, start=false, end=false).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPONENT_SET_ID = '373:5376';

/**
 * Figma Modes / variables (Appearance, Surface, Theme, Platform, Density, Loading, Disabled, …)
 * are NOT encoded in the Button COMPONENT_SET variant *name* string from `get_figma_data`.
 * Those only list: size, attention, condensed, contained, fullWidth, start, end.
 * We record typical canvas defaults here so the Vite page can pass matching `Button` props
 * and you can extend this object when your Figma file uses different mode defaults.
 */
const FIGMA_CANVAS_DEFAULT_PROPS = {
  /** Matches Figma "01 Appearance" when set to Primary */
  appearance: 'primary' as const,
  loading: false,
};

type RowCombo = {
  variant: 'bold' | 'subtle' | 'ghost';
  attention: 'high' | 'medium' | 'low';
  state: 'default';
  condensed: boolean;
  contained: boolean;
  fullWidth: boolean;
  start: boolean;
  end: boolean;
};

type ExpectBlock = {
  backgroundColor: string;
  borderRadius: string;
  border: string;
  width: string;
  height: string;
  color: string;
  fontSize: string;
  opacity: string;
};

function attentionToVariant(att: string): 'bold' | 'subtle' | 'ghost' {
  if (att === 'high') return 'bold';
  if (att === 'medium') return 'subtle';
  return 'ghost';
}

function parseVariantName(line: string): Record<string, string> | null {
  const name = line.replace(/^\s*name:\s*/, '').trim();
  if (!name.startsWith('size=')) return null;
  const o: Record<string, string> = {};
  for (const part of name.split(',').map((p) => p.trim())) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    o[part.slice(0, i)] = part.slice(i + 1);
  }
  return o;
}

function bool(s: string): boolean {
  return s === 'true';
}

function rowKey(o: Record<string, string>): string {
  return JSON.stringify({
    attention: o.attention,
    condensed: o.condensed,
    contained: o.contained,
    fullWidth: o.fullWidth,
    start: o.start,
    end: o.end,
  });
}

function variantId(size: string, row: RowCombo): string {
  const sz = size.toLowerCase();
  const { variant, attention, state } = row;
  const base = `button-${sz}-${variant}-${attention}-${state}`;
  if (
    !row.condensed &&
    row.contained &&
    !row.fullWidth &&
    !row.start &&
    !row.end
  ) {
    return base;
  }
  const f = (b: boolean) => (b ? '1' : '0');
  return `${base}-c${f(row.condensed)}-co${f(row.contained)}-fw${f(row.fullWidth)}-s${f(row.start)}-e${f(row.end)}`;
}

function main() {
  const dumpPath = process.argv[2];
  if (!dumpPath) {
    console.error(
      'Usage: tsx scripts/build-button-figma-grid-fixture.mts <path-to-get_figma_data.txt>',
    );
    process.exit(1);
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const appRoot = join(__dirname, '..');
  const existingPath = join(appRoot, 'fixtures', 'figma-parity.fixture.json');
  const outPath = existingPath;

  let oldExpectById = new Map<string, ExpectBlock>();
  try {
    const old = JSON.parse(readFileSync(existingPath, 'utf8')) as {
      variants?: Array<{ id: string; expect?: ExpectBlock }>;
    };
    for (const v of old.variants ?? []) {
      if (v.expect) oldExpectById.set(v.id, v.expect);
    }
  } catch {
    oldExpectById = new Map();
  }

  const text = readFileSync(dumpPath, 'utf8');
  const lines = text.split('\n');
  const rawNames: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s+name:\s/.test(line)) continue;
    const next = lines[i + 1];
    if (!next || !next.includes(`componentSetId: ${COMPONENT_SET_ID}`)) continue;
    const o = parseVariantName(line);
    if (o) rawNames.push(line.replace(/^\s*name:\s*/, '').trim());
  }

  const parsed = rawNames.map((name) => {
    const o: Record<string, string> = {};
    for (const part of name.split(',').map((p) => p.trim())) {
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      o[part.slice(0, idx)] = part.slice(idx + 1);
    }
    return o;
  });

  if (parsed.length === 0) {
    console.error('No Button variants found for componentSetId', COMPONENT_SET_ID);
    process.exit(1);
  }

  const sizes = [...new Set(parsed.map((p) => p.size))].sort((a, b) => {
    const order = ['XS', 'S', 'M', 'L', 'XL'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const rowMap = new Map<string, RowCombo>();
  for (const o of parsed) {
    const rk = rowKey(o);
    if (!rowMap.has(rk)) {
      rowMap.set(rk, {
        variant: attentionToVariant(o.attention),
        attention: o.attention as RowCombo['attention'],
        state: 'default',
        condensed: bool(o.condensed),
        contained: bool(o.contained),
        fullWidth: bool(o.fullWidth),
        start: bool(o.start),
        end: bool(o.end),
      });
    }
  }
  const combinations = [...rowMap.values()].sort((a, b) => {
    const keys: (keyof RowCombo)[] = [
      'variant',
      'attention',
      'state',
      'condensed',
      'contained',
      'fullWidth',
      'start',
      'end',
    ];
    for (const k of keys) {
      const av = a[k];
      const bv = b[k];
      if (av === bv) continue;
      if (typeof av === 'boolean') return Number(av) - Number(bv);
      return String(av).localeCompare(String(bv));
    }
    return 0;
  });

  const variants = parsed.map((o) => {
    const size = o.size;
    const row: RowCombo = {
      variant: attentionToVariant(o.attention),
      attention: o.attention as RowCombo['attention'],
      state: 'default',
      condensed: bool(o.condensed),
      contained: bool(o.contained),
      fullWidth: bool(o.fullWidth),
      start: bool(o.start),
      end: bool(o.end),
    };
    const id = variantId(size, row);
    const props = {
      size,
      variant: row.variant,
      attention: row.attention,
      state: row.state,
      condensed: row.condensed,
      contained: row.contained,
      fullWidth: row.fullWidth,
      start: row.start,
      end: row.end,
      appearance: FIGMA_CANVAS_DEFAULT_PROPS.appearance,
      loading: FIGMA_CANVAS_DEFAULT_PROPS.loading,
    };
    const expect = oldExpectById.get(id);
    return expect ? { id, props, expect } : { id, props };
  });

  const fixture = {
    meta: {
      figmaUrl:
        'https://www.figma.com/design/mH1yPtRJzZSNCS0kX737t6/OneUI?node-id=373-5376',
      componentName: 'Button',
      componentSetId: COMPONENT_SET_ID,
      documentType: 'COMPONENT_SET' as const,
      fetchedAt: new Date().toISOString(),
      totalVariants: variants.length,
      figmaContext: {
        variantNameProperties: [
          'size',
          'attention',
          'condensed',
          'contained',
          'fullWidth',
          'start',
          'end',
        ],
        notEncodedInVariantNames: [
          'Appearance (e.g. Primary), Surface, Theme, Colour mode, Platform, Density, Language, Brand, Material, Loading, Disabled — Figma variable / mode rows on the instance or page; not part of the comma-separated COMPONENT_SET variant name in REST/get_figma_data exports.',
          'Mirror them in code via Button props where they exist (appearance, loading, disabled) and via page root (index.html data-theme, data-Breakpoint, data-density) or a <Surface> wrapper for surface context.',
        ],
        canvasDefaultsAppliedToEveryVariant: FIGMA_CANVAS_DEFAULT_PROPS,
      },
      grid: {
        columns: {
          property: 'size',
          values: sizes,
        },
        rows: {
          properties: [
            'variant',
            'attention',
            'state',
            'condensed',
            'contained',
            'fullWidth',
            'start',
            'end',
          ] as const,
          combinations,
          figmaNote:
            'Figma variant names only expose attention (not variant) and have no state axis; variant is derived for <Button variant>; state is default.',
        },
      },
      uniquePropertyValues: {
        size: sizes,
        attention: [...new Set(parsed.map((p) => p.attention))].sort(),
        variant: ['bold', 'subtle', 'ghost'],
        state: ['default'],
        condensed: [false, true],
        contained: [false, true],
        fullWidth: [false, true],
        start: [false, true],
        end: [false, true],
      },
    },
    variants,
  };

  writeFileSync(outPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  console.log('Wrote', outPath, 'variants:', variants.length, 'rows:', combinations.length, 'sizes:', sizes);
}

main();
