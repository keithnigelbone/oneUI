/**
 * Pinned projection test for snapshot-brands.ts.
 *
 * Convex's `foundations.config: v.any()` means the live shape can drift without
 * compile-time signal. This test loads a checked-in fixture (what we EXPECT
 * getBrandOverviewData to return for a representative brand) and asserts the
 * pure projections produce the BrandFoundation shape the kb-core consumers
 * expect.
 *
 * When OneUI's foundation schema evolves:
 *   1. Update the fixture to match the new live shape.
 *   2. Update the projection helpers to read the new fields.
 *   3. Update `expected.*` keys.
 *   4. This test ensures consumers cannot silently absorb a stale projection.
 */

import fixture from '../__fixtures__/brandOverviewData.snapshot.json';
import { describe, expect, test } from 'vitest';
import {
  extractActiveRoles,
  extractFonts,
  projectBrand,
  projectScale,
} from '../snapshot-brands.lib';

const FROZEN_TIMESTAMP = '2026-05-13T00:00:00.000Z';
const BRAND_SET_VERSION = '3.0.0-test';

describe('snapshot-brands — pure projections vs fixture', () => {
  test('projectScale handles baseStep + steps + anchor', () => {
    const out = projectScale(fixture.scales[0]);
    expect(out.name).toBe('Primary');
    expect(out.baseStep).toBe(1300);
    expect(out.anchorBoldToBaseStep).toBe(true);
    expect(out.steps).toHaveLength(3);
  });

  test('extractActiveRoles preserves the 8-role accents tuple', () => {
    const roles = extractActiveRoles(fixture.overview);
    expect(roles).toEqual(fixture.expected.activeRoles);
  });

  test('extractFonts picks primary from fontSelection over fontFamily', () => {
    const fonts = extractFonts(fixture.overview);
    expect(fonts.primary.family).toBe('JioType');
    expect(fonts.secondary?.family).toBe('Inter');
    expect(fonts.code?.family).toBe('JetBrains Mono');
  });

  test('extractFonts returns "System" when nothing is configured', () => {
    const fonts = extractFonts({ typography: { config: {} } });
    expect(fonts.primary.family).toBe('System');
    expect(fonts.secondary).toBeUndefined();
    expect(fonts.code).toBeUndefined();
  });

  test('projectBrand emits the pinned BrandFoundation shape', () => {
    const brand = projectBrand({
      row: fixture.row as never,
      overview: fixture.overview as never,
      scales: fixture.scales as never,
      brandSetVersion: BRAND_SET_VERSION,
      snapshottedAt: FROZEN_TIMESTAMP,
    });
    expect(brand.brandId).toBe(fixture.expected.brandId);
    expect(brand.displayName).toBe(fixture.expected.displayName);
    expect(brand.status).toBe(fixture.expected.status);
    expect(brand.primary).toEqual(fixture.expected.primary);
    expect(brand.secondary).toEqual(fixture.expected.secondary);
    expect(brand.activeRoles).toEqual(fixture.expected.activeRoles);
    expect(brand.fonts.primary.family).toBe(fixture.expected.fontsPrimaryFamily);
    expect(brand.fonts.secondary?.family).toBe(fixture.expected.fontsSecondaryFamily);
    expect(brand.fonts.code?.family).toBe(fixture.expected.fontsCodeFamily);
    expect(brand.scales.map((s) => s.name)).toEqual(fixture.expected.scaleNames);
    expect(brand.recipes.Button?.cornerRadius).toBe(fixture.expected.recipesButtonCornerRadius);
    expect(brand.brandSetVersion).toBe(BRAND_SET_VERSION);
    expect(brand.snapshottedAt).toBe(FROZEN_TIMESTAMP);
    expect(brand.defaultModifiers).toEqual({ dark: false, rtl: false, highContrast: false });
  });

  test('projectBrand is deterministic — same inputs → identical JSON', () => {
    const a = projectBrand({
      row: fixture.row as never,
      overview: fixture.overview as never,
      scales: fixture.scales as never,
      brandSetVersion: BRAND_SET_VERSION,
      snapshottedAt: FROZEN_TIMESTAMP,
    });
    const b = projectBrand({
      row: fixture.row as never,
      overview: fixture.overview as never,
      scales: fixture.scales as never,
      brandSetVersion: BRAND_SET_VERSION,
      snapshottedAt: FROZEN_TIMESTAMP,
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
