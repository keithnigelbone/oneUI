import { describe, expect, test } from 'vitest';
import sharp from 'sharp';
import {
  KB_SCHEMA_VERSION,
  KB_VERSION,
  PHASH_HAMMING_THRESHOLD,
  type VisualSignatureIndex,
} from '@jds/kb-core';
import {
  enumerateVariants,
  hammingDistance,
  perceptualHash,
  run,
  type Renderer,
} from '../scripts/generate-visual-signatures';
import { JDSButton, JDSSurface, JDSText, JDSBanner } from '../src';

// ── Fixture helper ──────────────────────────────────────────────────────
// Low-frequency radial gradient — mimics real component renders (large
// smooth regions). pHash shift-invariance only holds for low-frequency
// signals; a high-frequency stripe pattern would diverge by ~18 bits
// after a 10-px shift even though the visual is "the same."
//
// The single `variant` integer is decorrelated into three perceptual axes
// (centre-x, centre-y, cosine phase) via independent low-prime hashes so
// distinct integers reliably produce distinct images. Empirically zero
// collisions across the chassis roster's 100+ variantIds.
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

class MockRenderer implements Renderer {
  public starts = 0;
  public stops = 0;
  public captured: Array<{ id: string; importPath: string }> = [];
  async start(): Promise<void> { this.starts += 1; }
  async stop(): Promise<void> { this.stops += 1; }
  async capture(t: { variantId: string }, importPath: string) {
    this.captured.push({ id: t.variantId, importPath });
    // FNV-1a-ish hash of the variantId → seed. Spread broadly so the
    // fixture's variant→(cx,cy,phase) decorrelation receives distinct
    // input per ID. Empirically zero pHash collisions across the chassis.
    let seed = 2166136261;
    for (let i = 0; i < t.variantId.length; i++) {
      seed = (seed ^ t.variantId.charCodeAt(i)) * 16777619;
      seed = seed >>> 0;
    }
    const pngBytes = await makeFixturePng({ variant: seed });
    return {
      pngBytes,
      canonicalSize: { width: 200, height: 200 },
      aspectRatio: 1,
    };
  }
}

describe('enumerateVariants', () => {
  test('Button enumerates appearance × variant × size, capped at 16', () => {
    const tuples = enumerateVariants(JDSButton);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples.length).toBeLessThanOrEqual(16);
    const ids = new Set(tuples.map((t) => t.variantId));
    expect(ids.size).toBe(tuples.length); // uniqueness
    expect(tuples[0]!.variantId).toMatch(/^Button\./);
  });

  test('Text enumerates role-related axes', () => {
    const tuples = enumerateVariants(JDSText);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples[0]!.variantId).toMatch(/^Text\./);
  });

  test('Surface (no enum-defined size axis) collapses to at most 16 tuples', () => {
    const tuples = enumerateVariants(JDSSurface);
    expect(tuples.length).toBeGreaterThan(0);
    expect(tuples.length).toBeLessThanOrEqual(16);
  });

  test('Banner enumerates tone (4) × no size', () => {
    const tuples = enumerateVariants(JDSBanner);
    const tones = new Set(tuples.map((t) => t.properties.tone));
    expect(tones.has('informative')).toBe(true);
    expect(tones.has('negative')).toBe(true);
  });
});

describe('perceptualHash — sharp + DCT', () => {
  test('returns 16-char hex per input', async () => {
    const a = await makeFixturePng({ variant: 1 });
    const h = await perceptualHash(a);
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });

  test('deterministic — same input produces the same hash across runs', async () => {
    const png = await makeFixturePng({ variant: 7 });
    const h1 = await perceptualHash(png);
    const h2 = await perceptualHash(png);
    expect(h1).toBe(h2);
  });

  test('different visual content → different hash (proves not constant)', async () => {
    const a = await makeFixturePng({ variant: 1 });
    const b = await makeFixturePng({ variant: 9 });
    expect(await perceptualHash(a)).not.toBe(await perceptualHash(b));
  });

  test('10-px shift has Hamming distance ≤ 16 (proves NOT sha-256-in-disguise)', async () => {
    const original = await makeFixturePng({ variant: 3, shiftX: 0, shiftY: 0 });
    const shifted = await makeFixturePng({ variant: 3, shiftX: 10, shiftY: 0 });
    const dist = hammingDistance(await perceptualHash(original), await perceptualHash(shifted));
    // Bound is 16 / 64 = 25% — well above PHASH_HAMMING_THRESHOLD (5) which
    // applies to "same render, no edits". A sha256 prefix would average
    // 32/64 = 50%; landing ≤16 confirms structural similarity, not byte
    // similarity. pHash literature reports 5–15 bits for ~5% translations
    // of low-frequency content (e.g. component renders).
    expect(dist).toBeLessThanOrEqual(16);
  });

  test('Hamming distance to PHASH_HAMMING_THRESHOLD: identical inputs distance == 0', async () => {
    const png = await makeFixturePng({ variant: 5 });
    const dist = hammingDistance(await perceptualHash(png), await perceptualHash(png));
    expect(dist).toBe(0);
    expect(dist).toBeLessThan(PHASH_HAMMING_THRESHOLD);
  });
});

describe('hammingDistance', () => {
  test('zero for identical hashes', () => {
    expect(hammingDistance('aabb01ff34567890', 'aabb01ff34567890')).toBe(0);
  });
  test('64 for fully-inverted hashes', () => {
    expect(hammingDistance('0000000000000000', 'ffffffffffffffff')).toBe(64);
  });
  test('counts bit-level XOR popcount', () => {
    expect(hammingDistance('0000000000000000', '0000000000000001')).toBe(1);
    expect(hammingDistance('0000000000000000', '0000000000000003')).toBe(2);
  });
});

describe('run — index emission + drift stamp', () => {
  test('index stamped with KB_SCHEMA_VERSION + KB_VERSION + sdk=web', async () => {
    const renderer = new MockRenderer();
    const idx: VisualSignatureIndex = await run({
      metas: [JDSBanner],
      renderer,
      nowIso: '2026-05-13T00:00:00.000Z',
    });
    expect(idx.schemaVersion).toBe(KB_SCHEMA_VERSION);
    expect(idx.kbVersion).toBe(KB_VERSION);
    expect(idx.sdk).toBe('web');
    expect(idx.generatedAt).toBe('2026-05-13T00:00:00.000Z');
    expect(idx.totalSignatures).toBeGreaterThan(0);
    expect(Object.keys(idx.byHash).length).toBe(idx.totalSignatures);
    expect(renderer.starts).toBe(1);
    expect(renderer.stops).toBe(1);
  });

  test('consumer drift assert: index.kbVersion === manifest.kbVersion', async () => {
    const renderer = new MockRenderer();
    const idx = await run({
      metas: [JDSBanner],
      renderer,
      nowIso: '2026-05-13T00:00:00.000Z',
    });
    expect(idx.kbVersion).toBe(KB_VERSION);
  });
});
