// @vitest-environment node

import { describe, expect, it } from 'vitest';

import {
  DYNAMIC_STROKE_FSTEP,
  STATIC_STROKE_PX,
  resolveTokenPixelValue,
} from './tokenValueResolvers';

describe('tokenValueResolvers stroke tokens', () => {
  const platformTokens = {
    '--Dimension-f-6': '4px',
    '--Dimension-f-1': '14px',
    '--Dimension-f0': '16px',
  };

  it('keeps Stroke-2XL fixed at 3px', () => {
    expect(STATIC_STROKE_PX['2XL']).toBe('3px');
    expect(DYNAMIC_STROKE_FSTEP['2XL']).toBeUndefined();
    expect(resolveTokenPixelValue('Stroke-2XL', 'stroke', platformTokens)).toBe('3px');
  });

  it('resolves Stroke-3XL through Stroke-9XL from density-aware dimension tokens', () => {
    expect(DYNAMIC_STROKE_FSTEP['3XL']).toBe('f-6');
    expect(DYNAMIC_STROKE_FSTEP['9XL']).toBe('f0');
    expect(resolveTokenPixelValue('Stroke-3XL', 'stroke', platformTokens)).toBe('4px');
    expect(resolveTokenPixelValue('Stroke-8XL', 'stroke', platformTokens)).toBe('14px');
    expect(resolveTokenPixelValue('Stroke-9XL', 'stroke', platformTokens)).toBe('16px');
  });
});
