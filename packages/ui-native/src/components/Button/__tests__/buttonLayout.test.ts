import { describe, it, expect } from 'vitest';
import { buildNativeDimensions } from '@oneui/shared/engine';
import {
  getButtonSizeMetrics,
  getButtonCondensedMetrics,
  getButtonIconMetrics,
  getButtonSlotMetrics,
} from '../buttonLayout';

describe('buttonLayout — S default density', () => {
  const { spacing } = buildNativeDimensions({ platform: 'S', density: 'default' });

  it('matches web default min-heights (Spacing-6/8/10/12)', () => {
    expect(getButtonSizeMetrics(spacing, 6).minHeight).toBe(spacing['6']);
    expect(getButtonSizeMetrics(spacing, 8).minHeight).toBe(spacing['8']);
    expect(getButtonSizeMetrics(spacing, 10).minHeight).toBe(spacing['10']);
    expect(getButtonSizeMetrics(spacing, 12).minHeight).toBe(spacing['12']);
  });

  it('matches web icon sizes (Spacing-3/4/5/6)', () => {
    expect(getButtonIconMetrics(spacing, 6).start).toBe(spacing['3']);
    expect(getButtonIconMetrics(spacing, 12).end).toBe(spacing['6']);
  });

  it('matches web slot padding overrides', () => {
    const slot = getButtonSlotMetrics(spacing, 10);
    expect(slot.padWithStart).toBe(spacing['4']);
    expect(slot.gapStart).toBe(spacing['1-5']);
  });

  it('condensed min-heights stay monotonic', () => {
    const c6 = getButtonCondensedMetrics(spacing, 6).minHeight;
    const c8 = getButtonCondensedMetrics(spacing, 8).minHeight;
    const c10 = getButtonCondensedMetrics(spacing, 10).minHeight;
    const c12 = getButtonCondensedMetrics(spacing, 12).minHeight;
    expect(c6).toBeLessThan(c8);
    expect(c8).toBeLessThan(c10);
    expect(c10).toBeLessThan(c12);
  });
});
