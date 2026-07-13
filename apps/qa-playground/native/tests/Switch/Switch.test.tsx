/**
 * Switch QA tests — state resolution, functional, a11y, Figma matrix smoke,
 * visual signal assertions, and bug-catching.
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property       Values                                 Notes
 *   ─────────────────────────────────────────────────────────────────────────
 *   size           S | M | L                              default M
 *   checked        true | false                           "selected" in Figma
 *   readOnly       true | false
 *   disabled       true | false
 *   appearance     auto | neutral | primary | secondary   checked-fill role
 *                  negative | positive | informative      auto → secondary
 *                  warning | sparkle
 *   accent         primary | secondary | sparkle          fill override; stripped on readOnly
 *   children       string                                 label text alongside switch
 *   aria-label     string                                 accessible name
 *
 *   Figma matrix (from design spec):
 *     Axes: size (M / S / L) × readOnly (false / true) × selected (false / true) = 12 combinations
 *
 * ─── Native → accessibility mapping ─────────────────────────────────────────
 *
 *   checked          → accessibilityState.checked
 *   disabled         → accessibilityState.disabled=true + aria-disabled=true
 *   readOnly         → accessibilityState.disabled=true + aria-readonly=true
 *                      (BUG-SWITCH-1: should be disabled=false for readOnly)
 *   aria-label       → accessibilityLabel (direct)
 *   children string  → accessibilityLabel (fallback)
 *   aria-hidden      → accessible=false + accessibilityElementsHidden=true
 *
 * ─── Known dev-file bugs (raise to dev team, do not modify dev files) ────────
 *
 * BUG-SWITCH-1 [readOnly incorrectly sets accessibilityState.disabled=true]
 *   getSwitchAccessibilityProps sets:
 *     accessibilityState.disabled = state.isDisabled || state.isReadOnly
 *   A readOnly switch is not disabled — it is non-interactive but still
 *   focusable and communicates its checked state. Marking it disabled causes
 *   VoiceOver/TalkBack to skip the element entirely or announce it as "dimmed".
 *   The implementation does correctly set `aria-readonly: true` as a supplementary
 *   signal, but this is overshadowed when accessibilityState.disabled=true.
 *   Expected: readOnly=true → accessibilityState.disabled = false
 *   Actual:   readOnly=true → accessibilityState.disabled = true
 *   File:     packages/ui-native/src/components/Switch/interface.ts:171
 *   Fix:      Change `disabled: state.isDisabled || state.isReadOnly`
 *             to      `disabled: state.isDisabled`
 *   [bug] tests below are expected to FAIL until the dev file is corrected.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '@ui-native/components/Switch/Switch.native';
import {
  getSwitchAccessibilityProps,
  resolveSize,
  useSwitchState,
} from '@ui-native/components/Switch/interface';
import { wrap } from '../../utils/renderWithTheme';

/** Finds the Pressable that carries the role, state, and interaction. */
function getControl() {
  return screen.UNSAFE_getByProps({ accessibilityRole: 'switch' });
}

// ─── State resolution — pure function tests ────────────────────────────────────
//
// useSwitchState() and getSwitchAccessibilityProps() contain no hooks;
// call them directly without a render context.

describe('Switch — state: defaults', () => {
  it('[fn] size omitted → resolvedSize="m"', () => {
    expect(useSwitchState({}).resolvedSize).toBe('m');
  });

  it('[fn] appearance omitted → resolvedAppearance="secondary"', () => {
    expect(useSwitchState({}).resolvedAppearance).toBe('secondary');
  });

  it('[fn] disabled omitted → isDisabled=false', () => {
    expect(useSwitchState({}).isDisabled).toBe(false);
  });

  it('[fn] readOnly omitted → isReadOnly=false', () => {
    expect(useSwitchState({}).isReadOnly).toBe(false);
  });

  it('[fn] checked omitted → isControlled=false, controlledChecked=undefined', () => {
    const state = useSwitchState({});
    expect(state.isControlled).toBe(false);
    expect(state.controlledChecked).toBeUndefined();
  });
});

