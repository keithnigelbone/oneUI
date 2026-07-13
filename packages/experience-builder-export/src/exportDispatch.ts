/**
 * exportDispatch.ts — pure export-kind → emitter routing.
 *
 * The export route (`/api/experience-lab/export`) handles I/O (Convex reads, the
 * live Playwright capture, `_storage` upload). The KIND → EMITTER decision is
 * extracted here as a pure, dependency-injected function so it is unit-testable
 * WITHOUT a live browser or Convex:
 *
 *   - `code`      → exportCode      (persisted TSX + Jio CSS, no re-gen — EXP-01)
 *   - `png`/`jpg` → exportRaster    (native-size re-render, format set — EXP-02)
 *   - `pdf`       → re-render each ordered frame raster (ascending orderIndex)
 *                   then composeCarouselPdf (one frame/page, carousel order — EXP-03)
 *   - anything else → rejected (never silently defaults to an emitter)
 *
 * The emitters are passed in (DI), mirroring the established
 * `foundationsLoader`/`previewExecutor` injection idiom — tests inject spies; the
 * route injects the real `exportCode`/`exportRaster`/`composeCarouselPdf`.
 */

import type { ExportCodeInput, ExportCodeResult } from './code';
import type { ExportRasterInput, ExportRasterResult } from './raster';
import type { CarouselPdfFrame } from './pdf';

/** The four export kinds (D-13). */
export type ExportKind = 'code' | 'png' | 'jpg' | 'pdf';

/** A per-frame raster job for the PDF path, carrying its carousel order. The
 *  raster is always re-rendered as PNG for embedding, so `format` is set by the
 *  dispatch — callers omit it. */
export interface PdfFrameJob {
  /** Carousel position — frames are composed in ASCENDING orderIndex. */
  orderIndex: number;
  /** The raster input for this frame (bundle + resolved dims). */
  raster: Omit<ExportRasterInput, 'format'>;
}

/** The dispatch input — discriminated on `kind`. */
export type DispatchExportInput =
  | { kind: 'code'; code: ExportCodeInput }
  | { kind: 'png'; raster: Omit<ExportRasterInput, 'format'> }
  | { kind: 'jpg'; raster: Omit<ExportRasterInput, 'format'> }
  | { kind: 'pdf'; frames: PdfFrameJob[] };

/** The emitters the dispatch routes to (injected). */
export interface ExportEmitters {
  exportCode: (input: ExportCodeInput) => ExportCodeResult;
  exportRaster: (input: ExportRasterInput) => Promise<ExportRasterResult>;
  composeCarouselPdf: (frames: CarouselPdfFrame[]) => Promise<Uint8Array>;
}

/** The dispatch result — discriminated on `kind` so callers can persist bytes. */
export type DispatchExportResult =
  | { kind: 'code'; payload: ExportCodeResult }
  | { kind: 'png' | 'jpg'; payload: ExportRasterResult }
  | { kind: 'pdf'; payload: Uint8Array };

/**
 * Route an export request to exactly one emitter (EXP-01/02/03 / D-13). Pure +
 * deterministic — all I/O is injected via `emitters`. Rejects an unknown kind
 * rather than silently defaulting to an emitter.
 */
export async function dispatchExport(
  input: DispatchExportInput,
  emitters: ExportEmitters,
): Promise<DispatchExportResult> {
  switch (input.kind) {
    case 'code': {
      const payload = emitters.exportCode(input.code);
      return { kind: 'code', payload };
    }
    case 'png': {
      const payload = await emitters.exportRaster({ ...input.raster, format: 'png' });
      return { kind: 'png', payload };
    }
    case 'jpg': {
      const payload = await emitters.exportRaster({ ...input.raster, format: 'jpg' });
      return { kind: 'jpg', payload };
    }
    case 'pdf': {
      // Compose the ordered per-frame rasters one frame per page (D-11). Sort by
      // ascending orderIndex FIRST so a caller passing frames out of order still
      // yields a carousel-ordered PDF; re-render each frame as PNG, then compose.
      const ordered = [...input.frames].sort((a, b) => a.orderIndex - b.orderIndex);
      const pdfFrames: CarouselPdfFrame[] = [];
      for (const job of ordered) {
        const raster = await emitters.exportRaster({ ...job.raster, format: 'png' });
        pdfFrames.push({
          png: raster.bytes,
          width: raster.viewport.width,
          height: raster.viewport.height,
          format: 'png',
        });
      }
      const payload = await emitters.composeCarouselPdf(pdfFrames);
      return { kind: 'pdf', payload };
    }
    default: {
      // Exhaustive guard — an unknown kind is rejected, never silently routed.
      const exhaustive: never = input;
      throw new Error(
        `dispatchExport: unknown export kind "${(exhaustive as { kind?: string }).kind ?? 'undefined'}"`,
      );
    }
  }
}
