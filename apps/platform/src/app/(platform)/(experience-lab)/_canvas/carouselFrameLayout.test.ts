/**
 * carouselFrameLayout.test.ts — CAMP-04 / D-07 ordered carousel group logic.
 *
 * Pure, testable ordering/label/status logic extracted from the tldraw frame
 * (no React/tldraw import). These functions drive the ordered carousel group:
 *   - `orderCarouselFrames` sorts ascending by `orderIndex` (deterministic render
 *     order regardless of input order).
 *   - `frameLabel` produces the 1-based human label ("Frame {n} of {N}").
 *   - `carouselGroupLabel` produces the group heading ("Carousel: {name}").
 *   - `frameStatusPill` maps a frame outcome to a per-frame status pill — a PURE
 *     per-frame function, so a failing frame never changes a sibling's mapping.
 */

import { describe, it, expect } from 'vitest';
import {
  orderCarouselFrames,
  frameLabel,
  carouselGroupLabel,
  frameStatusPill,
} from './carouselFrameLayout';

describe('orderCarouselFrames — stable ascending sort by orderIndex (D-07)', () => {
  it('sorts frames ascending by orderIndex regardless of input order', () => {
    const ordered = orderCarouselFrames([
      { orderIndex: 2, outcome: 'artifact' },
      { orderIndex: 0, outcome: 'artifact' },
      { orderIndex: 1, outcome: 'artifact' },
    ]);
    expect(ordered.map((f) => f.orderIndex)).toEqual([0, 1, 2]);
  });

  it('does not mutate the input array', () => {
    const input = [
      { orderIndex: 1, outcome: 'artifact' as const },
      { orderIndex: 0, outcome: 'artifact' as const },
    ];
    orderCarouselFrames(input);
    expect(input.map((f) => f.orderIndex)).toEqual([1, 0]);
  });
});

describe('frameLabel — 1-based human label from 0-based index', () => {
  it('formats "Frame {index+1} of {total}"', () => {
    expect(frameLabel(0, 5)).toBe('Frame 1 of 5');
    expect(frameLabel(4, 5)).toBe('Frame 5 of 5');
  });
});

describe('carouselGroupLabel — group heading', () => {
  it('formats "Carousel: {direction name}"', () => {
    expect(carouselGroupLabel('Bold Hook')).toBe('Carousel: Bold Hook');
  });
});

describe('frameStatusPill — per-frame outcome → pill (pure, sibling-isolated)', () => {
  it('maps a passing frame to a positive "Valid IR" pill', () => {
    expect(frameStatusPill('artifact')).toEqual({ appearance: 'positive', text: 'Valid IR' });
  });

  it('maps a repair-exhausted frame to a negative pill', () => {
    const pill = frameStatusPill('repair-exhausted');
    expect(pill.appearance).toBe('negative');
    expect(pill.text).toBe("Frame couldn't be made compliant");
  });

  it('is a pure per-frame function — mapping one frame does not change another', () => {
    const passing = frameStatusPill('artifact');
    const failing = frameStatusPill('repair-exhausted');
    // Re-evaluating the passing frame yields the same mapping (no shared state).
    expect(frameStatusPill('artifact')).toEqual(passing);
    expect(passing.appearance).toBe('positive');
    expect(failing.appearance).toBe('negative');
  });
});
