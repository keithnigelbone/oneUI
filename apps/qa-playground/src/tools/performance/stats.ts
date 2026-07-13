/**
 * stats.ts
 *
 * Duplicated from apps/storybook/src/stories/tools/stats.ts for the
 * qa-playground Performance page. Keep in sync with the Storybook original.
 *
 * Pure statistical helpers for the performance harness. No React. No DOM.
 *
 * All inputs are arrays of millisecond samples. Outputs are floored at
 * `MIN_DURATION_MS` so we don't return a misleading 0 from a sub-tick
 * profiler reading.
 */

export const MIN_DURATION_MS = 0.05;

export function clampMin(v: number): number {
  return v < MIN_DURATION_MS ? MIN_DURATION_MS : v;
}

export function average(samples: ReadonlyArray<number>): number {
  if (samples.length === 0) return MIN_DURATION_MS;
  let sum = 0;
  for (const s of samples) sum += s;
  return clampMin(sum / samples.length);
}

export function median(samples: ReadonlyArray<number>): number {
  if (samples.length === 0) return MIN_DURATION_MS;
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const m = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return clampMin(m);
}

export function percentile(samples: ReadonlyArray<number>, p: number): number {
  if (samples.length === 0) return MIN_DURATION_MS;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return clampMin(sorted[idx]);
}

export function stddev(samples: ReadonlyArray<number>): number {
  if (samples.length < 2) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (samples.length - 1);
  return Math.sqrt(variance);
}

export interface PowerLawFit {
  exponent: number;
  coefficient: number;
  rSquared: number;
  classification: 'constant' | 'sublinear' | 'near-linear' | 'superlinear' | 'quadratic+';
}

export function classifyExponent(x: number): PowerLawFit['classification'] {
  if (x < 0.2) return 'constant';
  if (x < 0.85) return 'sublinear';
  if (x < 1.15) return 'near-linear';
  if (x < 1.85) return 'superlinear';
  return 'quadratic+';
}

/**
 * Linear regression on log(n) vs log(t) — recovers the exponent of a
 * power law `t = k * n^x` along with R² goodness-of-fit.
 *
 * Drops any (n, t) where either coordinate is ≤ 0 since the log is undefined.
 */
export function fitPowerLaw(
  points: ReadonlyArray<{ n: number; t: number }>,
): PowerLawFit | null {
  const valid = points.filter((p) => p.n > 0 && p.t > 0);
  if (valid.length < 2) return null;

  const logs = valid.map((p) => ({ x: Math.log(p.n), y: Math.log(p.t) }));
  const n = logs.length;
  const sumX = logs.reduce((s, p) => s + p.x, 0);
  const sumY = logs.reduce((s, p) => s + p.y, 0);
  const sumXY = logs.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = logs.reduce((s, p) => s + p.x * p.x, 0);
  const meanY = sumY / n;

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const exponent = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - exponent * sumX) / n;
  const coefficient = Math.exp(intercept);

  const ssTot = logs.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = logs.reduce((s, p) => {
    const pred = intercept + exponent * p.x;
    return s + (p.y - pred) ** 2;
  }, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    exponent,
    coefficient,
    rSquared,
    classification: classifyExponent(exponent),
  };
}
