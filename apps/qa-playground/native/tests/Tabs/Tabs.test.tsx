/**
 * Tabs QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Location: apps/qa-playground/native/tests/Tabs/Tabs.test.tsx
 * QA policy: NEVER modify dev files. Tests here are QA-owned only.
 *
 * ─── Component overview ───────────────────────────────────────────────────────
 *   Two APIs:
 *     Flat:     TabGroup > TabItem + TabPanel (children split by Symbol marker)
 *     Compound: Tabs.Root > Tabs.List > Tabs.Item + Tabs.Indicator + Tabs.Panel
 *
 *   TabPanel returns null when not active (rather than rendering hidden). This is
 *   a confirmed bug — see BUG-TABS-2 below.
 *
 * ─── RNTL limitations ─────────────────────────────────────────────────────────
 *   - No layout engine: measureLayout is a no-op; indicator position is not set.
 *   - No scroll: ScrollView.scrollTo is mocked; scroll-into-view logic is skipped.
 *   - No pixel rendering: cannot verify colours, focus rings, or animation frames.
 *
 * ─── Known bugs (tests tagged [bug] are EXPECTED TO FAIL) ─────────────────────
 *
 *   BUG-TABS-1: TabItem with ReactNode children and no aria-label is inaccessible.
 *     File: packages/ui-native/src/components/Tabs/interface.ts
 *     Cause: resolveTabItemAccessibilityLabel() only handles string | number children.
 *            When children is a ReactNode (e.g. <Text>Label</Text>), the function
 *            returns undefined → accessible=false → tab invisible to VoiceOver/TalkBack.
 *     Expected: tab should still be accessible (accessible=true) with a fallback role.
 *     Fix needed: resolveTabItemAccessibilityLabel should traverse ReactNode children
 *                 to extract string content, OR require aria-label for ReactNode children.
 *
 *   BUG-TABS-2: TabPanel unmounts when not active instead of hiding via
 *               importantForAccessibility='no-hide-descendants'.
 *     File: packages/ui-native/src/components/Tabs/Tabs.native.tsx
 *     Cause: TabsPanel returns null when !isVisible. The getTabPanelAccessibilityProps
 *            hidden-state branch (importantForAccessibility: 'no-hide-descendants') is
 *            dead code — the component never renders in a hidden state.
 *     Side effects:
 *       - Scroll position, form state, and focus inside inactive panels are destroyed
 *         on every tab switch.
 *       - The accessibility props function tests in TabsA11y.test.ts for isVisible=false
 *         exercise dead code.
 *     Fix needed: Render all panels always; conditionally apply importantForAccessibility
 *                 instead of returning null.
 */

import React from 'react';
import { Text, ScrollView } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import {
  Tabs,
  TabGroup,
  TabItem,
  TabPanel,
} from '@ui-native/components/Tabs';
import {
  shouldEnableTabsAxisScroll,
  resolveTabsHorizontalScrollOffset,
  resolveTabsVerticalScrollOffset,
} from '@ui-native/components/Tabs/tabsListScroll.native';
import {
  resolveTabAppearance,
  resolveTabItemState,
  resolveTabItemAccessibilityLabel,
  getTabPanelAccessibilityProps,
} from '@ui-native/components/Tabs/interface';
import { wrap } from '../../utils/renderWithTheme';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function BasicTabs({
  defaultValue = 'a',
  onValueChange,
}: {
  defaultValue?: string;
  onValueChange?: (v: unknown) => void;
}): React.ReactElement {
  return (
    <TabGroup defaultValue={defaultValue} onValueChange={onValueChange} testID="tabs-root">
      <TabItem value="a" testID="tab-a">Overview</TabItem>
      <TabItem value="b" testID="tab-b">Projects</TabItem>
      <TabItem value="c" testID="tab-c">Settings</TabItem>
      <TabPanel value="a" testID="panel-a"><Text testID="panel-a-text">Panel A</Text></TabPanel>
      <TabPanel value="b" testID="panel-b"><Text testID="panel-b-text">Panel B</Text></TabPanel>
      <TabPanel value="c" testID="panel-c"><Text testID="panel-c-text">Panel C</Text></TabPanel>
    </TabGroup>
  );
}