describe('Switch — state: appearance resolution', () => {
  it('[fn] appearance="auto" → resolvedAppearance="secondary"', () => {
    expect(useSwitchState({ appearance: 'auto' }).resolvedAppearance).toBe('secondary');
  });

  it.each([
    'neutral', 'primary', 'secondary', 'negative',
    'positive', 'informative', 'warning',
  ] as const)('[fn] appearance="%s" passes through unchanged', (appearance) => {
    expect(useSwitchState({ appearance }).resolvedAppearance).toBe(appearance);
  });
});

describe('Switch — state: size', () => {
  it.each(['s', 'm', 'l'] as const)('[fn] size="%s" → resolvedSize="%s"', (size) => {
    expect(useSwitchState({ size }).resolvedSize).toBe(size);
  });
});

describe('Switch — state: disabled / readOnly', () => {
  it('[fn] disabled=true → isDisabled=true', () => {
    expect(useSwitchState({ disabled: true }).isDisabled).toBe(true);
  });

  it('[fn] disabled=false → isDisabled=false', () => {
    expect(useSwitchState({ disabled: false }).isDisabled).toBe(false);
  });

  it('[fn] readOnly=true → isReadOnly=true, isDisabled stays false', () => {
    const s = useSwitchState({ readOnly: true });
    expect(s.isReadOnly).toBe(true);
    expect(s.isDisabled).toBe(false);
  });

  it('[fn] readOnly=false → isReadOnly=false', () => {
    expect(useSwitchState({ readOnly: false }).isReadOnly).toBe(false);
  });

  it('[fn] disabled=true + readOnly=true → both flags true', () => {
    const s = useSwitchState({ disabled: true, readOnly: true });
    expect(s.isDisabled).toBe(true);
    expect(s.isReadOnly).toBe(true);
  });
});

describe('Switch — state: controlled mode', () => {
  it('[fn] checked=true → isControlled=true, controlledChecked=true', () => {
    const s = useSwitchState({ checked: true });
    expect(s.isControlled).toBe(true);
    expect(s.controlledChecked).toBe(true);
  });

  it('[fn] checked=false → isControlled=true, controlledChecked=false', () => {
    const s = useSwitchState({ checked: false });
    expect(s.isControlled).toBe(true);
    expect(s.controlledChecked).toBe(false);
  });

  it('[fn] checked omitted → isControlled=false', () => {
    expect(useSwitchState({}).isControlled).toBe(false);
  });
});

describe('Switch — state: accent', () => {
  it('[fn] accent="sparkle" passes through when not readOnly', () => {
    expect(useSwitchState({ accent: 'sparkle' }).resolvedAccent).toBe('sparkle');
  });

  it('[fn] accent="primary" passes through when not readOnly', () => {
    expect(useSwitchState({ accent: 'primary' }).resolvedAccent).toBe('primary');
  });

  it('[fn] accent stripped to undefined when readOnly=true', () => {
    expect(useSwitchState({ readOnly: true, accent: 'sparkle' }).resolvedAccent).toBeUndefined();
  });

  it('[fn] accent stripped when readOnly + accent="primary"', () => {
    expect(useSwitchState({ readOnly: true, accent: 'primary' }).resolvedAccent).toBeUndefined();
  });
});

// ─── resolveSize — pure function ──────────────────────────────────────────────

describe('Switch — resolveSize', () => {
  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
  ] as const)('resolveSize("%s") → "%s"', (input, expected) => {
    expect(resolveSize(input)).toBe(expected);
  });
});

// ─── A11y props — pure function tests ────────────────────────────────────────

describe('Switch — a11y props: core', () => {
  it('[a11y] accessibilityRole is always "switch"', () => {
    const a11y = getSwitchAccessibilityProps({}, { isDisabled: false, isReadOnly: false, isChecked: false });
    expect(a11y.accessibilityRole).toBe('switch');
  });

  it('[a11y] accessible=true by default', () => {
    const a11y = getSwitchAccessibilityProps({}, { isDisabled: false, isReadOnly: false, isChecked: false });
    expect(a11y.accessible).toBe(true);
  });

  it('[a11y] focusable=true by default', () => {
    const a11y = getSwitchAccessibilityProps({}, { isDisabled: false, isReadOnly: false, isChecked: false });
    expect(a11y.focusable).toBe(true);
  });
});

