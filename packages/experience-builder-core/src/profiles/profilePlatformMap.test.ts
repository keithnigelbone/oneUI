import { describe, it, expect } from 'vitest';
import { mmToPx } from '@oneui/shared';
import {
  PROFILE_PLATFORM_MAP,
  getPlatformTargetForProfile,
} from './profilePlatformMap';
import { OutputProfileSchema } from './outputProfileTable';

describe('profilePlatformMap (D-02)', () => {
  it('maps billboard-landscape to the seeded outdoor billboard breakpoint', () => {
    const target = getPlatformTargetForProfile('billboard-landscape');
    expect(target).toEqual({
      platformId: 'outdoor',
      breakpointId: 'outdoor-billboard-large',
    });
  });

  it('maps the Instagram profiles to the social platform canvas ids (resolvable per-brand once seeded, D-02)', () => {
    // Phase 04-02: the campaign path needs ig canvases to be resolvable for
    // brands that SEED them. The map names the social-platform target id; a
    // brand without that canvas still gaps honestly (the resolver checks the
    // brand's PlatformsFoundationConfig, not this map alone).
    expect(getPlatformTargetForProfile('ig-square')).toEqual({
      platformId: 'social',
      breakpointId: 'ig-square',
    });
    expect(getPlatformTargetForProfile('ig-portrait')).toEqual({
      platformId: 'social',
      breakpointId: 'ig-portrait',
    });
    expect(getPlatformTargetForProfile('ig-carousel')).toEqual({
      platformId: 'social',
      breakpointId: 'ig-carousel',
    });
  });

  it('still returns undefined for non-web profiles with no map entry (stay gapped per D-02)', () => {
    expect(getPlatformTargetForProfile('ig-story')).toBeUndefined();
    expect(getPlatformTargetForProfile('slide-16x9')).toBeUndefined();
    expect(getPlatformTargetForProfile('digital-portrait')).toBeUndefined();
  });

  it('every key of PROFILE_PLATFORM_MAP is a valid OutputProfile', () => {
    for (const key of Object.keys(PROFILE_PLATFORM_MAP)) {
      expect(() => OutputProfileSchema.parse(key)).not.toThrow();
    }
  });

  it('mmToPx is reachable from @oneui/shared and converts A4 width to px > mm', () => {
    const px = mmToPx(210); // A4 width in mm
    expect(Number.isFinite(px)).toBe(true);
    expect(px).toBeGreaterThan(210); // px > mm at 96+ ppi
  });
});