/* ─── 1. Smoke ───────────────────────────────────────────────────────────── */

describe('Tabs — smoke', () => {
  it('[smoke] TabGroup renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel A</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] Tabs.Root compound API renders without crash', () => {
    expect(() =>
      render(wrap(
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Item value="a">A</Tabs.Item>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Panel value="a"><Text>Panel A</Text></Tabs.Panel>
        </Tabs.Root>,
      ))
    ).not.toThrow();
  });

  it('[smoke] size="s" renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a" size="s">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] size="l" renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a" size="l">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] appearance="secondary" renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a" appearance="secondary">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] appearance="neutral" renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a" appearance="neutral">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] orientation="vertical" renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a" orientation="vertical">
          <TabItem value="a">A</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });

  it('[smoke] disabled tab renders without crash', () => {
    expect(() =>
      render(wrap(
        <TabGroup defaultValue="a">
          <TabItem value="a">A</TabItem>
          <TabItem value="b" disabled>B</TabItem>
          <TabPanel value="a"><Text>Panel</Text></TabPanel>
        </TabGroup>,
      ))
    ).not.toThrow();
  });
});

/* ─── 2. Functional ──────────────────────────────────────────────────────── */

describe('Tabs — functional', () => {
  it('[fn] defaultValue makes the matching tab selected', () => {
    render(wrap(<BasicTabs defaultValue="b" />));
    const tabB = screen.getByTestId('tab-b');
    expect(tabB.props.accessibilityState?.selected).toBe(true);
    const tabA = screen.getByTestId('tab-a');
    expect(tabA.props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] defaultValue panel is visible on mount', () => {
    render(wrap(<BasicTabs defaultValue="a" />));
    expect(screen.getByTestId('panel-a')).toBeTruthy();
    expect(screen.queryByTestId('panel-b')).toBeNull();
    expect(screen.queryByTestId('panel-c')).toBeNull();
  });

  it('[fn] pressing a tab calls onValueChange with its value', () => {
    const handler = vi.fn();
    render(wrap(<BasicTabs defaultValue="a" onValueChange={handler} />));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(handler).toHaveBeenCalledWith('b');
  });

  it('[fn] pressing a tab updates selected state', () => {
    render(wrap(<BasicTabs defaultValue="a" />));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('tab-b').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('tab-a').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] pressing a tab shows its panel and hides the previous', () => {
    render(wrap(<BasicTabs defaultValue="a" />));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('panel-b')).toBeTruthy();
    expect(screen.queryByTestId('panel-a')).toBeNull();
  });

  it('[fn] pressing a disabled tab does not call onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <TabGroup defaultValue="a" onValueChange={handler}>
        <TabItem value="a" testID="tab-a">A</TabItem>
        <TabItem value="b" testID="tab-b" disabled>B (disabled)</TabItem>
        <TabPanel value="a"><Text>Panel A</Text></TabPanel>
        <TabPanel value="b"><Text>Panel B</Text></TabPanel>
      </TabGroup>,
    ));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] pressing a disabled tab does not change the active panel', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">A</TabItem>
        <TabItem value="b" testID="tab-b" disabled>B (disabled)</TabItem>
        <TabPanel value="a" testID="panel-a"><Text>Panel A</Text></TabPanel>
        <TabPanel value="b" testID="panel-b"><Text>Panel B</Text></TabPanel>
      </TabGroup>,
    ));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('panel-a')).toBeTruthy();
    expect(screen.queryByTestId('panel-b')).toBeNull();
  });

  it('[fn] controlled value prop selects the specified tab', () => {
    render(wrap(
      <TabGroup value="c">
        <TabItem value="a" testID="tab-a">A</TabItem>
        <TabItem value="b" testID="tab-b">B</TabItem>
        <TabItem value="c" testID="tab-c">C</TabItem>
        <TabPanel value="a" testID="panel-a"><Text>Panel A</Text></TabPanel>
        <TabPanel value="b" testID="panel-b"><Text>Panel B</Text></TabPanel>
        <TabPanel value="c" testID="panel-c"><Text>Panel C</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-c').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('panel-c')).toBeTruthy();
    expect(screen.queryByTestId('panel-a')).toBeNull();
  });

  it('[fn] testID reaches the tab item Pressable', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="my-tab-item">A</TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('my-tab-item')).toBeTruthy();
  });

  it('[fn] aria-label on TabItem overrides the children label', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a" aria-label="Custom label">A</TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-a').props.accessibilityLabel).toBe('Custom label');
  });

  it('[fn] Tabs.Root compound API: pressing a tab switches the active panel', () => {
    render(wrap(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Item value="a" testID="tab-a">A</Tabs.Item>
          <Tabs.Item value="b" testID="tab-b">B</Tabs.Item>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a" testID="panel-a"><Text>Panel A</Text></Tabs.Panel>
        <Tabs.Panel value="b" testID="panel-b"><Text>Panel B</Text></Tabs.Panel>
      </Tabs.Root>,
    ));
    fireEvent.press(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('panel-b')).toBeTruthy();
    expect(screen.queryByTestId('panel-a')).toBeNull();
  });
});

