/**
 * colorScale-lockBase.test.ts
 *
 * Covers the "lock base color" behaviour across the scale-generation
 * pipeline. The lock is the user-facing guarantee that their chosen brand
 * colour will not drift when they move the Chroma or Hue sliders, so this
 * file focuses on the contract around:
 *
 *   - `generateColorScale` with lockBase + lockedBaseOklch
 *   - `updateScaleChroma` / `updateScaleHue` preserving the base step
 *   - `generateColorScaleWithLightnessScale` pinning the base step
 *   - `validateColorScale` flagging base drift when locked
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LIGHTNESS_SCALE,
  generateColorScale,
  generateColorScaleWithLightnessScale,
  hexToOklch,
  oklchToHex,
  updateScaleChroma,
  updateScaleHue,
  validateColorScale,
  type GeneratedColorScale,
  type LockedBaseOklch,
} from '../colorScale';

/**
 * Helper — pick the base step row from a generated scale. Throws if missing
 * so a wrong assumption about base step placement fails loudly.
 */
function getBaseStep(scale: GeneratedColorScale) {
  const row = scale.steps.find((s) => s.isBase);
  if (!row) throw new Error('expected a base step');
  return row;
}

function makeLockedScale(hex = '#FF5500'): {
  scale: GeneratedColorScale;
  locked: LockedBaseOklch;
} {
  const { l, c, h } = hexToOklch(hex);
  const locked: LockedBaseOklch = { l, c, h };
  const scale = generateColorScale('primary', hex, 'linear', 0, 0, {
    lockBase: true,
    lockedBaseOklch: locked,
  });
  return { scale, locked };
}

describe('generateColorScale — lockBase', () => {
  it('writes the base step from the locked OkLCH triple verbatim', () => {
    const { scale, locked } = makeLockedScale();
    const expected = oklchToHex(locked.l, locked.c, locked.h);

    expect(getBaseStep(scale).hex).toBe(expected);
    expect(scale.config.baseColor).toBe(expected);
    expect(scale.config.lockBase).toBe(true);
    expect(scale.config.lockedBaseOklch).toEqual(locked);
  });

  it('clamps the scaleChroma cap to the locked base chroma', () => {
    const { locked } = makeLockedScale();
    const overshot = generateColorScale('primary', '#FF5500', 'linear', 0, 0, {
      lockBase: true,
      lockedBaseOklch: locked,
      scaleChroma: locked.c * 2,
    });

    expect(overshot.config.chroma).toBeLessThanOrEqual(locked.c + 1e-9);
  });
});

describe('updateScaleChroma — lockBase', () => {
  it('preserves the base step hex for any slider value between 0 and lockedC', () => {
    const { scale, locked } = makeLockedScale();
    const baseHex = getBaseStep(scale).hex;

    for (const c of [0, locked.c * 0.25, locked.c * 0.5, locked.c * 0.9, locked.c]) {
      const next = updateScaleChroma(scale, c);
      expect(getBaseStep(next).hex).toBe(baseHex);
    }
  });

  it('clamps non-base chroma to the slider value (cap-only semantics)', () => {
    const { scale, locked } = makeLockedScale();
    const capped = updateScaleChroma(scale, locked.c * 0.25);

    for (const step of capped.steps) {
      if (step.isBase || step.step === 100 || step.step === 2500) continue;
      // Allow the same floating-point slack used in validateColorScale.
      expect(step.chroma).toBeLessThanOrEqual(capped.config.chroma + 0.001);
    }
  });

  it('clamps a slider value ABOVE lockedC back down to lockedC', () => {
    const { scale, locked } = makeLockedScale();
    const next = updateScaleChroma(scale, locked.c * 5);
    expect(next.config.chroma).toBeLessThanOrEqual(locked.c + 1e-9);
    expect(getBaseStep(next).hex).toBe(getBaseStep(scale).hex);
  });
});

describe('updateScaleHue — lockBase', () => {
  it('keeps the base step hex unchanged when the hue slider moves', () => {
    const { scale } = makeLockedScale();
    const baseHex = getBaseStep(scale).hex;

    for (const h of [0, 45, 120, 180, 270, 359]) {
      const next = updateScaleHue(scale, h);
      expect(getBaseStep(next).hex).toBe(baseHex);
    }
  });

  it('still shifts non-base step hues toward the new hue', () => {
    const { scale } = makeLockedScale(); // hue ~29° (orange)
    const before = scale.steps.find((s) => s.step === 500);
    const shifted = updateScaleHue(scale, 220);
    const after = shifted.steps.find((s) => s.step === 500);

    expect(before).toBeDefined();
    expect(after).toBeDefined();
    // Non-base hues must move meaningfully toward the new target.
    expect(after!.hue).not.toBe(before!.hue);
  });
});

