import { describe, expect, it } from 'vitest';
import { buildNativeDimensions } from '@oneui/shared/engine';
import { designIconSizePx } from './designIconSizing';

describe('designIconSizePx', () => {
  const spacing = buildNativeDimensions({ platform: 'S', density: 'default' }).spacing;

  it('maps index to spacing key (5 → f2)', () => {
    expect(designIconSizePx('5', spacing)).toBe(spacing['5']);
  });

  it('maps fractional index (3.5 → 3-5)', () => {
    expect(designIconSizePx('3.5', spacing)).toBe(spacing['3-5']);
  });

  it('maps 32 and 40 to Spacing-32 and Spacing-40', () => {
    expect(designIconSizePx('32', spacing)).toBe(spacing['32']);
    expect(designIconSizePx('40', spacing)).toBe(spacing['40']);
  });
});
