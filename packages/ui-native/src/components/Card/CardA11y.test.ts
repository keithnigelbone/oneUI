import { describe, expect, it } from 'vitest';
import { getCardAccessibilityProps } from './interface';

describe('Card accessibility', () => {
  it('maps aria-label to accessibilityLabel', () => {
    const props = getCardAccessibilityProps({
      'aria-label': 'Product card',
    });
    expect(props.accessibilityLabel).toBe('Product card');
    expect(props.accessible).toBe(true);
  });

  it('sets role to button for interactive cards', () => {
    const props = getCardAccessibilityProps({
      'aria-label': 'Click me',
      interactive: true,
    });
    expect(props.accessibilityRole).toBe('button');
  });

  it('sets role to summary for static cards', () => {
    const props = getCardAccessibilityProps({
      'aria-label': 'Info',
      interactive: false,
    });
    expect(props.accessibilityRole).toBe('summary');
  });

  it('reflects disabled state', () => {
    const props = getCardAccessibilityProps({
      'aria-label': 'Disabled card',
      interactive: true,
      disabled: true,
    });
    expect(props.accessibilityState.disabled).toBe(true);
    expect(props.accessibilityRole).toBe('summary'); // interactive && !disabled check in interface
  });

  it('forwards accessibilityHint', () => {
    const props = getCardAccessibilityProps({
      'aria-label': 'Action',
      accessibilityHint: 'Navigates to details',
    });
    expect(props.accessibilityHint).toBe('Navigates to details');
  });
});
