import { describe, expect, it } from 'vitest';

import { STROKE_SCALE_TOKENS, STROKE_TOKEN_OPTIONS } from '../stroke-scale';

describe('stroke scale tokens', () => {
  it('matches the Figma plugin stroke width mapping', () => {
    expect(STROKE_SCALE_TOKENS.map((stroke) => [stroke.token, stroke.value])).toEqual([
      ['Stroke-None', '0px'],
      ['Stroke-S', '0.5px'],
      ['Stroke-M', '1px'],
      ['Stroke-L', '1.5px'],
      ['Stroke-XL', '2px'],
      ['Stroke-2XL', '3px'],
      ['Stroke-3XL', 'var(--Dimension-f-6)'],
      ['Stroke-4XL', 'var(--Dimension-f-5)'],
      ['Stroke-5XL', 'var(--Dimension-f-4)'],
      ['Stroke-6XL', 'var(--Dimension-f-3)'],
      ['Stroke-7XL', 'var(--Dimension-f-2)'],
      ['Stroke-8XL', 'var(--Dimension-f-1)'],
      ['Stroke-9XL', 'var(--Dimension-f0)'],
    ]);
  });

  it('exposes all stroke tokens as editor options', () => {
    expect(STROKE_TOKEN_OPTIONS.map((option) => option.token)).toEqual(
      STROKE_SCALE_TOKENS.map((stroke) => stroke.token),
    );
    expect(STROKE_TOKEN_OPTIONS).toHaveLength(13);
  });
});
