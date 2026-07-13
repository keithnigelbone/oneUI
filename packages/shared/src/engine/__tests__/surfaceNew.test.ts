import { describe, it, expect } from 'vitest';
import {
  STEPS,
  APPEARANCE_ROLES,
  CONTEXT_SURFACE_TOKENS,
  MEDIA_CONTEXTS,
  resolveSurface,
  resolveContent,
  resolveState,
  resolveInteractionOverlay,
  resolveTokenSet,
  resolveMultiRoleTokenSets,
  resolveContextTokenSet,
  computeContrastDir,
  computeDarkerBaseStep,
  buildScaleDefinition,
  opacityFromStep,
  resolveMediaSurface,
  resolveMediaContent,
  resolveMediaInteraction,
  resolveMediaFocusRing,
  getTransparentBaseHex,
  type ScaleDefinition,
  type SurfaceToken,
  type ContentToken,
  type StateToken,
  type ContrastDir,
  type MediaContext,
} from '../surfaceNew';
import {
  preParseRGBPalette,
  hexToRgbTuple,
  getContrastRatioRGB,
  blendWithAlphaRGB,
  type ColorPalette,
  type RGB,
} from '../colorMath';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Build a simple greyscale gradient palette (dark → light).
 * Step 100 = near black, step 2500 = near white.
 */
function buildGreyscalePalette(): ColorPalette {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const v = Math.round(t * 255);
    palette[step] = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }
  return palette;
}

/**
 * Build a colored palette (warm ramp: dark red → bright orange → white).
 */
function buildColoredPalette(): ColorPalette {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const r = Math.round(Math.min(255, t * 300));
    const g = Math.round(t * 200);
    const b = Math.round(t * 150);
    palette[step] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return palette;
}

/** Build a scale definition from a palette */
function buildTestScale(palette: ColorPalette, baseStep = 1400): ScaleDefinition {
  return buildScaleDefinition('test', palette, baseStep);
}

/** Get WCAG contrast ratio between two steps in a palette */
function contrastBetween(palette: ColorPalette, step1: number, step2: number): number {
  const rgb1 = hexToRgbTuple(palette[step1] ?? '#808080');
  const rgb2 = hexToRgbTuple(palette[step2] ?? '#808080');
  return getContrastRatioRGB(rgb1, rgb2);
}

// ============================================================================
// resolveSurface
// ============================================================================

describe('resolveSurface', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  describe('default token', () => {
    it('returns 2500 in light mode', () => {
      expect(resolveSurface('default', 2500, scale, 1, false)).toBe(2500);
      expect(resolveSurface('default', 1400, scale, -1, false)).toBe(2500);
    });

    it('returns 200 in dark mode', () => {
      // RFC-0003 spec confirmation: Studio's dark root anchor is step 200
      // (matches OneUIColourTool reference). Was 100 previously.
      expect(resolveSurface('default', 100, scale, -1, true)).toBe(200);
      expect(resolveSurface('default', 1400, scale, 1, true)).toBe(200);
    });

    it('ignores parent step and direction', () => {
      // default is absolute, not relative
      expect(resolveSurface('default', 800, scale, -1, false)).toBe(2500);
      expect(resolveSurface('default', 1800, scale, 1, true)).toBe(200);
    });
  });

  describe('ghost token', () => {
    it('returns the parent step unchanged', () => {
      for (const step of STEPS) {
        expect(resolveSurface('ghost', step, scale, 1)).toBe(step);
        expect(resolveSurface('ghost', step, scale, -1)).toBe(step);
      }
    });
  });

  describe('blend token', () => {
    it('returns the parent step unchanged', () => {
      expect(resolveSurface('blend', 1700, scale, 1)).toBe(1700);
      expect(resolveSurface('blend', 500, scale, -1)).toBe(500);
    });
  });

  describe('elevated token', () => {
    it('shifts +100 toward light, capped at 2500', () => {
      expect(resolveSurface('elevated', 2000, scale, 1)).toBe(2100);
      expect(resolveSurface('elevated', 2000, scale, -1)).toBe(2100);
      expect(resolveSurface('elevated', 2500, scale, 1)).toBe(2500);
    });

    it('is direction-independent', () => {
      expect(resolveSurface('elevated', 1500, scale, 1))
        .toBe(resolveSurface('elevated', 1500, scale, -1));
    });
  });

  describe('minimal/subtle/moderate tokens', () => {
    it('offsets by 1/2/3 steps in contrast direction', () => {
      const parent = 2000;
      const dir: ContrastDir = -1; // toward darker
      expect(resolveSurface('minimal', parent, scale, dir)).toBe(1900);
      expect(resolveSurface('subtle', parent, scale, dir)).toBe(1800);
      expect(resolveSurface('moderate', parent, scale, dir)).toBe(1700);
    });

    it('offsets in the opposite direction when dir=1', () => {
      const parent = 500;
      const dir: ContrastDir = 1; // toward lighter
      expect(resolveSurface('minimal', parent, scale, dir)).toBe(600);
      expect(resolveSurface('subtle', parent, scale, dir)).toBe(700);
      expect(resolveSurface('moderate', parent, scale, dir)).toBe(800);
    });

    it('clamps to valid range', () => {
      // Near minimum — should not go below 100
      expect(resolveSurface('subtle', 100, scale, -1)).toBe(100);
      expect(resolveSurface('moderate', 200, scale, -1)).toBe(100);

      // Near maximum — should not go above 2500
      expect(resolveSurface('subtle', 2500, scale, 1)).toBe(2500);
      expect(resolveSurface('moderate', 2400, scale, 1)).toBe(2500);
    });
  });

  describe('bold token', () => {
    it('jumps to base step when parent is high (≥1300)', () => {
      // parent=2500, scale.baseStep=1400 → distance=11 ≥ 7 → use baseStep
      expect(resolveSurface('bold', 2500, scale, -1)).toBe(1400);
    });

    it('jumps to darkerBase step when parent is low (<1300)', () => {
      // parent=500, darkerBase = computeDarkerBaseStep(1400) = 1500
      expect(resolveSurface('bold', 500, scale, 1)).toBe(scale.darkerBaseStep);
    });

    it('uses parent − 700 fallback when candidate is too close', () => {
      // Create a scale where base is close to parent
      const closeScale = buildTestScale(palette, 1500);
      // parent=1400, base=1500, distance=1 < 7 → darker fallback: 1400 − 700 = 700
      // Bold fallback ignores parent's dir and always goes darker first.
      const result = resolveSurface('bold', 1400, closeScale, 1);
      expect(result).toBe(700);
    });

    it('reverses to parent + 700 when the darker fallback would land below 500', () => {
      // parent=1000, darkerBase close → fallback: 1000 − 700 = 300 < 500 → reverse to 1000 + 700 = 1700
      const closeScale = buildTestScale(palette, 1100);
      // parent=1000 is < 1300 → candidate = darkerBase (1300, computed offset=200).
      // distance = 300/100 = 3 < 7 → fallback.
      const result = resolveSurface('bold', 1000, closeScale, 1);
      expect(result).toBe(1700);
    });

    it('keeps darker fallback when result equals the flip threshold (500)', () => {
      // parent=1200, closeBase=1400 → candidate = darkerBase (parent < 1300).
      // darkerBase for baseStep=1400 = 1400 + 100 = 1500. distance = 300/100 = 3 < 7 → fallback.
      // 1200 − 700 = 500; `< 500` is false, keep 500.
      const closeScale = buildTestScale(palette, 1400);
      const result = resolveSurface('bold', 1200, closeScale, 1);
      expect(result).toBe(500);
    });

    it('boundary: parent=1300 still uses baseStep (not darkerBase)', () => {
      // parent=1300 is the lower edge of the ≥1300 branch. With baseStep=1400,
      // distance=1 < 7 → fallback: 1300 − 700 = 600.
      const closeScale = buildTestScale(palette, 1400);
      const result = resolveSurface('bold', 1300, closeScale, 1);
      expect(result).toBe(600);
    });

    it('boundary: parent=1200 uses darkerBaseStep (not baseStep)', () => {
      // parent=1200 is the upper edge of the <1300 branch.
      // darkerBase for baseStep=1400 = 1500. distance = 3 < 7 → fallback: 1200 − 700 = 500.
      const closeScale = buildTestScale(palette, 1400);
      const result = resolveSurface('bold', 1200, closeScale, 1);
      expect(result).toBe(500);
    });

    it('always produces a valid step', () => {
      for (const step of STEPS) {
        for (const dir of [1, -1] as ContrastDir[]) {
          const result = resolveSurface('bold', step, scale, dir);
          expect(result).toBeGreaterThanOrEqual(100);
          expect(result).toBeLessThanOrEqual(2500);
        }
      }
    });
  });

  describe('all tokens produce valid steps', () => {
    const tokens: SurfaceToken[] = [
      'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
    ];

    it('every token × every parent step → valid step in [100, 2500]', () => {
      for (const token of tokens) {
        for (const step of STEPS) {
          for (const dir of [1, -1] as ContrastDir[]) {
            for (const dm of [false, true]) {
              const result = resolveSurface(token, step, scale, dir, dm);
              expect(result).toBeGreaterThanOrEqual(100);
              expect(result).toBeLessThanOrEqual(2500);
            }
          }
        }
      }
    });
  });
});

