import { describe, expect, test } from 'vitest';
import { DEVLENS_TIP, devLensTipFor } from '../devlensTip';

describe('devLensTipFor — suppression matrix', () => {
  test('suppressed when caps is undefined', () => {
    expect(devLensTipFor(undefined)).toBe('');
  });
  test('suppressed when caps is empty', () => {
    expect(devLensTipFor({})).toBe('');
  });
  test('suppressed when plugin already installed', () => {
    expect(devLensTipFor({ hasOneUiDeps: true, hasDevLens: true })).toBe('');
  });
  test('suppressed when no OneUI deps present', () => {
    expect(devLensTipFor({ hasOneUiDeps: false, hasDevLens: false })).toBe('');
  });
  test('emits tip only when hasOneUiDeps=true AND hasDevLens=false', () => {
    expect(devLensTipFor({ hasOneUiDeps: true, hasDevLens: false })).toBe(DEVLENS_TIP);
  });
  test('emits tip when hasOneUiDeps=true and hasDevLens omitted', () => {
    expect(devLensTipFor({ hasOneUiDeps: true })).toBe(DEVLENS_TIP);
  });
  test('tip is bounded so it does not displace the brand summary or invariants', () => {
    expect(DEVLENS_TIP.length).toBeLessThan(600);
  });
});
