/**
 * carouselSelectionRailLayout.test.ts
 */

import { describe, expect, it } from 'vitest';
import {
  clampSelectionRailIndex,
  resolveCarouselSelectionRailPeekAlignInset,
} from './carouselSelectionRailLayout';

describe('carouselSelectionRailLayout', () => {
  it('aligns below-media rail inset per peek mode', () => {
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'both', 360, 328, 16)).toBe(16);
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'prev', 360, 344, 16)).toBe(16);
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'next', 360, 344, 16)).toBe(0);
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'none', 360, 328, 16)).toBeUndefined();
    expect(resolveCarouselSelectionRailPeekAlignInset(true, 'both', 360, 328, 16)).toBeUndefined();
  });
});

describe('clampSelectionRailIndex', () => {
  it('clamps out-of-range indices', () => {
    expect(clampSelectionRailIndex(3, 5)).toBe(3);
    expect(clampSelectionRailIndex(-1, 5)).toBe(0);
    expect(clampSelectionRailIndex(99, 5)).toBe(4);
    expect(clampSelectionRailIndex(0, 0)).toBe(0);
  });
});