// ============================================================================
// resolveState
// ============================================================================

describe('resolveState', () => {
  it('hover shifts 1 step from parent in contrast direction', () => {
    expect(resolveState('hover', 2000, 1400, 1800, -1)).toBe(1900);
    expect(resolveState('hover', 500, 1400, 700, 1)).toBe(600);
  });

  it('pressed shifts 2 steps from parent in contrast direction', () => {
    expect(resolveState('pressed', 2000, 1400, 1800, -1)).toBe(1800);
    expect(resolveState('pressed', 500, 1400, 700, 1)).toBe(700);
  });

  it('boldHover shifts 3 steps from bold step (larger delta than other surfaces)', () => {
    expect(resolveState('boldHover', 2500, 1400, 2300, -1)).toBe(1100);
    expect(resolveState('boldHover', 200, 1400, 400, 1)).toBe(1700);
  });

  it('boldPressed shifts 5 steps from bold step (larger delta than other surfaces)', () => {
    expect(resolveState('boldPressed', 2500, 1400, 2300, -1)).toBe(900);
    expect(resolveState('boldPressed', 200, 1400, 400, 1)).toBe(1900);
  });

  it('subtleHover shifts 1 step from subtle step', () => {
    expect(resolveState('subtleHover', 2500, 1400, 2300, -1)).toBe(2200);
    expect(resolveState('subtleHover', 200, 1400, 400, 1)).toBe(500);
  });

  it('subtlePressed shifts 2 steps from subtle step', () => {
    expect(resolveState('subtlePressed', 2500, 1400, 2300, -1)).toBe(2100);
    expect(resolveState('subtlePressed', 200, 1400, 400, 1)).toBe(600);
  });

  it('clamps to valid range', () => {
    expect(resolveState('hover', 100, 1400, 300, -1)).toBe(100);
    expect(resolveState('pressed', 100, 1400, 300, -1)).toBe(100);
    expect(resolveState('boldHover', 200, 2500, 400, 1)).toBe(2500);
    expect(resolveState('boldPressed', 200, 2500, 400, 1)).toBe(2500);
    expect(resolveState('subtleHover', 200, 1400, 100, 1)).toBe(200);
    expect(resolveState('subtlePressed', 200, 1400, 100, -1)).toBe(100);
  });

  it('uses the passed-in dir for all tokens — never re-derives from boldStep/subtleStep', () => {
    // Critical invariant from reference: interaction state deltas use the PARENT'S
    // contrasting direction, not the dir that would be computed at the resolved
    // bold or subtle step. Pass mismatched steps + dir to verify the function
    // trusts the caller's dir rather than second-guessing.
    // parent=2500 (light), bold=500 (very dark, would want dir=+1 if recomputed),
    // but caller passes dir=-1 meaning "keep moving toward dark".
    // boldHover must use the caller's dir regardless of boldStep's colour.
    expect(resolveState('boldHover', 2500, 500, 1800, -1)).toBe(200); // 500 + (-1)*300
    expect(resolveState('boldPressed', 2500, 500, 1800, -1)).toBe(100); // 500 + (-1)*500, clamped
    expect(resolveState('subtleHover', 2500, 500, 1800, -1)).toBe(1700); // 1800 + (-1)*100
  });
});

// ============================================================================
// resolveInteractionOverlay
// ============================================================================

