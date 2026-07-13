import { describe, expect, it } from 'vitest';
import {
  getSwitchAccessibilityProps,
  resolveSize,
  useSwitchState,
} from '../interface';

describe('getSwitchAccessibilityProps', () => {
  it('exposes role=switch with state.checked=true when on', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Enable notifications' },
      { isDisabled: false, isReadOnly: false, isChecked: true },
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('switch');
    expect(a11y.accessibilityLabel).toBe('Enable notifications');
    expect(a11y.accessibilityState.checked).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('returns checked=false when off', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.checked).toBe(false);
  });

  it('falls back to the visible children string when aria-label is omitted', () => {
    const a11y = getSwitchAccessibilityProps(
      { children: 'Auto-update' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBe('Auto-update');
  });

  it('marks disabled state in accessibilityState.disabled', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: true, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });

  it('marks readOnly as disabled for accessibility (no toggle possible)', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: true, isChecked: true },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
    expect(a11y['aria-readonly']).toBe(true);
  });

  it('hides the element when aria-hidden=true', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes accessibilityHint through unchanged', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle', accessibilityHint: 'Toggles dark mode' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityHint).toBe('Toggles dark mode');
  });

  it('sets aria-disabled when disabled', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: true, isReadOnly: false, isChecked: false },
    );
    expect(a11y['aria-disabled']).toBe(true);
  });

  it('does not set aria-disabled for enabled switch', () => {
    const a11y = getSwitchAccessibilityProps(
      { 'aria-label': 'Toggle' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y['aria-disabled']).toBeUndefined();
  });
});

describe('useSwitchState', () => {
  it('defaults size=m, appearance=secondary (auto), disabled=false', () => {
    const state = useSwitchState({});
    expect(state.resolvedSize).toBe('m');
    expect(state.resolvedAppearance).toBe('secondary');
    expect(state.isDisabled).toBe(false);
    expect(state.isReadOnly).toBe(false);
  });

  it('resolves auto appearance to secondary (matches web)', () => {
    const state = useSwitchState({ appearance: 'auto' });
    expect(state.resolvedAppearance).toBe('secondary');
  });

  it('keeps explicit appearance', () => {
    const state = useSwitchState({ appearance: 'positive' });
    expect(state.resolvedAppearance).toBe('positive');
  });

  it('marks isReadOnly when readOnly prop is true', () => {
    const state = useSwitchState({ readOnly: true });
    expect(state.isReadOnly).toBe(true);
    expect(state.isDisabled).toBe(false);
  });

  it('marks isDisabled when disabled prop is true', () => {
    const state = useSwitchState({ disabled: true });
    expect(state.isDisabled).toBe(true);
    expect(state.isReadOnly).toBe(false);
  });

  it('detects controlled mode when checked is provided', () => {
    const controlled = useSwitchState({ checked: true });
    expect(controlled.isControlled).toBe(true);
    expect(controlled.controlledChecked).toBe(true);
  });

  it('detects uncontrolled mode when checked is undefined', () => {
    const uncontrolled = useSwitchState({});
    expect(uncontrolled.isControlled).toBe(false);
    expect(uncontrolled.controlledChecked).toBeUndefined();
  });

  it('strips accent when readOnly (matches web: readOnly → neutral, no accent)', () => {
    const state = useSwitchState({ readOnly: true, accent: 'sparkle' });
    expect(state.resolvedAccent).toBeUndefined();
  });

  it('preserves accent when not readOnly', () => {
    const state = useSwitchState({ accent: 'sparkle' });
    expect(state.resolvedAccent).toBe('sparkle');
  });
});

describe('resolveSize', () => {
  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
  ] as const)('returns canonical %s → %s', (input, expected) => {
    expect(resolveSize(input)).toBe(expected);
  });
});
