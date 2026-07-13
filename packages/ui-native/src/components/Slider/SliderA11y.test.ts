import { describe, it, expect } from 'vitest';
import { getSliderAccessibilityProps, useSliderState } from './interface';

describe('Slider accessibility', () => {
  it('returns basic accessibility props for single slider', () => {
    const props = { 'aria-label': 'Volume control', min: 0, max: 100 };
    const state = useSliderState({ value: 50, ...props });
    const a11y = getSliderAccessibilityProps(props, state);

    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('adjustable');
    expect(a11y.accessibilityLabel).toBe('Volume control');
    expect(a11y.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
  });

  it('handles range slider accessibility for each thumb', () => {
    const props = { ariaLabels: ['Min', 'Max'], min: 0, max: 100 };
    const state = useSliderState({ value: [20, 80], ...props });
    
    const a11y0 = getSliderAccessibilityProps(props, state, 0);
    expect(a11y0.accessibilityLabel).toBe('Min');
    expect(a11y0.accessibilityValue?.now).toBe(20);

    const a11y1 = getSliderAccessibilityProps(props, state, 1);
    expect(a11y1.accessibilityLabel).toBe('Max');
    expect(a11y1.accessibilityValue?.now).toBe(80);
  });

  it('reflects disabled state', () => {
    const props = { disabled: true };
    const state = useSliderState(props);
    const a11y = getSliderAccessibilityProps(props, state);

    expect(a11y.accessibilityState?.disabled).toBe(true);
  });
});
