import { describe, expect, it } from 'vitest';
import {
  getTouchSliderAccessibilityProps,
  useTouchSliderState,
  type TouchSliderProps,
} from './interface';

describe('TouchSlider accessibility', () => {
  it('maps aria-label to accessibilityLabel', () => {
    const props: TouchSliderProps = { 'aria-label': 'Volume' };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);
    
    expect(a11y.accessibilityLabel).toBe('Volume');
    expect(a11y.accessibilityRole).toBe('adjustable');
    expect(a11y.accessible).toBe(true);
  });

  it('reflects values in accessibilityValue', () => {
    const props: TouchSliderProps = { min: 10, max: 200, value: 50 };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);
    
    expect(a11y.accessibilityValue).toEqual({
      min: 10,
      max: 200,
      now: 50,
    });
  });

  it('reflects disabled state', () => {
    const props: TouchSliderProps = { disabled: true };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);
    
    expect(a11y.accessibilityState.disabled).toBe(true);
  });

  it('forwards aria-labelledby to accessibilityLabelledBy', () => {
    const props: TouchSliderProps = { 'aria-labelledby': 'volume-label' };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);
    
    expect(a11y.accessibilityLabelledBy).toBe('volume-label');
  });

  it('does not announce readOnly as disabled', () => {
    const props: TouchSliderProps = { readOnly: true, value: 50 };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);

    expect(state.isDisabled).toBe(false);
    expect(state.isReadOnly).toBe(true);
    expect(a11y.accessibilityState.disabled).toBe(false);
    expect(a11y['aria-readonly']).toBe(true);
  });

  it('does not emit aria-readonly when disabled', () => {
    const props: TouchSliderProps = { disabled: true, readOnly: true };
    const state = useTouchSliderState(props);
    const a11y = getTouchSliderAccessibilityProps(props, state);

    expect(a11y.accessibilityState.disabled).toBe(true);
    expect(a11y['aria-readonly']).toBeUndefined();
  });
});
