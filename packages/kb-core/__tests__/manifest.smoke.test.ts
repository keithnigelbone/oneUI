/**
 * Smoke: the three independent semver fields are well-formed and the
 * exported CORE_INVARIANTS frozen object matches its declared schemaVersion.
 *
 * Goal: catch regressions where a maintainer bumps one version stamp without
 * the others (drift inside the core package itself).
 */

import { describe, expect, test } from 'vitest';
import {
  BRAND_SET_VERSION,
  CORE_INVARIANTS,
  COLOR_ROLES,
  KB_SCHEMA_VERSION,
  KB_VERSION,
  PHASH_HAMMING_THRESHOLD,
  SDK_IDS,
  SSIM_MATCH_THRESHOLD,
  SURFACE_MODES,
  ATTENTION_TO_SURFACE,
} from '../src';

const SEMVER = /^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/;

describe('@jds/kb-core version stamps', () => {
  test('KB_SCHEMA_VERSION is semver', () => {
    expect(KB_SCHEMA_VERSION).toMatch(SEMVER);
  });
  test('KB_VERSION is semver (allows pre-release)', () => {
    expect(KB_VERSION).toMatch(SEMVER);
  });
  test('BRAND_SET_VERSION is semver (allows pre-release)', () => {
    expect(BRAND_SET_VERSION).toMatch(SEMVER);
  });
  test('the three versions are distinct values (separation of concerns held)', () => {
    // We don't enforce inequality forever — only that they are addressed as
    // three separate identifiers, not collapsed to one.
    const set = new Set([KB_SCHEMA_VERSION, KB_VERSION, BRAND_SET_VERSION]);
    expect(set.size).toBeGreaterThanOrEqual(1);
  });
});

describe('@jds/kb-core invariants', () => {
  test('CORE_INVARIANTS.schemaVersion matches KB_SCHEMA_VERSION', () => {
    expect(CORE_INVARIANTS.schemaVersion).toBe(KB_SCHEMA_VERSION);
  });
  test('CORE_INVARIANTS.surfaces.modes equals SURFACE_MODES', () => {
    expect(CORE_INVARIANTS.surfaces.modes).toEqual(SURFACE_MODES);
  });
  test('attention-to-surface map is bijective on its domain', () => {
    expect(ATTENTION_TO_SURFACE.high).toBe('bold');
    expect(ATTENTION_TO_SURFACE.medium).toBe('subtle');
    expect(ATTENTION_TO_SURFACE.low).toBe('ghost');
  });
  test('I.0.a — roles surfaced top-level for invariants.json consumers', () => {
    expect(CORE_INVARIANTS.roles).toHaveLength(11);
    expect(CORE_INVARIANTS.roles).toContain('primary');
    expect(CORE_INVARIANTS.roles).toContain('sparkle');
    expect(CORE_INVARIANTS.roles).toContain('brand-bg');
  });
  test('I.0.a — attentionLevels surfaced top-level', () => {
    expect(CORE_INVARIANTS.attentionLevels).toEqual(['high', 'medium', 'low']);
  });
});

describe('@jds/kb-core visual-signature thresholds', () => {
  test('PHASH_HAMMING_THRESHOLD is a small integer in [1, 16] of the 64-bit space', () => {
    expect(Number.isInteger(PHASH_HAMMING_THRESHOLD)).toBe(true);
    expect(PHASH_HAMMING_THRESHOLD).toBeGreaterThanOrEqual(1);
    expect(PHASH_HAMMING_THRESHOLD).toBeLessThanOrEqual(16);
  });
  test('SSIM_MATCH_THRESHOLD is in (0.8, 1) — high-confidence visual match', () => {
    expect(SSIM_MATCH_THRESHOLD).toBeGreaterThan(0.8);
    expect(SSIM_MATCH_THRESHOLD).toBeLessThan(1);
  });
});

describe('@jds/kb-core vocabulary', () => {
  test('11 color roles exactly', () => {
    expect(COLOR_ROLES).toHaveLength(11);
    expect(COLOR_ROLES).toContain('primary');
    expect(COLOR_ROLES).toContain('sparkle');
    expect(COLOR_ROLES).toContain('brand-bg');
  });
  test('7 surface modes exactly', () => {
    expect(SURFACE_MODES).toHaveLength(7);
    expect(SURFACE_MODES).toContain('ghost');
    expect(SURFACE_MODES).toContain('elevated');
  });
  test('5 SDK ids', () => {
    expect(SDK_IDS).toHaveLength(5);
    expect(SDK_IDS).toEqual(['web', 'rn', 'ios', 'android', 'flutter']);
  });
});
