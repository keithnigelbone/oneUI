import { describe, expect, it } from 'vitest';
import {
  getInputFeedbackAccessibilityProps,
  resolveFeedbackSize,
  useInputFeedbackState,
  type InputFeedbackProps,
} from './interface';

const baseProps = (overrides?: Partial<InputFeedbackProps>): InputFeedbackProps => ({
  feedback_message: 'Password must be at least 8 characters.',
  ...overrides,
});

describe('resolveFeedbackSize', () => {
  it('passes valid t-shirt sizes through unchanged', () => {
    expect(resolveFeedbackSize('s')).toBe('s');
    expect(resolveFeedbackSize('m')).toBe('m');
    expect(resolveFeedbackSize('l')).toBe('l');
  });

  it("falls back to 'm' for unknown / unsupported inputs", () => {
    expect(resolveFeedbackSize('xl' as unknown as 'l')).toBe('m');
    expect(resolveFeedbackSize('xs' as unknown as 's')).toBe('m');
  });
});

describe('useInputFeedbackState', () => {
  it("defaults to variant=negative / attention=low / size='m'", () => {
    const s = useInputFeedbackState(baseProps());
    expect(s.resolvedVariant).toBe('negative');
    expect(s.resolvedAttention).toBe('low');
    expect(s.resolvedSize).toBe('m');
  });

  it('uses feedback_message as the message when provided', () => {
    const s = useInputFeedbackState(baseProps({ feedback_message: 'Try again.' }));
    expect(s.message).toBe('Try again.');
    expect(s.hasMessage).toBe(true);
  });

  it('falls back to children when feedback_message is missing', () => {
    const s = useInputFeedbackState({ children: 'Child copy' } as InputFeedbackProps);
    expect(s.message).toBe('Child copy');
    expect(s.hasMessage).toBe(true);
  });

  it('flags hasMessage=false for empty / whitespace strings', () => {
    expect(useInputFeedbackState({ feedback_message: '' } as InputFeedbackProps).hasMessage).toBe(false);
    expect(useInputFeedbackState({ feedback_message: '   ' } as InputFeedbackProps).hasMessage).toBe(false);
  });

  it('assigns role=alert with assertive live region for negative', () => {
    const s = useInputFeedbackState(baseProps({ variant: 'negative' }));
    expect(s.role).toBe('alert');
    expect(s.liveRegion).toBe('assertive');
  });

  it('assigns role=status with polite live region for non-negative', () => {
    for (const variant of ['positive', 'warning', 'informative'] as const) {
      const s = useInputFeedbackState(baseProps({ variant }));
      expect(s.role).toBe('status');
      expect(s.liveRegion).toBe('polite');
    }
  });

  it('honours a `role` override', () => {
    const s = useInputFeedbackState(baseProps({ variant: 'negative', role: 'status' }));
    expect(s.role).toBe('status');
    expect(s.liveRegion).toBe('polite');
  });
});

describe('getInputFeedbackAccessibilityProps', () => {
  it('exposes assertive live region + role=alert by default for negative', () => {
    const props = baseProps();
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('alert');
    expect(a11y.accessibilityLiveRegion).toBe('assertive');
    expect(a11y.accessibilityLabel).toBe('Password must be at least 8 characters.');
  });

  it('drops accessibilityRole when status (RN has no `status` role)', () => {
    const props = baseProps({ variant: 'positive' });
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y.accessibilityRole).toBeUndefined();
    expect(a11y.accessibilityLiveRegion).toBe('polite');
  });

  it('hides the row when aria-hidden=true', () => {
    const props = baseProps({ 'aria-hidden': true });
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('prefers aria-label over the message copy', () => {
    const props = baseProps({ 'aria-label': 'Override label' });
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y.accessibilityLabel).toBe('Override label');
  });

  it('forwards aria-describedby for cross-platform parity', () => {
    const props = baseProps({ 'aria-describedby': 'input-1' });
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y['aria-describedby']).toBe('input-1');
  });

  it('forwards accessibilityHint', () => {
    const props = baseProps({ accessibilityHint: 'Visible under the password field' });
    const state = useInputFeedbackState(props);
    const a11y = getInputFeedbackAccessibilityProps(props, state);
    expect(a11y.accessibilityHint).toBe('Visible under the password field');
  });
});