/* ─── 3. Accessibility ───────────────────────────────────────────────────── */

describe('Tabs — a11y', () => {
  it('[a11y] tab item has accessibilityRole="tab"', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">Overview</TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-a').props.accessibilityRole).toBe('tab');
  });

  it('[a11y] active tab has accessibilityState.selected=true', () => {
    render(wrap(<BasicTabs defaultValue="b" />));
    expect(screen.getByTestId('tab-b').props.accessibilityState?.selected).toBe(true);
  });

  it('[a11y] inactive tabs have accessibilityState.selected=false', () => {
    render(wrap(<BasicTabs defaultValue="a" />));
    expect(screen.getByTestId('tab-b').props.accessibilityState?.selected).toBe(false);
    expect(screen.getByTestId('tab-c').props.accessibilityState?.selected).toBe(false);
  });

  it('[a11y] disabled tab has accessibilityState.disabled=true', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">A</TabItem>
        <TabItem value="b" testID="tab-b" disabled>B</TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-b').props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] enabled tab has accessibilityState.disabled=false', () => {
    render(wrap(<BasicTabs defaultValue="a" />));
    expect(screen.getByTestId('tab-a').props.accessibilityState?.disabled).toBe(false);
  });

  it('[a11y] string-children tab is accessible to screen readers (accessible=true)', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">Overview</TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-a').props.accessible).toBe(true);
    expect(screen.getByTestId('tab-a').props.accessibilityLabel).toBe('Overview');
  });

  it('[a11y] tab with aria-label is accessible regardless of children type', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a" aria-label="Section: Overview">
          <Text>Overview</Text>
        </TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    expect(screen.getByTestId('tab-a').props.accessible).toBe(true);
    expect(screen.getByTestId('tab-a').props.accessibilityLabel).toBe('Section: Overview');
  });

  it('[a11y] TabList with aria-label has accessibilityRole="tablist" and accessible=true', () => {
    render(wrap(
      <Tabs.Root defaultValue="a">
        <Tabs.List testID="tab-list" aria-label="Main navigation">
          <Tabs.Item value="a">A</Tabs.Item>
        </Tabs.List>
        <Tabs.Panel value="a"><Text>Panel</Text></Tabs.Panel>
      </Tabs.Root>,
    ));
    const list = screen.getByTestId('tab-list');
    expect(list.props.accessibilityRole).toBe('tablist');
    expect(list.props.accessible).toBe(true);
    expect(list.props.accessibilityLabel).toBe('Main navigation');
  });

  it('[a11y] TabList without aria-label has accessible=false (tablist hidden from a11y tree)', () => {
    render(wrap(
      <Tabs.Root defaultValue="a">
        <Tabs.List testID="tab-list">
          <Tabs.Item value="a">A</Tabs.Item>
        </Tabs.List>
        <Tabs.Panel value="a"><Text>Panel</Text></Tabs.Panel>
      </Tabs.Root>,
    ));
    const list = screen.getByTestId('tab-list');
    expect(list.props.accessible).toBe(false);
  });
});

