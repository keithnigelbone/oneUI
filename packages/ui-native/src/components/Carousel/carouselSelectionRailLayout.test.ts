import { describe, expect, it } from 'vitest';
import {
  clampSelectionRailIndex,
  resolveCarouselSelectionRailPeekAlignInset,
} from './carouselSelectionRailLayout.native';
import { PEEK_COLUMN_WIDTH } from './Carousel.styles.native';

describe('carouselSelectionRailLayout', () => {
  it('aligns below-media rail inset per peek mode', () => {
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'both', 360, 328)).toBe(16);
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'prev', 360, 344)).toBe(
      PEEK_COLUMN_WIDTH,
    );
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'next', 360, 344)).toBe(0);
    expect(resolveCarouselSelectionRailPeekAlignInset(false, 'none', 360, 328)).toBeUndefined();
  });
});

// `useSelectionRailIndex` clamps both the derived active item and every
// `setActive` request through this helper, so the thumbnail rail stays in sync
// with the main carousel even when the driving index is stale/out of range.
describe('clampSelectionRailIndex (rail ↔ carousel sync)', () => {
  it('keeps an in-range index unchanged', () => {
    expect(clampSelectionRailIndex(0, 5)).toBe(0);
    expect(clampSelectionRailIndex(3, 5)).toBe(3);
    expect(clampSelectionRailIndex(4, 5)).toBe(4);
  });

  it('clamps below zero up to the first item', () => {
    expect(clampSelectionRailIndex(-1, 5)).toBe(0);
    expect(clampSelectionRailIndex(-99, 5)).toBe(0);
  });

  it('clamps past the end down to the last item', () => {
    expect(clampSelectionRailIndex(5, 5)).toBe(4);
    expect(clampSelectionRailIndex(99, 5)).toBe(4);
  });

  it('collapses to zero for an empty rail', () => {
    expect(clampSelectionRailIndex(0, 0)).toBe(0);
    expect(clampSelectionRailIndex(3, 0)).toBe(0);
  });
});
