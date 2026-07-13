import { describe, it, expect } from 'vitest';
import {
  outputProfileTable,
  getValidProfilesForType,
  isValidTypeProfilePair,
  coveredArtifactTypes,
} from './outputProfileTable';
import { ARTIFACT_TYPES } from '../ir/artifactTypes';

describe('outputProfileTable (D-03)', () => {
  it('covers all 8 artifact types', () => {
    expect(coveredArtifactTypes()).toHaveLength(8);
    for (const t of ARTIFACT_TYPES) {
      expect(getValidProfilesForType(t).length).toBeGreaterThan(0);
    }
  });

  it('maps social-post to the IG profiles', () => {
    const ids = getValidProfilesForType('social-post').map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(['ig-square', 'ig-portrait', 'ig-story', 'ig-carousel']),
    );
  });

  it('maps web-ui to desktop/mobile/responsive', () => {
    const ids = getValidProfilesForType('web-ui').map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(['web-desktop', 'web-mobile', 'web-responsive']),
    );
  });

  it('validates valid type/profile pairs and rejects invalid ones', () => {
    expect(isValidTypeProfilePair('web-ui', 'web-desktop')).toBe(true);
    expect(isValidTypeProfilePair('social-post', 'ig-square')).toBe(true);
    // Cross-type pairing is invalid.
    expect(isValidTypeProfilePair('web-ui', 'ig-square')).toBe(false);
    expect(isValidTypeProfilePair('social-post', 'web-desktop')).toBe(false);
  });

  it('honesty rule: web profiles are real-coverage; non-web are assumed (no fabricated dims)', () => {
    const web = getValidProfilesForType('web-ui');
    expect(web.every((p) => p.coverage === 'real')).toBe(true);
    const ig = getValidProfilesForType('social-post');
    // Non-web placeholders carry no fabricated pixel dimensions.
    expect(ig.every((p) => p.coverage === 'assumed' && p.dimensions === null)).toBe(true);
  });

  it('table keys exactly equal the artifact-type set', () => {
    expect(Object.keys(outputProfileTable).sort()).toEqual([...ARTIFACT_TYPES].sort());
  });
});
