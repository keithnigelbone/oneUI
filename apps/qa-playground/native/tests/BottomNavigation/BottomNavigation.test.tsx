/**
 * BottomNavigation QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/BottomNavigation/BottomNavigation.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property   Figma values       Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   items      2 | 3 | 4 | 5     (number of children — no direct native prop)
 *   label      1Line | 2Line | none  labelType: '1line' | '2line' | 'none'
 *                                    (BUG-BN-1: name + case mismatch)
 *
 * ─── Native props ────────────────────────────────────────────────────────────
 *
 *   aria-label   string — REQUIRED; announces the nav landmark to screen readers
 *   labelType    '1line'(default) | '2line' | 'none' — forwarded to all Item children via context
 *   value        string — controlled selected tab value
 *   defaultValue string — uncontrolled initial selected value
 *   onValueChange(value: string) — fires when any Item is pressed
 *   showDivider  boolean (default: true) — shows hairline Divider at top
 *   appearance   ComponentAppearance — forwarded to Items via context (auto→primary)
 *   testID
 *
 * ─── Structure ───────────────────────────────────────────────────────────────
 *
 *   <View accessibilityRole="tablist" accessibilityLabel={aria-label}>
 *     {showDivider && <Divider orientation="horizontal" size="s" />}
 *     <View>{children}</View>      ← item list
 *   </View>
 *
 *   MAX_ITEMS = 5 — warns in dev if more children provided.
 *   Context provides labelType, value, onValueChange, appearance to all Items.
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-BN-1 · Figma "label" prop = 1Line|2Line|none but native uses "labelType" = '1line'|'2line'|'none'
 *     Figma API table: property = "label", values = 1Line | 2Line | none.
 *     Native BottomNavigationProps: `labelType?: '1line' | '2line' | 'none'`.
 *     Two mismatches:
 *       • Prop name: Figma "label" vs native "labelType"
 *       • Value case: Figma "1Line"/"2Line" vs native "'1line'"/"'2line'"
 *     Callers following Figma who pass `label="1Line"` get a TypeScript error.
 *     File: packages/ui-native/src/components/BottomNavigation/interface.ts:26
 *     Fix:  Either rename native `labelType` → `label` and update value strings
 *           to '1Line'/'2Line'/'none', or document the mapping explicitly.
 *
 *   BUG-BN-2 · aria-label is required but TypeScript alone does not catch it at all call sites
 *     BottomNavigationProps declares `'aria-label': string` (non-optional).
 *     However, the component emits a console.warn (not throws) when it is missing,
 *     meaning the navigation landmark has no accessible name — VoiceOver/TalkBack
 *     announces it as "tab bar" without context. Screen reader users cannot identify
 *     which navigation is speaking.
 *     File: packages/ui-native/src/components/BottomNavigation/BottomNavigation.native.tsx:37-40
 *     Fix:  TypeScript required type is correct; warn should also be added for empty-string case.
 *
 *   BUG-BN-3 · More than MAX_ITEMS=5 children warns but still renders all
 *     The component warns in dev mode but renders all children (no hard cap).
 *     The design system supports only 2–5 items per Figma spec.
 *     File: packages/ui-native/src/components/BottomNavigation/BottomNavigation.native.tsx:29-33
 *     Fix:  Consider capping rendered children at MAX_ITEMS, or keep warn-only
 *           and add explicit test for 6+ children warning.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import type { SemanticIconName } from '@oneui/shared';
import { tokens } from '@oneui/tokens';
import { BottomNavigation } from '@ui-native/components/BottomNavigation/BottomNavigation.native';
import { BottomNavigationItem } from '@ui-native/components/BottomNavigationItem/BottomNavigationItem.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Renders a BottomNavigation with N item slots for matrix tests. */
function makeNav(count: number, labelType: '1line' | '2line' | 'none', extra?: Record<string, unknown>) {
  const icons: SemanticIconName[] = ['home', 'settings', 'user', 'heart', 'search'];
  const labels = ['Home', 'Settings', 'Profile', 'Favourites', 'Search'];
  return (
    <BottomNavigation
      aria-label="Main navigation"
      labelType={labelType}
      testID="nav"
      {...extra}
    >
      {Array.from({ length: count }, (_, i) => (
        <BottomNavigationItem
          key={i}
          icon={icons[i] ?? 'home'}
          label={labels[i]}
          value={labels[i].toLowerCase()}
          testID={`tab-${i}`}
        />
      ))}
    </BottomNavigation>
  );
}

// ─── Figma matrix: items × label ─────────────────────────────────────────────
//
// Figma matrix: rows = items (2/3/4/5), columns = label (1Line/2Line/none)

