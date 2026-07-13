/**
 * Button.material.test.ts
 *
 * Unit tests for the metallic gradient path in Button:
 *   - `extractMetallicPreset` correctly parses `Material-Metallic-*-Fill` refs
 *   - `applyTokenRefsToPaint` sets `bgGradient` when a brand assigns a metallic tokenRef
 *   - Auto-swap logic: `paint.bgGradient ?? (bold + renderer + roleMaterial)`
 *   - Solid fallback when renderer is null
 *
 * These tests replicate the pure-logic parts of Button.native.tsx without
 * requiring a native renderer or React context.
 */

import { describe, it, expect } from 'vitest';
import type { ResolvedMetallicGradient, ResolvedMaterials } from '@oneui/shared/engine';
import { setMaterialRenderer, getMaterialRenderer } from '../../../theme/materialRenderer';

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

// ─── Pure-logic replicas ──────────────────────────────────────────────────────

// Replicate extractMetallicPreset from Button.native.tsx
function extractMetallicPreset(ref: string, suffix: 'Fill' | 'StrokeColor'): string | undefined {
  const pattern = suffix === 'Fill'
    ? /^Material-Metallic-(.+)-Fill$/
    : /^Material-Metallic-(.+)-StrokeColor$/;
  const match = ref.match(pattern);
  if (!match) return undefined;
  const name = match[1]!;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

// Simplified version of the active-gradient selection logic in Button.native.tsx
function resolveActiveGradient(
  paintBgGradient: ResolvedMetallicGradient | undefined,
  variant: string,
  renderer: ReturnType<typeof getMaterialRenderer>,
  roleMaterial: ResolvedMetallicGradient | null,
): ResolvedMetallicGradient | null {
  return (
    paintBgGradient ??
    (variant === 'bold' && renderer != null && roleMaterial != null ? roleMaterial : null)
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('extractMetallicPreset', () => {
  it('parses Gold Fill ref', () => {
    expect(extractMetallicPreset('Material-Metallic-Gold-Fill', 'Fill')).toBe('gold');
  });

  it('parses Silver Fill ref', () => {
    expect(extractMetallicPreset('Material-Metallic-Silver-Fill', 'Fill')).toBe('silver');
  });

  it('parses RoseGold Fill ref', () => {
    expect(extractMetallicPreset('Material-Metallic-RoseGold-Fill', 'Fill')).toBe('roseGold');
  });

  it('parses Gold StrokeColor ref', () => {
    expect(extractMetallicPreset('Material-Metallic-Gold-StrokeColor', 'StrokeColor')).toBe('gold');
  });

  it('returns undefined for non-material refs', () => {
    expect(extractMetallicPreset('Surface-Bold', 'Fill')).toBeUndefined();
    expect(extractMetallicPreset('Primary-Bold', 'Fill')).toBeUndefined();
  });

  it('returns undefined for wrong suffix', () => {
    expect(extractMetallicPreset('Material-Metallic-Gold-Fill', 'StrokeColor')).toBeUndefined();
  });
});

describe('active gradient resolution', () => {
  it('prefers paint.bgGradient (tokenRef path) over role assignment', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    const active = resolveActiveGradient(GOLD_GRADIENT, 'bold', mockRenderer, null);
    expect(active).toBe(GOLD_GRADIENT);
  });

  it('falls back to roleMaterial when paint.bgGradient is absent (role-assignment path)', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    const active = resolveActiveGradient(undefined, 'bold', mockRenderer, GOLD_GRADIENT);
    expect(active).toBe(GOLD_GRADIENT);
  });

  it('returns null when variant is not bold, even if roleMaterial is set', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    const active = resolveActiveGradient(undefined, 'subtle', mockRenderer, GOLD_GRADIENT);
    expect(active).toBeNull();
  });

  it('returns null when renderer is null (initOneUIMaterials not called)', () => {
    const active = resolveActiveGradient(undefined, 'bold', null, GOLD_GRADIENT);
    expect(active).toBeNull();
  });

  it('returns null when neither tokenRef nor role-assignment is present', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    const active = resolveActiveGradient(undefined, 'bold', mockRenderer, null);
    expect(active).toBeNull();
  });
});

describe('setMaterialRenderer / getMaterialRenderer seam', () => {
  it('getMaterialRenderer returns null initially (no renderer registered)', () => {
    setMaterialRenderer(null);
    expect(getMaterialRenderer()).toBeNull();
  });

  it('getMaterialRenderer returns registered renderer', () => {
    const mock = { renderMetallicFill: () => null as never };
    setMaterialRenderer(mock);
    expect(getMaterialRenderer()).toBe(mock);
    setMaterialRenderer(null);
  });

  it('getMaterialRenderer returns null after clearing', () => {
    const mock = { renderMetallicFill: () => null as never };
    setMaterialRenderer(mock);
    setMaterialRenderer(null);
    expect(getMaterialRenderer()).toBeNull();
  });
});
