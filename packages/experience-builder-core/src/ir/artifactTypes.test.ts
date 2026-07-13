import { describe, it, expect } from 'vitest';
import {
  ARTIFACT_TYPES,
  NON_ARTIFACT_CARD_KINDS,
  CARD_KINDS,
  ArtifactTypeSchema,
  CardKindSchema,
  isArtifactType,
  isCardKind,
} from './artifactTypes';

describe('artifactTypes — 8 artifact types', () => {
  it('enumerates exactly the 8 expected artifact types', () => {
    expect([...ARTIFACT_TYPES].sort()).toEqual(
      [
        'app-screen',
        'dashboard',
        'image',
        'instagram-carousel',
        'outdoor-display',
        'slide',
        'social-post',
        'web-ui',
      ].sort(),
    );
    expect(ARTIFACT_TYPES).toHaveLength(8);
  });

  it('parses valid artifact types and rejects unknown ones', () => {
    expect(ArtifactTypeSchema.safeParse('web-ui').success).toBe(true);
    expect(ArtifactTypeSchema.safeParse('not-a-type').success).toBe(false);
    expect(isArtifactType('dashboard')).toBe(true);
    expect(isArtifactType('foundation-profile')).toBe(false);
  });
});

describe('artifactTypes — full 13-member card union (D-05)', () => {
  it('adds the 5 non-artifact card kinds', () => {
    expect([...NON_ARTIFACT_CARD_KINDS].sort()).toEqual(
      [
        'component-reference',
        'evaluation-report',
        'export',
        'foundation-profile',
        'variant-group',
      ].sort(),
    );
  });

  it('enumerates all 13 union members (8 artifact + 5 non-artifact)', () => {
    expect(CARD_KINDS).toHaveLength(13);
    expect(new Set(CARD_KINDS).size).toBe(13); // no duplicates
  });

  it('card-kind guards accept artifact + non-artifact kinds', () => {
    expect(isCardKind('web-ui')).toBe(true);
    expect(isCardKind('foundation-profile')).toBe(true);
    expect(isCardKind('component-reference')).toBe(true);
    expect(isCardKind('nope')).toBe(false);
    expect(CardKindSchema.safeParse('export').success).toBe(true);
  });
});