describe('resolveInteractionOverlay', () => {
  it('uses the plugin overlay step offset clamped to 200-2000', () => {
    expect(resolveInteractionOverlay('hover', 2500, 'default', -1)).toEqual({
      step: 1700,
      opacity: 0.16,
    });
    expect(resolveInteractionOverlay('pressed', 200, 'default', 1)).toEqual({
      step: 1000,
      opacity: 0.24,
    });
    expect(resolveInteractionOverlay('hover', 100, 'default', -1).step).toBe(200);
    expect(resolveInteractionOverlay('hover', 2500, 'default', 1).step).toBe(2000);
  });

  it('uses stronger opacity for bold state layers', () => {
    expect(resolveInteractionOverlay('hover', 1400, 'bold', -1)).toEqual({
      step: 600,
      opacity: 0.24,
    });
    expect(resolveInteractionOverlay('pressed', 1400, 'bold', -1)).toEqual({
      step: 600,
      opacity: 0.32,
    });
  });

  it('renders no overlay for idle and focus', () => {
    expect(resolveInteractionOverlay('idle', 1400, 'bold', -1)).toEqual({
      step: 600,
      opacity: 0,
    });
    expect(resolveInteractionOverlay('focus', 1400, 'bold', -1)).toEqual({
      step: 600,
      opacity: 0,
    });
  });
});

// ============================================================================
// resolveContent — WCAG Contract Tests
// ============================================================================

describe('resolveContent', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);
  const rgbPalette = preParseRGBPalette(palette);

  describe('high token', () => {
    it('returns the contrasting extreme at full opacity', () => {
      const parentRgb = hexToRgbTuple(palette[2500]!);
      const result = resolveContent('high', 2500, parentRgb, scale, rgbPalette, -1);
      expect(result.step).toBe(200);
      expect(result.opacity).toBe(1);
    });

    it('returns 2500 when dir=1', () => {
      const parentRgb = hexToRgbTuple(palette[100]!);
      const result = resolveContent('high', 100, parentRgb, scale, rgbPalette, 1);
      expect(result.step).toBe(2500);
      expect(result.opacity).toBe(1);
    });
  });

  describe('low token — WCAG AA (4.5:1) contract', () => {
    it('achieves ≥4.5:1 contrast when blended over parent', () => {
      for (const parentStep of [200, 800, 1300, 2000, 2500] as const) {
        const parentRgb = hexToRgbTuple(palette[parentStep]!);
        const dir: ContrastDir = parentStep >= 1300 ? -1 : 1;
        const result = resolveContent('low', parentStep, parentRgb, scale, rgbPalette, dir);

        // Text tokens use neutral black/white, not the palette's tinted extreme
        const neutralRgb: RGB = dir === 1 ? [255, 255, 255] : [0, 0, 0];
        const { rgb: blended } = blendWithAlphaRGB(neutralRgb, parentRgb, result.opacity);
        const contrast = getContrastRatioRGB(blended, parentRgb);

        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
    });
  });

  describe('medium token', () => {
    it('opacity is midpoint between low opacity and 1', () => {
      const parentStep = 2500;
      const parentRgb = hexToRgbTuple(palette[parentStep]!);
      const dir: ContrastDir = -1;

      const lowResult = resolveContent('low', parentStep, parentRgb, scale, rgbPalette, dir);
      const medResult = resolveContent('medium', parentStep, parentRgb, scale, rgbPalette, dir);

      expect(medResult.opacity).toBeCloseTo((lowResult.opacity + 1) / 2, 5);
    });

    it('always has higher contrast than low', () => {
      const parentStep = 2500;
      const parentRgb = hexToRgbTuple(palette[parentStep]!);
      const dir: ContrastDir = -1;

      const lowResult = resolveContent('low', parentStep, parentRgb, scale, rgbPalette, dir);
      const medResult = resolveContent('medium', parentStep, parentRgb, scale, rgbPalette, dir);

      expect(medResult.opacity).toBeGreaterThan(lowResult.opacity);
    });
  });

  describe('tinted token — 3:1 WCAG contract (UI components)', () => {
    it('achieves ≥3:1 contrast against parent', () => {
      for (const parentStep of [2500, 1800, 200] as const) {
        const parentRgb = hexToRgbTuple(palette[parentStep]!);
        const dir: ContrastDir = parentStep >= 1300 ? -1 : 1;
        const result = resolveContent('tinted', parentStep, parentRgb, scale, rgbPalette, dir);

        const resultRgb = hexToRgbTuple(palette[result.step]!);
        const contrast = getContrastRatioRGB(resultRgb, parentRgb);

        expect(contrast).toBeGreaterThanOrEqual(3.0);
      }
    });
  });

  describe('tintedA11y token — 4.5:1 WCAG AA contract (text)', () => {
    it('achieves ≥4.5:1 contrast against parent', () => {
      for (const parentStep of [2500, 1800, 200] as const) {
        const parentRgb = hexToRgbTuple(palette[parentStep]!);
        const dir: ContrastDir = parentStep >= 1300 ? -1 : 1;
        const result = resolveContent('tintedA11y', parentStep, parentRgb, scale, rgbPalette, dir);

        const resultRgb = hexToRgbTuple(palette[result.step]!);
        const contrast = getContrastRatioRGB(resultRgb, parentRgb);

        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }
    });
  });

  describe('stroke tokens', () => {
    it('strokeMedium has higher opacity than strokeLow', () => {
      const parentRgb = hexToRgbTuple(palette[2500]!);
      const medium = resolveContent('strokeMedium', 2500, parentRgb, scale, rgbPalette, -1);
      const low = resolveContent('strokeLow', 2500, parentRgb, scale, rgbPalette, -1);
      expect(medium.opacity).toBeGreaterThan(low.opacity);
    });

    it('produces valid step numbers', () => {
      for (const parentStep of STEPS) {
        const parentRgb = hexToRgbTuple(palette[parentStep]!);
        for (const dir of [1, -1] as ContrastDir[]) {
          const medium = resolveContent('strokeMedium', parentStep, parentRgb, scale, rgbPalette, dir);
          const low = resolveContent('strokeLow', parentStep, parentRgb, scale, rgbPalette, dir);
          expect(medium.step).toBeGreaterThanOrEqual(100);
          expect(medium.step).toBeLessThanOrEqual(2500);
          expect(low.step).toBeGreaterThanOrEqual(100);
          expect(low.step).toBeLessThanOrEqual(2500);
        }
      }
    });
  });
});

// ============================================================================
// computeContrastDir
// ============================================================================

describe('computeContrastDir', () => {
  const palette = buildGreyscalePalette();
  const rgbPalette = preParseRGBPalette(palette);

  it('returns 1 (toward light) for dark parent', () => {
    const parentRgb = hexToRgbTuple(palette[200]!);
    expect(computeContrastDir(parentRgb, rgbPalette)).toBe(1);
  });

  it('returns -1 (toward dark) for light parent', () => {
    const parentRgb = hexToRgbTuple(palette[2500]!);
    expect(computeContrastDir(parentRgb, rgbPalette)).toBe(-1);
  });
});

// ============================================================================
// computeDarkerBaseStep
// ============================================================================

