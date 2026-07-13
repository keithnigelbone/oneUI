import { describe, expect, it } from 'vitest';
import {
  getCheckboxAccessibilityProps,
  resolveSize,
  useCheckboxState,
} from './interface';

describe('checkboxA11y', () => {
  it('exposes role=checkbox with state.checked=true when selected', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Accept terms' },
      { isDisabled: false, isReadOnly: false, isSelected: true, isIndeterminate: false },
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('checkbox');
    expect(a11y.accessibilityLabel).toBe('Accept terms');
    expect(a11y.accessibilityState.checked).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('reports mixed state for indeterminate', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Mixed' },
      { isDisabled: false, isReadOnly: false, isSelected: false, isIndeterminate: true },
    );
    expect(a11y.accessibilityState.checked).toBe('mixed');
  });

  it('falls back to the visible label when aria-label is omitted', () => {
    const a11y = getCheckboxAccessibilityProps(
      { label: 'Subscribe to updates' },
      { isDisabled: false, isReadOnly: false, isSelected: false, isIndeterminate: false },
    );
    expect(a11y.accessibilityLabel).toBe('Subscribe to updates');
  });

  it('forwards aria-describedby as accessibilityLabelledBy', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Box', 'aria-describedby': 'help-1' },
      { isDisabled: false, isReadOnly: false, isSelected: false, isIndeterminate: false },
    );
    expect(a11y.accessibilityLabelledBy).toBe('help-1');
  });

  it('hides the subtree when aria-hidden=true', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Box', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isSelected: false, isIndeterminate: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes accessibilityHint through unchanged', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Box', accessibilityHint: 'Toggles the option' },
      { isDisabled: false, isReadOnly: false, isSelected: false, isIndeterminate: false },
    );
    expect(a11y.accessibilityHint).toBe('Toggles the option');
  });

  it('marks disabled state', () => {
    const a11y = getCheckboxAccessibilityProps(
      { 'aria-label': 'Box' },
      { isDisabled: true, isReadOnly: false, isSelected: false, isIndeterminate: false },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });
});

describe('useCheckboxState', () => {
  it('defaults size=m, appearance=secondary (auto), disabled=false', () => {
    const state = useCheckboxState({});
    expect(state.resolvedSize).toBe('m');
    expect(state.resolvedAppearance).toBe('secondary');
    expect(state.isDisabled).toBe(false);
    expect(state.isReadOnly).toBe(false);
  });

  it('resolves auto appearance to secondary (matches web)', () => {
    const state = useCheckboxState({ appearance: 'auto' });
    expect(state.resolvedAppearance).toBe('secondary');
  });

  it('keeps explicit appearance', () => {
    const state = useCheckboxState({ appearance: 'positive' });
    expect(state.resolvedAppearance).toBe('positive');
  });

  it('canonicalises legacy size aliases', () => {
    expect(useCheckboxState({ size: 'small' }).resolvedSize).toBe('s');
    expect(useCheckboxState({ size: 'medium' }).resolvedSize).toBe('m');
    expect(useCheckboxState({ size: 'large' }).resolvedSize).toBe('l');
  });

  it('emits data attributes mirroring web (.module.css selectors)', () => {
    const unchecked = useCheckboxState({ size: 'l', appearance: 'negative' });
    expect(unchecked.dataAttrs).toEqual({
      'data-size': 'l',
      'data-appearance': 'negative',
      'data-unselected': '',
    });

    const sel = useCheckboxState({ size: 'm', selected: true });
    expect(sel.dataAttrs).toMatchObject({ 'data-selected': '' });

    const indeterminate = useCheckboxState({ size: 's', indeterminate: true });
    expect(indeterminate.dataAttrs).toMatchObject({ 'data-indeterminate': '' });

    const ro = useCheckboxState({ readOnly: true, selected: true });
    expect(ro.dataAttrs).toMatchObject({ 'data-readonly': '', 'data-selected': '' });
  });

  it('forwards aria props on disabled / read-only', () => {
    expect(getCheckboxAccessibilityProps({}, { isDisabled: true, isReadOnly: false, isSelected: false, isIndeterminate: false })['aria-disabled']).toBe(true);
    expect(getCheckboxAccessibilityProps({}, { isDisabled: false, isReadOnly: true, isSelected: false, isIndeterminate: false })['aria-readonly']).toBe(true);
  });
});

describe('resolveSize', () => {
  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
    ['small', 's'],
    ['medium', 'm'],
    ['large', 'l'],
  ] as const)('canonicalises %s → %s', (input, expected) => {
    expect(resolveSize(input)).toBe(expected);
  });
});
