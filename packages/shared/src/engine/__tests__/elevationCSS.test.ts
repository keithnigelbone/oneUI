/**
 * elevationCSS.test.ts
 *
 * Tests for the brand elevation CSS generator — the pipeline segment that
 * turns the elevation foundation config (baseOpacity + darkModeMultiplier)
 * into `--Elevation-0..5` declarations.
 */

import { describe, it, expect } from 'vitest';
import { generateElevationCSS, elevationLevelToBoxShadow } from '../elevationCSS';
import { generateElevationLevel } from '../../utils/elevation';
import { filterBrandDeclarations } from '../tokenBoundary';

const CONFIG = { baseOpacity: 0.08, darkModeMultiplier: 1.5 };

describe('generateElevationCSS', () => {
  it('returns empty string for null/undefined config (static fallbacks stay active)', () => {
    expect(generateElevationCSS(null, 'light')).toBe('');
    expect(generateElevationCSS(undefined, 'light')).toBe('');
  });

  it('emits all 6 elevation tokens', () => {
    const css = generateElevationCSS(CONFIG, 'light');
    for (let level = 0; level <= 5; level += 1) {
      expect(css).toContain(`--Elevation-${level}:`);
    }
  });

  it('emits none for level 0', () => {
    const css = generateElevationCSS(CONFIG, 'light');
    expect(css).toContain('--Elevation-0: none;');
  });

  it('applies the configured base opacity in light mode', () => {
    const css = generateElevationCSS({ ...CONFIG, baseOpacity: 0.12 }, 'light');
    expect(css).toContain('rgba(0, 0, 0, 0.120)');
  });

  it('applies the dark mode multiplier in dark theme', () => {
    const css = generateElevationCSS({ ...CONFIG, darkModeMultiplier: 2 }, 'dark');
    // 0.08 × 2 = 0.16
    expect(css).toContain('rgba(0, 0, 0, 0.160)');
  });

  it('adds an inset edge stroke in dark mode using the stroke token', () => {
    const dark = generateElevationCSS(CONFIG, 'dark');
    const light = generateElevationCSS(CONFIG, 'light');
    expect(dark).toContain('inset 0 0 0 var(--Stroke-M)');
    expect(light).not.toContain('inset');
  });

  it('passes the token boundary filter (--Elevation- is an allowed family)', () => {
    const css = generateElevationCSS(CONFIG, 'light');
    const declarations = css
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--'));
    expect(declarations.length).toBeGreaterThan(0);
    const filtered = filterBrandDeclarations(declarations);
    expect(filtered).toEqual(declarations);
  });
});

describe('elevationLevelToBoxShadow', () => {
  it('returns none for level 0 regardless of theme', () => {
    const level0 = generateElevationLevel(0, 'low');
    expect(
      elevationLevelToBoxShadow(level0, {
        isDarkMode: true,
        baseOpacity: 0.2,
        darkModeMultiplier: 3,
      }),
    ).toBe('none');
  });

  it('uses the two-shadow formula (key + ambient) for raised levels', () => {
    const level3 = generateElevationLevel(3, 'low');
    const shadow = elevationLevelToBoxShadow(level3, {
      isDarkMode: false,
      ...CONFIG,
    });
    // Two comma-separated shadows, both y-offset/blur from f(3) = 3^1.5 × 2
    expect(shadow.split('), ')).toHaveLength(2);
    expect(shadow).toContain('rgba(0, 0, 0, 0.080)');
  });
});
