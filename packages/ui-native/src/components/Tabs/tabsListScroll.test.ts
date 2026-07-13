import { describe, expect, it } from 'vitest';
import {
  resolveTabsHorizontalScrollOffset,
  resolveTabsVerticalScrollOffset,
  shouldEnableTabsAxisScroll,
  shouldEnableTabsHorizontalScroll,
} from './tabsListScroll.native';

describe('tabsListScroll', () => {
  it('enables scroll only when content is larger than the viewport', () => {
    expect(shouldEnableTabsAxisScroll(400, 360)).toBe(true);
    expect(shouldEnableTabsAxisScroll(360, 360)).toBe(false);
    expect(shouldEnableTabsAxisScroll(200, 0)).toBe(false);
    expect(shouldEnableTabsHorizontalScroll(400, 360)).toBe(true);
  });

  describe('horizontal', () => {
    it('returns null when the active tab is already fully visible', () => {
      expect(
        resolveTabsHorizontalScrollOffset({ x: 40, width: 80 }, 360, 0),
      ).toBeNull();
      expect(
        resolveTabsHorizontalScrollOffset({ x: 280, width: 60 }, 360, 0),
      ).toBeNull();
    });

    it('scrolls backward when the tab starts before the visible window', () => {
      expect(
        resolveTabsHorizontalScrollOffset({ x: 50, width: 72 }, 200, 80, 8),
      ).toBe(42);
    });

    it('scrolls forward when the tab ends after the visible window', () => {
      expect(
        resolveTabsHorizontalScrollOffset({ x: 300, width: 72 }, 200, 0, 8),
      ).toBe(180);
    });
  });

  describe('vertical', () => {
    it('returns null when the active tab is already fully visible', () => {
      expect(
        resolveTabsVerticalScrollOffset({ y: 40, height: 80 }, 360, 0),
      ).toBeNull();
      expect(
        resolveTabsVerticalScrollOffset({ y: 280, height: 60 }, 360, 0),
      ).toBeNull();
    });

    it('scrolls upward when the tab starts above the visible window', () => {
      expect(
        resolveTabsVerticalScrollOffset({ y: 50, height: 72 }, 200, 80, 8),
      ).toBe(42);
    });

    it('scrolls downward when the tab ends below the visible window', () => {
      expect(
        resolveTabsVerticalScrollOffset({ y: 300, height: 72 }, 200, 0, 8),
      ).toBe(180);
    });
  });
});
