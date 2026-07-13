/**
 * buttonAttention.unit.test.ts
 *
 * Per-level attention style resolution for the native Button paint cascade —
 * the native mirror of the web attentionStyleOverrides generator. High→bold,
 * Medium→subtle, Low→ghost; each variant's factory style is a no-op and the
 * legacy emphasisStyle key aliases the High level.
 */

import { describe, it, expect } from 'vitest';
import {
  buildNativeTheme,
  type OneUINativeTheme,
  type NativeRoleTokens,
} from '@oneui/shared/engine';
import {
  applyAttentionStyleToPaint,
  applyEmphasisStyleToPaint,
  VARIANT_FACTORY_ATTENTION_STYLE,
  VARIANT_PAINT,
} from '../buttonPaint';

const colorConfig = {
  brandScales: [{ name: 'Brand', source: 'custom' as const, baseColor: '#e63329' }],
};
const appearanceConfig = {
  accentCount: 1,
  background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 200 } },
  accents: [{ role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1300 }],
};

function buildTheme(): OneUINativeTheme {
  return buildNativeTheme({ colorConfig, appearanceConfig }, { theme: 'light' })!;
}

function getRole(theme: OneUINativeTheme): NativeRoleTokens {
  return theme.rootRoles.primary ?? theme.rootRoles.neutral;
}

describe('applyAttentionStyleToPaint', () => {
  const theme = buildTheme();
  const role = getRole(theme);

  it('keeps every variant untouched on its factory style', () => {
    for (const variant of ['bold', 'subtle', 'ghost'] as const) {
      const base = VARIANT_PAINT[variant](role);
      const styled = applyAttentionStyleToPaint(
        base,
        VARIANT_FACTORY_ATTENTION_STYLE[variant],
        role,
        variant,
      );
      expect(styled).toBe(base);
      expect(applyAttentionStyleToPaint(base, undefined, role, variant)).toBe(base);
    }
  });

  it('renders medium (subtle) as solid when mediumAttentionStyle=solid', () => {
    const base = VARIANT_PAINT.subtle(role);
    const styled = applyAttentionStyleToPaint(base, 'solid', role, 'subtle');
    expect(styled.bg).toBe(role.surfaces.bold);
    expect(styled.text).toBe(role.onBoldContent.tintedA11y);
    expect(styled.pressedBg).toBe(role.states.boldPressed);
  });

  it('renders low (ghost) as tonal when lowAttentionStyle=tonal', () => {
    const base = VARIANT_PAINT.ghost(role);
    const styled = applyAttentionStyleToPaint(base, 'tonal', role, 'ghost');
    expect(styled.bg).toBe(role.surfaces.subtle);
    expect(styled.text).toBe(role.onSubtleContent.tintedA11y);
  });

  it('renders low (ghost) as outline with a visible stroke', () => {
    const base = VARIANT_PAINT.ghost(role);
    const styled = applyAttentionStyleToPaint(base, 'outline', role, 'ghost');
    expect(styled.bg).toBe('transparent');
    expect(styled.borderColor).toBe(role.content.tintedA11y);
    expect(styled.borderWidth).toBe(1);
  });

  it('renders high (bold) as quiet with transparent rest and state fills', () => {
    const base = VARIANT_PAINT.bold(role);
    const styled = applyAttentionStyleToPaint(base, 'quiet', role, 'bold');
    expect(styled.bg).toBe('transparent');
    expect(styled.pressedBg).toBe(role.states.subtlePressed);
  });

  it('keeps the deprecated applyEmphasisStyleToPaint as a High-level alias', () => {
    const base = VARIANT_PAINT.bold(role);
    expect(applyEmphasisStyleToPaint(base, 'tonal', role)).toEqual(
      applyAttentionStyleToPaint(base, 'tonal', role, 'bold'),
    );
    expect(applyEmphasisStyleToPaint(base, 'solid', role)).toBe(base);
  });
});
