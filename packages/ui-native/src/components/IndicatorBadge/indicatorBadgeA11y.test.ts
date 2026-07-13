import { describe, expect, it } from 'vitest';
import { getIndicatorBadgeAccessibilityProps } from './interface';

describe('indicatorBadgeA11y', () => {
  it('maps aria-label to accessibilityLabel with image role', () => {
    const props = getIndicatorBadgeAccessibilityProps({ 'aria-label': 'Online' });
    expect(props.accessibilityLabel).toBe('Online');
    expect(props.accessibilityRole).toBe('image');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityElementsHidden).toBe(false);
  });

  it('hides unlabeled decorative dots', () => {
    const props = getIndicatorBadgeAccessibilityProps({});
    expect(props.accessible).toBe(false);
    expect(props.accessibilityElementsHidden).toBe(true);
  });

  it('maps native-only accessibilityHint', () => {
    expect(
      getIndicatorBadgeAccessibilityProps({
        'aria-label': 'Online',
        accessibilityHint: 'User is active',
      }).accessibilityHint,
    ).toBe('User is active');
  });
});
