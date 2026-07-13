import { describe, it, expect } from 'vitest';
import {
  TOKEN_FAMILIES,
  getAllowedPrefixes,
  getFamiliesByCategory,
  getAppearanceRolePrefixes,
} from '../tokenManifest';
import type { TokenFamily } from '../tokenManifest';

describe('TOKEN_FAMILIES', () => {
  it('is a non-empty readonly array', () => {
    expect(TOKEN_FAMILIES).toBeInstanceOf(Array);
    expect(TOKEN_FAMILIES.length).toBeGreaterThan(0);
  });

  it('every family has required fields', () => {
    for (const family of TOKEN_FAMILIES) {
      expect(family.prefix).toBeDefined();
      expect(family.prefix.startsWith('--')).toBe(true);
      expect(family.prefix.endsWith('-')).toBe(true);
      expect(family.category).toBeDefined();
      expect(family.description).toBeDefined();
      expect(family.description.length).toBeGreaterThan(0);
    }
  });

  it('has unique prefixes', () => {
    const prefixes = TOKEN_FAMILIES.map(f => f.prefix);
    const uniquePrefixes = new Set(prefixes);
    expect(uniquePrefixes.size).toBe(prefixes.length);
  });

  it('categories are from the known set', () => {
    const validCategories: TokenFamily['category'][] = [
      'surface', 'text', 'appearance-role', 'typography', 'border', 'motion', 'grid', 'logo', 'focus', 'material', 'elevation', 'gradient',
    ];
    for (const family of TOKEN_FAMILIES) {
      expect(validCategories).toContain(family.category);
    }
  });
});

describe('getAllowedPrefixes', () => {
  it('returns array of strings matching TOKEN_FAMILIES length', () => {
    const prefixes = getAllowedPrefixes();
    expect(prefixes).toHaveLength(TOKEN_FAMILIES.length);
  });

  it('returns the prefix field from each family', () => {
    const prefixes = getAllowedPrefixes();
    for (let i = 0; i < TOKEN_FAMILIES.length; i++) {
      expect(prefixes[i]).toBe(TOKEN_FAMILIES[i].prefix);
    }
  });
});

describe('getFamiliesByCategory', () => {
  it('returns only surface families for "surface"', () => {
    const result = getFamiliesByCategory('surface');
    expect(result.length).toBeGreaterThan(0);
    for (const family of result) {
      expect(family.category).toBe('surface');
    }
  });

  it('returns only appearance-role families for "appearance-role"', () => {
    const result = getFamiliesByCategory('appearance-role');
    expect(result.length).toBeGreaterThan(0);
    for (const family of result) {
      expect(family.category).toBe('appearance-role');
    }
  });

  it('returns empty array for unknown category', () => {
    const result = getFamiliesByCategory('nonexistent' as any);
    expect(result).toEqual([]);
  });

  it('returns all families when summing all categories', () => {
    const categories: TokenFamily['category'][] = [
      'surface', 'text', 'appearance-role', 'typography', 'border', 'motion', 'grid', 'logo', 'focus', 'material', 'elevation', 'gradient',
    ];
    let total = 0;
    for (const cat of categories) {
      total += getFamiliesByCategory(cat).length;
    }
    expect(total).toBe(TOKEN_FAMILIES.length);
  });
});

describe('getAppearanceRolePrefixes', () => {
  it('returns only prefixes where perRole is true', () => {
    const result = getAppearanceRolePrefixes();
    const perRoleFamilies = TOKEN_FAMILIES.filter(f => f.perRole);
    expect(result).toHaveLength(perRoleFamilies.length);
  });

  it('includes Primary, Secondary, Neutral', () => {
    const result = getAppearanceRolePrefixes();
    expect(result).toContain('--Primary-');
    expect(result).toContain('--Secondary-');
    expect(result).toContain('--Neutral-');
  });

  it('does not include Surface or Text (not per-role)', () => {
    const result = getAppearanceRolePrefixes();
    expect(result).not.toContain('--Surface-');
    expect(result).not.toContain('--Text-');
  });
});
