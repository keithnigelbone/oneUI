import { describe, expect, it } from 'vitest';
import { normalizeObjectFit, resolveObjectFit, useImageState } from './interface';

describe('normalizeObjectFit', () => {
  it('returns cover when value is undefined', () => {
    expect(normalizeObjectFit(undefined)).toBe('cover');
  });

  it('returns the provided fallback when value is undefined', () => {
    expect(normalizeObjectFit(undefined, 'contain')).toBe('contain');
  });

  it('maps Figma fit="container" to contain', () => {
    expect(normalizeObjectFit('container')).toBe('contain');
  });

  it('passes through canonical resize modes unchanged', () => {
    expect(normalizeObjectFit('cover')).toBe('cover');
    expect(normalizeObjectFit('contain')).toBe('contain');
    expect(normalizeObjectFit('fill')).toBe('fill');
    expect(normalizeObjectFit('none')).toBe('none');
  });
});

describe('resolveObjectFit', () => {
  it('prefers fit over objectFit when both are set', () => {
    expect(resolveObjectFit({ fit: 'contain', objectFit: 'fill' })).toBe('contain');
  });

  it('maps Figma fit="container" to contain', () => {
    expect(resolveObjectFit({ fit: 'container' })).toBe('contain');
  });

  it('falls back to objectFit when fit is omitted', () => {
    expect(resolveObjectFit({ objectFit: 'none' })).toBe('none');
  });

  it('defaults to cover when neither prop is set', () => {
    expect(resolveObjectFit({})).toBe('cover');
  });
});

describe('useImageState resolvedObjectFit', () => {
  it('exposes contain when fit="container"', () => {
    const state = useImageState({
      src: 'https://example.com/photo.jpg',
      alt: 'Photo',
      fit: 'container',
    });
    expect(state.resolvedObjectFit).toBe('contain');
  });
});
