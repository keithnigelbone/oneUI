/**
 * pdf.ts — EXP-03 / D-11 ordered multi-page PDF emitter.
 *
 * Composes a carousel into a single multi-page PDF: one frame per page, IN
 * CAROUSEL ORDER (the ordered `orderIndex` rasters from `raster.ts`, D-11). Each
 * page is sized to its frame's dimensions and the raster is drawn full-bleed.
 *
 * Uses pdf-lib's `embedPng`/`embedJpg` + `addPage([w,h])` + `drawImage` — NOT
 * Playwright `page.pdf()`, which couples PDF output to print-CSS pagination and a
 * live browser render (RESEARCH "Don't Hand-Roll"). The input rasters are already
 * the full-res per-frame bytes from the raster emitter, so composing them
 * directly is deterministic and browser-free.
 *
 * pdf-lib is the ONE net-new dependency in Phase 4 — gated by the Task 1
 * blocking human-verify legitimacy checkpoint (npm version 1.17.1, empty
 * postinstall, npmjs.com Hopding/pdf-lib, pure-JS, zero native deps) and
 * EXPLICITLY APPROVED before this install.
 */

import { PDFDocument } from 'pdf-lib';

/** A single carousel frame raster + the page dimensions it should occupy. */
export interface CarouselPdfFrame {
  /** The full-res raster bytes (PNG by default; JPEG when `format: 'jpg'`). */
  png: Buffer | Uint8Array;
  /** Page width (px) — equals the frame's resolved canvas width. */
  width: number;
  /** Page height (px) — equals the frame's resolved canvas height. */
  height: number;
  /** Raster encoding. Defaults to 'png'; pass 'jpg' for a JPEG raster. */
  format?: 'png' | 'jpg';
}

/**
 * Compose ordered per-frame full-res rasters into ONE multi-page PDF — one frame
 * per page, page-sized to the frame, in the input (carousel `orderIndex`) order
 * (EXP-03 / D-11). The frames are embedded in the order passed; they are NEVER
 * reordered.
 */
export async function composeCarouselPdf(
  frames: CarouselPdfFrame[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  // Embed IN ORDER — the input array order IS the carousel orderIndex (D-11).
  for (const frame of frames) {
    const img =
      frame.format === 'jpg'
        ? await doc.embedJpg(frame.png)
        : await doc.embedPng(frame.png);
    // One frame per page, page sized to the frame dimensions.
    const page = doc.addPage([frame.width, frame.height]);
    // Full-bleed draw — the raster fills the page (no margins).
    page.drawImage(img, { x: 0, y: 0, width: frame.width, height: frame.height });
  }

  return doc.save();
}
