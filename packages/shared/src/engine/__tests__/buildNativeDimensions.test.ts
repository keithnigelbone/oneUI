import { describe, it, expect } from 'vitest';
import { buildNativeDimensions } from '../buildNativeDimensions';
import { getDimensionValue, getGridValue } from '../../data/dimension-scales';

describe('buildNativeDimensions — defaults', () => {
  it('returns spacing + shape buckets', () => {
    const d = buildNativeDimensions();
    expect(d).toHaveProperty('spacing');
    expect(d).toHaveProperty('shape');
  });

  it('spacing has numeric keys plus grid keys', () => {
    const d = buildNativeDimensions();
    expect(Object.keys(d.spacing)).toHaveLength(28);
    expect(d.spacing['4']).toBe(16);
    expect(d.spacing['40']).toBe(160);
  });

  it('shape has 18 canonical keys (17 numeric steps + Pill)', () => {
    const d = buildNativeDimensions();
    const canonical = Object.keys(d.shape).filter((k) => /^(\d+(-5)?|Pill)$/.test(k));
    expect(canonical).toHaveLength(18);
  });

  it('spacing.0 === 0 and shape.0 === 0', () => {
    const d = buildNativeDimensions();
    expect(d.spacing['0']).toBe(0);
    expect(d.shape['0']).toBe(0);
  });

  it('shape.5-5 (f2-5) sits between shape.5 and shape.6', () => {
    const d = buildNativeDimensions();
    expect(d.shape['5-5']).toBeGreaterThan(d.shape['5']);
    expect(d.shape['5-5']).toBeLessThan(d.shape['6']);
  });

  // ── Deprecated t-shirt compatibility layer ────────────────────────────────
  // Delete alongside `LegacyNativeShapeKey` when the shape-token allowlist empties.
  it('legacy t-shirt keys mirror their numeric counterpart exactly', () => {
    const d = buildNativeDimensions();
    const pairs: [keyof typeof d.shape, keyof typeof d.shape][] = [
      ['None', '0'], ['6XS', '0-5'], ['5XS', '1'], ['4XS', '1-5'],
      ['3XS', '2'], ['2XS', '2-5'], ['XS', '3'], ['S', '3-5'],
      ['M', '4'], ['L', '4-5'], ['XL', '5'], ['2XL', '6'],
      ['3XL', '7'], ['4XL', '8'], ['5XL', '9'], ['6XL', '10'],
    ];
    for (const [legacy, canonical] of pairs) {
      expect(d.shape[legacy], `shape.${legacy}`).toBe(d.shape[canonical]);
    }
  });

  it('legacy NativeShape.M is 16px (f0) — NOT the 8px of static tokens.shape.m', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.shape.M).toBe(16);
    expect(d.shape['4']).toBe(16);
    expect(d.shape['2']).toBe(8);
  });

  it('shape.Pill === 9999 (standalone constant, not f-step derived)', () => {
    const d = buildNativeDimensions();
    expect(d.shape.Pill).toBe(9999);
  });

  it('all spacing values are non-negative', () => {
    const d = buildNativeDimensions();
    for (const [k, v] of Object.entries(d.spacing)) {
      expect(v, `spacing.${k}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('all shape values are non-negative', () => {
    const d = buildNativeDimensions();
    for (const [k, v] of Object.entries(d.shape)) {
      expect(v, `shape.${k}`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('buildNativeDimensions — values match getDimensionValue', () => {
  it('spacing.4 (f0) matches getDimensionValue for default S', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.spacing['4']).toBe(getDimensionValue('S', 'default', 'f0'));
    expect(d.spacing['4']).toBe(16);
  });

  it('spacing.3 (f-2) matches getDimensionValue', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.spacing['3']).toBe(getDimensionValue('S', 'default', 'f-2'));
  });

  it('spacing.40 (f16) matches getDimensionValue', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.spacing['40']).toBe(getDimensionValue('S', 'default', 'f16'));
  });

  it('spacing.5-5 is the midpoint between spacing.5 and spacing.6', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.spacing['5-5']).toBe((d.spacing['5'] + d.spacing['6']) / 2);
  });

  it('shape.M (f0) matches getDimensionValue', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.shape.M).toBe(getDimensionValue('S', 'default', 'f0'));
  });

  it('shape.6XL (f7) matches getDimensionValue', () => {
    const d = buildNativeDimensions();
    expect(d.shape['6XL']).toBe(getDimensionValue('S', 'default', 'f7'));
  });
});

describe('buildNativeDimensions — density', () => {
  it('compact spacing.4 < default < open at S', () => {
    const compact = buildNativeDimensions({ platform: 'S', density: 'compact' });
    const def = buildNativeDimensions({ platform: 'S', density: 'default' });
    const open = buildNativeDimensions({ platform: 'S', density: 'open' });
    expect(compact.spacing['4']).toBeLessThan(def.spacing['4']);
    expect(def.spacing['4']).toBeLessThan(open.spacing['4']);
  });

  it('density-adjusted dimension values apply to shape too', () => {
    const compact = buildNativeDimensions({ density: 'compact' });
    const open = buildNativeDimensions({ density: 'open' });
    expect(compact.shape.L).toBeLessThan(open.shape.L);
  });
});

describe('buildNativeDimensions — breakpoint', () => {
  it('S maps to the min base (16) and M to the mid base (18)', () => {
    const s = buildNativeDimensions({ platform: 'S', density: 'default' });
    const m = buildNativeDimensions({ platform: 'M', density: 'default' });
    expect(s.spacing['4']).toBe(16);
    expect(m.spacing['4']).toBe(18);
  });

  it('L maps to the max base (20)', () => {
    const l = buildNativeDimensions({ platform: 'L', density: 'default' });
    expect(l.spacing['4']).toBe(20);
  });
});

describe('buildNativeDimensions — grid', () => {
  it('spacing.Margin matches getGridValue', () => {
    const d = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(d.spacing.Margin).toBe(getGridValue('S', 'default', 'margin'));
    expect(d.spacing.Margin).toBe(16);
  });

  it('spacing.Gutter matches getGridValue', () => {
    const d = buildNativeDimensions({ platform: 'M', density: 'default' });
    expect(d.spacing.Gutter).toBe(getGridValue('M', 'default', 'gutter'));
  });

  it('Grid varies with density', () => {
    const compact = buildNativeDimensions({ platform: 'L', density: 'compact' });
    const open = buildNativeDimensions({ platform: 'L', density: 'open' });
    expect(compact.spacing.Margin).not.toBe(open.spacing.Margin);
  });
});

describe('buildNativeDimensions — purity', () => {
  it('produces identical results for the same input', () => {
    const a = buildNativeDimensions({ platform: 'S', density: 'default' });
    const b = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(a).toEqual(b);
  });

  it('default options resolve to S / default', () => {
    const noArgs = buildNativeDimensions();
    const explicit = buildNativeDimensions({ platform: 'S', density: 'default' });
    expect(noArgs).toEqual(explicit);
  });
});
