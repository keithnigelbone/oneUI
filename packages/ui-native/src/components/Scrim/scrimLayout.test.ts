import { describe, expect, it } from 'vitest';
import {
  isScrimFullCoverageMode,
  resolveScrimLayout,
  resolveScrimTone,
} from './interface';
import { resolveScrimPaint } from './scrimPaint';
import { defaultNativeTheme } from '../../theme/defaultTheme';

describe('resolveScrimTone', () => {
  it('uses light scrim on dark theme', () => {
    expect(resolveScrimTone(true)).toBe('light');
  });

  it('uses dark scrim on light theme', () => {
    expect(resolveScrimTone(false)).toBe('dark');
  });
});

describe('isScrimFullCoverageMode', () => {
  it('is true for center, full size, or overlay variant', () => {
    expect(isScrimFullCoverageMode('center', 'XS', 'gradient')).toBe(true);
    expect(isScrimFullCoverageMode('bottom', 'full', 'gradient')).toBe(true);
    expect(isScrimFullCoverageMode('bottom', 'M', 'overlay')).toBe(true);
  });

  it('is false for edge gradient bands only', () => {
    expect(isScrimFullCoverageMode('bottom', 'L', 'gradient')).toBe(false);
  });
});

describe('resolveScrimLayout', () => {
  it('defaults bottom position to column with zone1 visible', () => {
    const layout = resolveScrimLayout('bottom', 'XS', 'gradient');
    expect(layout.isHorizontal).toBe(false);
    expect(layout.showZone1).toBe(true);
    expect(layout.showZone2).toBe(false);
    expect(layout.zoneFlex).toBe(9);
    expect(layout.bandFlex).toBe(1);
  });

  it('hides both zones for full overlay', () => {
    const layout = resolveScrimLayout('center', 'full', 'overlay');
    expect(layout.showZone1).toBe(false);
    expect(layout.showZone2).toBe(false);
    expect(layout.bandFlex).toBe(1);
  });

  it('hides both zones for size full gradient (flat full-coverage mode)', () => {
    const layout = resolveScrimLayout('bottom', 'full', 'gradient');
    expect(layout.showZone1).toBe(false);
    expect(layout.showZone2).toBe(false);
    expect(layout.bandFlex).toBe(1);
  });

  it('anchors start position to the leading edge', () => {
    const layout = resolveScrimLayout('start', 'M', 'gradient');
    expect(layout.isHorizontal).toBe(true);
    expect(layout.showZone1).toBe(false);
    expect(layout.showZone2).toBe(true);
    expect(layout.bandFlex).toBe(4);
    expect(layout.gradientDirection).toEqual({
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    });
  });

  it('anchors top position gradient from the top edge', () => {
    const layout = resolveScrimLayout('top', 'M', 'gradient');
    expect(layout.showZone1).toBe(false);
    expect(layout.showZone2).toBe(true);
    expect(layout.gradientDirection).toEqual({
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
    });
  });

  it('anchors bottom position gradient from the bottom edge', () => {
    const layout = resolveScrimLayout('bottom', 'M', 'gradient');
    expect(layout.showZone1).toBe(true);
    expect(layout.showZone2).toBe(false);
    expect(layout.gradientDirection).toEqual({
      x1: '0%',
      y1: '100%',
      x2: '0%',
      y2: '0%',
    });
  });

  it('anchors end position gradient from the trailing edge', () => {
    const layout = resolveScrimLayout('end', 'M', 'gradient');
    expect(layout.showZone1).toBe(true);
    expect(layout.showZone2).toBe(false);
    expect(layout.gradientDirection).toEqual({
      x1: '100%',
      y1: '0%',
      x2: '0%',
      y2: '0%',
    });
  });
});

describe('resolveScrimPaint', () => {
  const theme = defaultNativeTheme();

  it('maps overlay to flat full-coverage color (33% medium)', () => {
    const paint = resolveScrimPaint(theme, 'dark', 'medium', 'overlay', 'bottom', 'XS');
    expect(paint.flatColor).toBe('rgba(0, 0, 0, 0.33)');
    expect(paint.gradientStops).toEqual([]);
    expect(paint.variant).toBe('overlay');
  });

  it('maps full-coverage attention regardless of position or variant', () => {
    const overlay = resolveScrimPaint(theme, 'dark', 'low', 'overlay', 'bottom', 'M');
    expect(overlay.flatColor).toBe('rgba(0, 0, 0, 0.17)');

    const fullGradient = resolveScrimPaint(theme, 'dark', 'medium', 'gradient', 'bottom', 'full');
    expect(fullGradient.flatColor).toBe('rgba(0, 0, 0, 0.33)');
    expect(fullGradient.gradientStops).toEqual([]);

    const center = resolveScrimPaint(theme, 'dark', 'high', 'gradient', 'center', 'M');
    expect(center.flatColor).toBe('rgba(0, 0, 0, 0.5)');

    const light = resolveScrimPaint(theme, 'light', 'high', 'overlay', 'top', 'S');
    expect(light.flatColor).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('maps edge gradient high attention to the Layers .box.scrim stop curve at 95%', () => {
    const paint = resolveScrimPaint(theme, 'dark', 'high', 'gradient');
    expect(paint.flatColor).toBeUndefined();
    expect(paint.gradientStops).toEqual([
      { offset: '0', stopColor: expect.any(String), stopOpacity: 0.95 },
      { offset: '0.5', stopColor: expect.any(String), stopOpacity: 0.285 },
      { offset: '0.65', stopColor: expect.any(String), stopOpacity: 0.1425 },
      { offset: '0.75', stopColor: expect.any(String), stopOpacity: 0.076 },
      { offset: '0.83', stopColor: expect.any(String), stopOpacity: 0.038 },
      { offset: '0.88', stopColor: expect.any(String), stopOpacity: 0.019 },
      { offset: '1', stopColor: expect.any(String), stopOpacity: 0 },
    ]);
  });

  it('scales edge SVG gradient by attention level (25% / 50% / 95%)', () => {
    const medium = resolveScrimPaint(theme, 'dark', 'medium', 'gradient');
    expect(medium.gradientStops[0]?.stopOpacity).toBe(0.5);
    expect(medium.gradientStops[1]?.stopOpacity).toBe(0.15);

    const low = resolveScrimPaint(theme, 'dark', 'low', 'gradient');
    expect(low.gradientStops[0]?.stopOpacity).toBe(0.25);
    expect(low.gradientStops[1]?.stopOpacity).toBe(0.075);
  });
});
