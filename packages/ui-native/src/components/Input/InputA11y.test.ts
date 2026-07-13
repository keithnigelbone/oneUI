import { describe, expect, it } from 'vitest';
import {
  getInputAccessibilityProps,
  inputSizeToLabelSize,
  resolveInputSize,
  resolveTextInputType,
  useInputState,
} from './interface';

describe('resolveInputSize', () => {
  it('returns 10 (m) as the default for undefined', () => {
    expect(resolveInputSize(undefined)).toBe(10);
  });

  it('maps the four t-shirt tiers to numeric f-steps', () => {
    expect(resolveInputSize('xs')).toBe(6);
    expect(resolveInputSize('s')).toBe(8);
    expect(resolveInputSize('m')).toBe(10);
    expect(resolveInputSize('l')).toBe(12);
  });

  it('resolves the XS (f6) tier dedicated to native (web coerces to s)', () => {
    // Regression guard for the Figma XS bug: native must NOT fall back to 10.
    expect(resolveInputSize('xs')).toBe(6);
  });

  it('falls back to 10 for removed legacy aliases (small/medium/large)', () => {
    // These strings are no longer part of InputSize — untyped JS callers coerce to m.
    expect(resolveInputSize('small' as unknown as 's')).toBe(10);
    expect(resolveInputSize('medium' as unknown as 'm')).toBe(10);
    expect(resolveInputSize('large' as unknown as 'l')).toBe(10);
  });

  it('falls back to 10 for unsupported numeric / unknown inputs', () => {
    expect(resolveInputSize(8 as unknown as 's')).toBe(10);
    expect(resolveInputSize(7 as unknown as 's')).toBe(10);
  });
});

describe('inputSizeToLabelSize', () => {
  it('maps the four t-shirt tiers to label tiers', () => {
    // XS input collapses to the `s` field-label tier (Figma label stack is S/M/L only).
    expect(inputSizeToLabelSize('xs')).toBe('s');
    expect(inputSizeToLabelSize('s')).toBe('s');
    expect(inputSizeToLabelSize('m')).toBe('m');
    expect(inputSizeToLabelSize('l')).toBe('l');
  });
});

describe('resolveTextInputType', () => {
  it('maps email/number/tel/url to RN keyboardType', () => {
    expect(resolveTextInputType('email')).toEqual({
      keyboardType: 'email-address',
      secureTextEntry: false,
    });
    expect(resolveTextInputType('number')).toEqual({
      keyboardType: 'numeric',
      secureTextEntry: false,
    });
    expect(resolveTextInputType('tel')).toEqual({
      keyboardType: 'phone-pad',
      secureTextEntry: false,
    });
    expect(resolveTextInputType('url')).toEqual({
      keyboardType: 'url',
      secureTextEntry: false,
    });
  });

  it('flags `password` for secure text entry', () => {
    expect(resolveTextInputType('password')).toEqual({
      keyboardType: 'default',
      secureTextEntry: true,
    });
  });

  it('falls back to default keyboard for `text` and `search`', () => {
    expect(resolveTextInputType('text')).toEqual({
      keyboardType: 'default',
      secureTextEntry: false,
    });
    expect(resolveTextInputType('search')).toEqual({
      keyboardType: 'default',
      secureTextEntry: false,
    });
    expect(resolveTextInputType(undefined)).toEqual({
      keyboardType: 'default',
      secureTextEntry: false,
    });
  });
});

describe('useInputState', () => {
  it('defaults appearance to secondary when auto / unset', () => {
    expect(useInputState({}).resolvedAppearance).toBe('secondary');
    expect(useInputState({ appearance: 'auto' }).resolvedAppearance).toBe('secondary');
  });

  it('passes explicit appearance through', () => {
    expect(useInputState({ appearance: 'primary' }).resolvedAppearance).toBe('primary');
    expect(useInputState({ appearance: 'negative' }).resolvedAppearance).toBe('negative');
  });

  it('detects when any of the 4 slots is populated', () => {
    expect(useInputState({}).hasAnySlot).toBe(false);
    expect(useInputState({ start: 'icon' as unknown as React.ReactNode }).hasAnySlot).toBe(true);
    expect(useInputState({ end2: 'kg' as unknown as React.ReactNode }).hasAnySlot).toBe(true);
  });

  it('reports error highlight when errorHighlight or aria-invalid is set', () => {
    expect(useInputState({}).hasErrorHighlight).toBe(false);
    expect(useInputState({ errorHighlight: true }).hasErrorHighlight).toBe(true);
    expect(useInputState({ 'aria-invalid': true }).hasErrorHighlight).toBe(true);
  });

  it('forwards disabled / readOnly flags', () => {
    const state = useInputState({ disabled: true, readOnly: true });
    expect(state.isDisabled).toBe(true);
    expect(state.isReadOnly).toBe(true);
  });

  it('normalises the size t-shirt tier to a numeric f-step', () => {
    expect(useInputState({ size: 'l' }).numericSize).toBe(12);
  });

  it('normalises the XS size to numericSize 6', () => {
    expect(useInputState({ size: 'xs' }).numericSize).toBe(6);
  });
});

