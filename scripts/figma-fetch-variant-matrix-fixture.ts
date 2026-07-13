#!/usr/bin/env node
/**
 * PHASE 1 — FETCH FIGMA DATA (variant matrix fixture)
 *
 * Writes `packages/ui/src/__tests__/<Slug>/figma-variant-matrix.fixture.json`
 * from Figma REST `GET /v1/files/:file_key/nodes?ids=:node_id`.
 *
 * Token order: FIGMA_ACCESS_TOKEN → FIGMA_TOKEN → repo-root `.env` → apps/platform/.env.local
 * (never overrides an env var already set).
 *
 * Usage (repo root):
 *   pnpm figma-matrix:fetch Checkbox "https://www.figma.com/design/FILE/...?node-id=12-345"
 *
 * Flags:
 *   --force   Re-fetch even if fixture is newer than 24 hours.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFigmaDesignUrl } from '../apps/platform/src/lib/agents/validation/parseFigmaUrl';

import type { FigmaVariantMatrixFixture } from '../packages/ui/src/__tests__/figmaVariantMatrix.types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

type FigmaRawNode = {
  name?: string;
  type?: string;
  visible?: boolean;
  opacity?: number;
  children?: FigmaRawNode[];
  fills?: Array<{
    type?: string;
    visible?: boolean;
    opacity?: number;
    color?: { r: number; g: number; b: number };
  }>;
  strokes?: Array<{
    type?: string;
    visible?: boolean;
    color?: { r: number; g: number; b: number };
  }>;
  strokeWeight?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  absoluteBoundingBox?: { width?: number; height?: number };
};

function applyDotEnvFile(absPath: string): void {
  if (!existsSync(absPath)) return;
  const raw = readFileSync(absPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function loadEnv(): void {
  applyDotEnvFile(join(REPO_ROOT, '.env'));
  applyDotEnvFile(join(REPO_ROOT, '.env.local'));
  applyDotEnvFile(join(REPO_ROOT, 'apps/platform/.env.local'));
}

function rgb01ToCssRgb(r: number, g: number, b: number, opacity = 1): string {
  const R = Math.round(Math.max(0, Math.min(1, r)) * 255);
  const G = Math.round(Math.max(0, Math.min(1, g)) * 255);
  const B = Math.round(Math.max(0, Math.min(1, b)) * 255);
  if (opacity >= 1 - 1e-6) return `rgb(${R}, ${G}, ${B})`;
  return `rgba(${R}, ${G}, ${B}, ${opacity})`;
}

function solidFillToRgb(fill: NonNullable<FigmaRawNode['fills']>[number]): string | null {
  if (fill.type !== 'SOLID' || fill.visible === false || !fill.color) return null;
  const o = fill.opacity ?? 1;
  return rgb01ToCssRgb(fill.color.r, fill.color.g, fill.color.b, o);
}

function firstVisibleSolidRgb(node: FigmaRawNode | undefined): string | null {
  if (!node?.fills?.length) return null;
  for (const f of node.fills) {
    const css = solidFillToRgb(f);
    if (css) return css;
  }
  return null;
}

function firstVisibleStrokeRgb(node: FigmaRawNode | undefined): string | null {
  if (!node?.strokes?.length) return null;
  for (const s of node.strokes) {
    if (s.type === 'SOLID' && s.visible !== false && s.color) {
      return rgb01ToCssRgb(s.color.r, s.color.g, s.color.b);
    }
  }
  return null;
}

function parseVariantName(name: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of name.split(',')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const key = part.slice(0, eq).trim().replace(/\s+/g, '');
    const val = part.slice(eq + 1).trim();
    if (key) props[key] = val;
  }
  return props;
}

function cornerRadiusCss(node: FigmaRawNode): string {
  if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    return `${Math.round(node.cornerRadius)}px`;
  }
  const r = node.rectangleCornerRadii;
  if (Array.isArray(r) && r.length >= 4) {
    return r.map((x) => `${Math.round(typeof x === 'number' ? x : 0)}px`).join(' ');
  }
  return '0px';
}

function borderCss(node: FigmaRawNode): string {
  const w = typeof node.strokeWeight === 'number' ? node.strokeWeight : 0;
  const rgb = firstVisibleStrokeRgb(node);
  if (!rgb || w <= 0) return 'none';
  return `${w}px solid ${rgb}`;
}

function backgroundCss(node: FigmaRawNode): string {
  const rgb = firstVisibleSolidRgb(node);
  return rgb ?? 'transparent';
}

function findIconInfo(
  node: FigmaRawNode | undefined,
  depth: number,
): { visible: boolean; type: string; color: string } | null {
  if (!node || depth > 8) return null;
  const name = (node.name ?? '').toLowerCase();
  const type = node.type ?? '';
  const iconish =
    type === 'VECTOR' ||
    /icon|check|dash|arrow|close|indicator/.test(name);
  if (iconish && node.visible !== false) {
    const rgb = firstVisibleSolidRgb(node) ?? 'rgb(0, 0, 0)';
    const t = name.includes('check') ? 'check' : 'icon';
    return { visible: true, type: t, color: rgb };
  }
  if (node.children) {
    for (const c of node.children) {
      const hit = findIconInfo(c, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

function slugifyVariantId(componentName: string, props: Record<string, string>): string {
  const base = componentName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const keys = Object.keys(props).sort((a, b) => a.localeCompare(b));
  const tail = keys
    .map((k) => {
      const v = String(props[k] ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return `${k}-${v}`;
    })
    .join('-');
  return tail ? `${base}-${tail}` : `${base}-default`;
}

function collectVariantNodes(doc: FigmaRawNode): Array<{ node: FigmaRawNode; props: Record<string, string> }> {
  const t = doc.type ?? '';
  if (t === 'COMPONENT_SET' && doc.children?.length) {
    const rows = doc.children.filter((c) => c.type === 'COMPONENT');
    return rows.map((c) => ({
      node: c,
      props: parseVariantName(c.name ?? 'variant'),
    }));
  }
  return [{ node: doc, props: {} }];
}

function buildExpect(node: FigmaRawNode): FigmaVariantMatrixFixture['variants'][0]['expect'] {
  const w = node.absoluteBoundingBox?.width;
  const h = node.absoluteBoundingBox?.height;
  const opacity = typeof node.opacity === 'number' ? String(node.opacity) : '1';
  const icon = findIconInfo(node, 0);
  return {
    backgroundColor: backgroundCss(node),
    borderRadius: cornerRadiusCss(node),
    width: typeof w === 'number' ? `${Math.round(w)}px` : '0px',
    height: typeof h === 'number' ? `${Math.round(h)}px` : '0px',
    border: borderCss(node),
    opacity,
    icon:
      icon ?
        { visible: true, type: icon.type, color: icon.color }
      : { visible: false, type: 'none', color: 'rgb(0, 0, 0)' },
  };
}

async function fetchDocument(
  fileKey: string,
  nodeId: string,
  token: string,
): Promise<{ document: FigmaRawNode | null; err: string | null }> {
  const tryIds = [nodeId, nodeId.replace(/:/g, '-')];
  let lastErr: string | null = null;
  for (const id of tryIds) {
    const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(id)}`;
    const res = await fetch(url, { headers: { 'X-Figma-Token': token }, cache: 'no-store' });
    const text = await res.text();
    let json: { err?: string; nodes?: Record<string, { document?: FigmaRawNode }> };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      lastErr = `Invalid JSON (${res.status})`;
      continue;
    }
    if (!res.ok || json.err) {
      lastErr = json.err ?? `HTTP ${res.status}`;
      continue;
    }
    const first = json.nodes ? Object.values(json.nodes)[0] : undefined;
    const doc = first?.document;
    if (!doc?.name) {
      lastErr = 'Empty document';
      continue;
    }
    return { document: doc, err: null };
  }
  return { document: null, err: lastErr };
}

async function main(): Promise<void> {
  loadEnv();

  const force = process.argv.includes('--force');
  const args = process.argv.slice(2).filter((a) => a !== '--force');
  const slug = (args[0] ?? 'Checkbox').trim();
  const figmaUrl = (args[1] ?? '').trim();

  if (!figmaUrl) {
    console.error('Usage: pnpm figma-matrix:fetch <Slug> "<figma design url>" [--force]');
    process.exit(1);
  }

  const parsed = parseFigmaDesignUrl(figmaUrl);
  if (!parsed) {
    console.error('Invalid Figma URL — expected figma.com/design/... with node-id.');
    process.exit(1);
  }

  const token =
    process.env.FIGMA_ACCESS_TOKEN?.trim() || process.env.FIGMA_TOKEN?.trim() || '';
  if (!token) {
    console.error('Add FIGMA_ACCESS_TOKEN to your .env file then try again.');
    process.exit(1);
  }

  const outDir = join(REPO_ROOT, 'packages/ui/src/__tests__', slug);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'figma-variant-matrix.fixture.json');

  if (!force && existsSync(outPath)) {
    try {
      const prev = JSON.parse(readFileSync(outPath, 'utf8')) as { meta?: { fetchedAt?: string } };
      const t = prev.meta?.fetchedAt;
      if (t) {
        const age = Date.now() - new Date(t).getTime();
        if (age >= 0 && age < 24 * 3600 * 1000) {
          console.log(`Skipped: ${outPath} is fresher than 24h (use --force to re-fetch).`);
          process.exit(0);
        }
      }
    } catch {
      /* rewrite */
    }
  }

  const { document, err } = await fetchDocument(parsed.fileKey, parsed.nodeId, token);
  if (!document) {
    console.error(`Figma nodes fetch failed: ${err ?? 'unknown'}`);
    process.exit(1);
  }

  const rows = collectVariantNodes(document);
  const componentName = document.name ?? slug;

  const fixture: FigmaVariantMatrixFixture = {
    meta: {
      figmaUrl,
      fileKey: parsed.fileKey,
      nodeId: parsed.nodeId,
      componentName,
      fetchedAt: new Date().toISOString(),
      totalVariants: rows.length,
    },
    variants: rows.map(({ node, props }) => ({
      id: slugifyVariantId(componentName, props),
      props,
      expect: buildExpect(node),
    })),
  };

  writeFileSync(outPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${fixture.variants.length} variant(s)).`);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
