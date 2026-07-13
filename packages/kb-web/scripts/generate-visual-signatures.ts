/**
 * generate-visual-signatures.ts — kb-web visual-signature pipeline.
 *
 * Goal: each chassis component gets 8..16 deterministic variant renders.
 * Each render produces a PNG, a perceptual hash (pHash), and an entry in
 * the package-level reverse-index. Total budget: ~100..200 PNGs for
 * kb-web, ~2 MB gzipped.
 *
 * Pipeline:
 *   1. Read kb-web's ALL_COMPONENTS from src.
 *   2. For each meta, enumerate the canonical variant matrix from its
 *      propsSchema (appearance × surface × size × density-where-applicable).
 *   3. Open a render harness (Playwright → headless Chromium → a tiny HTML
 *      page that mounts the @oneui/ui component referenced by importPath).
 *   4. Capture PNG at @2x for each variant.
 *   5. Compute pHash (16-hex) using sharp + dct.
 *   6. Write PNGs to dist/visual-signatures/<Component>/<variantId>.png.
 *   7. Patch each component's meta with the populated `visualSignatures`
 *      array (re-emit dist/components/<Component>.json + components.json).
 *   8. Emit dist/visual-signature-index.json — the by-hash reverse lookup.
 *
 * Status: DRAFT. The variant enumerator + index emission are concrete and
 * unit-testable. The Playwright render step is wired against a `Renderer`
 * interface so the harness can be swapped (Storybook, standalone HTML,
 * Figma export) without touching the pipeline shape.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ BLOCKER FLAGGED IN F.4 RESPONSE                                  │
 * │                                                                  │
 * │ apps/storybook/.storybook/main.ts (line 33) throws when          │
 * │ STORYBOOK_CONVEX_URL is missing — meaning the existing storybook │
 * │ cannot boot in a sandboxed CI step without a live Convex URL.    │
 * │ Two unblock paths, both fit in <30 line patch:                   │
 * │                                                                  │
 * │ (i)  Add a `STORYBOOK_OFFLINE=1` switch to main.ts that          │
 * │      short-circuits the Convex requirement and loads brand from  │
 * │      @jds/kb-core/brands/<slug>.json (snapshotted).              │
 * │ (ii) Skip storybook entirely. The Renderer interface below has   │
 * │      a `StandaloneHarnessRenderer` adapter that boots a tiny     │
 * │      Vite dev server with one route per (component, variantId).  │
 * │                                                                  │
 * │ Recommend (i): keeps Storybook as the single source of truth for │
 * │ stories; only swaps the brand source. PR with diff in F.4 resp.  │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  KB_SCHEMA_VERSION,
  KB_VERSION,
  enumerateVariants,
  type VariantTuple,
  type VisualSignatureIndex,
} from '@jds/kb-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const signaturesDir = join(distDir, 'visual-signatures');

// Re-export the kb-core helpers under their old kb-web paths so callers that
// imported `enumerateVariants` / `VariantTuple` from this script keep working.
export { enumerateVariants, type VariantTuple } from '@jds/kb-core';

// ── Renderer interface (pluggable backend) ──────────────────────────────

export interface RenderedCapture {
  readonly pngBytes: Uint8Array;
  readonly canonicalSize: { width: number; height: number };
  readonly aspectRatio: number;
}

export interface Renderer {
  /** Boot the harness (Playwright + browser + harness URL). */
  start(): Promise<void>;
  /** Render the given variant tuple and return PNG bytes + size. */
  capture(t: VariantTuple, importPath: string): Promise<RenderedCapture>;
  stop(): Promise<void>;
}

// ── Perceptual hash ─────────────────────────────────────────────────────

/**
 * Standard DCT-pHash. Robust to crop / shift / resize within tight bounds —
 * a translated image should land within ~8 bits of Hamming distance against
 * its original (verified by the smoke test in __tests__/visual-signatures.test.ts).
 *
 * Pipeline:
 *   1. greyscale + resize to 32×32 (sharp; deterministic 'fill' fit so dimensions
 *      can't sneak into the hash)
 *   2. 2D DCT-II on the 32×32 matrix
 *   3. take the top-left 8×8 block of coefficients (low-frequency only)
 *   4. compute the median of those 64 values, excluding the DC component at
 *      [0,0] so a single very-bright tile doesn't dominate the threshold
 *   5. for each of the 64 coefficients output 1 if > median else 0
 *   6. pack as a 16-char hex string
 *
 * Compares via Hamming distance; consumers import the canonical threshold
 * from @jds/kb-core (PHASH_HAMMING_THRESHOLD) so SDKs and DevLens use the
 * same cutoff.
 */
