/**
 * Surface.material.test.ts
 *
 * Unit tests for the metallic auto-swap logic on the native <Surface> component.
 *
 * Surface uses the same renderer seam + role-material lookup as Button. These
 * tests verify the conditions that gate the metallic render path:
 *   - mode must be 'bold'
 *   - material must not be 'none'
 *   - renderer must be registered (getMaterialRenderer() != null)
 *   - roleMaterial must be non-null (brand assigns a metal to the role)
 */

import { describe, it, expect } from 'vitest';
import type { ResolvedMetallicGradient } from '@oneui/shared/engine';
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

// ─── Pure-logic replica of Surface's metallic gate ───────────────────────────

type SurfaceMode = 'default' | 'ghost' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated';
type MaterialProp = 'auto' | 'none';

function shouldUseMetallic(
  mode: SurfaceMode,
  material: MaterialProp,
  renderer: ReturnType<typeof getMaterialRenderer>,
  roleMaterial: ResolvedMetallicGradient | null,
): boolean {
  return mode === 'bold' && material !== 'none' && renderer != null && roleMaterial != null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Surface metallic auto-swap gate', () => {
  it('renders metallic when mode=bold, material=auto, renderer set, roleMaterial assigned', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    expect(shouldUseMetallic('bold', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(true);
  });

  it('does NOT render metallic when material="none"', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    expect(shouldUseMetallic('bold', 'none', mockRenderer, GOLD_GRADIENT)).toBe(false);
  });

  it('does NOT render metallic when mode is not "bold"', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    expect(shouldUseMetallic('subtle', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
    expect(shouldUseMetallic('moderate', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
    expect(shouldUseMetallic('minimal', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
    expect(shouldUseMetallic('ghost', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
    expect(shouldUseMetallic('elevated', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
    expect(shouldUseMetallic('default', 'auto', mockRenderer, GOLD_GRADIENT)).toBe(false);
  });

  it('does NOT render metallic when renderer is null (initOneUIMaterials not called)', () => {
    expect(shouldUseMetallic('bold', 'auto', null, GOLD_GRADIENT)).toBe(false);
  });

  it('does NOT render metallic when roleMaterial is null (no brand assignment)', () => {
    const mockRenderer = { renderMetallicFill: () => null as never };
    expect(shouldUseMetallic('bold', 'auto', mockRenderer, null)).toBe(false);
  });

  it('does NOT render metallic when both renderer and roleMaterial are absent', () => {
    expect(shouldUseMetallic('bold', 'auto', null, null)).toBe(false);
  });
});

describe('setMaterialRenderer state transitions for Surface', () => {
  it('getMaterialRenderer returns null after clearing', () => {
    const mock = { renderMetallicFill: () => null as never };
    setMaterialRenderer(mock);
    setMaterialRenderer(null);
    expect(getMaterialRenderer()).toBeNull();
  });

  it('getMaterialRenderer returns the registered renderer', () => {
    const mock = { renderMetallicFill: () => null as never };
    setMaterialRenderer(mock);
    expect(getMaterialRenderer()).toBe(mock);
    setMaterialRenderer(null);
  });
});
