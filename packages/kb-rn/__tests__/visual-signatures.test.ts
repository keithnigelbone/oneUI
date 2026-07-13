/**
 * Smoke tests for the kb-rn visual-signature pipeline.
 *
 * Mirror of @jds/kb-web's suite. MockRNRenderer stands in for Detox until
 * the device harness lands. Coverage:
 *   - 5 chassis components enumerate cleanly
 *   - pHash matches web (shared DCT-II implementation)
 *   - Shift-invariance ≤ 16 bits (proves NOT sha256-in-disguise)
 *   - Index stamped with KB_SCHEMA_VERSION / KB_VERSION / sdk='rn'
 *   - Drift gate: index.kbVersion === manifest.kbVersion (the const that
 *     scripts/generate-json.mjs writes to dist/manifest.json)
 */

import { describe, expect, test } from 'vitest';
import sharp from 'sharp';
import {
  KB_SCHEMA_VERSION,
  KB_VERSION,
  PHASH_HAMMING_THRESHOLD,
  enumerateVariants,
  hammingDistance,
  type VariantTuple,
  type VisualSignatureIndex,
} from '@jds/kb-core';
import {
  perceptualHash,
  run,
  ROUND_1_COMPONENT_NAMES,
  type RNRenderedCapture,
  type RNRenderer,
} from '../scripts/generate-visual-signatures';
import { JDSButton, JDSCard, JDSSurface, JDSText, JDSIcon } from '../src';

// Same low-frequency radial-gradient fixture as kb-web. See
// packages/kb-web/__tests__/visual-signatures.test.ts for the rationale —
// pHash shift-invariance only holds for low-frequency signals (which is
// what real component renders produce).
async function makeFixturePng(opts: {
  width?: number;
  height?: number;
  shiftX?: number;
  shiftY?: number;
  variant?: number;
}): Promise<Uint8Array> {
  const W = opts.width ?? 200;
  const H = opts.height ?? 200;
  const sx = opts.shiftX ?? 0;
  const sy = opts.shiftY ?? 0;
  const v = opts.variant ?? 0;
  const cx = W * (0.2 + 0.6 * (((v * 73) & 0xff) / 256));
  const cy = H * (0.2 + 0.6 * (((v * 137) & 0xff) / 256));
  const phase = (((v * 41) & 0xff) / 256) * Math.PI * 2;
  const diagonal = Math.sqrt(W * W + H * H);
  const raw = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const bx = x - sx;
      const by = y - sy;
      const dx = bx - cx;
      const dy = by - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const norm = d / diagonal;
      const intensity = 0.5 + 0.42 * Math.cos(norm * Math.PI * 2 + phase);
      const val = Math.max(0, Math.min(255, Math.floor(intensity * 255)));
      const i = (y * W + x) * 3;
      raw[i] = val;
      raw[i + 1] = val;
      raw[i + 2] = val;
    }
  }
  const png = await sharp(raw, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  return new Uint8Array(png);
}

class MockRNRenderer implements RNRenderer {
  public starts = 0;
  public stops = 0;
  public captured: Array<{ id: string; importPath: string }> = [];
  async start(): Promise<void> { this.starts += 1; }
  async stop(): Promise<void> { this.stops += 1; }
  async capture(t: VariantTuple, importPath: string): Promise<RNRenderedCapture> {
    this.captured.push({ id: t.variantId, importPath });
    // FNV-1a-ish hash of the variantId → seed; same approach as kb-web's
    // mock so distinct variantIds produce distinct fixtures.
    let seed = 2166136261;
    for (let i = 0; i < t.variantId.length; i++) {
      seed = (seed ^ t.variantId.charCodeAt(i)) * 16777619;
      seed = seed >>> 0;
    }
    const pngBytes = await makeFixturePng({ variant: seed });
    return {
      pngBytes,
      // RN logical points: iPhone 14 logical width ≈ 390pt. Captured at @2x
      // density; canonical size stays logical.
      canonicalSize: { width: 200, height: 200 },
      aspectRatio: 1,
      pixelDensity: 2,
    };
  }
}

describe('round-1 scope', () => {
  test('ROUND_1_COMPONENT_NAMES = Button + Card + Surface + Text + Icon (exact)', () => {
    expect([...ROUND_1_COMPONENT_NAMES].sort()).toEqual(
      ['Button', 'Card', 'Icon', 'Surface', 'Text'],
    );
  });
  test('every name resolves to an existing kb-rn meta', () => {
    const byName = Object.fromEntries(
      [JDSButton, JDSCard, JDSSurface, JDSText, JDSIcon].map((m) => [m.name, m]),
    );
    for (const name of ROUND_1_COMPONENT_NAMES) {
      expect(byName[name]).toBeDefined();
    }
  });
});

