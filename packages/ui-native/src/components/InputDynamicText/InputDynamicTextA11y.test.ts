import { describe, expect, it } from 'vitest';
import {
  getInputDynamicTextAccessibilityProps,
  resolveAccessibilityLiveRegion,
  useInputDynamicTextState,
} from './interface';

describe('useInputDynamicTextState', () => {
  it('defaults size to m and reports both slots empty', () => {
    const state = useInputDynamicTextState({});
    expect(state.size).toBe('m');
    expect(state.hasContent).toBe(false);
    expect(state.hasEnd).toBe(false);
    expect(state.isEmpty).toBe(true);
    expect(state.trailingOnly).toBe(false);
    expect(state.isDisabled).toBe(false);
  });

  it('treats whitespace-only content as empty', () => {
    const state = useInputDynamicTextState({ content: '   ', end: '   ' });
    expect(state.isEmpty).toBe(true);
    expect(state.hasContent).toBe(false);
    expect(state.hasEnd).toBe(false);
  });

  it('flags trailingOnly when only the end slot has content', () => {
    const state = useInputDynamicTextState({ end: 'Clear', size: 'l' });
    expect(state.size).toBe('l');
    expect(state.trailingOnly).toBe(true);
    expect(state.isEmpty).toBe(false);
  });

  it('forwards disabled flag', () => {
    const state = useInputDynamicTextState({
      content: '0 / 280',
      end: 'Clear',
      disabled: true,
    });
    expect(state.isDisabled).toBe(true);
    expect(state.hasContent).toBe(true);
    expect(state.hasEnd).toBe(true);
  });
});

describe('resolveAccessibilityLiveRegion', () => {
  it('maps web aria-live values to RN accessibilityLiveRegion', () => {
    expect(resolveAccessibilityLiveRegion('off')).toBe('none');
    expect(resolveAccessibilityLiveRegion('polite')).toBe('polite');
    expect(resolveAccessibilityLiveRegion('assertive')).toBe('assertive');
  });

  it('returns undefined when aria-live is not provided', () => {
    expect(resolveAccessibilityLiveRegion(undefined)).toBeUndefined();
  });
});

describe('getInputDynamicTextAccessibilityProps', () => {
  it('exposes role=text by default with no live region', () => {
    const a11y = getInputDynamicTextAccessibilityProps({});
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('text');
    expect(a11y.accessibilityLiveRegion).toBeUndefined();
  });

  it('forwards a polite live region when requested', () => {
    const a11y = getInputDynamicTextAccessibilityProps({ 'aria-live': 'polite' });
    expect(a11y.accessibilityLiveRegion).toBe('polite');
  });

  it('maps "off" to RN "none"', () => {
    const a11y = getInputDynamicTextAccessibilityProps({ 'aria-live': 'off' });
    expect(a11y.accessibilityLiveRegion).toBe('none');
  });
});
