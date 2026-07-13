import { describe, expect, it } from 'vitest';
import {
  getRadioAccessibilityProps,
  resolveSize,
  useRadioState,
} from './interface';

describe('radioA11y', () => {
  it('exposes role=radio with state.selected=true when checked', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Option A' },
      { isDisabled: false, isReadOnly: false, isChecked: true },
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('radio');
    expect(a11y.accessibilityLabel).toBe('Option A');
    expect(a11y.accessibilityState.selected).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('reports state.selected=false when unchecked', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Option' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.selected).toBe(false);
  });

  it('falls back to the visible label when aria-label is omitted', () => {
    const a11y = getRadioAccessibilityProps(
      { label: 'Standard delivery' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabel).toBe('Standard delivery');
  });

  it('forwards aria-labelledby as accessibilityLabelledBy', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Box', 'aria-labelledby': 'group-heading' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabelledBy).toBe('group-heading');
  });

  it('falls back to aria-describedby when labelledby is missing', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Box', 'aria-describedby': 'group-desc' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityLabelledBy).toBe('group-desc');
  });

  it('hides the subtree when aria-hidden=true', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Box', 'aria-hidden': true },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('marks disabled state', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Box' },
      { isDisabled: true, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });

  it('passes accessibilityHint through unchanged', () => {
    const a11y = getRadioAccessibilityProps(
      { 'aria-label': 'Box', accessibilityHint: 'Selects this option' },
      { isDisabled: false, isReadOnly: false, isChecked: false },
    );
    expect(a11y.accessibilityHint).toBe('Selects this option');
  });
});

describe('useRadioState', () => {
  it('defaults size=m, appearance=secondary, isChecked=false', () => {
    const state = useRadioState({ value: 'x' });
    expect(state.resolvedSize).toBe('m');
    expect(state.resolvedAppearance).toBe('secondary');
    expect(state.isDisabled).toBe(false);
    expect(state.isReadOnly).toBe(false);
    expect(state.isChecked).toBe(false);
  });

  it('resolves auto appearance to secondary (matches web)', () => {
    const state = useRadioState({ value: 'x', appearance: 'auto' });
    expect(state.resolvedAppearance).toBe('secondary');
  });

  it('keeps explicit appearance', () => {
    const state = useRadioState({ value: 'x', appearance: 'positive' });
    expect(state.resolvedAppearance).toBe('positive');
  });

  it('derives isChecked directly from props.checked', () => {
    expect(useRadioState({ value: 'a', checked: true }).isChecked).toBe(true);
    expect(useRadioState({ value: 'a', checked: false }).isChecked).toBe(false);
    expect(useRadioState({ value: 'a' }).isChecked).toBe(false);
  });

  it('emits data attributes mirroring web (.module.css selectors)', () => {
    const unchecked = useRadioState({ value: 'x', size: 'l', appearance: 'negative' });
    expect(unchecked.dataAttrs).toEqual({
      'data-size': 'l',
      'data-appearance': 'negative',
      'data-unchecked': '',
    });

    const checked = useRadioState({ value: 'a', size: 'm', checked: true });
    expect(checked.dataAttrs).toMatchObject({ 'data-checked': '' });

    const ro = useRadioState({ value: 'a', readOnly: true, checked: true });
    expect(ro.dataAttrs).toMatchObject({ 'data-readonly': '', 'data-checked': '' });
  });

  it('forwards aria props on disabled / read-only', () => {
    expect(getRadioAccessibilityProps({}, { isDisabled: true, isReadOnly: false, isSelected: false })['aria-disabled']).toBe(true);
    expect(getRadioAccessibilityProps({}, { isDisabled: false, isReadOnly: true, isSelected: false })['aria-readonly']).toBe(true);
  });
});

describe('resolveSize', () => {
  it.each([
    ['s', 's'],
    ['m', 'm'],
    ['l', 'l'],
  ] as const)('passes %s through unchanged', (input, expected) => {
    expect(resolveSize(input)).toBe(expected);
  });

  it("falls back to 'm' for unknown / cast inputs", () => {
    expect(resolveSize('xl' as unknown as 'l')).toBe('m');
  });
});
