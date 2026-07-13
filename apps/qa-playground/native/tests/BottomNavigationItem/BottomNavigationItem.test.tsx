/**
 * BottomNavigationItem QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/BottomNavigationItem/BottomNavigationItem.native.tsx
 *
 * ─── Figma API table (BottomNav.Item) ────────────────────────────────────────
 *
 *   Property   Figma values                       Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   active     false | true                        active?: boolean  (same)
 *   type       label1Line | label2Line | labelFalse  labelType: '1line'|'2line'|'none'
 *                                                  (BUG-BNI-1: naming completely different)
 *
 * ─── Press event order ────────────────────────────────────────────────────────
 *
 *   1. onPress  fires
 *   2. onClick  fires  (alias, secondary handler)
 *   3. Linking.openURL(href) called (if href set)
 *   4. ctx.onValueChange(value) (if value + BottomNavigation context)
 *
 * ─── isActive resolution ─────────────────────────────────────────────────────
 *
 *   props.active !== undefined → use props.active (explicit override, BUG-BNI-3)
 *   else props.value && ctx?.value → props.value === ctx.value
 *   else → false
 *
 * ─── testID convention ────────────────────────────────────────────────────────
 *
 *   testID          → Pressable
 *   testID-icon     → icon slot View
 *   testID-label    → label Text (accessible=false)
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-BNI-1 · Figma "type" vs native "labelType" — completely different naming
 *     Figma: type = label1Line | label2Line | labelFalse
 *     Native: labelType = '1line' | '2line' | 'none'
 *     Mismatches: prop name (type vs labelType) AND value names.
 *     File: packages/ui-native/src/components/BottomNavigationItem/interface.ts:29
 *     Fix:  Rename labelType → type and align value strings with Figma, or
 *           document the Figma→native prop mapping explicitly.
 *
 *   BUG-BNI-2 · labelType="none" without aria-label — no accessible name
 *     When labelType='none' and no aria-label, the tab has no accessibilityLabel.
 *     VoiceOver/TalkBack announces only "tab" with no context.
 *     Component warns in dev but does not enforce the requirement.
 *     File: packages/ui-native/src/components/BottomNavigationItem/BottomNavigationItem.native.tsx:89-95
 *     Fix:  Make aria-label TypeScript-required when labelType='none'.
 *
 *   BUG-BNI-3 · active=true + context value mismatch → two tabs both appear active
 *     When active=true is passed explicitly AND a different tab's value matches
 *     the parent BottomNavigation's value, both tabs show selected=true.
 *     Violates radio-button mutual exclusivity.
 *     File: packages/ui-native/src/components/BottomNavigationItem/interface.ts:42-48
 *     Fix:  Inside a context, always derive isActive from context, ignoring props.active.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { BottomNavigationItem } from '@ui-native/components/BottomNavigationItem/BottomNavigationItem.native';
import { BottomNavigation } from '@ui-native/components/BottomNavigation/BottomNavigation.native';
import {
  itemHeight,
} from '@ui-native/components/BottomNavigationItem/BottomNavigationItem.styles.native';
import { wrap } from '../../utils/renderWithTheme';

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: active × labelType ────────────────────────────────────────
//
// Figma: active=false/true × type=label1Line/label2Line/labelFalse
// Native: active=false/true × labelType='1line'/'2line'/'none'

describe('BottomNavigationItem — Figma matrix: active × labelType', () => {
  const LABEL_TYPES: ('1line' | '2line' | 'none')[] = ['1line', '2line', 'none'];

  for (const active of [false, true] as const) {
    for (const labelType of LABEL_TYPES) {
      it(`[smoke] active=${active} labelType="${labelType}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <BottomNavigationItem
              icon="home"
              label="Label"
              aria-label="Label"
              active={active}
              labelType={labelType}
              testID="bni-matrix"
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] active=${active} labelType="${labelType}" — correct role and selected state`, () => {
        render(wrap(
          <BottomNavigationItem
            icon="home"
            label="Label"
            aria-label="Label"
            active={active}
            labelType={labelType}
            testID="bni-fn"
          />,
        ));
        const el = screen.getByTestId('bni-fn');
        expect(el.props.accessibilityRole).toBe('tab');
        expect(el.props.accessibilityState?.selected).toBe(active);
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('BottomNavigationItem — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() =>
      render(wrap(<BottomNavigationItem icon="home" label="Home" />)),
    ).not.toThrow();
  });

  it('[smoke] renders label text', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" />));
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('[smoke] renders active without crashing', () => {
    expect(() =>
      render(wrap(<BottomNavigationItem icon="home" label="Home" active />)),
    ).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() =>
      render(wrap(<BottomNavigationItem icon="home" label="Home" disabled />)),
    ).not.toThrow();
  });

  it('[smoke] renders labelType="none" with aria-label', () => {
    expect(() =>
      render(wrap(
        <BottomNavigationItem icon="home" aria-label="Home" labelType="none" />,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders with activeIcon that switches when active', () => {
    expect(() =>
      render(wrap(
        <BottomNavigationItem icon="home" activeIcon="person" label="Home" active />,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: active state ─────────────────────────────────────────────────

describe('BottomNavigationItem — functional: active state', () => {
  it('[fn] active=true → accessibilityState.selected=true', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" active testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] active=false → accessibilityState.selected=false', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" active={false} testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] no active prop → selected=false by default', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] active state derived from value === context.value (via BottomNavigation)', () => {
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

// ─── Functional: events ───────────────────────────────────────────────────────

describe('BottomNavigationItem — functional: events', () => {
  it('[fn] fires onPress when tapped', () => {
    const handler = vi.fn();
    render(wrap(<BottomNavigationItem icon="home" label="Home" onPress={handler} testID="bni" />));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] fires onClick when tapped (alias for onPress)', () => {
    const handler = vi.fn();
    render(wrap(<BottomNavigationItem icon="home" label="Home" onClick={handler} testID="bni" />));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onPress fires before onClick', () => {
    const order: string[] = [];
    const onPress = vi.fn(() => order.push('onPress'));
    const onClick = vi.fn(() => order.push('onClick'));
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" onPress={onPress} onClick={onClick} testID="bni" />,
    ));
    fireEvent.press(screen.getByTestId('bni'));
    expect(order).toEqual(['onPress', 'onClick']);
  });

  it('[fn] both onPress and onClick fire on each press', () => {
    const pressH = vi.fn();
    const clickH = vi.fn();
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" onPress={pressH} onClick={clickH} testID="bni" />,
    ));
    fireEvent.press(screen.getByTestId('bni'));
    expect(pressH).toHaveBeenCalledTimes(1);
    expect(clickH).toHaveBeenCalledTimes(1);
  });

  it('[fn] pressing inside BottomNavigation fires onValueChange with tab value', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigation aria-label="Nav" onValueChange={handler}>
        <BottomNavigationItem icon="home" label="Home" value="home" testID="t-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="t-settings" />
      </BottomNavigation>,
    ));
    fireEvent.press(screen.getByTestId('t-settings'));
    expect(handler).toHaveBeenCalledWith('settings');
  });

  it('[fn] multiple taps fire onPress each time (re-tappable)', () => {
    const handler = vi.fn();
    render(wrap(<BottomNavigationItem icon="home" label="Home" onPress={handler} testID="bni" />));
    fireEvent.press(screen.getByTestId('bni'));
    fireEvent.press(screen.getByTestId('bni'));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('[fn] active=true does NOT block onPress', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" active onPress={handler} testID="bni" />,
    ));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] disabled=true blocks onPress', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" disabled onPress={handler} testID="bni" />,
    ));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] disabled=true blocks onClick too', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" disabled onClick={handler} testID="bni" />,
    ));
    fireEvent.press(screen.getByTestId('bni'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] disabled tab inside BottomNavigation does not fire onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <BottomNavigation aria-label="Nav" onValueChange={handler}>
        <BottomNavigationItem icon="home" label="Home" value="home" disabled testID="t-dis" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="t-ok" />
      </BottomNavigation>,
    ));
    fireEvent.press(screen.getByTestId('t-dis'));
    expect(handler).not.toHaveBeenCalled();
    // Non-disabled tab still works:
    fireEvent.press(screen.getByTestId('t-ok'));
    expect(handler).toHaveBeenCalledWith('settings');
  });
});

// ─── Functional: label and testID ────────────────────────────────────────────

describe('BottomNavigationItem — functional: label and testID', () => {
  it('[fn] label text renders as visible text', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" />));
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('[fn] label uses testID="${testID}-label" convention', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni-label')).toBeTruthy();
  });

  it('[fn] icon slot uses testID="${testID}-icon" convention', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni-icon')).toBeTruthy();
  });

  it('[fn] labelType="none" hides label text', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" aria-label="Home" labelType="none" />,
    ));
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('[fn] labelType="2line" sets numberOfLines=2 on label Text', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Label text" labelType="2line" testID="bni" />,
    ));
    expect(screen.getByTestId('bni-label').props.numberOfLines).toBe(2);
  });

  it('[fn] labelType="1line" sets numberOfLines=1 on label Text', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" labelType="1line" testID="bni" />,
    ));
    expect(screen.getByTestId('bni-label').props.numberOfLines).toBe(1);
  });

  it('[fn] label Text is accessible=false (Pressable carries the a11y label)', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni-label').props.accessible).toBe(false);
  });
});

// ─── Functional: item height ──────────────────────────────────────────────────

describe('BottomNavigationItem — functional: item height per labelType', () => {
  it('[fn] labelType="none" → height = tokens.spacing["14"]', () => {
    render(wrap(
      <BottomNavigationItem icon="home" aria-label="Home" labelType="none" testID="bni" />,
    ));
    expect(flatStyle(screen.getByTestId('bni').props.style).height).toBe(itemHeight('none'));
  });

  it('[fn] labelType="1line" → height = tokens.spacing["16"]', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" labelType="1line" testID="bni" />,
    ));
    expect(flatStyle(screen.getByTestId('bni').props.style).height).toBe(itemHeight('1line'));
  });

  it('[fn] labelType="2line" → height = tokens.spacing["18"] (tallest)', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" labelType="2line" testID="bni" />,
    ));
    expect(flatStyle(screen.getByTestId('bni').props.style).height).toBe(itemHeight('2line'));
  });

  it('[fn] item heights increase: none < 1line < 2line', () => {
    expect(itemHeight('none')).toBeLessThan(itemHeight('1line'));
    expect(itemHeight('1line')).toBeLessThan(itemHeight('2line'));
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('BottomNavigationItem — a11y', () => {
  it('[a11y] has accessibilityRole="tab"', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityRole).toBe('tab');
  });

  it('[a11y] getByRole("tab") finds the item', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" />));
    expect(screen.getByRole('tab')).toBeTruthy();
  });

  it('[a11y] accessible=true on the Pressable', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni').props.accessible).toBe(true);
  });

  it('[a11y] active=true → accessibilityState.selected=true', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" active testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityState?.selected).toBe(true);
  });

  it('[a11y] disabled → accessibilityState.disabled=true', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" disabled testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] accessibilityLabel from label prop', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" testID="bni" />));
    expect(screen.getByTestId('bni').props.accessibilityLabel).toBe('Home');
  });

  it('[a11y] aria-label overrides label as accessibilityLabel', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" aria-label="Navigate home" testID="bni" />,
    ));
    expect(screen.getByTestId('bni').props.accessibilityLabel).toBe('Navigate home');
  });

  it('[a11y] getByLabelText finds item via label prop', () => {
    render(wrap(<BottomNavigationItem icon="home" label="Home" />));
    expect(screen.getByLabelText('Home')).toBeTruthy();
  });

  it('[a11y] accessibilityHint forwarded to Pressable', () => {
    render(wrap(
      <BottomNavigationItem icon="home" label="Home" accessibilityHint="Go to home" testID="bni" />,
    ));
    expect(screen.getByTestId('bni').props.accessibilityHint).toBe('Go to home');
  });

  it('[a11y] labelType="none" with aria-label — tab has accessible name', () => {
    render(wrap(
      <BottomNavigationItem icon="home" aria-label="Home" labelType="none" testID="bni" />,
    ));
    expect(screen.getByTestId('bni').props.accessibilityLabel).toBe('Home');
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('BottomNavigationItem — bug-catching', () => {
  // ── BUG-BNI-1: Figma "type" vs native "labelType" ──────────────────────────

  it('[bug] BUG-BNI-1: Figma type="label1Line" ≠ native labelType="1line" — prop name AND values differ', () => {
    // Correct native usage (labelType):
    render(wrap(<BottomNavigationItem icon="home" label="Home" labelType="1line" testID="bni-ok" />));
    expect(screen.getByText('Home')).toBeTruthy();
    // Figma type prop not recognised — silently ignored at runtime:
    // @ts-expect-error — "type" is Figma's name, not the native prop name
    render(wrap(<BottomNavigationItem icon="home" label="Home" type="label1Line" testID="bni-bad" />));
    // Label still shows because native defaults to labelType='1line' (from context or default)
    expect(screen.getByText('Home')).toBeTruthy();
  });

  // ── BUG-BNI-2: labelType="none" without aria-label emits warn ───────────────

  it('[bug] BUG-BNI-2: labelType="none" without aria-label → console.warn fires, no accessible name', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(<BottomNavigationItem icon="home" labelType="none" testID="bni-no-lbl" />));
      // Warn fires:
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
      // Bug: accessibilityLabel is undefined — tab has no name for screen readers
      expect(screen.getByTestId('bni-no-lbl').props.accessibilityLabel).toBeTruthy();
    } finally {
      warnSpy.mockRestore();
    }
  });

  // ── BUG-BNI-3: active=true + context value mismatch → two tabs both active ──

  it('[bug] BUG-BNI-3: explicit active=true alongside context-selected tab → two selected tabs', () => {
    // Home has active=true (explicit) but context selects "settings".
    // Expected: only one tab should be selected (mutual exclusivity).
    // Bug: both home (explicit) and settings (context) show selected=true.
    render(wrap(
      <BottomNavigation aria-label="Nav" value="settings">
        <BottomNavigationItem icon="home" label="Home" value="home" active testID="t-home" />
        <BottomNavigationItem icon="settings" label="Settings" value="settings" testID="t-settings" />
      </BottomNavigation>,
    ));
    const activeCount = screen.getAllByRole('tab')
      .filter(t => t.props.accessibilityState?.selected).length;
    // Expected: 1 (mutual exclusivity). Bug: gets 2.
    expect(activeCount).toBe(1);
  });
});