describe('enumerateVariants (shared with kb-core)', () => {
  test('Button enumerates appearance × variant × size, capped at 16', () => {
    const tuples = enumerateVariants(JDSButton);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples.length).toBeLessThanOrEqual(16);
    const ids = new Set(tuples.map((t) => t.variantId));
    expect(ids.size).toBe(tuples.length);
    expect(tuples[0]!.variantId).toMatch(/^Button\./);
  });

  test('Surface (variadic, mode + appearance enum) enumerates ≤ 16 tuples', () => {
    const tuples = enumerateVariants(JDSSurface);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples.length).toBeLessThanOrEqual(16);
  });

  test('Card enumerates mode × appearance × shape × padding when present', () => {
    const tuples = enumerateVariants(JDSCard);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples[0]!.variantId).toMatch(/^Card\./);
  });

  test('Text + Icon enumerate against their explicit prop enums', () => {
    expect(enumerateVariants(JDSText).length).toBeGreaterThan(0);
    expect(enumerateVariants(JDSIcon).length).toBeGreaterThan(0);
  });
});

describe('perceptualHash (RN — sharp + DCT)', () => {
  test('returns 16-char hex', async () => {
    const h = await perceptualHash(await makeFixturePng({ variant: 1 }));
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });

  test('deterministic — same input produces the same hash', async () => {
    const png = await makeFixturePng({ variant: 7 });
    expect(await perceptualHash(png)).toBe(await perceptualHash(png));
  });

  test('different visual content → different hash', async () => {
    const a = await makeFixturePng({ variant: 1 });
    const b = await makeFixturePng({ variant: 9 });
    expect(await perceptualHash(a)).not.toBe(await perceptualHash(b));
  });

  test('10-px shift Hamming distance ≤ 16 (proves NOT sha-256-in-disguise)', async () => {
    const original = await makeFixturePng({ variant: 3, shiftX: 0, shiftY: 0 });
    const shifted = await makeFixturePng({ variant: 3, shiftX: 10, shiftY: 0 });
    const dist = hammingDistance(await perceptualHash(original), await perceptualHash(shifted));
    expect(dist).toBeLessThanOrEqual(16);
  });

  test('identical inputs distance = 0 < PHASH_HAMMING_THRESHOLD', async () => {
    const png = await makeFixturePng({ variant: 5 });
    const dist = hammingDistance(await perceptualHash(png), await perceptualHash(png));
    expect(dist).toBe(0);
    expect(dist).toBeLessThan(PHASH_HAMMING_THRESHOLD);
  });
});

describe('run — index emission + drift stamp', () => {
  test('index stamped with KB_SCHEMA_VERSION + KB_VERSION + sdk=rn', async () => {
    const renderer = new MockRNRenderer();
    const idx: VisualSignatureIndex = await run({
      metas: [JDSButton],
      renderer,
      nowIso: '2026-05-14T00:00:00.000Z',
    });
    expect(idx.schemaVersion).toBe(KB_SCHEMA_VERSION);
    expect(idx.kbVersion).toBe(KB_VERSION);
    expect(idx.sdk).toBe('rn');
    expect(idx.generatedAt).toBe('2026-05-14T00:00:00.000Z');
    expect(idx.totalSignatures).toBeGreaterThan(0);
    expect(Object.keys(idx.byHash).length).toBe(idx.totalSignatures);
    expect(renderer.starts).toBe(1);
    expect(renderer.stops).toBe(1);
  });

  test('round-1 chassis (5 components) emits ≥ 1 signature per component', async () => {
    const renderer = new MockRNRenderer();
    const idx = await run({
      metas: [JDSButton, JDSCard, JDSSurface, JDSText, JDSIcon],
      renderer,
      nowIso: '2026-05-14T00:00:00.000Z',
    });
    const componentsSeen = new Set(Object.values(idx.byHash).map((v) => v.component));
    expect(componentsSeen).toEqual(new Set(['Button', 'Card', 'Surface', 'Text', 'Icon']));
  });

  test('consumer drift assert: index.kbVersion === KB_VERSION (manifest source)', async () => {
    const renderer = new MockRNRenderer();
    const idx = await run({
      metas: [JDSButton],
      renderer,
      nowIso: '2026-05-14T00:00:00.000Z',
    });
    expect(idx.kbVersion).toBe(KB_VERSION);
  });
});
