import { describe, expect, it } from 'vitest';
import { getScrimAccessibilityProps, SCRIM_A11Y } from './interface';

describe('Scrim accessibility', () => {
  it('is decorative and hidden from the accessibility tree', () => {
    expect(getScrimAccessibilityProps()).toEqual(SCRIM_A11Y);
    expect(getScrimAccessibilityProps().accessible).toBe(false);
    expect(getScrimAccessibilityProps()['aria-hidden']).toBe(true);
  });
});
