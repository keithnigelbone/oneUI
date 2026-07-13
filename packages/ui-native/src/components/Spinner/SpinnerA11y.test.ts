import { describe, expect, it } from 'vitest';
import { getSpinnerAccessibilityProps, SPINNER_RING_A11Y } from './interface';

describe('Spinner accessibility', () => {
  it('exposes progressbar role with label and busy state', () => {
    const a11y = getSpinnerAccessibilityProps({ label: 'Loading' });
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('progressbar');
    expect(a11y.accessibilityLabel).toBe('Loading');
    expect(a11y.accessibilityState.busy).toBe(true);
    expect(a11y['aria-busy']).toBe(true);
    expect(a11y.accessibilityLiveRegion).toBe('polite');
  });

  it('hides the animated ring from the tree', () => {
    expect(SPINNER_RING_A11Y).toEqual({ 'aria-hidden': true });
  });
});
