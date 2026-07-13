import { describe, expect, it } from 'vitest';
import { explicitAppearanceClass } from './appearanceClasses';

const classMap = {
  primary: 'appearancePrimary',
  neutral: 'appearanceNeutral',
  secondary: 'appearanceSecondary',
  sparkle: 'appearanceSparkle',
  'brand-bg': 'appearanceBrandBg',
  positive: 'appearancePositive',
  negative: 'appearanceNegative',
  warning: 'appearanceWarning',
  informative: 'appearanceInformative',
} as const;

describe('explicitAppearanceClass', () => {
  it('pins CSS class when appearance is explicit', () => {
    expect(
      explicitAppearanceClass('secondary', 'secondary', classMap, false),
    ).toBe('appearanceSecondary');
  });

  it('skips CSS class for auto at page root (brand theme defaults)', () => {
    expect(
      explicitAppearanceClass('auto', 'primary', classMap, false),
    ).toBeUndefined();
  });

  it('maps inherited surface role for auto inside a Surface (non-default role)', () => {
    expect(
      explicitAppearanceClass('auto', 'secondary', classMap, true),
    ).toBe('appearanceSecondary');
  });

  it('skips CSS class for auto inside a primary Surface (preserves brand --Button-role* override)', () => {
    // A primary Surface resolves auto → 'primary'. Mapping .appearancePrimary
    // would drop the --Button-roleBold brand override layer, so the class
    // must stay off — same as page root.
    expect(
      explicitAppearanceClass('auto', 'primary', classMap, true),
    ).toBeUndefined();
  });

  it('skips CSS class for auto inside a secondary Surface when secondary is the component default (Chip)', () => {
    // Chip defaults to 'secondary' at page root; a secondary Surface must
    // not pin .appearanceSecondary on an auto Chip or the --Chip-role*
    // brand override layer is lost.
    expect(
      explicitAppearanceClass('auto', 'secondary', classMap, true, 'secondary'),
    ).toBeUndefined();
  });

  it('maps inherited primary role for auto inside a Surface when primary is not the default (Chip)', () => {
    // Chip inside a primary Surface should still reach .appearancePrimary
    // because primary is not Chip's default role.
    expect(
      explicitAppearanceClass('auto', 'primary', classMap, true, 'secondary'),
    ).toBe('appearancePrimary');
  });
});
