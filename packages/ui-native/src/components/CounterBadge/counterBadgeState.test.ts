import { describe, expect, it } from 'vitest';
import {
  COUNTER_BADGE_DEFAULT_MAX,
  getCounterBadgeDisplayValue,
  isCounterBadgeHidden,
  resolveCounterBadgeMax,
} from './interface';

describe('isCounterBadgeHidden', () => {
  it('hides negative values regardless of showZero', () => {
    expect(isCounterBadgeHidden(-1)).toBe(true);
    expect(isCounterBadgeHidden(-1, true)).toBe(true);
  });

  it('hides zero unless showZero is enabled', () => {
    expect(isCounterBadgeHidden(0)).toBe(true);
    expect(isCounterBadgeHidden(0, true)).toBe(false);
  });

  it('does not hide positive values', () => {
    expect(isCounterBadgeHidden(1)).toBe(false);
  });
});

describe('resolveCounterBadgeMax', () => {
  it('defaults when max is omitted', () => {
    expect(resolveCounterBadgeMax(undefined)).toBe(COUNTER_BADGE_DEFAULT_MAX);
  });

  it('falls back when max is zero', () => {
    expect(resolveCounterBadgeMax(0)).toBe(COUNTER_BADGE_DEFAULT_MAX);
  });

  it('falls back when max is negative', () => {
    expect(resolveCounterBadgeMax(-1)).toBe(COUNTER_BADGE_DEFAULT_MAX);
  });

  it('falls back when max is not finite', () => {
    expect(resolveCounterBadgeMax(Number.NaN)).toBe(COUNTER_BADGE_DEFAULT_MAX);
    expect(resolveCounterBadgeMax(Number.POSITIVE_INFINITY)).toBe(COUNTER_BADGE_DEFAULT_MAX);
  });

  it('uses a valid positive max', () => {
    expect(resolveCounterBadgeMax(9)).toBe(9);
  });

  it('floors fractional max values', () => {
    expect(resolveCounterBadgeMax(9.9)).toBe(9);
  });
});

describe('getCounterBadgeDisplayValue', () => {
  it('shows the raw value when below max', () => {
    expect(getCounterBadgeDisplayValue(1, { max: 9 })).toBe('1');
  });

  it('shows overflow when value exceeds max', () => {
    expect(getCounterBadgeDisplayValue(15, { max: 9 })).toBe('9+');
  });

  it('shows exact value when equal to max', () => {
    expect(getCounterBadgeDisplayValue(9, { max: 9 })).toBe('9');
  });

  it('does not render "0+" for invalid max={0}', () => {
    expect(getCounterBadgeDisplayValue(1, { max: 0 })).toBe('1');
  });

  it('uses default max overflow for value above 99', () => {
    expect(getCounterBadgeDisplayValue(150)).toBe('99+');
  });

  it('returns empty string when value is zero and showZero is false', () => {
    expect(getCounterBadgeDisplayValue(0)).toBe('');
  });

  it('shows zero when showZero is true', () => {
    expect(getCounterBadgeDisplayValue(0, { showZero: true })).toBe('0');
  });

  it('returns empty string for negative values', () => {
    expect(getCounterBadgeDisplayValue(-1)).toBe('');
    expect(getCounterBadgeDisplayValue(-1, { showZero: true })).toBe('');
  });
});
