import { describe, it, expect } from 'vitest';
import {
  computeMotionScale,
  JIO_MOTION_BASE_DURATION,
  JIO_MOTION_EASINGS,
  getDefaultMotionFoundationConfig,
  parseCubicBezier,
} from '../../utils/motion';
import { generateMotionCSS, generateDefaultMotionCSS } from '../motionCSS';

// ============================================================================
// computeMotionScale — pure math that derives all 37 tokens
// ============================================================================

describe('computeMotionScale', () => {
  it('produces the exact Jio spec from 300ms base', () => {
    const scale = computeMotionScale(JIO_MOTION_BASE_DURATION);

    expect(scale.duration.moderate).toEqual({
      '2xs': 60,
      xs: 90,
      s: 135,
      m: 200,
      l: 300,
      xl: 450,
      '2xl': 675,
      '3xl': 1015,
    });

    expect(scale.duration.subtle).toEqual({
      '2xs': 40,
      xs: 60,
      s: 90,
      m: 135,
      l: 200,
      xl: 300,
      '2xl': 450,
      '3xl': 675,
    });

    expect(scale.offset.moderate).toEqual({
      s: 25,
      m: 40,
      l: 90,
      xl: 200,
      '2xl': 450,
      '3xl': 1015,
    });

    expect(scale.offset.subtle).toEqual({
      s: 15,
      m: 25,
      l: 60,
      xl: 135,
      '2xl': 300,
      '3xl': 675,
    });
  });

  it('rounds to nearest multiple of 5 (eliminates awkward values)', () => {
    // 3XL = 675 * 1.5 = 1012.5 → rounds to 1015, NOT 1013
    // This is the round-to-5 fix from commit d824cb7.
    const scale = computeMotionScale(300);
    expect(scale.duration.moderate['3xl']).toBe(1015);
    expect(scale.offset.moderate['3xl']).toBe(1015);
  });

  it('scales linearly with baseDuration', () => {
    const scale = computeMotionScale(200);
    expect(scale.duration.moderate.l).toBe(200);
    expect(scale.duration.moderate.m).toBe(135); // 200/1.5 → 133.33 → round-to-5 → 135
    expect(scale.duration.moderate.xl).toBe(300); // 200*1.5 = 300
  });

  it('passes easings through unchanged', () => {
    const scale = computeMotionScale(300, JIO_MOTION_EASINGS);
    expect(scale.easings.entrance.moderate).toBe(JIO_MOTION_EASINGS.entrance.moderate);
    expect(scale.easings.linear).toBe('linear');
  });

  it('subtle L equals moderate M', () => {
    // The Subtle scale is the Moderate scale shifted down one step,
    // so subtle.l should equal moderate.m for all base durations.
    for (const base of [100, 200, 300, 500]) {
      const scale = computeMotionScale(base);
      expect(scale.duration.subtle.l).toBe(scale.duration.moderate.m);
    }
  });
});

// ============================================================================
// generateMotionCSS — CSS string output
// ============================================================================

describe('generateMotionCSS', () => {
  it('returns empty string when config is null', () => {
    expect(generateMotionCSS(null)).toBe('');
    expect(generateMotionCSS(undefined)).toBe('');
  });

  it('emits all 37 motion token declarations for the default config', () => {
    const css = generateDefaultMotionCSS();

    // 16 duration tokens (8 moderate + 8 subtle)
    for (const size of ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']) {
      expect(css).toContain(`--Motion-Duration-${size}:`);
      expect(css).toContain(`--Motion-Duration-Subtle-${size}:`);
    }

    // 12 offset tokens (6 moderate + 6 subtle)
    for (const size of ['S', 'M', 'L', 'XL', '2XL', '3XL']) {
      expect(css).toContain(`--Motion-Offset-${size}:`);
      expect(css).toContain(`--Motion-Offset-Subtle-${size}:`);
    }

    // 9 easing tokens (4 × moderate/subtle + linear)
    expect(css).toContain('--Motion-Easing-Entrance-Moderate:');
    expect(css).toContain('--Motion-Easing-Entrance-Subtle:');
    expect(css).toContain('--Motion-Easing-Exit-Moderate:');
    expect(css).toContain('--Motion-Easing-Exit-Subtle:');
    expect(css).toContain('--Motion-Easing-Transition-Moderate:');
    expect(css).toContain('--Motion-Easing-Transition-Subtle:');
    expect(css).toContain('--Motion-Easing-Bounce-Moderate:');
    expect(css).toContain('--Motion-Easing-Bounce-Subtle:');
    expect(css).toContain('--Motion-Easing-Linear:');
  });

  it('emits the round-to-5 3XL value (1015ms)', () => {
    const css = generateDefaultMotionCSS();
    expect(css).toContain('--Motion-Duration-3XL: 1015ms;');
    expect(css).toContain('--Motion-Offset-3XL: 1015ms;');
  });

  it('reflects custom baseDuration in output', () => {
    const css = generateMotionCSS({
      baseDuration: 400,
      easings: JIO_MOTION_EASINGS,
    });
    expect(css).toContain('--Motion-Duration-L: 400ms;');
  });
});

// ============================================================================
// parseCubicBezier — negative values support (for bounce curves)
// ============================================================================

describe('parseCubicBezier', () => {
  it('parses standard cubic-bezier strings', () => {
    expect(parseCubicBezier('cubic-bezier(0.25, 0.8, 0.5, 1)')).toEqual([0.25, 0.8, 0.5, 1]);
  });

  it('parses bounce curves with negative values', () => {
    expect(parseCubicBezier('cubic-bezier(0.2, -0.5, 0.3, 1.4)')).toEqual([0.2, -0.5, 0.3, 1.4]);
  });

  it('returns null for invalid input', () => {
    expect(parseCubicBezier('linear')).toBeNull();
    expect(parseCubicBezier('ease-in-out')).toBeNull();
    expect(parseCubicBezier('cubic-bezier(0.5)')).toBeNull();
  });
});

// ============================================================================
// getDefaultMotionFoundationConfig — backwards-compat default
// ============================================================================

describe('getDefaultMotionFoundationConfig', () => {
  it('returns a complete config with interaction and transition patterns', () => {
    const config = getDefaultMotionFoundationConfig();
    expect(config.baseDuration).toBe(300);
    expect(config.easings.entrance.moderate).toBeTruthy();
    expect(config.interactionPatterns).toBeDefined();
    expect(config.interactionPatterns!.length).toBeGreaterThan(0);
    expect(config.transitionPatterns).toBeDefined();
    expect(config.transitionPatterns!.length).toBeGreaterThan(0);
  });

  it('returns a mutable copy (not a reference to the frozen defaults)', () => {
    const config = getDefaultMotionFoundationConfig();
    config.baseDuration = 400;
    const fresh = getDefaultMotionFoundationConfig();
    expect(fresh.baseDuration).toBe(300); // Original unchanged
  });
});