/* ─── 4. Bug-catching (expected to FAIL until dev fixes) ────────────────── */

/* ─── 5. Scroll ──────────────────────────────────────────────────────────── */

describe('shouldEnableTabsAxisScroll — unit', () => {
  it('[scroll] returns false before layout (both sizes are 0)', () => {
    expect(shouldEnableTabsAxisScroll(0, 0)).toBe(false);
  });

  it('[scroll] returns false when viewportSize is 0 (layout not yet measured)', () => {
    expect(shouldEnableTabsAxisScroll(800, 0)).toBe(false);
  });

  it('[scroll] returns false when content fits exactly in viewport', () => {
    expect(shouldEnableTabsAxisScroll(300, 300)).toBe(false);
  });

  it('[scroll] returns false when content is smaller than viewport', () => {
    expect(shouldEnableTabsAxisScroll(200, 300)).toBe(false);
  });

  it('[scroll] returns true when content overflows viewport by 1px', () => {
    expect(shouldEnableTabsAxisScroll(301, 300)).toBe(true);
  });

  it('[scroll] returns true when 8 tabs overflow a typical phone width', () => {
    // 8 tabs × ~100px each = 800px content; viewport = 390px (iPhone 15)
    expect(shouldEnableTabsAxisScroll(800, 390)).toBe(true);
  });
});

