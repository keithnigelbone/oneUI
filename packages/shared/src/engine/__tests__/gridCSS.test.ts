import { describe, it, expect } from 'vitest';
import { generateGridCSS, hasGridOverrides } from '../gridCSS';

describe('generateGridCSS', () => {
  it('returns empty string for null/undefined/empty config', () => {
    expect(generateGridCSS(null)).toBe('');
    expect(generateGridCSS(undefined)).toBe('');
    expect(generateGridCSS({ breakpoints: {} })).toBe('');
  });

  it('emits a block per breakpoint override', () => {
    const css = generateGridCSS({
      breakpoints: {
        M: { columns: 8, maxWidth: 1280 },
        L: { columns: 16, maxWidth: 1600 },
      },
    });
    expect(css).toContain('[data-Breakpoint="M"]');
    expect(css).toContain('--Grid-MaxWidth: 1280px');
    expect(css).toContain('[data-Breakpoint="L"]');
    expect(css).toContain('--Grid-Columns: 16');
    expect(css).toContain('--Grid-MaxWidth: 1600px');
  });

  it('emits max-width: none for unbounded breakpoints', () => {
    const css = generateGridCSS({ breakpoints: { L: { columns: 12, maxWidth: null } } });
    expect(css).toContain('--Grid-MaxWidth: none');
  });

  it('rounds and clamps non-integer column counts', () => {
    const css = generateGridCSS({ breakpoints: { S: { columns: 4.7, maxWidth: null } } });
    expect(css).toContain('--Grid-Columns: 5');
  });

  it('enforces a minimum of 1 column', () => {
    const css = generateGridCSS({ breakpoints: { S: { columns: 0, maxWidth: null } } });
    expect(css).toContain('--Grid-Columns: 1');
  });

  it('preserves breakpoint order (S → M → L)', () => {
    const css = generateGridCSS({
      breakpoints: {
        L: { columns: 12, maxWidth: 1600 },
        S: { columns: 4, maxWidth: null },
      },
    });
    const sIdx = css.indexOf('data-Breakpoint="S"');
    const lIdx = css.indexOf('data-Breakpoint="L"');
    expect(sIdx).toBeGreaterThan(-1);
    expect(lIdx).toBeGreaterThan(sIdx);
  });

  it('skips entries with non-finite column counts', () => {
    const css = generateGridCSS({
      breakpoints: {
        S: { columns: NaN, maxWidth: null },
        L: { columns: 12, maxWidth: 1280 },
      },
    });
    expect(css).not.toContain('data-Breakpoint="S"');
    expect(css).toContain('data-Breakpoint="L"');
  });
});

describe('hasGridOverrides', () => {
  it('returns false for null/empty configs', () => {
    expect(hasGridOverrides(null)).toBe(false);
    expect(hasGridOverrides(undefined)).toBe(false);
    expect(hasGridOverrides({ breakpoints: {} })).toBe(false);
  });

  it('returns true when at least one breakpoint is configured', () => {
    expect(hasGridOverrides({ breakpoints: { L: { columns: 12, maxWidth: 1280 } } })).toBe(true);
  });
});
