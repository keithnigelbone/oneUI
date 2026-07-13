import { describe, it, expect } from 'vitest';
import { buildNativeDimensions } from '@oneui/shared/engine';
import { getIconButtonMetrics } from '../iconButtonLayout';

describe('iconButtonLayout — S default density', () => {
  const { spacing } = buildNativeDimensions({ platform: 'S', density: 'default' });

  it('matches web container + icon sizes (Spacing-10 / Spacing-5 at M)', () => {
    const m = getIconButtonMetrics(spacing, 10);
    expect(m.container).toBe(spacing['10']);
    expect(m.icon).toBe(spacing['5']);
  });

  it('matches web condensed container at L', () => {
    const normal = getIconButtonMetrics(spacing, 12);
    const condensed = getIconButtonMetrics(spacing, 12, true);
    expect(normal.container).toBe(spacing['12']);
    expect(condensed.container).toBe(spacing['10']);
    expect(normal.icon).toBe(condensed.icon);
  });

  it('maps XL to Spacing-14 container and Spacing-8 icon', () => {
    const xl = getIconButtonMetrics(spacing, 14);
    expect(xl.container).toBe(spacing['14']);
    expect(xl.icon).toBe(spacing['8']);
  });
});