describe('resolveTabsHorizontalScrollOffset — unit', () => {
  it('[scroll] returns null when tab is fully visible (no scroll needed)', () => {
    // Tab occupies x=50..150 inside a 300px viewport at scroll offset 0
    const result = resolveTabsHorizontalScrollOffset({ x: 50, width: 100 }, 300, 0);
    expect(result).toBeNull();
  });

  it('[scroll] returns offset when tab is fully off-screen to the right', () => {
    // Tab at x=350..450, viewport=300, scroll=0 → tab is off-screen right
    const result = resolveTabsHorizontalScrollOffset({ x: 350, width: 100 }, 300, 0);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it('[scroll] returns offset when tab is partially hidden to the right', () => {
    // Tab at x=250..350, viewport=300, scroll=0 → last 50px hidden
    const result = resolveTabsHorizontalScrollOffset({ x: 250, width: 100 }, 300, 0);
    expect(result).not.toBeNull();
  });

  it('[scroll] returns offset when tab is off-screen to the left (already scrolled past)', () => {
    // Tab at x=10..110, viewport=300, currently scrolled to x=200 → tab is off-screen left
    const result = resolveTabsHorizontalScrollOffset({ x: 10, width: 100 }, 300, 200);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('[scroll] returned offset brings tab into view with edge inset', () => {
    // Tab at x=400..500 in a 300px viewport, scroll=0
    // Expected: scroll to ~(400 - EDGE_INSET) so tab has breathing room
    const result = resolveTabsHorizontalScrollOffset({ x: 400, width: 100 }, 300, 0);
    // Should scroll so the tab end (500px) is within viewport + inset
    expect(result).toBeLessThan(400); // shouldn't over-scroll past tab start
  });
});

describe('resolveTabsVerticalScrollOffset — unit', () => {
  it('[scroll] returns null when tab is fully visible vertically', () => {
    const result = resolveTabsVerticalScrollOffset({ y: 40, height: 40 }, 200, 0);
    expect(result).toBeNull();
  });

  it('[scroll] returns offset when tab is below the vertical viewport', () => {
    // Tab at y=220..260, viewport=200, scroll=0
    const result = resolveTabsVerticalScrollOffset({ y: 220, height: 40 }, 200, 0);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });
});

describe('Tabs scroll — integration (RNTL event simulation)', () => {
  function ManyTabs(): React.ReactElement {
    return (
      <TabGroup defaultValue="t1" testID="tabs-root">
        <TabItem value="t1" testID="tab-1">Tab 1</TabItem>
        <TabItem value="t2" testID="tab-2">Tab 2</TabItem>
        <TabItem value="t3" testID="tab-3">Tab 3</TabItem>
        <TabItem value="t4" testID="tab-4">Tab 4</TabItem>
        <TabItem value="t5" testID="tab-5">Tab 5</TabItem>
        <TabItem value="t6" testID="tab-6">Tab 6</TabItem>
        <TabItem value="t7" testID="tab-7">Tab 7</TabItem>
        <TabItem value="t8" testID="tab-8">Tab 8</TabItem>
        <TabPanel value="t1"><Text>Panel 1</Text></TabPanel>
        <TabPanel value="t8"><Text>Panel 8</Text></TabPanel>
      </TabGroup>
    );
  }

  it('[scroll] scrollEnabled is false before layout events (viewportSize=0)', () => {
    render(wrap(<ManyTabs />));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);
    // Before any layout events, viewportSize=0 → shouldEnableTabsAxisScroll returns false
    expect(tabListScrollView.props.scrollEnabled).toBe(false);
  });

  it('[scroll] scrollEnabled becomes true when content overflows viewport', () => {
    render(wrap(<ManyTabs />));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);

    act(() => {
      // Simulate viewport measured at 390px (phone width)
      fireEvent(tabListScrollView, 'layout', {
        nativeEvent: { layout: { width: 390, height: 48 } },
      });
      // Simulate content measured at 800px (8 tabs × ~100px each)
      fireEvent(tabListScrollView, 'contentSizeChange', 800, 48);
    });

    expect(tabListScrollView.props.scrollEnabled).toBe(true);
  });

  it('[scroll] scrollEnabled stays false when all tabs fit in the viewport', () => {
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a">A</TabItem>
        <TabItem value="b">B</TabItem>
        <TabItem value="c">C</TabItem>
        <TabPanel value="a"><Text>Panel A</Text></TabPanel>
      </TabGroup>,
    ));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);

    act(() => {
      // Viewport wider than content → no overflow
      fireEvent(tabListScrollView, 'layout', {
        nativeEvent: { layout: { width: 390, height: 48 } },
      });
      fireEvent(tabListScrollView, 'contentSizeChange', 240, 48); // 3 tabs × 80px
    });

    expect(tabListScrollView.props.scrollEnabled).toBe(false);
  });

  it('[scroll] scrollEnabled resets to false if tabs are removed and content no longer overflows', () => {
    const { rerender } = render(wrap(<ManyTabs />));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);

    // Simulate overflow
    act(() => {
      fireEvent(tabListScrollView, 'layout', {
        nativeEvent: { layout: { width: 390, height: 48 } },
      });
      fireEvent(tabListScrollView, 'contentSizeChange', 800, 48);
    });
    expect(tabListScrollView.props.scrollEnabled).toBe(true);

    // Simulate content shrunk (tabs removed or remeasured to fit)
    act(() => {
      fireEvent(tabListScrollView, 'contentSizeChange', 240, 48);
    });
    expect(tabListScrollView.props.scrollEnabled).toBe(false);
  });

  it('[scroll] horizontal TabGroup scrolls horizontally (horizontal=true on ScrollView)', () => {
    render(wrap(<ManyTabs />));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);
    expect(tabListScrollView.props.horizontal).toBe(true);
  });

  it('[scroll] vertical TabGroup scrolls vertically (horizontal=false on ScrollView)', () => {
    render(wrap(
      <TabGroup defaultValue="a" orientation="vertical">
        <TabItem value="a">A</TabItem>
        <TabItem value="b">B</TabItem>
        <TabPanel value="a"><Text>Panel A</Text></TabPanel>
      </TabGroup>,
    ));
    const [tabListScrollView] = screen.UNSAFE_getAllByType(ScrollView);
    expect(tabListScrollView.props.horizontal).toBe(false);
  });
});

