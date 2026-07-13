/**
 * generate-visual-signatures.ts — kb-rn visual-signature pipeline.
 *
 * Mirror of the kb-web pipeline (round 4, F.4.b) targeting React Native.
 * Variant enumeration + pHash + Hamming distance live in @jds/kb-core so
 * web and rn share one implementation.
 *
 * Goal: each chassis component gets 8..16 deterministic variant renders.
 * Each render produces a PNG, a perceptual hash, and an entry in the
 * package-level reverse-index. Total budget for kb-rn round 1: 5 chassis
 * components (Button + Card + Surface + Text + Icon) × ~8 variants = ~40 PNGs.
 *
 * Pipeline:
 *   1. Read ROUND_1_COMPONENTS (the chassis subset of kb-rn's ALL_COMPONENTS).
 *   2. For each meta, enumerateVariants(meta) → readonly VariantTuple[]
 *      (capped at 16 per component, deterministic axis order).
 *   3. Open a render harness (DetoxRenderer → device target → tap the
 *      apps/native-components-sample detail screen for each (component,
 *      variantId)).
 *   4. Capture PNG at the device's logical-px size (NOT @2x like web).
 *   5. Compute pHash via @jds/kb-core (sharp + DCT, identical to web).
 *   6. Write PNGs to dist/visual-signatures/<Component>/<variantId>.png.
 *   7. Patch each component's meta with the populated `visualSignatures`
 *      array (re-emit dist/components/<Component>.json + components.json).
 *   8. Emit dist/visual-signature-index.json — the by-hash reverse lookup
 *      stamped sdk='rn'.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Status: scaffold + MockRNRenderer for tests.                    │
 * │                                                                  │
 * │ The DetoxRenderer below is a STUB. Wiring real Detox against     │
 * │ apps/native-components-sample is the next sub-task — depends on  │
 * │ Detox CI infrastructure (iOS + Android simulators / emulators).  │
 * │ The Renderer interface here is identical to kb-web's so once     │
 * │ Detox lands, the run() loop is unchanged.                        │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Key RN/web differences captured in the emitted VisualSignature:
 *   - canonicalSize captures iOS / Android LOGICAL points (pt / dp), not
 *     @2x browser pixels. Consumers normalise on read.
 *   - capturedFrom = 'rn-storybook' (vs web's 'storybook').
 *   - The harness drives apps/native-components-sample directly — there is
 *     no Storybook on RN today; future @storybook/react-native integration
 *     swaps the renderer adapter, not the run() loop.
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

// ── pHash (identical to kb-web — DCT-II / 32x32 / median threshold) ───────
//
// Duplicated locally (not promoted to kb-core) because the pHash implementation
// imports `sharp`, a heavy native module. Each SDK's generator script imports
// it directly so kb-core stays free of native peer deps.

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
    for (let x = 0; x < DCT_INPUT_SIZE; x++) row.push(raw[y * DCT_INPUT_SIZE + x]!);
    matrix.push(row);
  }
  const dct = dct2d(matrix);

  const coefficients: number[] = [];
  for (let u = 0; u < DCT_HASH_SIZE; u++) {
    for (let v = 0; v < DCT_HASH_SIZE; v++) {
      coefficients.push(dct[u]![v]!);
    }
  }
  const forMedian = coefficients.slice(1).slice().sort((a, b) => a - b);
  const mid = Math.floor(forMedian.length / 2);
  const median = forMedian.length % 2 === 0
    ? (forMedian[mid - 1]! + forMedian[mid]!) / 2
    : forMedian[mid]!;

  let bits = '';
  for (const c of coefficients) bits += c > median ? '1' : '0';
  let hex = '';
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

// ── Renderer interface (RN) ───────────────────────────────────────────────

export interface RNRenderedCapture {
  readonly pngBytes: Uint8Array;
  /**
   * iOS / Android LOGICAL size at @1x (UIKit points / Android dp). Web uses
   * @2x browser pixels — RN's logical size is what apps actually lay out
   * against. Consumers normalise on read; the field semantics differ from
   * kb-web on purpose.
   */
  readonly canonicalSize: { width: number; height: number };
  readonly aspectRatio: number;
  /** Effective pixel density at capture time (1, 2, or 3 — iOS @2x/@3x; Android xhdpi/xxhdpi/xxxhdpi). */
  readonly pixelDensity: 1 | 2 | 3;
}

export interface RNRenderer {
  /** Boot the device harness (Detox session + cold app launch). */
  start(): Promise<void>;
  /** Navigate to the component's detail screen, set the variantTuple's props, capture. */
  capture(t: VariantTuple, importPath: string): Promise<RNRenderedCapture>;
  /** Tear down the device session. */
  stop(): Promise<void>;
}

// ── DetoxRenderer — STUB (real implementation lands when Detox CI is up) ──

/**
 * Drives apps/native-components-sample via Detox. Boots an iOS Simulator
 * (or Android Emulator), launches the app with `initialRouteName='Detail'`
 * + `initialParams={ id: <component slug> }`, sets variant props through
 * the detail screen's prop inspector (TODO — needs an inspector to be
 * added to native-components-sample's detail route), captures the
 * component frame.
 *
 * NOT IMPLEMENTED in this round. The Renderer interface is the actionable
 * contract; the Detox wiring is a follow-up sub-task that needs:
 *   - Detox config (detox.config.ts) in apps/native-components-sample
 *   - testID anchors on every chassis component instance
 *   - A prop-inspector route or a deep-link variant-encoder
 *   - iOS Simulator + Android Emulator in CI
 */
export class DetoxRenderer implements RNRenderer {
  // eslint-disable-next-line class-methods-use-this
  async start(): Promise<void> {
    throw new Error(
      '[DetoxRenderer] not implemented. Wire Detox against ' +
        'apps/native-components-sample first. See the comment block in this file.',
    );
  }
  // eslint-disable-next-line class-methods-use-this
  async capture(_t: VariantTuple, _importPath: string): Promise<RNRenderedCapture> {
    throw new Error('[DetoxRenderer] not implemented.');
  }
  // eslint-disable-next-line class-methods-use-this
  async stop(): Promise<void> { /* no-op */ }
}

// ── CLI entrypoint ────────────────────────────────────────────────────────

interface MetaLike {
  readonly name: string;
  readonly importPath: string;
  readonly propsSchema: { properties: Record<string, unknown> };
}

export interface RunArgs {
  readonly metas: readonly MetaLike[];
  readonly renderer: RNRenderer;
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
        byHash[hash] = { component: meta.name, variantId: t.variantId, sdk: 'rn' };
        total += 1;
      }
    }
  } finally {
    await args.renderer.stop();
  }

  const index: VisualSignatureIndex = {
    schemaVersion: KB_SCHEMA_VERSION,
    kbVersion: KB_VERSION,
    sdk: 'rn',
    generatedAt: capturedAt,
    totalSignatures: total,
    byHash,
  };
  writeFileSync(
    join(distDir, 'visual-signature-index.json'),
    JSON.stringify(index, null, 2) + '\n',
  );
  return index;
}

// ── Round-1 scope: chassis subset ─────────────────────────────────────────
//
// Imported here (not auto-detected from ALL_COMPONENTS) so reviewers can see
// the round-1 scope at a glance. Expanding adds the meta to this tuple and
// reruns the script — no other changes.
//
// Chassis = the 5 components that DevLens's screenshot recognizer needs most
// against Coffee Shop / production app surfaces.
export const ROUND_1_COMPONENT_NAMES = [
  'Button',
  'Card',
  'Surface',
  'Text',
  'Icon',
] as const;
