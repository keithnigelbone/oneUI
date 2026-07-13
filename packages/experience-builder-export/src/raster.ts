/**
 * raster.ts — EXP-02 / D-10 native-size raster emitter (PNG / JPG).
 *
 * Re-renders the artifact's PERSISTED compiled bundle at the FOUNDATION-RESOLVED
 * native size (e.g. 1080×1080) with a `pixelDensity`-derived `deviceScaleFactor`
 * — NOT the eval/preview default viewport, NOT the hardcoded `deviceScaleFactor:
 * 2` (Pitfall 5). For `units: 'mm'` print canvases (A4, Business Card) the
 * width/height are converted to CSS px via `mmToPx(value, ppi)` BEFORE the
 * viewport is set (Pitfall 6) — `ppi` (pixels-per-inch), NOT `pixelDensity` (the
 * device pixel ratio, which only drives `deviceScaleFactor`). PNG and JPG are
 * both supported (D-10).
 *
 * The Playwright capture itself lives in `apps/platform/src/lib/playwrightRenderer.ts`
 * (it imports `playwright`, a Node/chromium-only dep). To keep this package pure,
 * deterministic, and unit-testable WITHOUT a live browser, the capture function is
 * DEPENDENCY-INJECTED (the established `foundationsLoader`/`previewExecutor`
 * injection idiom in the agents package). The export route wires the real
 * `captureCodeScreenshots`; tests inject a spy. The render stays in the SAME
 * credential-free path eval screenshots use (PREV-01 — no auth/session/Convex
 * token reaches the rendered bundle; the bundle is the brand's own compiled
 * artifact).
 */

import { mmToPx } from '@oneui/shared';
import type { ResolvedDimensionsT } from '@oneui/experience-builder-core';

/** The compiled bundle to re-render (mirror of the persisted `compiledBundle`). */
export interface RasterCompiledBundle {
  code: string;
}

/** The viewport the capture function is asked to render at (CSS px). */
export interface CaptureViewport {
  width: number;
  height: number;
  label: string;
}

/** What the injected capture function is called with. Mirrors the platform
 *  `CaptureCodeInput` shape so the route can pass `captureCodeScreenshots`
 *  directly. */
export interface RasterCaptureInput {
  code: string;
  viewports: CaptureViewport[];
  deviceScaleFactor: number;
  format: 'png' | 'jpeg';
  quality?: number;
}

/** A single captured raster (bytes + the viewport label it was captured at). */
export interface RasterCaptureResult {
  viewport: string;
  png: Buffer;
}

/** The injected capture function (the real one is `captureCodeScreenshots`). */
export type RasterCaptureFn = (
  input: RasterCaptureInput,
) => Promise<RasterCaptureResult[]>;

export interface ExportRasterInput {
  /** The PERSISTED compiled bundle (read, never re-generated). */
  compiledBundle: RasterCompiledBundle;
  /** The foundation-resolved canvas dimensions (D-10 / Pitfall 5/6). */
  resolvedDimensions: ResolvedDimensionsT;
  /** Delivery format — PNG or JPG (D-10). */
  format: 'png' | 'jpg';
  /** Optional JPG quality 0–100 (ignored for PNG). */
  quality?: number;
  /** A label for the capture (defaults to the output profile or 'export'). */
  label?: string;
}

export interface ExportRasterResult {
  /** The full-res raster bytes (PNG or JPEG per `format`). */
  bytes: Buffer;
  /** The actual px viewport the bundle was rendered at. */
  viewport: { width: number; height: number };
  /** The device scale factor used (= the foundation's pixelDensity). */
  deviceScaleFactor: number;
  /** The encoding used ('png' | 'jpeg'). */
  encoding: 'png' | 'jpeg';
}

/**
 * Re-render the compiled bundle at the foundation-resolved native size (EXP-02 /
 * D-10). The capture function is injected so this stays unit-testable without a
 * live browser; the export route wires `captureCodeScreenshots`.
 */
export async function exportRaster(
  input: ExportRasterInput,
  capture: RasterCaptureFn,
): Promise<ExportRasterResult> {
  const { resolvedDimensions: dims } = input;

  // Pitfall 6: mm-unit print canvases (A4 = 210×297mm) MUST be converted to CSS
  // px via mmToPx at the canvas's `ppi` (pixels-per-inch: 72/300) BEFORE the
  // viewport is set — never render `210×297` raw px, and NEVER pass
  // `pixelDensity` (the device pixel ratio 1/2/3) where ppi is expected: an A4 at
  // ppi 300 is ~2480px wide, but at pixelDensity 1 it would collapse to ~8px.
  // px canvases pass through unchanged.
  const width =
    dims.units === 'mm' ? mmToPx(dims.width, dims.ppi) : dims.width;
  const height =
    dims.units === 'mm' ? mmToPx(dims.height, dims.ppi) : dims.height;

  // Pitfall 5 / D-10: deviceScaleFactor is the foundation's pixelDensity, NOT the
  // hardcoded 2 and NOT a guess. A 1080×1080 IG post at pixelDensity 1 is 1080
  // device px; at 2 it's 2160 — match the foundation.
  const deviceScaleFactor = dims.pixelDensity;
  const encoding: 'png' | 'jpeg' = input.format === 'jpg' ? 'jpeg' : 'png';
  const label = input.label ?? 'export';

  const captures = await capture({
    code: input.compiledBundle.code,
    // Pitfall 5: the export viewport is the foundation-resolved size — NEVER the
    // eval DEFAULT_VIEWPORTS.mobile default.
    viewports: [{ width, height, label }],
    deviceScaleFactor,
    format: encoding,
    ...(input.quality != null ? { quality: input.quality } : {}),
  });

  const first = captures[0];
  if (!first) {
    throw new Error('exportRaster: capture returned no frames');
  }

  return {
    bytes: first.png,
    viewport: { width, height },
    deviceScaleFactor,
    encoding,
  };
}