describe('Tabs — bugs', () => {
  it('[bug] BUG-TABS-1: TabItem with ReactNode children and no aria-label is not accessible to screen readers', () => {
    // resolveTabItemAccessibilityLabel() only handles string | number children.
    // When children is a ReactElement, it returns undefined → accessible=false.
    // VoiceOver and TalkBack will skip this tab entirely.
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">
          <Text>Overview</Text>
        </TabItem>
        <TabPanel value="a"><Text>Panel</Text></TabPanel>
      </TabGroup>,
    ));
    // FAILS: accessible is false because resolveTabItemAccessibilityLabel returns
    // undefined for ReactNode children when no aria-label is provided.
    expect(screen.getByTestId('tab-a').props.accessible).toBe(true);
  });

  it('[bug] BUG-TABS-2: inactive TabPanel is unmounted from the tree instead of hidden', () => {
    // TabsPanel returns null when !isVisible. The correct behavior is to render
    // the panel with importantForAccessibility='no-hide-descendants' so panel
    // state (scroll, form data, focus) is preserved across tab switches.
    render(wrap(
      <TabGroup defaultValue="a">
        <TabItem value="a" testID="tab-a">A</TabItem>
        <TabItem value="b" testID="tab-b">B</TabItem>
        <TabPanel value="a" testID="panel-a"><Text>Panel A</Text></TabPanel>
        <TabPanel value="b" testID="panel-b"><Text>Panel B</Text></TabPanel>
      </TabGroup>,
    ));
    // Both panels should be in the tree simultaneously — panel B hidden via
    // importantForAccessibility='no-hide-descendants', not removed from the DOM.
    // FAILS: panel-b is null because TabPanel returns null when !isVisible.
    expect(screen.queryByTestId('panel-b')).not.toBeNull();
  });
});

/* ─── 8. Interface pure-function tests (moved from packages/ — QA must not modify dev files) ── */

describe('resolveTabAppearance', () => {
  it("[a11y] resolves 'auto' with no parent to 'primary'", () => {
    expect(resolveTabAppearance('auto')).toBe('primary');
  });

  it("[a11y] resolves 'auto' with parentAppearance='secondary' to 'secondary'", () => {
    expect(resolveTabAppearance('auto', 'secondary')).toBe('secondary');
  });

  it("[a11y] explicit 'sparkle' ignores parent appearance", () => {
    expect(resolveTabAppearance('sparkle', 'secondary')).toBe('sparkle');
  });

  it("[a11y] explicit 'positive' ignores parent", () => {
    expect(resolveTabAppearance('positive', 'primary')).toBe('positive');
  });

  it("[a11y] undefined with no parent resolves to 'primary'", () => {
    expect(resolveTabAppearance(undefined)).toBe('primary');
  });
});

