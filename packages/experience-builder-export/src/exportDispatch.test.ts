import { describe, it, expect, vi } from 'vitest';
import {
  dispatchExport,
  type ExportEmitters,
  type ExportRasterInput,
} from './index';
import type { ExportRasterResult } from './raster';

function makeEmitterSpies(): ExportEmitters & {
  rasterCalls: ExportRasterInput[];
} {
  const rasterCalls: ExportRasterInput[] = [];
  return {
    rasterCalls,
    exportCode: vi.fn((input) => ({ code: input.compiledBundle.code, css: input.css })),
    exportRaster: vi.fn(async (input: ExportRasterInput): Promise<ExportRasterResult> => {
      rasterCalls.push(input);
      return {
        bytes: Buffer.from(`raster-${input.format}`),
        viewport: { width: input.resolvedDimensions.width, height: input.resolvedDimensions.height },
        deviceScaleFactor: input.resolvedDimensions.pixelDensity,
        encoding: input.format === 'jpg' ? 'jpeg' : 'png',
      };
    }),
    composeCarouselPdf: vi.fn(async () => new Uint8Array([1, 2, 3])),
  };
}

const RASTER_INPUT = {
  compiledBundle: { code: 'export default () => null;' },
  resolvedDimensions: { width: 1080, height: 1080, units: 'px' as const, ppi: 96, pixelDensity: 1 },
};

describe('dispatchExport (kind → emitter routing)', () => {
  it('code → exportCode only (never raster/pdf)', async () => {
    const e = makeEmitterSpies();
    const out = await dispatchExport(
      { kind: 'code', code: { compiledBundle: { code: 'X' }, css: 'Y' } },
      e,
    );
    expect(e.exportCode).toHaveBeenCalledTimes(1);
    expect(e.exportRaster).not.toHaveBeenCalled();
    expect(e.composeCarouselPdf).not.toHaveBeenCalled();
    expect(out).toEqual({ kind: 'code', payload: { code: 'X', css: 'Y' } });
  });

  it('png → exportRaster with format "png" (not code/pdf)', async () => {
    const e = makeEmitterSpies();
    const out = await dispatchExport({ kind: 'png', raster: RASTER_INPUT }, e);
    expect(e.exportRaster).toHaveBeenCalledTimes(1);
    expect(e.rasterCalls[0].format).toBe('png');
    expect(e.exportCode).not.toHaveBeenCalled();
    expect(e.composeCarouselPdf).not.toHaveBeenCalled();
    expect(out.kind).toBe('png');
  });

  it('jpg → exportRaster with format "jpg" (not code/pdf)', async () => {
    const e = makeEmitterSpies();
    const out = await dispatchExport({ kind: 'jpg', raster: RASTER_INPUT }, e);
    expect(e.exportRaster).toHaveBeenCalledTimes(1);
    expect(e.rasterCalls[0].format).toBe('jpg');
    expect(e.exportCode).not.toHaveBeenCalled();
    expect(e.composeCarouselPdf).not.toHaveBeenCalled();
    expect(out.kind).toBe('jpg');
  });

  it('pdf → composeCarouselPdf over the ordered frame rasters', async () => {
    const e = makeEmitterSpies();
    const out = await dispatchExport(
      {
        kind: 'pdf',
        frames: [
          { orderIndex: 0, raster: RASTER_INPUT },
          { orderIndex: 1, raster: RASTER_INPUT },
          { orderIndex: 2, raster: RASTER_INPUT },
        ],
      },
      e,
    );
    expect(e.exportRaster).toHaveBeenCalledTimes(3);
    expect(e.composeCarouselPdf).toHaveBeenCalledTimes(1);
    expect(e.exportCode).not.toHaveBeenCalled();
    expect(out.kind).toBe('pdf');
  });

  it('pdf passes frames to composeCarouselPdf in ASCENDING orderIndex (not input order)', async () => {
    const e = makeEmitterSpies();
    // Tag each frame's bundle code with its orderIndex so we can assert order.
    const mk = (i: number) => ({
      orderIndex: i,
      raster: { ...RASTER_INPUT, compiledBundle: { code: `frame-${i}` }, label: `f${i}` },
    });
    await dispatchExport({ kind: 'pdf', frames: [mk(2), mk(0), mk(1)] }, e);
    // exportRaster called in ascending orderIndex order (0,1,2), not input (2,0,1).
    expect(e.rasterCalls.map((c) => c.compiledBundle.code)).toEqual([
      'frame-0',
      'frame-1',
      'frame-2',
    ]);
  });

  it('rejects an unknown kind (never silently defaults to an emitter)', async () => {
    const e = makeEmitterSpies();
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatchExport({ kind: 'svg' } as any, e),
    ).rejects.toThrow(/unknown export kind/i);
    expect(e.exportCode).not.toHaveBeenCalled();
    expect(e.exportRaster).not.toHaveBeenCalled();
    expect(e.composeCarouselPdf).not.toHaveBeenCalled();
  });
});
