import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  BOTTOM_NAVIGATION_MAX_ITEMS,
  clampBottomNavigationChildren,
} from './interface';

describe('clampBottomNavigationChildren', () => {
  it('passes through up to five items unchanged', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      createElement('View', { key: String(i), testID: `tab-${i}` }),
    );
    expect(clampBottomNavigationChildren(items)).toHaveLength(5);
  });

  it('clamps six items to five', () => {
    const items = Array.from({ length: 6 }, (_, i) =>
      createElement('View', { key: String(i), testID: `tab-${i}` }),
    );
    const clamped = clampBottomNavigationChildren(items);
    expect(clamped).toHaveLength(BOTTOM_NAVIGATION_MAX_ITEMS);
    expect((clamped[4] as { props: { testID?: string } }).props.testID).toBe('tab-4');
    expect(clamped.some((node) => (node as { props: { testID?: string } }).props.testID === 'tab-5')).toBe(
      false,
    );
  });
});