describe('Switch — a11y props: checked state', () => {
  it('[a11y] isChecked=true → accessibilityState.checked=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: true },
    );
    expect(a11y.accessibilityState.checked).toBe(true);
  });

  it('[a11y] isChecked=false → accessibilityState.checked=false', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.checked).toBe(false);
  });
});

describe('Switch — a11y props: label derivation', () => {
  it('[a11y] aria-label → accessibilityLabel', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Enable notifications' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBe('Enable notifications');
  });

  it('[a11y] children string → accessibilityLabel when aria-label absent', () => {
    const a11y = getSwitchAccessibilityProps(
      { children: 'Dark mode' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBe('Dark mode');
  });

  it('[a11y] aria-label takes precedence over children string', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle dark mode', children: 'Dark mode' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBe('Toggle dark mode');
  });

  it('[a11y] both omitted → accessibilityLabel is undefined', () => {
    const a11y = getSwitchAccessibilityProps(
      {},
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBeUndefined();
  });
});

describe('Switch — a11y props: disabled state', () => {
  it('[a11y] isDisabled=true → accessibilityState.disabled=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: true, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });

  it('[a11y] isDisabled=false → accessibilityState.disabled=false', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('[a11y] isDisabled=true → aria-disabled=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: true, isReadOnly: false, isChecked: false },
    );
    expect(a11y['aria-disabled']).toBe(true);
  });

  it('[a11y] isDisabled=false → aria-disabled is undefined', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y['aria-disabled']).toBeUndefined();
  });
});

describe('Switch — a11y props: readOnly state', () => {
  it('[a11y] isReadOnly=true → aria-readonly=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: true, isChecked: false },
    );
    expect(a11y['aria-readonly']).toBe(true);
  });

  it('[a11y] isReadOnly=false → aria-readonly is undefined', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y['aria-readonly']).toBeUndefined();
  });
});

describe('Switch — a11y props: aria-hidden', () => {
  it('[a11y] aria-hidden=true → accessible=false', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessible).toBe(false);
  });

  it('[a11y] aria-hidden=true → focusable=false', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.focusable).toBe(false);
  });

  it('[a11y] aria-hidden=true → accessibilityElementsHidden=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden=true → importantForAccessibility="no-hide-descendants"', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('[a11y] aria-hidden absent → importantForAccessibility is undefined', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.importantForAccessibility).toBeUndefined();
  });
});

describe('Switch — a11y props: accessibilityHint', () => {
  it('[a11y] accessibilityHint passes through unchanged', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', accessibilityHint: 'Turns dark mode on or off' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityHint).toBe('Turns dark mode on or off');
  });

  it('[a11y] accessibilityHint absent → undefined', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityHint).toBeUndefined();
  });
});

// ─── Figma matrix — smoke ─────────────────────────────────────────────────────
//
// Figma matrix: size (M / S / L) × readOnly (false / true) × selected (false / true).
// All 12 combinations must render without crashing.

describe('Switch — Figma matrix: size × readOnly × selected', () => {
  const SIZES = ['s', 'm', 'l'] as const;
  const READONLY_STATES = [false, true] as const;
  const CHECKED_STATES = [false, true] as const;

  for (const size of SIZES) {
    for (const readOnly of READONLY_STATES) {
      for (const checked of CHECKED_STATES) {
        it(`[smoke] size="${size}" readOnly=${readOnly} checked=${checked} renders without crashing`, () => {
          expect(() =>
            render(wrap(
              <Switch
                size={size}
                readOnly={readOnly}
                checked={checked}
                aria-label="Test switch"
                testID="switch"
              />,
            )),
          ).not.toThrow();
        });
      }
    }
  }
});

// ─── Figma matrix: size × disabled ────────────────────────────────────────────

describe('Switch — Figma matrix: size × disabled', () => {
  const SIZES = ['s', 'm', 'l'] as const;

  for (const size of SIZES) {
    it(`[smoke] size="${size}" disabled renders without crashing`, () => {
      expect(() =>
        render(wrap(<Switch size={size} disabled aria-label="Test switch" testID="switch" />)),
      ).not.toThrow();
    });
  }
});

