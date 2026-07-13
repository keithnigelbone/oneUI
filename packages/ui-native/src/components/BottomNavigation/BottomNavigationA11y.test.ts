import { describe, expect, it } from 'vitest';
import { getBottomNavigationAccessibilityProps } from './interface';

describe('BottomNavigation accessibility', () => {
  it('exposes tablist with required aria-label', () => {
    const props = getBottomNavigationAccessibilityProps({ 'aria-label': 'Primary navigation' });
    expect(props.accessibilityRole).toBe('tablist');
    expect(props.accessibilityLabel).toBe('Primary navigation');
    expect(props.accessible).toBe(true);
  });

  it('forwards accessibilityHint', () => {
    const props = getBottomNavigationAccessibilityProps({
      'aria-label': 'Primary navigation',
      accessibilityHint: 'Swipe between sections',
    });
    expect(props.accessibilityHint).toBe('Swipe between sections');
  });
});
