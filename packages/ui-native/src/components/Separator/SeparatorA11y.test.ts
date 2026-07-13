import { describe, expect, it } from 'vitest';
import { getSeparatorAccessibilityProps, SEPARATOR_A11Y } from './interface';

describe('Separator accessibility', () => {
  it('is decorative and hidden from the accessibility tree', () => {
    expect(getSeparatorAccessibilityProps()).toEqual(SEPARATOR_A11Y);
    expect(getSeparatorAccessibilityProps().accessible).toBe(false);
    expect(getSeparatorAccessibilityProps()['aria-hidden']).toBe(true);
  });
});