// ─── Figma matrix: appearance × checked ──────────────────────────────────────

describe('Switch — Figma matrix: appearance × checked', () => {
  const APPEARANCES = [
    'auto', 'neutral', 'primary', 'secondary',
    'negative', 'positive', 'informative', 'warning',
  ] as const;

  for (const appearance of APPEARANCES) {
    for (const checked of [false, true] as const) {
      it(`[smoke] appearance="${appearance}" checked=${checked} renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Switch
              appearance={appearance}
              checked={checked}
              aria-label="Test switch"
              testID="switch"
            />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: accent × checked ──────────────────────────────────────────

describe('Switch — Figma matrix: accent × checked', () => {
  const ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

  for (const accent of ACCENTS) {
    for (const checked of [false, true] as const) {
      it(`[smoke] accent="${accent}" checked=${checked} renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Switch
              accent={accent}
              checked={checked}
              aria-label="Test switch"
              testID="switch"
            />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Switch — smoke', () => {
  it('[smoke] renders with no props (all defaults)', () => {
    expect(() => render(wrap(<Switch />))).not.toThrow();
  });

  it('[smoke] renders with aria-label only', () => {
    expect(() => render(wrap(<Switch aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] renders with children label', () => {
    expect(() => render(wrap(<Switch>Dark mode</Switch>))).not.toThrow();
  });

  it('[smoke] uncontrolled with defaultChecked=true', () => {
    expect(() => render(wrap(<Switch defaultChecked={true} aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] uncontrolled with defaultChecked=false', () => {
    expect(() => render(wrap(<Switch defaultChecked={false} aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] controlled checked=true', () => {
    expect(() =>
      render(wrap(<Switch checked={true} onCheckedChange={() => {}} aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] controlled checked=false', () => {
    expect(() =>
      render(wrap(<Switch checked={false} onCheckedChange={() => {}} aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] disabled=true', () => {
    expect(() => render(wrap(<Switch disabled aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] readOnly=true', () => {
    expect(() => render(wrap(<Switch readOnly aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] disabled + checked', () => {
    expect(() =>
      render(wrap(<Switch disabled checked={true} aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] readOnly + checked', () => {
    expect(() =>
      render(wrap(<Switch readOnly checked={true} aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] testID accepted', () => {
    expect(() => render(wrap(<Switch testID="my-switch" aria-label="Toggle" />))).not.toThrow();
  });

  it('[smoke] onCheckedChange callback accepted', () => {
    expect(() =>
      render(wrap(<Switch onCheckedChange={() => {}} aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] accessibilityHint accepted', () => {
    expect(() =>
      render(wrap(<Switch accessibilityHint="Toggles dark mode" aria-label="Toggle" />)),
    ).not.toThrow();
  });

  it('[smoke] aria-hidden=true accepted', () => {
    expect(() => render(wrap(<Switch aria-hidden={true} />))).not.toThrow();
  });
});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('Switch — functional: testID and role', () => {
  it('[fn] testID is forwarded to the Pressable', () => {
    render(wrap(<Switch testID="my-switch" aria-label="Toggle" />));
    expect(screen.getByTestId('my-switch')).toBeTruthy();
  });

  it('[fn] Pressable has accessibilityRole="switch"', () => {
    render(wrap(<Switch testID="sw" aria-label="Toggle" />));
    expect(getControl()).toBeTruthy();
  });

  it('[fn] control is accessible by default', () => {
    render(wrap(<Switch testID="sw" aria-label="Toggle" />));
    expect(getControl().props.accessible).toBe(true);
  });

  it('[fn] control is focusable by default', () => {
    render(wrap(<Switch testID="sw" aria-label="Toggle" />));
    expect(getControl().props.focusable).toBe(true);
  });
});

describe('Switch — functional: checked state', () => {
  it('[fn] default unchecked: accessibilityState.checked=false', () => {
    render(wrap(<Switch testID="sw" aria-label="Toggle" />));
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });

  it('[fn] checked=true: accessibilityState.checked=true', () => {
    render(wrap(<Switch checked={true} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });

  it('[fn] checked=false: accessibilityState.checked=false', () => {
    render(wrap(<Switch checked={false} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });

  it('[fn] defaultChecked=true: initial accessibilityState.checked=true', () => {
    render(wrap(<Switch defaultChecked={true} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });

  it('[fn] defaultChecked=false: initial accessibilityState.checked=false', () => {
    render(wrap(<Switch defaultChecked={false} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });
});

describe('Switch — functional: toggle interaction', () => {
  it('[fn] press toggles uncontrolled switch from false to true', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    const control = getControl();
    expect(control.props.accessibilityState?.checked).toBe(false);
    fireEvent.press(control);
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });

  it('[fn] press toggles uncontrolled switch from true to false', () => {
    render(wrap(<Switch defaultChecked={true} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(true);
    fireEvent.press(getControl());
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });

  it('[fn] onCheckedChange fires with true on first press (default unchecked)', () => {
    const handler = vi.fn();
    render(wrap(<Switch onCheckedChange={handler} aria-label="Toggle" testID="sw" />));
    fireEvent.press(getControl());
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('[fn] onCheckedChange fires with false when toggling off', () => {
    const handler = vi.fn();
    render(wrap(
      <Switch defaultChecked={true} onCheckedChange={handler} aria-label="Toggle" testID="sw" />,
    ));
    fireEvent.press(getControl());
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('[fn] disabled=true: press does NOT fire onCheckedChange', () => {
    const handler = vi.fn();
    render(wrap(
      <Switch disabled onCheckedChange={handler} aria-label="Toggle" testID="sw" />,
    ));
    fireEvent.press(getControl());
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] disabled=true: checked state does not toggle on press', () => {
    render(wrap(<Switch disabled aria-label="Toggle" testID="sw" />));
    fireEvent.press(getControl());
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });

  it('[fn] readOnly=true: press does NOT fire onCheckedChange', () => {
    const handler = vi.fn();
    render(wrap(
      <Switch readOnly onCheckedChange={handler} aria-label="Toggle" testID="sw" />,
    ));
    fireEvent.press(getControl());
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] readOnly=true: checked state does not toggle on press', () => {
    render(wrap(<Switch readOnly defaultChecked={true} aria-label="Toggle" testID="sw" />));
    fireEvent.press(getControl());
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });
});

describe('Switch — functional: label', () => {
  it('[fn] aria-label reflected as accessibilityLabel on control', () => {
    render(wrap(<Switch aria-label="Notifications" testID="sw" />));
    expect(getControl().props.accessibilityLabel).toBe('Notifications');
  });

  it('[fn] children string rendered as visible Text in tree', () => {
    render(wrap(<Switch>Dark mode</Switch>));
    expect(screen.getByText('Dark mode')).toBeTruthy();
  });

  it('[fn] children string also used as accessibilityLabel when aria-label absent', () => {
    render(wrap(<Switch testID="sw">Auto-update</Switch>));
    expect(getControl().props.accessibilityLabel).toBe('Auto-update');
  });

  it('[fn] aria-label overrides children for accessibilityLabel', () => {
    render(wrap(<Switch aria-label="Override label" testID="sw">Label text</Switch>));
    expect(getControl().props.accessibilityLabel).toBe('Override label');
  });

  it('[fn] label Text has accessible=false (not a separate a11y element)', () => {
    render(wrap(<Switch>Dark mode</Switch>));
    const text = screen.getByText('Dark mode');
    expect(text.props.accessible).toBe(false);
  });
});

describe('Switch — functional: disabled state', () => {
  it('[fn] disabled=true: accessibilityState.disabled=true', () => {
    render(wrap(<Switch disabled aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(true);
  });

  it('[fn] disabled=false: accessibilityState.disabled=false', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(false);
  });

  it('[fn] disabled=true: Pressable native disabled prop is true', () => {
    render(wrap(<Switch disabled aria-label="Toggle" testID="sw" />));
    expect(screen.getByTestId('sw').props.disabled).toBe(true);
  });

  it('[fn] enabled switch: Pressable native disabled prop is false', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(screen.getByTestId('sw').props.disabled).toBe(false);
  });
});

describe('Switch — functional: readOnly state', () => {
  it('[fn] readOnly=true: Pressable native disabled=true (interaction blocked)', () => {
    render(wrap(<Switch readOnly aria-label="Toggle" testID="sw" />));
    expect(screen.getByTestId('sw').props.disabled).toBe(true);
  });

  it('[fn] readOnly=true: aria-readonly=true on control', () => {
    render(wrap(<Switch readOnly aria-label="Toggle" testID="sw" />));
    expect(getControl().props['aria-readonly']).toBe(true);
  });

  it('[fn] readOnly=false: aria-readonly is absent', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(getControl().props['aria-readonly']).toBeUndefined();
  });
});

describe('Switch — functional: accessibilityHint', () => {
  it('[fn] accessibilityHint is forwarded to the control', () => {
    render(wrap(
      <Switch accessibilityHint="Turns dark mode on" aria-label="Toggle" testID="sw" />,
    ));
    expect(getControl().props.accessibilityHint).toBe('Turns dark mode on');
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Switch — a11y', () => {
  it('[a11y] getByLabelText works with aria-label', () => {
    render(wrap(<Switch aria-label="Enable notifications" testID="sw" />));
    expect(screen.getByLabelText('Enable notifications')).toBeTruthy();
  });

  it('[a11y] getByLabelText works with children string', () => {
    render(wrap(<Switch testID="sw">Auto-update</Switch>));
    expect(screen.getByLabelText('Auto-update')).toBeTruthy();
  });

  it('[a11y] role="switch" is queryable', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'switch' })).toBeTruthy();
  });

  it('[a11y] unchecked: screen reader reads switch as "off" (checked=false)', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(false);
  });

  it('[a11y] checked=true: screen reader reads switch as "on" (checked=true)', () => {
    render(wrap(<Switch checked={true} aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });

  it('[a11y] disabled switch announced as disabled to screen readers', () => {
    render(wrap(<Switch disabled aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] enabled switch: accessible=true', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessible).toBe(true);
  });

  it('[a11y] aria-hidden=true: accessible=false (excluded from a11y tree)', () => {
    render(wrap(<Switch aria-hidden={true} />));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'switch' }).props.accessible).toBe(false);
  });

  it('[a11y] aria-hidden=true: accessibilityElementsHidden=true', () => {
    render(wrap(<Switch aria-hidden={true} />));
    expect(
      screen.UNSAFE_getByProps({ accessibilityRole: 'switch' }).props.accessibilityElementsHidden,
    ).toBe(true);
  });

  it('[a11y] accessibilityHint forwarded for screen reader interaction guidance', () => {
    render(wrap(
      <Switch aria-label="Toggle" accessibilityHint="Turns dark mode on or off" testID="sw" />,
    ));
    expect(getControl().props.accessibilityHint).toBe('Turns dark mode on or off');
  });

  it('[a11y] checked state updates after toggle (VoiceOver announces new state)', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.checked).toBe(false);
    fireEvent.press(getControl());
    expect(getControl().props.accessibilityState?.checked).toBe(true);
  });
});

// ─── Visual signal tests (Applitools equivalent) ──────────────────────────────
//
// These tests verify the observable visual state signals that would be caught
// by Applitools visual regression: opacity, Pressable disabled prop, and the
// presence of label text. Animated color transitions (backgroundColor) are
// driven by Animated.Value interpolations and cannot be directly inspected
// in the RNTL node environment — those are covered by Maestro E2E tests.

describe('Switch — visual: disabled opacity', () => {
  it('[visual] disabled=true: wrapper View has opacity 0.5', () => {
    const { toJSON } = render(
      wrap(<Switch disabled aria-label="Toggle" testID="sw" />),
    );
    const json = toJSON();
    // The root View (wrapper) contains opacity when disabled and NOT readOnly.
    // Flatten all style arrays and check for the opacity token.
    const wrapperStyle = (json as { props?: { style?: unknown } })?.props?.style;
    const flatStyles = Array.isArray(wrapperStyle) ? wrapperStyle.flat(Infinity) : [wrapperStyle];
    expect(flatStyles).toEqual(expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]));
  });

  it('[visual] readOnly=true: wrapper View has NO opacity reduction', () => {
    const { toJSON } = render(
      wrap(<Switch readOnly aria-label="Toggle" testID="sw" />),
    );
    const json = toJSON();
    const wrapperStyle = (json as { props?: { style?: unknown } })?.props?.style;
    const flatStyles = (Array.isArray(wrapperStyle) ? wrapperStyle.flat(Infinity) : [wrapperStyle]).filter(Boolean);
    expect(flatStyles).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
    );
  });

  it('[visual] enabled switch: wrapper View has NO opacity reduction', () => {
    const { toJSON } = render(
      wrap(<Switch aria-label="Toggle" testID="sw" />),
    );
    const json = toJSON();
    const wrapperStyle = (json as { props?: { style?: unknown } })?.props?.style;
    const flatStyles = (Array.isArray(wrapperStyle) ? wrapperStyle.flat(Infinity) : [wrapperStyle]).filter(Boolean);
    expect(flatStyles).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
    );
  });
});

describe('Switch — visual: label rendering', () => {
  it('[visual] children string renders visible label Text', () => {
    render(wrap(<Switch>Wi-Fi</Switch>));
    expect(screen.getByText('Wi-Fi')).toBeTruthy();
  });

  it('[visual] no children: no extra Text node in tree', () => {
    render(wrap(<Switch aria-label="Toggle" testID="sw" />));
    expect(screen.queryByText('Toggle')).toBeNull();
  });
});

describe('Switch — visual: Figma matrix key states (snapshot)', () => {
  it('[visual] size=M unchecked default state', () => {
    const { toJSON } = render(wrap(<Switch size="m" aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] size=M checked=true', () => {
    const { toJSON } = render(wrap(<Switch size="m" checked={true} aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] size=S unchecked', () => {
    const { toJSON } = render(wrap(<Switch size="s" aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] size=L unchecked', () => {
    const { toJSON } = render(wrap(<Switch size="l" aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] readOnly=false checked=false', () => {
    const { toJSON } = render(wrap(<Switch readOnly={false} aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] readOnly=true checked=true', () => {
    const { toJSON } = render(wrap(<Switch readOnly={true} checked={true} aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] disabled=true checked=false', () => {
    const { toJSON } = render(wrap(<Switch disabled aria-label="Toggle" testID="sw" />));
    expect(toJSON()).toMatchSnapshot();
  });

  it('[visual] with children label', () => {
    const { toJSON } = render(wrap(<Switch testID="sw">Dark mode</Switch>));
    expect(toJSON()).toMatchSnapshot();
  });
});

// ─── Bug-catching tests ───────────────────────────────────────────────────────
//
// These tests assert the CORRECT intended behaviour. They are expected to FAIL
// until the underlying dev-file bug is fixed.

describe('Switch — bug-catching', () => {
  it('[bug] BUG-SWITCH-1: readOnly should NOT set accessibilityState.disabled=true (pure fn)', () => {
    // A readOnly switch is non-interactive but still focusable and announces its
    // checked state. Marking it disabled causes VoiceOver/TalkBack to skip it.
    // EXPECTED: disabled=false   ACTUAL: disabled=true → test FAILS until fixed.
    const state = { isDisabled: false, isReadOnly: true, isChecked: false };
    const a11y = getSwitchAccessibilityProps({ 'aria-label': 'Toggle' }, state);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('[bug] BUG-SWITCH-1: readOnly switch is accessible to screen readers (rendered)', () => {
    // Same bug exercised via the full rendered component.
    render(wrap(<Switch readOnly aria-label="Toggle" testID="sw" />));
    expect(getControl().props.accessibilityState?.disabled).toBe(false);
  });

  it('[bug] BUG-SWITCH-1: readOnly checked=true switch still announces as "on" to VoiceOver', () => {
    // When disabled=true overrides the element, VoiceOver may not announce the
    // checked state at all. This ensures the switch remains audible while readOnly.
    render(wrap(<Switch readOnly checked={true} aria-label="Toggle" testID="sw" />));
    const control = getControl();
    // Both must be correct simultaneously: checked=true AND disabled=false.
    expect(control.props.accessibilityState?.checked).toBe(true);
    expect(control.props.accessibilityState?.disabled).toBe(false);
  });
});
