import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { composeCarouselPdf } from './pdf';

/**
 * A minimal VALID PNG (a single solid pixel). pdf-lib's `embedPng` parses the PNG
 * IHDR, so the bytes must be a real PNG; the page size is set explicitly by
 * `addPage([w,h])` in the emitter, independent of the image's intrinsic size.
 *
 * This is the canonical 1×1 transparent PNG (67 bytes), widely used in tests.
 */
const ONE_PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('composeCarouselPdf (EXP-03 / D-11)', () => {
  it('emits one page per frame, sized to the frame dimensions', async () => {
    const bytes = await composeCarouselPdf([
      { png: ONE_PX_PNG, width: 1080, height: 1080 },
      { png: ONE_PX_PNG, width: 1080, height: 1080 },
      { png: ONE_PX_PNG, width: 1080, height: 1080 },
    ]);

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      expect(width).toBe(1080);
      expect(height).toBe(1080);
    }
  });

  it('a single frame yields a 1-page PDF sized to that frame', async () => {
    const bytes = await composeCarouselPdf([
      { png: ONE_PX_PNG, width: 1080, height: 1350 },
    ]);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBe(1080);
    expect(height).toBe(1350);
  });

  it('embeds frames in the order passed (carousel orderIndex), never reordered', async () => {
    // Distinct per-frame page sizes act as order markers — page N must keep the
    // dimensions of input frame N.
    const bytes = await composeCarouselPdf([
      { png: ONE_PX_PNG, width: 100, height: 200 },
      { png: ONE_PX_PNG, width: 300, height: 400 },
      { png: ONE_PX_PNG, width: 500, height: 600 },
    ]);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    expect(doc.getPage(0).getSize()).toMatchObject({ width: 100, height: 200 });
    expect(doc.getPage(1).getSize()).toMatchObject({ width: 300, height: 400 });
    expect(doc.getPage(2).getSize()).toMatchObject({ width: 500, height: 600 });
  });
});
