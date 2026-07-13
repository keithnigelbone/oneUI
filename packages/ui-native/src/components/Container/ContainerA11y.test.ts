import { describe, expect, it } from 'vitest';
import { getContainerAccessibilityProps } from './interface';

describe('Container accessibility', () => {
  it('is presentational (not individually focusable)', () => {
    expect(getContainerAccessibilityProps()).toEqual({ accessible: false });
  });
});
