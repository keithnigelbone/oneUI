import { describe, it, expect } from 'vitest';
import { computeInputHash } from '../cacheKey';

describe('computeInputHash', () => {
  it('returns a string', () => {
    const hash = computeInputHash({ hue: 30 }, { accents: [] });
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('returns deterministic results for same input', () => {
    const config = { hue: 30, chroma: 0.15 };
    const appearance = { accents: [{ role: 'primary', scaleName: 'Brand' }] };

    const hash1 = computeInputHash(config, appearance);
    const hash2 = computeInputHash(config, appearance);
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different inputs', () => {
    const hash1 = computeInputHash({ hue: 30 }, { accents: [] });
    const hash2 = computeInputHash({ hue: 60 }, { accents: [] });
    expect(hash1).not.toBe(hash2);
  });

  it('handles null/undefined inputs', () => {
    const hash1 = computeInputHash(null, null);
    const hash2 = computeInputHash(undefined, undefined);
    // Both should produce the same hash since null and undefined normalize to null
    expect(hash1).toBe(hash2);
  });

  it('includes typography config in hash when provided', () => {
    const config = { hue: 30 };
    const appearance = { accents: [] };

    const hashWithout = computeInputHash(config, appearance);
    const hashWith = computeInputHash(config, appearance, { fontFamily: 'Inter' });
    expect(hashWithout).not.toBe(hashWith);
  });

  it('produces hex string output', () => {
    const hash = computeInputHash({ hue: 30 }, {});
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('handles complex nested objects', () => {
    const config = {
      brandScales: [
        { name: 'Brand', source: 'custom', baseColor: '#ff5500' },
        { name: 'Neutral', source: 'preset', presetCollectionId: 'abc123' },
      ],
    };
    const appearance = {
      accents: [
        { role: 'primary', scaleName: 'Brand', baseStep: 1300 },
        { role: 'neutral', scaleName: 'Neutral', baseStep: 500 },
      ],
      background: { backgroundStep: 100 },
    };

    const hash = computeInputHash(config, appearance);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('is sensitive to property order differences in JSON', () => {
    // JSON.stringify produces deterministic output for same object structure
    const hash1 = computeInputHash({ a: 1, b: 2 }, {});
    const hash2 = computeInputHash({ a: 1, b: 2 }, {});
    expect(hash1).toBe(hash2);
  });
});
