import { describe, expect, it } from 'vitest';
import {
  checkboxFieldSizeToInputNumeric,
  getCheckboxFieldAccessibilityProps,
  useCheckboxFieldState,
} from './interface';

describe('checkboxFieldA11y', () => {
  it('exposes the field label as accessibilityLabel', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'Notification channels' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabel).toBe('Notification channels');
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('prefers aria-label over the visible label', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'Visible', 'aria-label': 'Override' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabel).toBe('Override');
  });

  it('forwards aria-describedby as accessibilityLabelledBy', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'L', 'aria-describedby': 'help-id' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabelledBy).toBe('help-id');
  });

  it('hides the subtree when aria-hidden=true', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'L', 'aria-hidden': true },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes accessibilityHint through unchanged', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'L', accessibilityHint: 'Choose one' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityHint).toBe('Choose one');
  });

  it('marks disabled state', () => {
    const a11y = getCheckboxFieldAccessibilityProps(
      { label: 'L' },
      { isInvalid: false, isDisabled: true },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });
});

describe('useCheckboxFieldState', () => {
  it('isInvalid=true when invalid prop is true', () => {
    const state = useCheckboxFieldState({ invalid: true });
    expect(state.isInvalid).toBe(true);
  });

  it('isInvalid=true when error string is non-empty', () => {
    const state = useCheckboxFieldState({ error: 'Something went wrong' });
    expect(state.isInvalid).toBe(true);
  });

  it('isInvalid=false when error string is whitespace-only', () => {
    const state = useCheckboxFieldState({ error: '   ' });
    expect(state.isInvalid).toBe(false);
  });

  it('isInvalid=false when neither invalid nor error provided', () => {
    const state = useCheckboxFieldState({});
    expect(state.isInvalid).toBe(false);
  });

  it('isMultiMode=true when children present', () => {
    const state = useCheckboxFieldState({ children: 'anything' });
    expect(state.isMultiMode).toBe(true);
  });

  it('isMultiMode=false when no children', () => {
    const state = useCheckboxFieldState({});
    expect(state.isMultiMode).toBe(false);
  });

  it('isDisabled mirrors disabled prop', () => {
    expect(useCheckboxFieldState({ disabled: true }).isDisabled).toBe(true);
    expect(useCheckboxFieldState({ disabled: false }).isDisabled).toBe(false);
    expect(useCheckboxFieldState({}).isDisabled).toBe(false);
  });
});

describe('checkboxFieldSizeToInputNumeric', () => {
  it.each([
    ['s', 8],
    ['m', 10],
    ['l', 12],
    ['small', 8],
    ['medium', 10],
    ['large', 12],
  ] as const)('maps %s → %s', (input, expected) => {
    expect(checkboxFieldSizeToInputNumeric(input)).toBe(expected);
  });

  it('defaults to 10 (M) when size omitted', () => {
    expect(checkboxFieldSizeToInputNumeric()).toBe(10);
  });
});
