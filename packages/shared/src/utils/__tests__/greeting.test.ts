/**
 * greeting.test.ts
 *
 * Covers bucket boundaries, variant determinism, and the name-omission
 * fallback for the home landing's time-of-day greeting.
 */

import { describe, expect, it } from 'vitest';
import { bucketForHour, getGreeting } from '../greeting';

function at(hour: number, minute = 0): Date {
  const d = new Date(2026, 3, 14, hour, minute, 0, 0);
  return d;
}

describe('bucketForHour', () => {
  it('maps 05:00–07:59 to early-morning', () => {
    expect(bucketForHour(5)).toBe('early-morning');
    expect(bucketForHour(6)).toBe('early-morning');
    expect(bucketForHour(7)).toBe('early-morning');
  });

  it('maps 08:00–11:59 to morning', () => {
    expect(bucketForHour(8)).toBe('morning');
    expect(bucketForHour(11)).toBe('morning');
  });

  it('maps 12:00–16:59 to afternoon', () => {
    expect(bucketForHour(12)).toBe('afternoon');
    expect(bucketForHour(16)).toBe('afternoon');
  });

  it('maps 17:00–20:59 to evening', () => {
    expect(bucketForHour(17)).toBe('evening');
    expect(bucketForHour(20)).toBe('evening');
  });

  it('wraps late-night from 21:00 through 04:59', () => {
    expect(bucketForHour(21)).toBe('late-night');
    expect(bucketForHour(23)).toBe('late-night');
    expect(bucketForHour(0)).toBe('late-night');
    expect(bucketForHour(4)).toBe('late-night');
  });
});

describe('getGreeting', () => {
  it('returns the right bucket and a name-interpolated template', () => {
    const r = getGreeting(at(22), 'Nuno', { seed: 0 });
    expect(r.bucket).toBe('late-night');
    expect(r.text).toBe('Good evening, Nuno');
  });

  it('is deterministic for a given seed', () => {
    const a = getGreeting(at(9), 'Nuno', { seed: 1 });
    const b = getGreeting(at(9), 'Nuno', { seed: 1 });
    expect(a.text).toBe(b.text);
  });

  it('rotates variants across seeds within the same bucket', () => {
    const texts = [0, 1, 2].map((s) => getGreeting(at(9), 'Nuno', { seed: s }).text);
    // All three variants should be distinct — the bucket has 3 templates.
    expect(new Set(texts).size).toBe(3);
  });

  it("drops the ', {name}' suffix when no name is given", () => {
    const r = getGreeting(at(9), null, { seed: 0 });
    expect(r.text).toBe('Good morning');
    expect(r.text).not.toContain('{name}');
    expect(r.text).not.toContain(', ');
  });

  it('treats an empty or whitespace name as missing', () => {
    expect(getGreeting(at(18), '', { seed: 0 }).text).toBe('Good evening');
    expect(getGreeting(at(18), '   ', { seed: 0 }).text).toBe('Good evening');
  });

  it('uses the hour as default seed so output is stable within an hour', () => {
    const a = getGreeting(at(14, 5), 'Nuno');
    const b = getGreeting(at(14, 55), 'Nuno');
    expect(a.text).toBe(b.text);
  });

  it('handles all five buckets with real-world examples', () => {
    expect(getGreeting(at(6), 'Nuno', { seed: 0 }).bucket).toBe('early-morning');
    expect(getGreeting(at(10), 'Nuno', { seed: 0 }).bucket).toBe('morning');
    expect(getGreeting(at(14), 'Nuno', { seed: 0 }).bucket).toBe('afternoon');
    expect(getGreeting(at(19), 'Nuno', { seed: 0 }).bucket).toBe('evening');
    expect(getGreeting(at(23), 'Nuno', { seed: 0 }).bucket).toBe('late-night');
  });

  it('trims whitespace from names before interpolating', () => {
    const r = getGreeting(at(9), '  Nuno  ', { seed: 0 });
    expect(r.text).toBe('Good morning, Nuno');
  });

  it('uses direct contextual variants instead of branded phrasing', () => {
    const texts = [0, 1, 2].map((s) => getGreeting(at(9), 'Nuno', { seed: s }).text);
    expect(texts).toEqual([
      'Good morning, Nuno',
      'Welcome back',
      'Continue your last project?',
    ]);
    expect(texts.join(' ')).not.toContain('Fresh morning');
  });
});
