import { describe, expect, it } from 'vitest';
import {
  getRadioFieldAccessibilityProps,
  radioFieldSizeToInputNumeric,
  useRadioFieldState,
} from './interface';

describe('radioFieldA11y', () => {
  it('exposes the field label as accessibilityLabel', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'Delivery speed' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabel).toBe('Delivery speed');
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
  });

  it('prefers aria-label over the visible label', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'Visible', 'aria-label': 'Override' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabel).toBe('Override');
  });

  it('forwards aria-describedby as accessibilityLabelledBy', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'L', 'aria-describedby': 'help-id' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityLabelledBy).toBe('help-id');
  });

  it('hides the subtree when aria-hidden=true', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'L', 'aria-hidden': true },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes accessibilityHint through unchanged', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'L', accessibilityHint: 'Choose one' },
      { isInvalid: false, isDisabled: false },
    );
    expect(a11y.accessibilityHint).toBe('Choose one');
  });

  it('marks disabled state', () => {
    const a11y = getRadioFieldAccessibilityProps(
      { label: 'L' },
      { isInvalid: false, isDisabled: true },
    );
    expect(a11y.accessibilityState.disabled).toBe(true);
  });
});

describe('useRadioFieldState', () => {
  it('isInvalid=true when invalid prop is true', () => {
    expect(useRadioFieldState({ invalid: true }).isInvalid).toBe(true);
  });

  it('isInvalid=true when error string is non-empty', () => {
    expect(useRadioFieldState({ error: 'Oops' }).isInvalid).toBe(true);
  });

  it('isInvalid=false when error is whitespace only', () => {
    expect(useRadioFieldState({ error: '   ' }).isInvalid).toBe(false);
  });

  it('isInvalid=false when neither invalid nor error', () => {
    expect(useRadioFieldState({}).isInvalid).toBe(false);
  });

  it('isMultiOptionMode=true when more than one child', () => {
    const state = useRadioFieldState({ children: ['a', 'b'] });
    expect(state.isMultiOptionMode).toBe(true);
    expect(state.isPlainOptionMode).toBe(false);
    expect(state.isIntegratedSingleMode).toBe(false);
    expect(state.optionCount).toBe(2);
  });

  it('isPlainOptionMode=true when exactly one child', () => {
    const state = useRadioFieldState({ children: ['a'] });
    expect(state.isPlainOptionMode).toBe(true);
    expect(state.isMultiOptionMode).toBe(false);
    expect(state.optionCount).toBe(1);
  });

  it('isIntegratedSingleMode=true when no children + label set', () => {
    const state = useRadioFieldState({ label: 'Toggle' });
    expect(state.isIntegratedSingleMode).toBe(true);
    expect(state.optionCount).toBe(0);
  });

  it('isIntegratedSingleMode=false when label is whitespace only', () => {
    expect(useRadioFieldState({ label: '   ' }).isIntegratedSingleMode).toBe(false);
  });

  it('isDisabled mirrors disabled prop', () => {
    expect(useRadioFieldState({ disabled: true }).isDisabled).toBe(true);
    expect(useRadioFieldState({ disabled: false }).isDisabled).toBe(false);
  });
});

describe('radioFieldSizeToInputNumeric', () => {
  it.each([
    ['s', 8],
    ['m', 10],
    ['l', 12],
  ] as const)('maps %s → %s', (input, expected) => {
    expect(radioFieldSizeToInputNumeric(input)).toBe(expected);
  });

  it('defaults to 10 (M) when size omitted', () => {
    expect(radioFieldSizeToInputNumeric()).toBe(10);
  });
});
