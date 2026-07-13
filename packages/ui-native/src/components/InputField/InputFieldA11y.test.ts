/**
 * InputField a11y / state-resolver tests
 *
 * Pure-function coverage for `useInputFieldState` + `getInputFieldAccessibilityProps`.
 * No React renderer involved — every behaviour the renderer relies on is
 * codified here so regressions surface before the bordered shell paints.
 */

import { describe, expect, it } from 'vitest';
import {
  getInputFieldAccessibilityProps,
  useInputFieldState,
  type InputFieldProps,
} from './interface';

const baseProps = (overrides?: Partial<InputFieldProps>): InputFieldProps => ({
  label: 'Email',
  ...overrides,
});

describe('useInputFieldState', () => {
  it("defaults appearance='auto' to 'secondary'", () => {
    const s = useInputFieldState(baseProps());
    expect(s.resolvedAppearance).toBe('secondary');
  });

  it('passes explicit appearance through unchanged', () => {
    expect(useInputFieldState(baseProps({ appearance: 'primary' })).resolvedAppearance).toBe('primary');
    expect(useInputFieldState(baseProps({ appearance: 'negative' })).resolvedAppearance).toBe('negative');
  });

  it('normalises the four t-shirt tiers to numeric f-step', () => {
    expect(useInputFieldState(baseProps({ size: 'xs' })).numericSize).toBe(6);
    expect(useInputFieldState(baseProps({ size: 's' })).numericSize).toBe(8);
    expect(useInputFieldState(baseProps({ size: 'm' })).numericSize).toBe(10);
    expect(useInputFieldState(baseProps({ size: 'l' })).numericSize).toBe(12);
  });

  it('maps size to label tier (XS collapses to S)', () => {
    expect(useInputFieldState(baseProps({ size: 'xs' })).labelSize).toBe('s');
    expect(useInputFieldState(baseProps({ size: 's' })).labelSize).toBe('s');
    expect(useInputFieldState(baseProps({ size: 'm' })).labelSize).toBe('m');
    expect(useInputFieldState(baseProps({ size: 'l' })).labelSize).toBe('l');
  });

  it("derives feedback size from label tier (matches inputSizeToLabelSize)", () => {
    expect(useInputFieldState(baseProps({ size: 's' })).feedbackSize).toBe('s');
    expect(useInputFieldState(baseProps({ size: 'l' })).feedbackSize).toBe('l');
  });

  it('defaults shape and attention', () => {
    const s = useInputFieldState(baseProps());
    expect(s.shape).toBe('default');
    expect(s.attention).toBe('medium');
  });

  it('reflects disabled / readOnly flags', () => {
    expect(useInputFieldState(baseProps({ disabled: true })).isDisabled).toBe(true);
    expect(useInputFieldState(baseProps({ readOnly: true })).isReadOnly).toBe(true);
  });

  it('isInvalid covers invalid, aria-invalid, and non-empty error', () => {
    expect(useInputFieldState(baseProps({ invalid: true })).isInvalid).toBe(true);
    expect(useInputFieldState(baseProps({ 'aria-invalid': true })).isInvalid).toBe(true);
    expect(useInputFieldState(baseProps({ error: 'Bad input' })).isInvalid).toBe(true);
    expect(useInputFieldState(baseProps({ error: '   ' })).isInvalid).toBe(false);
    expect(useInputFieldState(baseProps()).isInvalid).toBe(false);
  });

  it('hasLabel / hasDescription respect trimmed-empty strings', () => {
    expect(useInputFieldState(baseProps({ label: '' })).hasLabel).toBe(false);
    expect(useInputFieldState(baseProps({ label: '   ' })).hasLabel).toBe(false);
    expect(useInputFieldState(baseProps({ label: 'Email' })).hasLabel).toBe(true);
    expect(useInputFieldState(baseProps({ description: '' })).hasDescription).toBe(false);
    expect(useInputFieldState(baseProps({ description: 'desc' })).hasDescription).toBe(true);
  });

  it('hasInfoIcon requires infoIcon + non-empty label', () => {
    expect(useInputFieldState(baseProps({ infoIcon: true })).hasInfoIcon).toBe(true);
    expect(useInputFieldState(baseProps({ infoIcon: false })).hasInfoIcon).toBe(false);
    expect(useInputFieldState(baseProps({ infoIcon: true, label: '' })).hasInfoIcon).toBe(false);
  });

  it('hasFeedback prefers feedback slot over error string', () => {
    expect(useInputFieldState(baseProps({ feedback: 'node' })).hasFeedback).toBe(true);
    expect(useInputFieldState(baseProps({ error: 'Bad' })).hasFeedback).toBe(true);
    expect(useInputFieldState(baseProps({ error: '   ' })).hasFeedback).toBe(false);
    expect(useInputFieldState(baseProps()).hasFeedback).toBe(false);
  });

  it('hasDynamicRow triggers on non-empty dynamicText / helperButton strings', () => {
    expect(useInputFieldState(baseProps({ dynamicText: '0 / 280' })).hasDynamicRow).toBe(true);
    expect(useInputFieldState(baseProps({ helperButton: 'Clear' })).hasDynamicRow).toBe(true);
    expect(useInputFieldState(baseProps({ dynamicText: '   ', helperButton: '' })).hasDynamicRow).toBe(false);
    expect(useInputFieldState(baseProps()).hasDynamicRow).toBe(false);
  });

  it("defaults info-icon aria-label to 'More information'", () => {
    expect(useInputFieldState(baseProps()).infoIconAriaLabel).toBe('More information');
    expect(useInputFieldState(baseProps({ infoIconAriaLabel: 'Why?' })).infoIconAriaLabel).toBe('Why?');
  });

  describe('resolvedAccessibilityLabel', () => {
    it('falls back to the trimmed visible `label` when no a11y prop is set', () => {
      expect(useInputFieldState(baseProps({ label: '  Email  ' })).resolvedAccessibilityLabel).toBe('Email');
    });

    it('prefers `accessibilityLabel` over `aria-label` and `label`', () => {
      const state = useInputFieldState(
        baseProps({ accessibilityLabel: 'Native name', 'aria-label': 'Web name', label: 'Visible' }),
      );
      expect(state.resolvedAccessibilityLabel).toBe('Native name');
    });

    it('uses `aria-label` when `accessibilityLabel` is unset', () => {
      const state = useInputFieldState(baseProps({ 'aria-label': 'Web name', label: 'Visible' }));
      expect(state.resolvedAccessibilityLabel).toBe('Web name');
    });

    it('skips whitespace-only sources and walks to the next candidate', () => {
      const state = useInputFieldState(
        baseProps({ accessibilityLabel: '   ', 'aria-label': '', label: 'Fallback' }),
      );
      expect(state.resolvedAccessibilityLabel).toBe('Fallback');
    });

    it('is undefined when every source is missing or empty', () => {
      expect(useInputFieldState({ label: '   ' }).resolvedAccessibilityLabel).toBeUndefined();
      expect(useInputFieldState({}).resolvedAccessibilityLabel).toBeUndefined();
    });
  });
});

describe('getInputFieldAccessibilityProps', () => {
  it('hides the field when aria-hidden=true', () => {
    const a11y = getInputFieldAccessibilityProps({ 'aria-hidden': true });
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityRole).toBe('none');
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('returns a decorative root (accessible=false) by default', () => {
    const a11y = getInputFieldAccessibilityProps({});
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityRole).toBeUndefined();
    expect(a11y.accessibilityElementsHidden).toBeUndefined();
  });
});
