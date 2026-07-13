import { describe, expect, it } from 'vitest';
import { getCounterBadgeAccessibilityProps } from './interface';

describe('counterBadgeA11y', () => {
  it('maps aria-label to accessibilityLabel', () => {
    const props = getCounterBadgeAccessibilityProps({ 'aria-label': '3 unread', value: 3 }, 3);
    expect(props.accessibilityLabel).toBe('3 unread');
    expect(props.accessibilityRole).toBe('text');
    expect(props.accessibilityLiveRegion).toBe('polite');
  });

  it('defaults accessibilityLabel to the display value', () => {
    expect(getCounterBadgeAccessibilityProps({ value: 7 }, 7).accessibilityLabel).toBe('7');
  });

  it('maps native-only accessibilityHint', () => {
    expect(
      getCounterBadgeAccessibilityProps(
        { value: 2, accessibilityHint: 'Unread messages' },
        2,
      ).accessibilityHint,
    ).toBe('Unread messages');
  });
});
