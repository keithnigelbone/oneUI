import { describe, expect, it } from 'vitest';
import {
  getPaginationDotReadOnlyAccessibilityProps,
  getPaginationDotTabAccessibilityProps,
  getPaginationDotsRootAccessibilityProps,
} from './interface';

describe('PaginationDots accessibility', () => {
  it('exposes tablist for interactive carousels', () => {
    const root = getPaginationDotsRootAccessibilityProps(
      { 'aria-label': 'Slides' },
      { readOnly: false, count: 5, resolvedActive: 2 },
    );
    expect(root.accessibilityRole).toBe('tablist');
    expect(root.accessibilityLabel).toBe('Slides');
  });

  it('exposes progressbar with value when readOnly', () => {
    const root = getPaginationDotsRootAccessibilityProps(
      { 'aria-label': 'Carousel' },
      { readOnly: true, count: 5, resolvedActive: 2 },
    );
    expect(root.accessibilityRole).toBe('progressbar');
    expect(root.accessibilityValue).toEqual({ min: 0, max: 4, now: 2 });
  });

  it('maps dot tab labels and selected state', () => {
    const tab = getPaginationDotTabAccessibilityProps({ absIdx: 0, isActive: true, slot: 0, state: 'active' });
    expect(tab.accessibilityRole).toBe('tab');
    expect(tab.accessibilityLabel).toBe('Go to page 1');
    expect(tab.accessibilityState.selected).toBe(true);
    expect(tab['aria-selected']).toBe(true);
  });

  it('hides read-only overflow dots', () => {
    expect(getPaginationDotReadOnlyAccessibilityProps()).toEqual({ 'aria-hidden': true });
  });
});
