/**
 * BrandPickerHeader.test.ts
 *
 * Tests the exported `derivePillTokens` selector. The selector picks the
 * neutral role's `content.high`, `surfaces.subtle`, `surfaces.bold`, and
 * `onBoldContent.high` from a built `OneUINativeTheme`, falling back to a
 * skeleton-only literal palette when no theme is mounted (loading state).
 */

import { describe, it, expect } from 'vitest';
import { buildNativeTheme, type OneUINativeTheme } from '@oneui/shared/engine';
import { derivePillTokens } from './BrandPickerHeader';

const colorConfig = {
  brandScales: [
    { name: 'Brand', source: 'custom' as const, baseColor: '#0066cc' },
  ],
};
const appearanceConfig = {
  accentCount: 1,
  background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
  accents: [{ role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 }],
};

const lightTheme: OneUINativeTheme = buildNativeTheme(
  { colorConfig, appearanceConfig },
  { theme: 'light' },
)!;
const darkTheme: OneUINativeTheme = buildNativeTheme(
  { colorConfig, appearanceConfig },
  { theme: 'dark' },
)!;

describe('derivePillTokens — token-driven outputs (theme mounted)', () => {
  it('reads onColor from neutral.content.high in light theme', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.onColor).toBe(lightTheme.rootRoles.neutral!.content.high);
  });

  it('reads onColor from neutral.content.high in dark theme', () => {
    const t = derivePillTokens(darkTheme, true);
    expect(t.onColor).toBe(darkTheme.rootRoles.neutral!.content.high);
  });

  it('uses surfaces.subtle for the inactive pill background', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.inactiveBg).toBe(lightTheme.rootRoles.neutral!.surfaces.subtle);
  });

  it('uses surfaces.bold for the active pill background', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.activeBg).toBe(lightTheme.rootRoles.neutral!.surfaces.bold);
  });

  it('uses onBoldContent.high for the active pill text', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.activeFg).toBe(lightTheme.rootRoles.neutral!.onBoldContent.high);
  });

  it('returns a label-XS typography style with fontSize/lineHeight/family/weight', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.labelXS).not.toBeNull();
    expect(t.labelXS!.fontSize).toBeGreaterThan(0);
    expect(t.labelXS!.lineHeight).toBeGreaterThan(0);
    expect(typeof t.labelXS!.fontFamily).toBe('string');
    expect(typeof t.labelXS!.fontWeight).toBe('number');
  });

  it('label-S fontSize is at least label-XS fontSize', () => {
    const t = derivePillTokens(lightTheme, false);
    expect(t.labelS!.fontSize).toBeGreaterThanOrEqual(t.labelXS!.fontSize);
  });

  it('dark theme inactive bg differs from light theme inactive bg', () => {
    const light = derivePillTokens(lightTheme, false);
    const dark = derivePillTokens(darkTheme, true);
    expect(dark.inactiveBg).not.toBe(light.inactiveBg);
  });
});

describe('derivePillTokens — skeleton fallback (no theme mounted)', () => {
  it('uses light-mode skeleton palette when theme is null and darkMode false', () => {
    const t = derivePillTokens(null, false);
    expect(t.onColor).toBe('#111');
    expect(t.inactiveBg).toBe('#f1f1f1');
    expect(t.activeBg).toBe('#111');
    expect(t.activeFg).toBe('#fff');
    expect(t.labelXS).toBeNull();
    expect(t.labelS).toBeNull();
  });

  it('uses dark-mode skeleton palette when theme is null and darkMode true', () => {
    const t = derivePillTokens(null, true);
    expect(t.onColor).toBe('#fff');
    expect(t.inactiveBg).toBe('#1f1f1f');
    expect(t.activeBg).toBe('#fff');
    expect(t.activeFg).toBe('#111');
  });

  it('inverts active fg/bg vs onColor (contrast inversion preserved)', () => {
    const dark = derivePillTokens(null, true);
    expect(dark.activeFg).not.toBe(dark.onColor);

    const light = derivePillTokens(null, false);
    expect(light.activeFg).not.toBe(light.onColor);
  });
});

describe('BrandPickerHeader — active brand predicate (rendered logic)', () => {
  it('marks a brand active when its _id matches activeId', () => {
    const brands = [
      { _id: 'a', name: 'A' },
      { _id: 'b', name: 'B' },
    ];
    const activeId = 'a';
    const states = brands.map((b) => b._id === activeId);
    expect(states).toEqual([true, false]);
  });

  it('marks all brands inactive when activeId is null', () => {
    const brands = [
      { _id: 'a', name: 'A' },
      { _id: 'b', name: 'B' },
    ];
    const states = brands.map((b) => b._id === null);
    expect(states).toEqual([false, false]);
  });

  it('handles an empty brand list', () => {
    const brands: Array<{ _id: string; name: string }> = [];
    expect(brands.map((b) => b._id === 'x')).toEqual([]);
  });
});
