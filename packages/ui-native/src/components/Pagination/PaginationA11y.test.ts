import { describe, expect, it } from 'vitest';
import {
  buildPaginationPages,
  getPaginationAccessibilityProps,
  getPaginationContainerAccessibilityProps,
  getPaginationEllipsisAccessibilityProps,
  getPaginationItemAccessibilityProps,
  getPaginationLiveRegionProps,
  getPaginationNameAccessibilityProps,
  _internal,
} from './interface';

describe('Pagination accessibility', () => {
  it('keeps the container non-accessible so child controls remain focusable', () => {
    expect(getPaginationContainerAccessibilityProps()).toEqual({
      accessible: false,
      importantForAccessibility: 'no',
    });
    expect(getPaginationAccessibilityProps({})).toEqual({
      accessible: false,
      importantForAccessibility: 'no',
    });
  });

  it('exposes a screen-reader-only group name with configured label', () => {
    expect(
      getPaginationNameAccessibilityProps({ 'aria-label': 'Search results' }),
    ).toMatchObject({
      accessible: true,
      accessibilityRole: 'header',
      accessibilityLabel: 'Search results',
    });
  });

  it('defaults group name to Pagination', () => {
    expect(getPaginationNameAccessibilityProps({})).toMatchObject({
      accessibilityLabel: 'Pagination',
    });
  });

  it('forwards accessibilityHint on the group name', () => {
    expect(
      getPaginationNameAccessibilityProps({
        'aria-label': 'Search results',
        accessibilityHint: 'Swipe through pages',
      }),
    ).toMatchObject({
      accessibilityHint: 'Swipe through pages',
    });
  });

  it('announces current page via live region', () => {
    expect(getPaginationLiveRegionProps(2, 5)).toMatchObject({
      accessibilityLabel: 'Page 2 of 5',
      accessibilityLiveRegion: 'polite',
    });
  });

  it('generates Go to page N for page chips', () => {
    expect(
      getPaginationItemAccessibilityProps({ page: 11 }),
    ).toMatchObject({
      accessibilityLabel: 'Go to page 11',
      accessibilityRole: 'button',
    });
  });

  it('marks selected page chips', () => {
    expect(
      getPaginationItemAccessibilityProps({ page: 4, selected: true }),
    ).toMatchObject({
      accessibilityState: { selected: true, disabled: false },
    });
  });

  it('hides ellipsis from the accessibility tree', () => {
    expect(getPaginationEllipsisAccessibilityProps()).toMatchObject({
      accessible: false,
      accessibilityElementsHidden: true,
    });
  });
});

describe('buildPaginationPages — windowing math', () => {
  const f = buildPaginationPages;

  it('returns [] for totalPages <= 0', () => {
    expect(f({ totalPages: 0, currentPage: 1, siblingCount: 1, boundaryCount: 1 })).toEqual([]);
  });

  it('renders all pages when total <= window (no ellipsis)', () => {
    expect(f({ totalPages: 5, currentPage: 3, siblingCount: 1, boundaryCount: 1 })).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('inserts an end-ellipsis when current is near the start', () => {
    const out = f({ totalPages: 20, currentPage: 1, siblingCount: 1, boundaryCount: 1 });
    expect(out[0]).toBe(1);
    expect(out[out.length - 1]).toBe(20);
    expect(out).toContain('ellipsis-end');
  });

  it('clamps via _internal.clamp', () => {
    expect(_internal.clamp(0, 1, 5)).toBe(1);
    expect(_internal.clamp(9, 1, 5)).toBe(5);
  });
});
