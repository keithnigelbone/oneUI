/**
 * tabsListScroll.native.ts — tab-list overflow scroll helpers (horizontal + vertical).
 */

import { tokens } from '@oneui/tokens';
import type { TabContentLayout } from './TabsSelectionContext';

/** Inset when scrolling a tab into view (peer of QA playground scroll step padding). */
export const TABS_LIST_SCROLL_EDGE_INSET = tokens.spacing['2'];

export function shouldEnableTabsAxisScroll(
  contentSize: number,
  viewportSize: number,
): boolean {
  return viewportSize > 0 && contentSize > viewportSize;
}

/** @deprecated Use {@link shouldEnableTabsAxisScroll} */
export function shouldEnableTabsHorizontalScroll(
  contentWidth: number,
  viewportWidth: number,
): boolean {
  return shouldEnableTabsAxisScroll(contentWidth, viewportWidth);
}

function resolveTabsAxisScrollOffset(
  tabStart: number,
  tabSize: number,
  viewportSize: number,
  scrollOffset: number,
  edgeInset = TABS_LIST_SCROLL_EDGE_INSET,
): number | null {
  if (viewportSize <= 0) return null;

  const tabEnd = tabStart + tabSize;
  const visibleStart = scrollOffset;
  const visibleEnd = scrollOffset + viewportSize;

  if (tabStart >= visibleStart && tabEnd <= visibleEnd) {
    return null;
  }

  if (tabStart < visibleStart) {
    return Math.max(0, tabStart - edgeInset);
  }

  return Math.max(0, tabEnd - viewportSize + edgeInset);
}

/**
 * Returns the next horizontal `scrollTo` x offset, or `null` when fully visible.
 */
export function resolveTabsHorizontalScrollOffset(
  tabLayout: Pick<TabContentLayout, 'x' | 'width'>,
  viewportWidth: number,
  scrollX: number,
  edgeInset = TABS_LIST_SCROLL_EDGE_INSET,
): number | null {
  return resolveTabsAxisScrollOffset(
    tabLayout.x,
    tabLayout.width,
    viewportWidth,
    scrollX,
    edgeInset,
  );
}

/**
 * Returns the next vertical `scrollTo` y offset, or `null` when fully visible.
 */
export function resolveTabsVerticalScrollOffset(
  tabLayout: Pick<TabContentLayout, 'y' | 'height'>,
  viewportHeight: number,
  scrollY: number,
  edgeInset = TABS_LIST_SCROLL_EDGE_INSET,
): number | null {
  return resolveTabsAxisScrollOffset(
    tabLayout.y,
    tabLayout.height,
    viewportHeight,
    scrollY,
    edgeInset,
  );
}
