import { describe, expect, it } from 'vitest';
import { getProgressAccessibilityProps, PROGRESS_INDICATOR_A11Y, useProgressState } from './interface';

describe('Progress accessibility', () => {
  it('exposes busy progressbar when indeterminate', () => {
    const state = useProgressState({});
    const a11y = getProgressAccessibilityProps({ 'aria-label': 'Loading' }, state);
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('progressbar');
    expect(a11y.accessibilityLabel).toBe('Loading');
    expect(a11y.accessibilityState.busy).toBe(true);
    expect(a11y.accessibilityValue).toBeUndefined();
    expect(a11y['aria-busy']).toBe(true);
  });

  it('exposes accessibilityValue when determinate', () => {
    const state = useProgressState({ value: 40, min: 0, max: 100 });
    const a11y = getProgressAccessibilityProps(
      { 'aria-label': 'Upload', value: 40, min: 0, max: 100 },
      state,
    );
    expect(a11y.accessibilityState.busy).toBe(false);
    expect(a11y.accessibilityValue).toEqual({ min: 0, max: 100, now: 40 });
    expect(a11y['aria-valuenow']).toBe(40);
  });

  it('forwards aria-labelledby', () => {
    expect(
      getProgressAccessibilityProps(
        { 'aria-labelledby': 'progress-caption' },
        useProgressState({ value: 10 }),
      ).accessibilityLabelledBy,
    ).toBe('progress-caption');
  });

  it('hides the indicator bar from the tree', () => {
    expect(PROGRESS_INDICATOR_A11Y).toEqual({ 'aria-hidden': true });
  });
});