describe('computeDarkerBaseStep', () => {
  it('applies correct offset based on base position', () => {
    expect(computeDarkerBaseStep(2000)).toBe(2000); // ≥1900: offset 0
    expect(computeDarkerBaseStep(1400)).toBe(1500); // ≥1300: offset 1
    expect(computeDarkerBaseStep(1000)).toBe(1200); // ≥700: offset 2
    expect(computeDarkerBaseStep(500)).toBe(800);   // <700: offset 3
  });

  it('clamps to 2500 maximum', () => {
    expect(computeDarkerBaseStep(2500)).toBe(2500);
  });
});

// ============================================================================
// resolveTokenSet — Integration
// ============================================================================

describe('resolveTokenSet', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  describe('light mode (parent=2500)', () => {
    const result = resolveTokenSet(scale, 2500, false);

    it('resolves all 8 surface tokens', () => {
      expect(Object.keys(result.surfaces)).toHaveLength(8);
      expect(result.surfaces.default.step).toBe(2500);
      expect(result.surfaces.ghost.step).toBe(2500);
      expect(result.surfaces.blend.step).toBe(2500);
      expect(result.surfaces.bold.step).toBe(1400);
    });

    it('resolves all 7 content tokens', () => {
      expect(Object.keys(result.content)).toHaveLength(7);
      expect(result.content.high.opacity).toBe(1);
    });

    it('resolves all 6 state tokens', () => {
      expect(Object.keys(result.states)).toHaveLength(6);
    });

    it('resolves all 6 plugin-style state layers', () => {
      expect(Object.keys(result.stateLayers)).toHaveLength(6);
      expect(result.stateLayers.hover.step).toBe(1700);
      expect(result.stateLayers.hover.opacity).toBe(0.16);
      // Plugin tokenator aliases bold surface mode to the bold state-layer
      // variant, but the overlay colour is still derived from the active
      // parent surface step. Bold changes opacity, not the reference step.
      expect(result.stateLayers.boldHover.step).toBe(1700);
      expect(result.stateLayers.boldHover.opacity).toBe(0.24);
      expect(result.stateLayers.subtleHover.step).toBe(1700);
      expect(result.stateLayers.subtleHover.opacity).toBe(0.16);
    });

    it('provides hex values for all surfaces', () => {
      for (const surface of Object.values(result.surfaces)) {
        expect(surface.hex).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('provides hex and blendedHex for all content', () => {
      for (const content of Object.values(result.content)) {
        expect(content.hex).toMatch(/^#[0-9a-f]{6}$/i);
        expect(content.blendedHex).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('contrast direction is toward dark for light parent', () => {
      expect(result.contrastDir).toBe(-1);
    });
  });

  describe('dark mode (parent=200)', () => {
    const result = resolveTokenSet(scale, 200, true);

    it('default surface is 200 in dark mode', () => {
      // Dark root anchors at step 200 (RFC-0003 confirmed spec).
      expect(result.surfaces.default.step).toBe(200);
    });

    it('contrast direction is toward light for dark parent', () => {
      expect(result.contrastDir).toBe(1);
    });

    it('content.high points to light extreme', () => {
      expect(result.content.high.step).toBe(2500);
    });
  });

  describe('with colored palette', () => {
    const coloredPalette = buildColoredPalette();
    const coloredScale = buildTestScale(coloredPalette, 1400);

    it('WCAG contracts hold on non-greyscale palettes', () => {
      const result = resolveTokenSet(coloredScale, 2500, false);

      // low must achieve 4.5:1
      const parentRgb = hexToRgbTuple(coloredPalette[2500]!);
      // Text tokens use neutral black/white
      const lowRgb: RGB = result.contrastDir === 1 ? [255, 255, 255] : [0, 0, 0];
      const { rgb: blended } = blendWithAlphaRGB(lowRgb, parentRgb, result.content.low.opacity);
      const contrast = getContrastRatioRGB(blended, parentRgb);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('parent-dir invariant (reference critical rule)', () => {
    // Reference rule: interaction state deltas must use the dir computed at the
    // PARENT step, not recomputed at the resolved bold/subtle steps.
    // End-to-end assertion: within a single resolveTokenSet call, every state
    // token is derived from its base surface via the parent's contrastDir.
    const palette = buildGreyscalePalette();
    const scale = buildTestScale(palette, 1400);

    it.each([
      { label: 'light parent', parentStep: 2500 },
      { label: 'dark parent', parentStep: 100 },
      { label: 'just above 1300 boundary', parentStep: 1400 },
      { label: 'just below 1300 boundary', parentStep: 1200 },
    ])('$label (parent=$parentStep): all state offsets move with the parent dir', ({ parentStep }) => {
      const result = resolveTokenSet(scale, parentStep, false);
      const { contrastDir, surfaces, states } = result;

      // hover/pressed — offset from parent
      const hoverDelta = states.hover.step - parentStep;
      const pressedDelta = states.pressed.step - parentStep;

      // boldHover/boldPressed — offset from bold.step using PARENT's dir
      const boldHoverDelta = states.boldHover.step - surfaces.bold.step;
      const boldPressedDelta = states.boldPressed.step - surfaces.bold.step;

      // subtleHover/subtlePressed — offset from subtle.step using PARENT's dir
      const subtleHoverDelta = states.subtleHover.step - surfaces.subtle.step;
      const subtlePressedDelta = states.subtlePressed.step - surfaces.subtle.step;

      // Each delta either (a) moves in contrastDir or (b) is clamped to 0 at the
      // palette boundary. None should move AGAINST the parent's dir — that would
      // indicate dir was recomputed at the resolved surface step.
      const agreesOrClamped = (delta: number) =>
        Math.sign(delta) === contrastDir || delta === 0;

      expect(agreesOrClamped(hoverDelta)).toBe(true);
      expect(agreesOrClamped(pressedDelta)).toBe(true);
      expect(agreesOrClamped(boldHoverDelta)).toBe(true);
      expect(agreesOrClamped(boldPressedDelta)).toBe(true);
      expect(agreesOrClamped(subtleHoverDelta)).toBe(true);
      expect(agreesOrClamped(subtlePressedDelta)).toBe(true);
    });
  });
});

// ============================================================================
// resolveMultiRoleTokenSets
// ============================================================================

describe('resolveMultiRoleTokenSets', () => {
  const palette = buildGreyscalePalette();
  const coloredPalette = buildColoredPalette();

  const themeConfig = {
    appearances: {
      neutral: buildTestScale(palette, 1300),
      primary: buildTestScale(coloredPalette, 1400),
    },
  };

  it('resolves all configured roles', () => {
    const result = resolveMultiRoleTokenSets(themeConfig, 2500, false);
    expect(Object.keys(result.roles)).toEqual(['neutral', 'primary']);
  });

  it('each role has independent token resolution', () => {
    const result = resolveMultiRoleTokenSets(themeConfig, 2500, false);
    // neutral and primary have different bold steps (different baseSteps)
    expect(result.roles.neutral.surfaces.bold.step).toBe(1300);
    expect(result.roles.primary.surfaces.bold.step).toBe(1400);
  });

  it('passes darkMode through to all roles', () => {
    const result = resolveMultiRoleTokenSets(themeConfig, 100, true);
    expect(result.darkMode).toBe(true);
    expect(result.roles.neutral.surfaces.default.step).toBe(200);
    expect(result.roles.primary.surfaces.default.step).toBe(200);
  });
});

// ============================================================================
// resolveContextTokenSet — Surface context remapping
// ============================================================================

describe('resolveContextTokenSet', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  describe('bold context', () => {
    const outerParent = 2500; // light mode page
    const context = resolveContextTokenSet(scale, 'bold', outerParent, false);

    it('parent step is the bold surface step, not the outer parent', () => {
      // bold at parent=2500 should jump to baseStep=1400
      expect(context.parentStep).toBe(1400);
    });

    it('content.high points to the contrasting extreme from bold surface', () => {
      // On greyscale step 1400 (~58% brightness), contrast toward dark (200)
      // is higher than toward light (2500), so dir=-1 and high=200.
      expect(context.content.high.step).toBe(context.contrastDir === 1 ? 2500 : 200);
    });

    it('nested surfaces resolve relative to the bold container, not page', () => {
      // subtle inside bold should offset from 1400, not from 2500
      const dir = context.contrastDir;
      const expectedSubtle = 1400 + dir * 200;
      expect(context.surfaces.subtle.step).toBe(expectedSubtle);
    });
  });

  describe('subtle context', () => {
    const outerParent = 2500;
    const context = resolveContextTokenSet(scale, 'subtle', outerParent, false);

    it('parent step is the subtle surface step', () => {
      // subtle at parent=2500, dir=-1: 2500 + (-1)*200 = 2300
      expect(context.parentStep).toBe(2300);
    });
  });

  describe('elevated context', () => {
    const outerParent = 2400;
    const context = resolveContextTokenSet(scale, 'elevated', outerParent, false);

    it('parent step is parent + 100', () => {
      expect(context.parentStep).toBe(2500);
    });
  });

  describe('WCAG contracts hold inside surface contexts', () => {
    for (const surfaceToken of CONTEXT_SURFACE_TOKENS) {
      it(`content.low achieves ≥4.5:1 inside ${surfaceToken} context`, () => {
        const context = resolveContextTokenSet(scale, surfaceToken, 2500, false);
        const parentRgb = hexToRgbTuple(palette[context.parentStep]!);
        // Text tokens use neutral black/white
        const lowRgb: RGB = context.contrastDir === 1 ? [255, 255, 255] : [0, 0, 0];
        const { rgb: blended } = blendWithAlphaRGB(
          lowRgb, parentRgb, context.content.low.opacity,
        );
        const contrast = getContrastRatioRGB(blended, parentRgb);
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
});

// ============================================================================
// Dark Mode — Symmetry and Correctness
// ============================================================================

describe('dark mode symmetry', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  it('default flips from 2500 to 200', () => {
    const light = resolveTokenSet(scale, 2500, false);
    const dark = resolveTokenSet(scale, 200, true);
    expect(light.surfaces.default.step).toBe(2500);
    expect(dark.surfaces.default.step).toBe(200);
  });

  it('contrast direction flips between light and dark', () => {
    const light = resolveTokenSet(scale, 2500, false);
    const dark = resolveTokenSet(scale, 100, true);
    expect(light.contrastDir).toBe(-1); // toward dark
    expect(dark.contrastDir).toBe(1);   // toward light
  });

  it('content.high always points to the contrasting extreme', () => {
    const light = resolveTokenSet(scale, 2500, false);
    const dark = resolveTokenSet(scale, 200, true);
    expect(light.content.high.step).toBe(200);   // dark text on light bg
    expect(dark.content.high.step).toBe(2500);    // light text on dark bg
  });

  it('bold surface is the same in both modes (base step)', () => {
    const light = resolveTokenSet(scale, 2500, false);
    const dark = resolveTokenSet(scale, 200, true);
    // Both should jump to baseStep or darkerBaseStep
    expect(light.surfaces.bold.step).toBe(1400); // base
    expect(dark.surfaces.bold.step).toBe(scale.darkerBaseStep); // darker base
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('edge cases', () => {
  const palette = buildGreyscalePalette();

  it('handles base step at minimum (100)', () => {
    const scale = buildTestScale(palette, 100);
    const result = resolveTokenSet(scale, 2500, false);
    expect(result.surfaces.bold.step).toBeGreaterThanOrEqual(100);
    expect(result.surfaces.bold.step).toBeLessThanOrEqual(2500);
  });

  it('handles base step at maximum (2500)', () => {
    const scale = buildTestScale(palette, 2500);
    const result = resolveTokenSet(scale, 200, true);
    expect(result.surfaces.bold.step).toBeGreaterThanOrEqual(100);
    expect(result.surfaces.bold.step).toBeLessThanOrEqual(2500);
  });

  it('handles parent at step 100 (minimum)', () => {
    const scale = buildTestScale(palette, 1400);
    const result = resolveTokenSet(scale, 100, false);
    // minimal with dir=-1 should clamp to 100
    if (result.contrastDir === -1) {
      expect(result.surfaces.minimal.step).toBe(100);
    }
  });

  it('handles parent at step 2500 (maximum)', () => {
    const scale = buildTestScale(palette, 1400);
    const result = resolveTokenSet(scale, 2500, false);
    expect(result.surfaces.elevated.step).toBe(2500); // capped
  });

  it('every STEPS value produces valid results as parent', () => {
    const scale = buildTestScale(palette, 1400);
    for (const step of STEPS) {
      const result = resolveTokenSet(scale, step, false);
      for (const surface of Object.values(result.surfaces)) {
        expect(surface.step).toBeGreaterThanOrEqual(100);
        expect(surface.step).toBeLessThanOrEqual(2500);
      }
    }
  });
});

// ============================================================================
// Nesting Depth — The Key Advantage Over V4
// ============================================================================

describe('nesting depth', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  it('supports arbitrary nesting without a pre-computed matrix', () => {
    // Simulate 5 levels of nesting: page → subtle → subtle → subtle → bold
    let parentStep = 2500; // page
    const steps: number[] = [parentStep];

    for (let i = 0; i < 3; i++) {
      const rgbPalette = preParseRGBPalette(palette);
      const parentRgb = hexToRgbTuple(palette[parentStep]!);
      const dir = computeContrastDir(parentRgb, rgbPalette);
      parentStep = resolveSurface('subtle', parentStep, scale, dir);
      steps.push(parentStep);
    }

    // Each level should be distinct from its parent
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).not.toBe(steps[i - 1]);
    }

    // Final bold on the nested container
    const rgbPalette = preParseRGBPalette(palette);
    const parentRgb = hexToRgbTuple(palette[parentStep]!);
    const dir = computeContrastDir(parentRgb, rgbPalette);
    const boldStep = resolveSurface('bold', parentStep, scale, dir);

    // Bold should always be visually distinct
    expect(Math.abs(boldStep - parentStep)).toBeGreaterThanOrEqual(700);
  });

  it('WCAG contract holds at every nesting level', () => {
    let parentStep = 2500;
    const tokens: ('subtle' | 'minimal' | 'bold')[] = ['subtle', 'minimal', 'bold', 'subtle'];

    for (const token of tokens) {
      const rgbPalette = preParseRGBPalette(palette);
      const parentRgb = hexToRgbTuple(palette[parentStep]!);
      const dir = computeContrastDir(parentRgb, rgbPalette);
      const newStep = resolveSurface(token, parentStep, scale, dir);

      // Verify content.low achieves 4.5:1 at this level
      // IMPORTANT: recompute dir from the NEW surface, not the parent
      const newParentRgb = hexToRgbTuple(palette[newStep]!);
      const newDir = computeContrastDir(newParentRgb, rgbPalette);
      const low = resolveContent('low', newStep, newParentRgb, scale, rgbPalette, newDir);
      // Text tokens use neutral black/white
      const lowRgb: RGB = newDir === 1 ? [255, 255, 255] : [0, 0, 0];
      const { rgb: blended } = blendWithAlphaRGB(lowRgb, newParentRgb, low.opacity);
      const contrast = getContrastRatioRGB(blended, newParentRgb);

      expect(contrast).toBeGreaterThanOrEqual(4.5);
      parentStep = newStep;
    }
  });
});

// ============================================================================
// No Brand Mode Switch — V4's Brand Route is Implicit
// ============================================================================

describe('no brand mode switch needed', () => {
  const palette = buildGreyscalePalette();
  const scale = buildTestScale(palette, 1400);

  it('resolving from bold surface (brand page) works without special mode', () => {
    // In V4, "brand mode" pre-computes a separate stacking from the accent base.
    // In the new system, we just resolve from the bold step directly.
    const boldStep = 1400; // the brand's accent
    const result = resolveTokenSet(scale, boldStep, false);

    // Surfaces resolve naturally from this accent base
    expect(result.surfaces.ghost.step).toBe(1400);
    expect(result.surfaces.subtle.step).not.toBe(1400);

    // Content achieves WCAG against the accent
    const parentRgb = hexToRgbTuple(palette[boldStep]!);
    // Text tokens use neutral black/white
      const lowRgb: RGB = result.contrastDir === 1 ? [255, 255, 255] : [0, 0, 0];
    const { rgb: blended } = blendWithAlphaRGB(
      lowRgb, parentRgb, result.content.low.opacity,
    );
    const contrast = getContrastRatioRGB(blended, parentRgb);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});

// ============================================================================
// buildScaleDefinition
// ============================================================================

describe('buildScaleDefinition', () => {
  const palette = buildGreyscalePalette();

  it('auto-computes darkerBaseStep when not provided', () => {
    const scale = buildScaleDefinition('test', palette, 1400);
    expect(scale.darkerBaseStep).toBe(1500); // 1400 + 100 (≥1300 offset)
  });

  it('uses explicit darkerBaseStep when provided', () => {
    const scale = buildScaleDefinition('test', palette, 1400, 1800);
    expect(scale.darkerBaseStep).toBe(1800);
  });

  it('stores all properties correctly', () => {
    const scale = buildScaleDefinition('indigo', palette, 1400);
    expect(scale.name).toBe('indigo');
    expect(scale.baseStep).toBe(1400);
    expect(scale.palette).toBe(palette);
  });

  it('sets anchorBoldToBaseStep and still auto-computes darkerBaseStep', () => {
    const scale = buildScaleDefinition('mint', palette, 2100, { anchorBoldToBaseStep: true });
    expect(scale.anchorBoldToBaseStep).toBe(true);
    expect(scale.darkerBaseStep).toBe(computeDarkerBaseStep(2100));
  });

  it('allows explicit darkerBaseStep with anchorBoldToBaseStep', () => {
    const scale = buildScaleDefinition('mint', palette, 2100, {
      darkerBaseStep: 2200,
      anchorBoldToBaseStep: true,
    });
    expect(scale.darkerBaseStep).toBe(2200);
    expect(scale.anchorBoldToBaseStep).toBe(true);
  });
});

describe('Brand-Bg anchor (anchorBoldToBaseStep)', () => {
  const palette = buildColoredPalette();

  it('resolveTokenSet: pinned bold still uses the plugin distance rule', () => {
    const scale = buildScaleDefinition('mint', palette, 2100, { anchorBoldToBaseStep: true });
    const set = resolveTokenSet(scale, 2500, false);
    expect(set.surfaces.bold.step).toBe(1800);
  });

  it('resolveContextTokenSet: container bold uses pinned candidate through plugin distance rule', () => {
    const scale = buildScaleDefinition('mint', palette, 2100, { anchorBoldToBaseStep: true });
    const inner = resolveContextTokenSet(scale, 'bold', 2500, false);
    expect(inner.parentStep).toBe(1800);
  });

  it('resolveContextTokenSet: inner bold surface differs from container (anchor stripped for contrast)', () => {
    // Primary role: baseStep=600 (dark), anchorBoldToBaseStep=true
    // Container (data-surface="bold") fill = baseStep=600
    // Inside the container, --Primary-Bold must NOT also equal 600 (invisible button)
    // The anchor is stripped for inner resolution, so resolveSurface offsets to provide contrast
    const greyPalette = buildGreyscalePalette();
    const scale = buildScaleDefinition('primary', greyPalette, 600, { anchorBoldToBaseStep: true });
    const inner = resolveContextTokenSet(scale, 'bold', 2500, false);
    // Container parent step should be 600 (anchored)
    expect(inner.parentStep).toBe(600);
    // But inner bold should NOT be 600 — it must contrast against the container
    expect(inner.surfaces.bold.step).not.toBe(600);
    // It should be at least 7 steps away from the container step (600)
    expect(Math.abs(inner.surfaces.bold.step - 600) / 100).toBeGreaterThanOrEqual(7);
  });
});

// ============================================================================
// Constants
// ============================================================================

describe('constants', () => {
  it('STEPS has 25 entries from 100 to 2500', () => {
    expect(STEPS).toHaveLength(25);
    expect(STEPS[0]).toBe(100);
    expect(STEPS[24]).toBe(2500);
  });

  it('APPEARANCE_ROLES matches V4 roles', () => {
    expect(APPEARANCE_ROLES).toContain('primary');
    expect(APPEARANCE_ROLES).toContain('neutral');
    expect(APPEARANCE_ROLES).toContain('sparkle');
    expect(APPEARANCE_ROLES).toContain('positive');
    expect(APPEARANCE_ROLES).toContain('negative');
    expect(APPEARANCE_ROLES).toContain('warning');
    expect(APPEARANCE_ROLES).toContain('informative');
    expect(APPEARANCE_ROLES).toContain('brand-bg');
  });

  it('CONTEXT_SURFACE_TOKENS excludes modes that share the parent context', () => {
    expect(CONTEXT_SURFACE_TOKENS).not.toContain('default');
    expect(CONTEXT_SURFACE_TOKENS).not.toContain('ghost');
    expect(CONTEXT_SURFACE_TOKENS).not.toContain('blend');
    expect(CONTEXT_SURFACE_TOKENS).toContain('bold');
    expect(CONTEXT_SURFACE_TOKENS).toContain('subtle');
    expect(CONTEXT_SURFACE_TOKENS).toContain('elevated');
  });
});

// ============================================================================
// Transparent material — media contexts
// ============================================================================

describe('Transparent Material', () => {
  const ALL_SURFACE_TOKENS: SurfaceToken[] = [
    'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
  ];

  describe('opacityFromStep', () => {
    it('maps step 100 to fully opaque (alpha 1)', () => {
      expect(opacityFromStep(100)).toBe(1);
    });

    it('maps step 2500 to fully transparent (alpha 0)', () => {
      expect(opacityFromStep(2500)).toBe(0);
    });

    it('maps step 1300 (midpoint) to alpha 0.5', () => {
      expect(opacityFromStep(1300)).toBeCloseTo(0.5);
    });

    it('is strictly decreasing across the scale', () => {
      let prev = opacityFromStep(100);
      for (const step of STEPS.slice(1)) {
        const curr = opacityFromStep(step);
        expect(curr).toBeLessThan(prev);
        prev = curr;
      }
    });
  });

  describe('MEDIA_CONTEXTS', () => {
    it('exposes the three canonical contexts', () => {
      expect([...MEDIA_CONTEXTS]).toEqual(['dynamic', 'dark', 'light']);
    });
  });

  describe('resolveMediaSurface', () => {
    it.each(MEDIA_CONTEXTS)('returns a TransparentMaterial for every surface token (context=%s)', (context) => {
      for (const token of ALL_SURFACE_TOKENS) {
        const result = resolveMediaSurface(context, token);
        expect(result.variant).toMatch(/^(light|dark)$/);
        expect(result.contentVariant).toMatch(/^(light|dark)$/);
        expect(result.opacityStep).toBeGreaterThanOrEqual(100);
        expect(result.opacityStep).toBeLessThanOrEqual(2500);
      }
    });

    it('default and ghost resolve identically for each context (they paint the same opaque base)', () => {
      for (const context of MEDIA_CONTEXTS) {
        expect(resolveMediaSurface(context, 'default')).toEqual(resolveMediaSurface(context, 'ghost'));
      }
    });

    it('bold surface has contentVariant opposite its variant (guaranteed contrast)', () => {
      for (const context of MEDIA_CONTEXTS) {
        const bold = resolveMediaSurface(context, 'bold');
        expect(bold.contentVariant).not.toBe(bold.variant);
      }
    });

    it('dynamic context uses dark base for everything except bold + elevated', () => {
      expect(resolveMediaSurface('dynamic', 'default').variant).toBe('dark');
      expect(resolveMediaSurface('dynamic', 'subtle').variant).toBe('dark');
      expect(resolveMediaSurface('dynamic', 'moderate').variant).toBe('dark');
      expect(resolveMediaSurface('dynamic', 'blend').variant).toBe('dark');
      // bold inverts to light (guaranteed contrast against arbitrary bg)
      expect(resolveMediaSurface('dynamic', 'bold').variant).toBe('light');
      expect(resolveMediaSurface('dynamic', 'elevated').variant).toBe('light');
    });

    it('default surface always uses opacityStep 2500 (fully transparent base)', () => {
      for (const context of MEDIA_CONTEXTS) {
        expect(resolveMediaSurface(context, 'default').opacityStep).toBe(2500);
      }
    });

    it('bold surface always uses opacityStep 100 (fully opaque base)', () => {
      for (const context of MEDIA_CONTEXTS) {
        expect(resolveMediaSurface(context, 'bold').opacityStep).toBe(100);
      }
    });

    it('blend matches the plugin transparent media table', () => {
      expect(resolveMediaSurface('dynamic', 'blend')).toEqual({
        variant: 'dark',
        opacityStep: 100,
        contentVariant: 'light',
      });
      expect(resolveMediaSurface('dark', 'blend')).toEqual({
        variant: 'dark',
        opacityStep: 100,
        contentVariant: 'light',
      });
      expect(resolveMediaSurface('light', 'blend')).toEqual({
        variant: 'light',
        opacityStep: 100,
        contentVariant: 'dark',
      });
    });
  });

  describe('resolveMediaContent', () => {
    it('high and tinted variants resolve to fully opaque (step 100)', () => {
      expect(resolveMediaContent('high')).toBe(100);
      expect(resolveMediaContent('tinted')).toBe(100);
      expect(resolveMediaContent('tintedA11y')).toBe(100);
    });

    it('medium is softer than high (higher step = more transparent)', () => {
      expect(resolveMediaContent('medium')).toBeGreaterThan(resolveMediaContent('high'));
    });

    it('low is softer than medium', () => {
      expect(resolveMediaContent('low')).toBeGreaterThan(resolveMediaContent('medium'));
    });

    it('stroke tokens are softer than low text', () => {
      expect(resolveMediaContent('strokeMedium')).toBeGreaterThan(resolveMediaContent('low'));
      expect(resolveMediaContent('strokeLow')).toBeGreaterThan(resolveMediaContent('strokeMedium'));
    });
  });

  describe('resolveMediaInteraction', () => {
    it('idle and focus return fully transparent overlay (opacityStep 2500)', () => {
      for (const context of MEDIA_CONTEXTS) {
        for (const token of ALL_SURFACE_TOKENS) {
          expect(resolveMediaInteraction('idle', token, context).opacityStep).toBe(2500);
          expect(resolveMediaInteraction('focus', token, context).opacityStep).toBe(2500);
        }
      }
    });

    it('hover produces a visible overlay (opacityStep < 2500)', () => {
      for (const context of MEDIA_CONTEXTS) {
        for (const token of ALL_SURFACE_TOKENS) {
          expect(resolveMediaInteraction('hover', token, context).opacityStep).toBeLessThan(2500);
        }
      }
    });

    it('pressed is more opaque than hover (stronger state)', () => {
      for (const context of MEDIA_CONTEXTS) {
        for (const token of ALL_SURFACE_TOKENS) {
          const hover = resolveMediaInteraction('hover', token, context);
          const pressed = resolveMediaInteraction('pressed', token, context);
          // Lower step = higher opacity. Pressed should have lower-or-equal step than hover.
          expect(pressed.opacityStep).toBeLessThanOrEqual(hover.opacityStep);
        }
      }
    });

    it('bold + light context picks light variant at step 2100 for hover (distinguishes from body rows)', () => {
      const overlay = resolveMediaInteraction('hover', 'bold', 'light');
      expect(overlay.variant).toBe('light');
      expect(overlay.opacityStep).toBe(2100);
    });

    it('blend matches the plugin transparent interaction table', () => {
      expect(resolveMediaInteraction('hover', 'blend', 'dynamic')).toEqual({
        variant: 'light',
        opacityStep: 2100,
      });
      expect(resolveMediaInteraction('pressed', 'blend', 'dynamic')).toEqual({
        variant: 'light',
        opacityStep: 1800,
      });
      expect(resolveMediaInteraction('hover', 'blend', 'light')).toEqual({
        variant: 'dark',
        opacityStep: 2300,
      });
      expect(resolveMediaInteraction('pressed', 'blend', 'light')).toEqual({
        variant: 'dark',
        opacityStep: 2100,
      });
    });
  });

  describe('resolveMediaFocusRing', () => {
    const informative = buildScaleDefinition('sky', buildGreyscalePalette(), 1400);

    it('ring uses informativeScale.baseStep in light mode', () => {
      for (const context of MEDIA_CONTEXTS) {
        const result = resolveMediaFocusRing(context, informative, false);
        expect(result.ring.step).toBe(informative.baseStep);
        expect(result.ring.scaleName).toBe('sky');
      }
    });

    it('ring uses informativeScale.darkerBaseStep in dark mode', () => {
      for (const context of MEDIA_CONTEXTS) {
        const result = resolveMediaFocusRing(context, informative, true);
        expect(result.ring.step).toBe(informative.darkerBaseStep);
      }
    });

    it('offset matches the bold transparent surface for the current context', () => {
      for (const context of MEDIA_CONTEXTS) {
        const result = resolveMediaFocusRing(context, informative, false);
        const bold = resolveMediaSurface(context, 'bold');
        expect(result.offset.variant).toBe(bold.variant);
        expect(result.offset.opacityStep).toBe(bold.opacityStep);
      }
    });
  });

  describe('getTransparentBaseHex', () => {
    const palette = buildGreyscalePalette();

    it('variant="light" returns neutral step 2500', () => {
      expect(getTransparentBaseHex('light', palette)).toBe(palette[2500]);
    });

    it('variant="dark" returns neutral step 200', () => {
      expect(getTransparentBaseHex('dark', palette)).toBe(palette[200]);
    });

    it('falls back to white/black when palette is missing steps', () => {
      const empty: ColorPalette = {};
      expect(getTransparentBaseHex('light', empty)).toBe('#ffffff');
      expect(getTransparentBaseHex('dark', empty)).toBe('#000000');
    });
  });
});

// ============================================================================
// Regression: Avatar on-bold on-colour should be branded, not pure black/white
// ============================================================================
//
// Bug: A HIGH-attention Avatar inside <Surface mode="bold"> rendered pure
// #000000 text against the inner bold step. The neutral-text override in
// resolveContentFull was unconditionally applied to high/medium/low, even
// when the caller was resolving text for a branded surface (on-bold /
// on-subtle). Fix: gate the override with allowScalePalette=false; on-bold
// and on-subtle opt into the scale's step-200/2500 extreme.

describe('onBold/onSubtle content uses scale palette extremes', () => {
  // Warm-tinted scale where step 200 and step 2500 are distinct from pure
  // #000 / #fff — lets us tell a neutral-override emission apart from a
  // scale-palette emission.
  function buildTintedPalette(): ColorPalette {
    const palette: ColorPalette = {};
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      const t = i / (STEPS.length - 1);
      // Warm offset keeps every channel well inside (0, 255).
      const r = Math.round(20 + t * 220);
      const g = Math.round(10 + t * 200);
      const b = Math.round(10 + t * 180);
      palette[step] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return palette;
  }

  const palette = buildTintedPalette();
  const scale = buildTestScale(palette, 600);

  it('onBoldContent.high emits the scale extreme hex, not pure #000/#fff', () => {
    const tokenSet = resolveTokenSet(scale, 2500, false);
    const { hex } = tokenSet.onBoldContent.high;
    const paletteExtremes = [palette[200], palette[2500]];
    expect(paletteExtremes).toContain(hex);
    expect(hex).not.toBe('#000000');
    expect(hex).not.toBe('#ffffff');
  });

  it('onSubtleContent.high emits the scale extreme hex', () => {
    const tokenSet = resolveTokenSet(scale, 2500, false);
    const { hex } = tokenSet.onSubtleContent.high;
    const paletteExtremes = [palette[200], palette[2500]];
    expect(paletteExtremes).toContain(hex);
  });

  it('root content.high keeps the neutral override (pure #000/#fff)', () => {
    // On the page surface (not a branded container), text stays neutral to
    // avoid tinted text on saturated brands.
    const tokenSet = resolveTokenSet(scale, 2500, false);
    const { hex } = tokenSet.content.high;
    expect(['#ffffff', '#000000']).toContain(hex);
  });

  it('context block onBold content is still branded (Avatar-inside-bold case)', () => {
    // Simulate <Surface mode="bold"> — outer page at 2500, container surface = 'bold'.
    const context = resolveContextTokenSet(scale, 'bold', 2500, false);
    const { hex } = context.onBoldContent.high;
    expect(hex).not.toBe('#000000');
    expect(hex).not.toBe('#ffffff');
  });
});