describe('getInputAccessibilityProps', () => {
  const baseState = { isDisabled: false, isReadOnly: false };

  it('exposes accessible=true and forwards `accessibilityLabel` to RN', () => {
    const a11y = getInputAccessibilityProps(
      { accessibilityLabel: 'Email address' },
      baseState,
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityLabel).toBe('Email address');
  });

  it('accepts the web-aligned `aria-label` alias', () => {
    const a11y = getInputAccessibilityProps(
      { 'aria-label': 'Phone number' },
      baseState,
    );
    expect(a11y.accessibilityLabel).toBe('Phone number');
  });

  it('prefers `accessibilityLabel` over `aria-label` when both are set', () => {
    const a11y = getInputAccessibilityProps(
      { accessibilityLabel: 'Native name', 'aria-label': 'Web name' },
      baseState,
    );
    expect(a11y.accessibilityLabel).toBe('Native name');
  });

  it('trims surrounding whitespace from `accessibilityLabel`', () => {
    const a11y = getInputAccessibilityProps(
      { accessibilityLabel: '  Email  ' },
      baseState,
    );
    expect(a11y.accessibilityLabel).toBe('Email');
  });

  it('omits `accessibilityLabel` entirely when whitespace-only / unset', () => {
    expect(getInputAccessibilityProps({}, baseState).accessibilityLabel).toBeUndefined();
    expect(
      getInputAccessibilityProps({ accessibilityLabel: '   ' }, baseState).accessibilityLabel,
    ).toBeUndefined();
    expect(
      getInputAccessibilityProps({ 'aria-label': '' }, baseState).accessibilityLabel,
    ).toBeUndefined();
  });

  it('marks disabled accessibilityState when disabled', () => {
    const a11y = getInputAccessibilityProps({}, { isDisabled: true, isReadOnly: false });
    expect(a11y.accessibilityState?.disabled).toBe(true);
  });

  it('announces read-only as read-only, NOT disabled (stays focusable/readable)', () => {
    // Regression guard: readOnly must not collapse into accessibilityState.disabled,
    // otherwise screen readers cannot tell a read-only field from a disabled one.
    // It is announced via accessibilityState.readonly + aria-readonly instead.
    const a11y = getInputAccessibilityProps({}, { isDisabled: false, isReadOnly: true });
    expect(a11y.accessibilityState?.disabled).toBe(false);
    expect(a11y.accessibilityState?.readonly).toBe(true);
    expect(a11y['aria-readonly']).toBe(true);
  });

  it('does not emit aria-readonly for an editable (non-read-only) field', () => {
    const a11y = getInputAccessibilityProps({}, { isDisabled: false, isReadOnly: false });
    expect(a11y['aria-readonly']).toBeUndefined();
  });

  it('announces disabled (not read-only) when both disabled and read-only are set', () => {
    const a11y = getInputAccessibilityProps({}, { isDisabled: true, isReadOnly: true });
    expect(a11y.accessibilityState?.disabled).toBe(true);
    expect(a11y['aria-readonly']).toBeUndefined();
  });

  it('collapses to a hidden subtree when aria-hidden', () => {
    const a11y = getInputAccessibilityProps({ 'aria-hidden': true }, baseState);
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityRole).toBe('none');
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes through aria-describedby + aria-invalid for cross-platform tests', () => {
    const a11y = getInputAccessibilityProps(
      { 'aria-describedby': 'help-id', 'aria-invalid': true },
      baseState,
    );
    expect(a11y['aria-describedby']).toBe('help-id');
    expect(a11y['aria-invalid']).toBe(true);
  });

  it('forwards `accessibilityHint`', () => {
    const a11y = getInputAccessibilityProps(
      { accessibilityHint: 'Activates voice search' },
      baseState,
    );
    expect(a11y.accessibilityHint).toBe('Activates voice search');
  });
});
