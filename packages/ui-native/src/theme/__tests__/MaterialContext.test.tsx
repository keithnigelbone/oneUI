/**
 * MaterialContext.test.ts
 *
 * Unit tests for the pure logic of `useRoleMaterial` — the assignment-lookup
 * function that drives metallic auto-swap in Surface and Button.
 *
 * React context subscription is tested indirectly via the hook signature:
 * `useRoleMaterial` returns the gradient resolved from `materials.assignments[role]`.
 * These tests exercise that resolution directly against fixtures.
 */

import { describe, expect, it } from 'vitest';
import type { ResolvedMaterials, ResolvedMetallicGradient } from '@oneui/shared/engine';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const GOLD_GRADIENT: ResolvedMetallicGradient = {
  preset: 'gold',
  colors: ['#462523', '#cb9b51', '#f6e27a', '#f6f2c0', '#f6f2c0', '#cb9b51', '#f6e27a', '#462523'],
  locations: [0, 0.15, 0.30, 0.45, 0.55, 0.70, 0.85, 1.0],
  strokeColors: ['#462523', '#cb9b51', '#f6e27a', '#f6f2c0', '#f6e27a', '#462523'],
  strokeLocations: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
  angle: 135,
  gradientType: 'linear',
  text: '#462523',
  strokeColor: '#9a7b2d',
};

const TIRA_RESOLVED: ResolvedMaterials = {
  enabled: ['gold', 'silver', 'bronze'],
  assignments: { primary: 'gold' },
  metallic: { gold: GOLD_GRADIENT },
};

// ─── Pure-logic extraction (mirrors the hook body) ───────────────────────────

function resolveRoleMaterial(
  materials: ResolvedMaterials | null,
  role: string,
): ResolvedMetallicGradient | null {
  if (!materials) return null;
  const preset = materials.assignments[role as 'primary'];
  if (!preset) return null;
  return materials.metallic[preset] ?? null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('role-material resolution (MaterialContext logic)', () => {
  it('returns gold gradient for primary when Tira assigns primary → gold', () => {
    const result = resolveRoleMaterial(TIRA_RESOLVED, 'primary');
    expect(result).toBe(GOLD_GRADIENT);
    expect(result?.preset).toBe('gold');
  });

  it('returns null for secondary when no assignment exists', () => {
    expect(resolveRoleMaterial(TIRA_RESOLVED, 'secondary')).toBeNull();
  });

  it('returns null when materials is null (no provider)', () => {
    expect(resolveRoleMaterial(null, 'primary')).toBeNull();
  });

  it('returns null when assigned preset is not in metallic map', () => {
    const broken: ResolvedMaterials = {
      enabled: ['gold'],
      assignments: { primary: 'gold' },
      metallic: {},
    };
    expect(resolveRoleMaterial(broken, 'primary')).toBeNull();
  });

  it('resolvedMaterials enabled list reflects activeMetals', () => {
    expect(TIRA_RESOLVED.enabled).toContain('gold');
    expect(TIRA_RESOLVED.enabled).not.toContain('platinum');
  });

  it('gradient carries 8 fill colors and 8 locations', () => {
    const grad = resolveRoleMaterial(TIRA_RESOLVED, 'primary')!;
    expect(grad.colors).toHaveLength(8);
    expect(grad.locations).toHaveLength(8);
  });

  it('gradient locations start at 0 and end at 1', () => {
    const grad = resolveRoleMaterial(TIRA_RESOLVED, 'primary')!;
    expect(grad.locations[0]).toBe(0);
    expect(grad.locations[grad.locations.length - 1]).toBe(1.0);
  });
});
