import { describe, expect, it } from 'vitest';
import {
  getSingleTextButtonAccessibilityProps,
  getButtonFamilyLoadingSpinnerAccessibility,
  useSingleTextButtonState,
  SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT,
} from './interface';

describe('SingleTextButton accessibility', () => {
  it('exposes a button role and maps aria-label to accessibilityLabel', () => {
    const props = getSingleTextButtonAccessibilityProps(
      { 'aria-label': 'Agent' },
      { isDisabled: false },
    );
    expect(props.accessibilityRole).toBe('button');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLabel).toBe('Agent');
  });

  it('loading reports busy but NOT disabled', () => {
    const props = getSingleTextButtonAccessibilityProps(
      { 'aria-label': 'Save', loading: true },
      { isDisabled: false },
    );
    expect(props.accessibilityState.busy).toBe(true);
    expect(props.accessibilityState.disabled).toBe(false);
  });

  it('maps aria-expanded to accessibilityState.expanded', () => {
    expect(
      getSingleTextButtonAccessibilityProps(
        { 'aria-label': 'Menu', 'aria-expanded': true },
        { isDisabled: false },
      ).accessibilityState.expanded,
    ).toBe(true);
  });

  it('forwards aria-haspopup for menu triggers', () => {
    const props = getSingleTextButtonAccessibilityProps(
      { 'aria-label': 'Menu', 'aria-haspopup': 'menu' },
      { isDisabled: false },
    );
    expect(props['aria-haspopup']).toBe('menu');
    expect(props.focusable).toBe(true);
  });

  it('forwards accessibilityHint and aria-describedby', () => {
    const props = getSingleTextButtonAccessibilityProps(
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
      getSingleTextButtonAccessibilityProps(
        { 'aria-label': 'Hidden', 'aria-hidden': true },
        { isDisabled: false },
      ).accessibilityElementsHidden,
    ).toBe(true);
  });

  it('exposes loading spinner subtree props', () => {
    expect(getButtonFamilyLoadingSpinnerAccessibility()).toEqual({
      accessible: true,
      accessibilityLabel: 'Loading',
      accessibilityRole: 'progressbar',
    });
  });

  it('maps attention levels to variants (high→bold, medium→subtle, low→ghost)', () => {
    expect(SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT.high).toBe('bold');
    expect(SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT.medium).toBe('subtle');
    expect(SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT.low).toBe('ghost');
  });
});

describe('SingleTextButton disabled/busy derivation (loading ≠ disabled)', () => {
  it('loading alone marks the control busy but NOT disabled', () => {
    const state = useSingleTextButtonState({ children: 'Ag', loading: true });
    expect(state.isDisabled).toBe(false);
    expect(state.ariaProps['aria-disabled']).toBe(false);
    expect(state.ariaProps['aria-busy']).toBe(true);
  });

  it('disabled marks the control disabled', () => {
    const state = useSingleTextButtonState({ children: 'Ag', disabled: true });
    expect(state.isDisabled).toBe(true);
    expect(state.ariaProps['aria-disabled']).toBe(true);
  });

  it('explicit disabled + loading is both disabled and busy', () => {
    const state = useSingleTextButtonState({ children: 'Ag', disabled: true, loading: true });
    expect(state.isDisabled).toBe(true);
    expect(state.ariaProps['aria-busy']).toBe(true);
  });

  it('neither disabled nor loading leaves the control enabled', () => {
    const state = useSingleTextButtonState({ children: 'Ag' });
    expect(state.isDisabled).toBe(false);
    expect(state.ariaProps['aria-disabled']).toBe(false);
    expect(state.ariaProps['aria-busy']).toBeUndefined();
  });
});
