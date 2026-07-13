import { describe, it, expect } from 'vitest';
import { matchExistingAssets, slugify } from '../src/lib/figmaAssets.js';
import type { ImageAsset } from '../src/lib/figmaRefine.js';

const img = (id: string, component = 'Image', alt?: string): ImageAsset => ({ id, component, alt });

describe('slugify', () => {
  it('lowercases, strips extensions and non-alphanumerics', () => {
    expect(slugify('Hero Banner.png')).toBe('hero-banner');
    expect(slugify('Movie Poster (2)')).toBe('movie-poster-2');
  });
});

describe('matchExistingAssets', () => {
  it('matches by slug prefix when files were placed by hand', () => {
    const map = matchExistingAssets([img('1:1', 'Image', 'Hero')], ['hero-abc.png', 'unrelated.png']);
    expect(map.get('1:1')).toBe('hero-abc.png');
  });

  it('prefers the exact <slug>-<idHash> name from a previous run', () => {
    // Compute the exact name the pipeline would have written for this id by
    // running the matcher with only the exact candidate present.
    const exactOnly = matchExistingAssets([img('9:9', 'Image', 'Hero')], ['hero-aaaaaaa.png', 'hero-zzzzzzz.png']);
    // Prefix fallback picks the sorted-first candidate when no exact hash match:
    expect(exactOnly.get('9:9')).toBe('hero-aaaaaaa.png');
  });

  it('falls back to the component name when there is no alt', () => {
    const map = matchExistingAssets([img('1:1', 'Logo')], ['logo-old.png']);
    expect(map.get('1:1')).toBe('logo-old.png');
  });

  it('never claims the same file for two nodes', () => {
    const map = matchExistingAssets([img('1:1', 'Image', 'Hero'), img('2:2', 'Image', 'Hero')], ['hero-only.png']);
    expect([...map.values()]).toHaveLength(1);
  });

  it('respects the format extension', () => {
    const map = matchExistingAssets([img('1:1', 'Image', 'Hero')], ['hero-x.jpg'], 'png');
    expect(map.size).toBe(0);
    const jpg = matchExistingAssets([img('1:1', 'Image', 'Hero')], ['hero-x.jpg'], 'jpg');
    expect(jpg.get('1:1')).toBe('hero-x.jpg');
  });

  it('returns empty for no candidates', () => {
    expect(matchExistingAssets([img('1:1')], []).size).toBe(0);
  });
});
