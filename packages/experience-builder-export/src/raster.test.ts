import { describe, it, expect, vi } from 'vitest';
import { mmToPx } from '@oneui/shared';
import { DEFAULT_VIEWPORTS } from './testFixtures';
import { exportRaster, type RasterCaptureFn, type RasterCaptureInput } from './raster';

/** A capture spy: records the args and returns a single fake raster buffer. */
function makeCaptureSpy(): {
  fn: RasterCaptureFn;
  calls: RasterCaptureInput[];
} {
  const calls: RasterCaptureInput[] = [];
  const fn: RasterCaptureFn = vi.fn(async (input: RasterCaptureInput) => {
    calls.push(input);
    return [{ viewport: input.viewports[0]?.label ?? 'x', png: Buffer.from('fake') }];
  });
  return { fn, calls };
}

describe('exportRaster (EXP-02 / D-10)', () => {
  it('captures at the foundation-resolved viewport with deviceScaleFactor = pixelDensity (NOT 2, NOT a mobile default)', async () => {
    const { fn, calls } = makeCaptureSpy();

    const out = await exportRaster(
      {
        compiledBundle: { code: 'export default () => null;' },
        resolvedDimensions: { width: 1080, height: 1080, units: 'px', ppi: 96, pixelDensity: 1 },
        format: 'png',
      },
      fn,
    );

    expect(calls).toHaveLength(1);
    const vp = calls[0].viewports[0];
    expect(vp.width).toBe(1080);
    expect(vp.height).toBe(1080);
    // Pitfall 5: device scale factor = pixelDensity (1), NOT the hardcoded 2.
    expect(calls[0].deviceScaleFactor).toBe(1);
    expect(out.deviceScaleFactor).toBe(1);
    expect(out.viewport).toEqual({ width: 1080, height: 1080 });
  });

  it('honours a pixelDensity of 2 as deviceScaleFactor 2 (not hardcoded, derived)', async () => {
    const { fn, calls } = makeCaptureSpy();
    await exportRaster(
      {
        compiledBundle: { code: 'x' },
        resolvedDimensions: { width: 800, height: 600, units: 'px', ppi: 96, pixelDensity: 2 },
        format: 'png',
      },
      fn,
    );
    expect(calls[0].deviceScaleFactor).toBe(2);
  });

  it('converts a mm-unit print canvas to px via mmToPx at PPI (not pixelDensity) BEFORE the viewport is set (Pitfall 6, CR-01)', async () => {
    const { fn, calls } = makeCaptureSpy();

    // A real A4 print canvas: 300 ppi at 1× device density. `ppi` and
    // `pixelDensity` are DISTINCT — the conversion must use ppi (300), and the
    // deviceScaleFactor must use pixelDensity (1). Conflating them (the CR-01
    // bug) would collapse a ~2480px A4 to ~8px.
    const out = await exportRaster(
      {
        compiledBundle: { code: 'x' },
        resolvedDimensions: { width: 210, height: 297, units: 'mm', ppi: 300, pixelDensity: 1 },
        format: 'png',
      },
      fn,
    );

    const vp = calls[0].viewports[0];
    expect(vp.width).toBe(mmToPx(210, 300));
    expect(vp.height).toBe(mmToPx(297, 300));
    // CR-01 regression: the conversion uses ppi (300), NOT pixelDensity (1).
    // mmToPx(210, 1) would be ~8px — the viewport must be the full-res ~2480px.
    expect(vp.width).not.toBe(mmToPx(210, 1));
    expect(vp.width).toBeGreaterThan(2000);
    // The raw mm numbers (210 / 297) MUST NOT be used as the px viewport.
    expect(vp.width).not.toBe(210);
    expect(vp.height).not.toBe(297);
    // deviceScaleFactor is the SEPARATE pixelDensity (1), not the ppi.
    expect(calls[0].deviceScaleFactor).toBe(1);
    expect(out.viewport).toEqual({ width: mmToPx(210, 300), height: mmToPx(297, 300) });
  });

  it('produces a JPEG capture for format "jpg" and a PNG capture for "png"', async () => {
    const jpg = makeCaptureSpy();
    await exportRaster(
      {
        compiledBundle: { code: 'x' },
        resolvedDimensions: { width: 1080, height: 1350, units: 'px', ppi: 96, pixelDensity: 1 },
        format: 'jpg',
        quality: 90,
      },
      jpg.fn,
    );
    expect(jpg.calls[0].format).toBe('jpeg');
    expect(jpg.calls[0].quality).toBe(90);

    const png = makeCaptureSpy();
    const out = await exportRaster(
      {
        compiledBundle: { code: 'x' },
        resolvedDimensions: { width: 1080, height: 1080, units: 'px', ppi: 96, pixelDensity: 1 },
        format: 'png',
      },
      png.fn,
    );
    expect(png.calls[0].format).toBe('png');
    expect(out.encoding).toBe('png');
  });

  it('never uses the eval DEFAULT_VIEWPORTS.mobile (Pitfall 5)', async () => {
    const { fn, calls } = makeCaptureSpy();
    await exportRaster(
      {
        compiledBundle: { code: 'x' },
        resolvedDimensions: { width: 1080, height: 1080, units: 'px', ppi: 96, pixelDensity: 1 },
        format: 'png',
      },
      fn,
    );
    const vp = calls[0].viewports[0];
    expect(vp.width).not.toBe(DEFAULT_VIEWPORTS.mobile.width);
    expect(vp.height).not.toBe(DEFAULT_VIEWPORTS.mobile.height);
  });
});