describe('resolveTabItemState — edge cases', () => {
  it("[a11y] item size 's' overrides ctx size 'l'", () => {
    const state = resolveTabItemState({
      size: 's', appearance: undefined, orientation: undefined,
      ctxSize: 'l', ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: false, selectedValue: null, tabValue: 'x',
    });
    expect(state.resolvedSize).toBe('s');
  });

  it("[a11y] orientation defaults to 'horizontal' when both item and ctx are undefined", () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: false, selectedValue: null, tabValue: 'x',
    });
    expect(state.resolvedOrientation).toBe('horizontal');
  });

  it('[a11y] isSelected is false when selectedValue does not match tabValue', () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: false, selectedValue: 'b', tabValue: 'a',
    });
    expect(state.isSelected).toBe(false);
  });

  it('[a11y] isSelected is false when selectedValue is null', () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: false, selectedValue: null, tabValue: 'a',
    });
    expect(state.isSelected).toBe(false);
  });

  it('[a11y] isDisabled is true when disabled=true', () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: true, selectedValue: null, tabValue: 'x',
    });
    expect(state.isDisabled).toBe(true);
  });

  it('[a11y] isDisabled is false when disabled is false', () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: false, selectedValue: null, tabValue: 'x',
    });
    expect(state.isDisabled).toBe(false);
  });

  it('[a11y] isDisabled is false when disabled is undefined', () => {
    const state = resolveTabItemState({
      size: undefined, appearance: undefined, orientation: undefined,
      ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
      disabled: undefined, selectedValue: null, tabValue: 'x',
    });
    expect(state.isDisabled).toBe(false);
  });
});

describe('resolveTabItemAccessibilityLabel — slot precedence', () => {
  it('[a11y] returns aria-label when both aria-label and children string are set', () => {
    expect(
      resolveTabItemAccessibilityLabel({ 'aria-label': 'Explicit', children: 'Children text' }),
    ).toBe('Explicit');
  });

  it('[a11y] returns string representation when children is a number', () => {
    expect(resolveTabItemAccessibilityLabel({ children: 42 })).toBe('42');
  });

  it('[a11y] returns undefined when children is a ReactNode (not string/number)', () => {
    expect(
      resolveTabItemAccessibilityLabel({ children: { type: 'span' } as unknown as string }),
    ).toBeUndefined();
  });

  it('[a11y] returns undefined when no props are passed', () => {
    expect(resolveTabItemAccessibilityLabel({})).toBeUndefined();
  });
});

describe('resolveTabItemState × size × orientation × appearance — combination matrix', () => {
  const sizes = ['s', 'm', 'l'] as const;
  const orientations = ['horizontal', 'vertical'] as const;
  const appearances = ['primary', 'secondary', 'neutral'] as const;

  for (const size of sizes) {
    for (const orientation of orientations) {
      for (const appearance of appearances) {
        it(`[a11y] size=${size} / orientation=${orientation} / appearance=${appearance}`, () => {
          const state = resolveTabItemState({
            size, appearance, orientation,
            ctxSize: undefined, ctxAppearance: undefined, ctxOrientation: undefined,
            disabled: false, selectedValue: null, tabValue: 'combo',
          });
          expect(state.resolvedSize).toBe(size);
          expect(state.resolvedOrientation).toBe(orientation);
          expect(state.resolvedAppearance).toBe(appearance);
        });
      }
    }
  }
});

describe('getTabPanelAccessibilityProps', () => {
  it("[a11y] visible panel has importantForAccessibility='auto' and accessibilityRole='none'", () => {
    const props = getTabPanelAccessibilityProps({ children: 'Content' }, { isVisible: true });
    expect(props.importantForAccessibility).toBe('auto');
    expect(props.accessibilityRole).toBe('none');
  });

  it("[a11y] hidden panel has importantForAccessibility='no-hide-descendants'", () => {
    const props = getTabPanelAccessibilityProps({ children: 'Content' }, { isVisible: false });
    expect(props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('[a11y] accessible is always false — panels are not directly focusable', () => {
    const visible = getTabPanelAccessibilityProps({ children: 'Content' }, { isVisible: true });
    const hidden = getTabPanelAccessibilityProps({ children: 'Content' }, { isVisible: false });
    expect(visible.accessible).toBe(false);
    expect(hidden.accessible).toBe(false);
  });
});
