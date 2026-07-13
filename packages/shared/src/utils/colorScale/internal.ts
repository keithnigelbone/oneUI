/**
 * colorScale/internal.ts
 *
 * Private easing helpers shared between `lightness.ts` and `generation.ts`.
 * NOT re-exported from `colorScale.ts` — these are implementation details.
 */

/** Hermite (smooth-step) interpolation for soft S-curve transitions. */
export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Apply easing curve with adjustable strength at the extremes.
 * @param t    Normalised position (0-1)
 * @param bias How much to adjust extremes (-1 to 1). Positive expands the
 *             extremes (slower fade), negative compresses (faster fade).
 */
export function applyExtremeBias(t: number, bias: number): number {
  if (bias === 0) return t;

  if (bias > 0) {
    const power = 1 + bias * 1.5;
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, power);
    } else {
      return 1 - 0.5 * Math.pow(2 * (1 - t), power);
    }
  } else {
    const power = 1 / (1 + Math.abs(bias) * 1.5);
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, power);
    } else {
      return 1 - 0.5 * Math.pow(2 * (1 - t), power);
    }
  }
}