describe('updateScaleChroma / updateScaleHue — unlocked (legacy behaviour)', () => {
  it('rewrites the base step hex when unlocked and the chroma slider moves', () => {
    const scale = generateColorScale('primary', '#FF5500');
    expect(scale.config.lockBase).toBeUndefined();

    const next = updateScaleChroma(scale, 0.05);
    // Unlocked: the base step hex is rebuilt from the new chroma, so it
    // MUST differ from the original (this asserts that the "organic"
    // behaviour is still preserved when lockBase is absent).
    expect(getBaseStep(next).hex).not.toBe(getBaseStep(scale).hex);
  });
});

describe('generateColorScaleWithLightnessScale — lockBase', () => {
  it('pins the base step to the locked OkLCH snapshot', () => {
    const { locked } = makeLockedScale();
    const expected = oklchToHex(locked.l, locked.c, locked.h);

    const scale = generateColorScaleWithLightnessScale(
      'primary',
      locked.h,
      locked.c,
      { mode: 'auto', values: { ...DEFAULT_LIGHTNESS_SCALE } },
      locked.l,
      0,
      { lockBase: true, lockedBaseOklch: locked },
    );

    expect(getBaseStep(scale).hex).toBe(expected);
    expect(scale.config.lockBase).toBe(true);
    expect(scale.config.lockedBaseOklch).toEqual(locked);
  });

  it('uses the slider chroma as the cap for non-base steps only', () => {
    const { locked } = makeLockedScale();
    const sliderChroma = locked.c * 0.3;

    const scale = generateColorScaleWithLightnessScale(
      'primary',
      locked.h,
      sliderChroma,
      { mode: 'auto', values: { ...DEFAULT_LIGHTNESS_SCALE } },
      locked.l,
      0,
      { lockBase: true, lockedBaseOklch: locked },
    );

    expect(scale.config.chroma).toBeLessThanOrEqual(sliderChroma + 1e-9);
    // Base step still carries the full locked chroma.
    expect(getBaseStep(scale).chroma).toBeCloseTo(
      Math.round(locked.c * 1000) / 1000,
      3,
    );
  });
});

describe('generateColorScaleWithLightnessScale — cap preservation regression', () => {
  // Regression: the editor's `regenerateScale` previously fed `seed.c` (the
  // full locked chroma) into the generator on every offset / retention edit,
  // silently resetting the cap to the base's chroma. The fix passes the
  // existing `config.chroma` cap forward; this test simulates that flow.
  it('preserves the existing slider cap across a non-chroma regeneration', () => {
    const { locked } = makeLockedScale();
    const sliderCap = locked.c * 0.25;

    // Pretend the editor previously stored a scale with a low cap.
    const previous = generateColorScaleWithLightnessScale(
      'primary',
      locked.h,
      sliderCap,
      { mode: 'auto', values: { ...DEFAULT_LIGHTNESS_SCALE } },
      locked.l,
      0,
      { lockBase: true, lockedBaseOklch: locked },
    );

    expect(previous.config.chroma).toBeLessThanOrEqual(sliderCap + 1e-9);

    // Now the user nudges a lightness offset — emulate the post-fix call
    // that forwards the previous scale's config.chroma instead of `locked.c`.
    const offsetLightness = {
      mode: 'manual' as const,
      values: { ...DEFAULT_LIGHTNESS_SCALE, [1300]: DEFAULT_LIGHTNESS_SCALE[1300] - 1 },
    };
    const next = generateColorScaleWithLightnessScale(
      'primary',
      locked.h,
      previous.config.chroma, // <-- the surviving cap
      offsetLightness,
      locked.l,
      0,
      { lockBase: true, lockedBaseOklch: locked },
    );

    expect(next.config.chroma).toBeCloseTo(previous.config.chroma, 6);
    // And critically, NOT the full locked chroma.
    expect(next.config.chroma).toBeLessThan(locked.c);
  });
});

describe('validateColorScale — lockBase assertions', () => {
  it('passes a freshly generated locked scale', () => {
    const { scale } = makeLockedScale();
    const result = validateColorScale(scale);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('flags drift when the locked base step has been tampered with', () => {
    const { scale } = makeLockedScale();
    const tampered: GeneratedColorScale = {
      ...scale,
      steps: scale.steps.map((s) =>
        s.isBase
          ? { ...s, chroma: s.chroma + 0.05, hex: '#ABCDEF' }
          : s,
      ),
    };

    const result = validateColorScale(tampered);
    expect(result.valid).toBe(false);
    // At minimum the locked-chroma drift check must fire.
    expect(
      result.errors.some((e) => /Locked base chroma drift/.test(e)),
    ).toBe(true);
  });
});
