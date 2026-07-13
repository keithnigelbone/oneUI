import { describe, expect, it } from 'vitest';
import { DIVIDER_LINE_A11Y, getDividerAccessibilityProps } from './interface';

describe('getDividerAccessibilityProps', () => {
  it('exposes separator role and vertical orientation', () => {
    const props = getDividerAccessibilityProps('vertical', 'Section break');
    expect(props.role).toBe('separator');
    expect(props['aria-orientation']).toBe('vertical');
    expect(props.accessibilityHint).toBe('Section break');
    expect(props.accessible).toBe(true);
  });

  it('maps horizontal orientation for cross-platform parity', () => {
    const props = getDividerAccessibilityProps('horizontal');
    expect(props['aria-orientation']).toBe('horizontal');
    expect(props.accessibilityHint).toBeUndefined();
  });
});

describe('DIVIDER_LINE_A11Y', () => {
  it('hides decorative line segments', () => {
    expect(DIVIDER_LINE_A11Y.accessible).toBe(false);
    expect(DIVIDER_LINE_A11Y.accessibilityElementsHidden).toBe(true);
  });
});