const DCT_INPUT_SIZE = 32;
const DCT_HASH_SIZE = 8;

function dct2d(matrix: readonly number[][]): number[][] {
  const N = matrix.length;
  const sqrtN = Math.sqrt(N);
  const piOverTwoN = Math.PI / (2 * N);
  const result: number[][] = Array.from({ length: N }, () => Array<number>(N).fill(0));
  for (let u = 0; u < N; u++) {
    const au = u === 0 ? 1 / sqrtN : Math.sqrt(2 / N);
    for (let v = 0; v < N; v++) {
      const av = v === 0 ? 1 / sqrtN : Math.sqrt(2 / N);
      let sum = 0;
      for (let x = 0; x < N; x++) {
        const cx = Math.cos((2 * x + 1) * u * piOverTwoN);
        const row = matrix[x]!;
        for (let y = 0; y < N; y++) {
          sum += row[y]! * cx * Math.cos((2 * y + 1) * v * piOverTwoN);
        }
      }
      result[u]![v] = au * av * sum;
    }
  }
  return result;
}

export async function perceptualHash(png: Uint8Array): Promise<string> {
  const raw = await sharp(Buffer.from(png))
    .greyscale()
    .resize(DCT_INPUT_SIZE, DCT_INPUT_SIZE, { fit: 'fill' })
    .raw()
    .toBuffer();

  const matrix: number[][] = [];
  for (let y = 0; y < DCT_INPUT_SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < DCT_INPUT_SIZE; x++) {
      row.push(raw[y * DCT_INPUT_SIZE + x]!);
    }
    matrix.push(row);
  }

  const dct = dct2d(matrix);

  const coefficients: number[] = [];
  for (let u = 0; u < DCT_HASH_SIZE; u++) {
    for (let v = 0; v < DCT_HASH_SIZE; v++) {
      coefficients.push(dct[u]![v]!);
    }
  }

  // Median excludes DC at [0,0] (index 0) so a single very bright/dark image
  // doesn't shift every other bit. Standard pHash trick.
  const forMedian = coefficients.slice(1).slice().sort((a, b) => a - b);
  const mid = Math.floor(forMedian.length / 2);
  const median = forMedian.length % 2 === 0
    ? (forMedian[mid - 1]! + forMedian[mid]!) / 2
    : forMedian[mid]!;

  let bits = '';
  for (const c of coefficients) {
    bits += c > median ? '1' : '0';
  }

  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Bit-count Hamming distance — re-exported from @jds/kb-core (round 6). */
export { hammingDistance } from '@jds/kb-core';

// ── CLI entrypoint ──────────────────────────────────────────────────────

interface MetaLike {
  readonly name: string;
  readonly importPath: string;
  readonly propsSchema: { properties: Record<string, unknown> };
}

export interface RunArgs {
  readonly metas: readonly MetaLike[];
  readonly renderer: Renderer;
  readonly nowIso?: string;
}

export async function run(args: RunArgs): Promise<VisualSignatureIndex> {
  mkdirSync(signaturesDir, { recursive: true });
  await args.renderer.start();
  const byHash: Record<string, { component: string; variantId: string; sdk: string }> = {};
  const capturedAt = args.nowIso ?? new Date().toISOString();
  let total = 0;
  try {
    for (const meta of args.metas) {
      const componentDir = join(signaturesDir, meta.name);
      mkdirSync(componentDir, { recursive: true });
      const variants = enumerateVariants(meta);
      for (const t of variants) {
        const render = await args.renderer.capture(t, meta.importPath);
        const hash = await perceptualHash(render.pngBytes);
        const pngPath = `visual-signatures/${meta.name}/${t.variantId}.png`;
        writeFileSync(join(distDir, pngPath), render.pngBytes);
        byHash[hash] = { component: meta.name, variantId: t.variantId, sdk: 'web' };
        total += 1;
      }
    }
  } finally {
    await args.renderer.stop();
  }

  const index: VisualSignatureIndex = {
    schemaVersion: KB_SCHEMA_VERSION,
    kbVersion: KB_VERSION,
    sdk: 'web',
    generatedAt: capturedAt,
    totalSignatures: total,
    byHash,
  };
  writeFileSync(join(distDir, 'visual-signature-index.json'), JSON.stringify(index, null, 2) + '\n');
  return index;
}
