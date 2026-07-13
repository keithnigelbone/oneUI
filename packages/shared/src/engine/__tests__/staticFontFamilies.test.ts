import { describe, it, expect } from 'vitest';
import {
  buildStaticWeightFamilyMap,
  snapToStandardCssWeight,
  typographySlotForRole,
  resolveStaticWeightFamily,
  mergeStaticWeightFamilyConfig,
} from '../staticFontFamilies';
import { buildNativeTypography } from '../buildNativeTypography';

describe('staticFontFamilies', () => {
  it('buildStaticWeightFamilyMap produces Prefix-Suffix keys', () => {
    const map = buildStaticWeightFamilyMap('JioTypeUI');
    expect(map[400]).toBe('JioTypeUI-Regular');
    expect(map[700]).toBe('JioTypeUI-Bold');
    expect(map[900]).toBe('JioTypeUI-Black');
  });

  it('snapToStandardCssWeight rounds to nearest 100', () => {
    expect(snapToStandardCssWeight(456)).toBe(500);
    expect(snapToStandardCssWeight(850)).toBe(900);
    expect(snapToStandardCssWeight(50)).toBe(100);
    expect(snapToStandardCssWeight(950)).toBe(900);
  });

  it('typographySlotForRole maps roles to slots', () => {
    expect(typographySlotForRole('label')).toBe('primary');
    expect(typographySlotForRole('body')).toBe('primary');
    expect(typographySlotForRole('headline')).toBe('secondary');
    expect(typographySlotForRole('code')).toBe('code');
  });

  it('resolveStaticWeightFamily snaps before lookup', () => {
    const map = buildStaticWeightFamilyMap('JioTypeUI');
    expect(resolveStaticWeightFamily(map, 680)).toBe('JioTypeUI-Bold');
    expect(resolveStaticWeightFamily(undefined, 700)).toBeUndefined();
  });

  it('mergeStaticWeightFamilyConfig merges prefix and explicit overrides', () => {
    const merged = mergeStaticWeightFamilyConfig(
      { primary: 'JioTypeUI' },
      { primary: { 700: 'Custom-Bold' } },
    );
    expect(merged?.primary?.[400]).toBe('JioTypeUI-Regular');
    expect(merged?.primary?.[700]).toBe('Custom-Bold');
  });

  it('buildNativeTypography attaches staticWeightFamilies from prefix config', () => {
    const typo = buildNativeTypography({
      config: {
        staticWeightFamilyPrefix: { primary: 'JioTypeUI', secondary: 'JioTypeUI' },
      },
    });
    expect(typo.staticWeightFamilies?.primary?.[500]).toBe('JioTypeUI-Medium');
    expect(typo.staticWeightFamilies?.secondary?.[900]).toBe('JioTypeUI-Black');
  });

  it('preserves staticWeightFamilyPrefix on outer envelope when typographyV2 is nested', () => {
    const typo = buildNativeTypography({
      config: {
        typographyV2: { fontSelection: { textFontId: 'preset:jiotype' } },
        staticWeightFamilyPrefix: { primary: 'JioTypeUI', secondary: 'JioTypeUI' },
      },
    });
    expect(typo.staticWeightFamilies?.primary?.[700]).toBe('JioTypeUI-Bold');
  });
});
