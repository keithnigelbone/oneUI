import { describe, expect, it } from 'vitest';
import {
  getButtonAccessibilityProps,
  getButtonFamilyLoadingSpinnerAccessibility,
  resolveButtonAccessibilityLabel,
} from './interface';

describe('Button accessibility', () => {
  it('maps aria-label to accessibilityLabel', () => {
    expect(resolveButtonAccessibilityLabel({ 'aria-label': 'Submit', children: 'Go' })).toBe(
      'Submit',
    );
    const props = getButtonAccessibilityProps(
      { 'aria-label': 'Submit', children: 'Go' },
      { isDisabled: false },
    );
    expect(props.accessibilityLabel).toBe('Submit');
    expect(props.accessibilityRole).toBe('button');
    expect(props.accessible).toBe(true);
  });

  it('loading reports busy but NOT disabled', () => {
    const props = getButtonAccessibilityProps(
      { 'aria-label': 'Save', loading: true },
      { isDisabled: false },
    );
    expect(props.accessibilityState.busy).toBe(true);
    expect(props.accessibilityState.disabled).toBe(false);
  });

  it('disabled reports disabled', () => {
    const props = getButtonAccessibilityProps(
      { 'aria-label': 'Save' },
      { isDisabled: true },
    );
    expect(props.accessibilityState.disabled).toBe(true);
  });

  it('maps aria-expanded to accessibilityState.expanded', () => {
    expect(
      getButtonAccessibilityProps({ 'aria-label': 'Menu', 'aria-expanded': true }, { isDisabled: false })
        .accessibilityState.expanded,
    ).toBe(true);
  });

  it('forwards aria-haspopup for menu triggers', () => {
    const props = getButtonAccessibilityProps(
      { 'aria-label': 'Menu', 'aria-haspopup': 'menu' },
      { isDisabled: false },
    );
    expect(props['aria-haspopup']).toBe('menu');
    expect(props.focusable).toBe(true);
  });

  it('forwards accessibilityHint and aria-describedby', () => {
    const props = getButtonAccessibilityProps(
      {
        'aria-label': 'Next',
        accessibilityHint: 'Advances to step 2',
        'aria-describedby': 'step-hint',
      },
      { isDisabled: false },
    );
    expect(props.accessibilityHint).toBe('Advances to step 2');
    expect(props.accessibilityLabelledBy).toBe('step-hint');
  });

  it('hides from the tree when aria-hidden', () => {
    expect(
      getButtonAccessibilityProps({ 'aria-label': 'Hidden', 'aria-hidden': true }, { isDisabled: false })
        .accessibilityElementsHidden,
    ).toBe(true);
  });

  it('exposes loading spinner subtree props', () => {
    expect(getButtonFamilyLoadingSpinnerAccessibility()).toEqual({
      accessible: true,
      accessibilityLabel: 'Loading',
      accessibilityRole: 'progressbar',
    });
  });
});