describe('BottomNavigation — Figma matrix: items × labelType', () => {
  const ITEM_COUNTS = [2, 3, 4, 5] as const;
  const LABEL_TYPES: ('1line' | '2line' | 'none')[] = ['1line', '2line', 'none'];

  for (const count of ITEM_COUNTS) {
    for (const labelType of LABEL_TYPES) {
      it(`[smoke] items=${count} labelType="${labelType}" renders without crashing`, () => {
        expect(() =>
          render(wrap(makeNav(count, labelType))),
        ).not.toThrow();
      });

      it(`[fn] items=${count} labelType="${labelType}" — tablist has ${count} tab children`, () => {
        render(wrap(makeNav(count, labelType)));
        expect(screen.getAllByRole('tab').length).toBe(count);
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('BottomNavigation — smoke', () => {
  it('[smoke] renders without crashing with 2 items', () => {
    expect(() =>
      render(wrap(
        <BottomNavigation aria-label="Nav">
          <BottomNavigationItem icon="home" label="Home" />
          <BottomNavigationItem icon="settings" label="Settings" />
        </BottomNavigation>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders all labelType variants', () => {
    for (const labelType of ['1line', '2line', 'none'] as const) {
      const { unmount } = render(wrap(
        <BottomNavigation aria-label="Nav" labelType={labelType}>
          <BottomNavigationItem icon="home" label="Home" aria-label="Home" />
          <BottomNavigationItem icon="settings" label="Settings" aria-label="Settings" />
        </BottomNavigation>,
      ));
      unmount();
    }
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
  });

  it('[smoke] renders with showDivider=false', () => {
    expect(() =>
      render(wrap(
        <BottomNavigation aria-label="Nav" showDivider={false}>
          <BottomNavigationItem icon="home" label="Home" />
          <BottomNavigationItem icon="settings" label="Settings" />
        </BottomNavigation>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders with defaultValue pre-selected', () => {
    expect(() =>
      render(wrap(
        <BottomNavigation aria-label="Nav" defaultValue="home">
          <BottomNavigationItem icon="home" label="Home" value="home" />
          <BottomNavigationItem icon="settings" label="Settings" value="settings" />
        </BottomNavigation>,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: tablist container ───────────────────────────────────────────

describe('BottomNavigation — functional: container', () => {
  it('[fn] has accessibilityRole="tablist"', () => {
    render(wrap(
      <BottomNavigation aria-label="Main nav" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('nav').props.accessibilityRole).toBe('tablist');
  });

  it('[fn] aria-label sets accessibilityLabel on the container', () => {
    render(wrap(
      <BottomNavigation aria-label="Main navigation" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('nav').props.accessibilityLabel).toBe('Main navigation');
  });

  it('[fn] getByRole("tablist") finds the container', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByRole('tablist')).toBeTruthy();
  });

  it('[fn] accessible=true on the container', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('nav').props.accessible).toBe(true);
  });

  it('[fn] accessibilityHint forwarded to container', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" accessibilityHint="Swipe to navigate" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('nav').props.accessibilityHint).toBe('Swipe to navigate');
  });

  it('[fn] all children render as tab items', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
        <BottomNavigationItem icon="user" label="Profile" />
      </BottomNavigation>,
    ));
    expect(screen.getAllByRole('tab').length).toBe(3);
  });
});

// ─── Functional: value / selection ───────────────────────────────────────────

describe('BottomNavigation — functional: value and selection', () => {
  it('[fn] controlled value marks the matching tab as selected', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" value="settings">
        <BottomNavigationItem icon="home" label="Home" value="home" testID="tab-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="tab-settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('tab-home').props.accessibilityState?.selected).toBe(false);
    expect(screen.getByTestId('tab-settings').props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] defaultValue pre-selects the matching tab (uncontrolled)', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" defaultValue="home">
        <BottomNavigationItem icon="home" label="Home" value="home" testID="tab-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="tab-settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('tab-home').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('tab-settings').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] pressing a tab fires onValueChange with its value', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigation aria-label="Nav" onValueChange={handler}>
        <BottomNavigationItem icon="home" label="Home" value="home" testID="tab-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="tab-settings" />
      </BottomNavigation>,
    ));
    fireEvent.press(screen.getByTestId('tab-settings'));
    expect(handler).toHaveBeenCalledWith('settings');
  });

  it('[fn] pressing a different tab updates selection (uncontrolled)', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" defaultValue="home">
        <BottomNavigationItem icon="home" label="Home" value="home" testID="tab-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="tab-settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('tab-home').props.accessibilityState?.selected).toBe(true);
    fireEvent.press(screen.getByTestId('tab-settings'));
    expect(screen.getByTestId('tab-settings').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('tab-home').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] only one tab is selected at a time (mutual exclusivity)', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" value="home" testID="t0" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="t1" />
        <BottomNavigationItem icon="user" label="Profile" value="profile" testID="t2" />
      </BottomNavigation>,
    ));
    fireEvent.press(screen.getByTestId('t1'));
    const tabs = screen.getAllByRole('tab');
    const selectedCount = tabs.filter(t => t.props.accessibilityState?.selected).length;
    expect(selectedCount).toBe(1);
  });

  it('[fn] controlled mode: pressing tab calls onValueChange but does not self-update', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigation aria-label="Nav" value="home" onValueChange={handler}>
        <BottomNavigationItem icon="home" label="Home" value="home" testID="tab-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="tab-settings" />
      </BottomNavigation>,
    ));
    fireEvent.press(screen.getByTestId('tab-settings'));
    expect(handler).toHaveBeenCalledWith('settings');
    // Still "home" because controlled externally:
    expect(screen.getByTestId('tab-home').props.accessibilityState?.selected).toBe(true);
  });
});

// ─── Functional: labelType context ───────────────────────────────────────────

describe('BottomNavigation — functional: labelType context', () => {
  it('[fn] labelType="none" hides all labels across items', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" labelType="none">
        <BottomNavigationItem icon="home" label="Home" aria-label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" aria-label="Settings" />
      </BottomNavigation>,
    ));
    // Label text not shown when labelType=none
    expect(screen.queryByText('Home')).toBeNull();
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('[fn] labelType="1line" shows single-line labels', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" labelType="1line">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('[fn] labelType="2line" shows two-line labels', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" labelType="2line">
        <BottomNavigationItem icon="home" label="Label can go into 2 lines" />
        <BottomNavigationItem icon="settings" label="Settings label" />
      </BottomNavigation>,
    ));
    expect(screen.getByText('Label can go into 2 lines')).toBeTruthy();
  });

  it('[fn] default labelType is "1line" — labels visible by default', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('[fn] item-level labelType overrides context labelType', () => {
    // Individual item can override the group labelType
    render(wrap(
      <BottomNavigation aria-label="Nav" labelType="1line">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" labelType="none" aria-label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeNull(); // hidden by item-level override
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('BottomNavigation — a11y', () => {
  it('[a11y] container has accessibilityRole="tablist"', () => {
    render(wrap(
      <BottomNavigation aria-label="Main nav" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByRole('tablist')).toBeTruthy();
  });

  it('[a11y] aria-label required — provides accessible name for nav landmark', () => {
    render(wrap(
      <BottomNavigation aria-label="App navigation" testID="nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('nav').props.accessibilityLabel).toBe('App navigation');
  });

  it('[a11y] all Items have role="tab"', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
        <BottomNavigationItem icon="user" label="Profile" />
      </BottomNavigation>,
    ));
    expect(screen.getAllByRole('tab').length).toBe(3);
  });

  it('[a11y] selected Item has accessibilityState.selected=true', () => {
    render(wrap(
      <BottomNavigation aria-label="Nav" value="settings">
        <BottomNavigationItem icon="home" label="Home" value="home" testID="t-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="t-settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByTestId('t-settings').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByTestId('t-home').props.accessibilityState?.selected).toBe(false);
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('BottomNavigation — bug-catching', () => {
  // ── BUG-BN-1: Figma "label" vs native "labelType" naming mismatch ──────────

  it('[bug] BUG-BN-1: Figma "label=1Line" maps to native labelType="1line" — naming mismatch', () => {
    // Figma prop: label = 1Line | 2Line | none (component property)
    // Native prop: labelType = '1line' | '2line' | 'none'
    // Figma values use different capitalization and a different prop name.
    // This test confirms the correct native usage (labelType):
    render(wrap(
      <BottomNavigation aria-label="Nav" labelType="1line" testID="bn-lbl">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    expect(screen.getByText('Home')).toBeTruthy();
    // @ts-expect-error — "label" is the Figma prop name but not the native prop:
    render(wrap(
      <BottomNavigation aria-label="Nav" label="1Line" testID="bn-figma-lbl">
        <BottomNavigationItem icon="home" label="Home" />
        <BottomNavigationItem icon="settings" label="Settings" />
      </BottomNavigation>,
    ));
    // label="1Line" is ignored — labelType defaults to '1line' anyway, so labels still show
    // but this documents that the Figma API name is not the native API name.
  });

  // ── BUG-BN-2: aria-label warns but not enforced at runtime ─────────────────

  it('[bug] BUG-BN-2: omitting aria-label emits console.warn (no accessible landmark name)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // @ts-expect-error — aria-label is required by TypeScript but not at runtime
      render(wrap(
        <BottomNavigation>
          <BottomNavigationItem icon="home" label="Home" />
          <BottomNavigationItem icon="settings" label="Settings" />
        </BottomNavigation>,
      ));
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('aria-label'),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  // ── BUG-BN-3: > MAX_ITEMS warns but still renders all ──────────────────────

  it('[bug] BUG-BN-3: 6 items (>MAX_ITEMS=5) emits console.warn but still renders all 6', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(
        <BottomNavigation aria-label="Nav">
          <BottomNavigationItem icon="home" label="Home" />
          <BottomNavigationItem icon="settings" label="Settings" />
          <BottomNavigationItem icon="user" label="Profile" />
          <BottomNavigationItem icon="heart" label="Favourites" />
          <BottomNavigationItem icon="search" label="Search" />
          <BottomNavigationItem icon="home" label="Extra" />
        </BottomNavigation>,
      ));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('6 items'));
      // Bug: all 6 still render despite the warning:
      expect(screen.getAllByRole('tab').length).toBe(5); // Expected 5 (capped), FAILS: gets 6
    } finally {
      warnSpy.mockRestore();
    }
  });
});
