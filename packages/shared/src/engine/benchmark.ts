/**
 * benchmark.ts
 *
 * Performance measurement utilities for the brand CSS pipeline.
 * Measures computation time, CSS output size, and token counts.
 *
 * Usage:
 *   const result = measureBrandCSSPipeline(colorConfig, presetSelection, appearanceConfig);
 *   console.log(result.timings);   // { buildScales: 2.1, validate: 0.3 }
 *   console.log(result.cssSize);   // 12480
 *   console.log(result.tokenCount); // 156
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

import { buildAvailableScales } from './buildAvailableScales';
import { validateBrandCSS } from './validateBrandCSS';
import { filterBrandDeclarations } from './tokenBoundary';

// ============================================================================
// Types
// ============================================================================

export interface PipelineTimings {
  /** Time to build available scales (ms) */
  buildScales: number;
  /** Time to filter declarations through boundary (ms) */
  filterBoundary: number;
  /** Time to validate CSS (ms) */
  validate: number;
  /** Total pipeline time (ms) */
  total: number;
}

export interface PipelineBenchmarkResult {
  /** Timing measurements */
  timings: PipelineTimings;
  /** Number of scales built */
  scaleCount: number;
  /** Number of declarations after boundary filtering */
  declarationCount: number;
  /** CSS size in bytes (of raw declarations, before wrapping) */
  cssSize: number;
  /** Token count from validation */
  tokenCount: number;
  /** Whether validation passed */
  isValid: boolean;
}

// ============================================================================
// Benchmark functions
// ============================================================================

/**
 * Measure the performance of the shared engine pipeline steps.
 * Does NOT include V4 stacking (which lives in @oneui/ui) — only the
 * shared engine steps: buildScales, filterBoundary, validate.
 *
 * For full pipeline benchmarking including V4 stacking, use the
 * `benchmarkFullPipeline` function in @oneui/ui/engine.
 */
export function measureSharedPipeline(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorConfig: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presetSelection: any,
  /** Pre-generated CSS declarations to test filter + validate */
  rawDeclarations?: string[],
): PipelineBenchmarkResult {
  const totalStart = performance.now();

  // Step 1: Build scales
  const scaleStart = performance.now();
  const scales = buildAvailableScales(colorConfig, presetSelection);
  const scaleEnd = performance.now();

  // Step 2: Filter boundary (if declarations provided)
  let filteredDeclarations: string[] = rawDeclarations ?? [];
  const filterStart = performance.now();
  if (rawDeclarations && rawDeclarations.length > 0) {
    filteredDeclarations = filterBrandDeclarations(rawDeclarations);
  }
  const filterEnd = performance.now();

  // Step 3: Validate
  const rawCSS = filteredDeclarations.join('\n  ');
  const validateStart = performance.now();
  const validation = validateBrandCSS(rawCSS);
  const validateEnd = performance.now();

  const totalEnd = performance.now();

  return {
    timings: {
      buildScales: scaleEnd - scaleStart,
      filterBoundary: filterEnd - filterStart,
      validate: validateEnd - validateStart,
      total: totalEnd - totalStart,
    },
    scaleCount: scales.length,
    declarationCount: filteredDeclarations.length,
    cssSize: new TextEncoder().encode(rawCSS).length,
    tokenCount: validation.tokenCount,
    isValid: validation.valid,
  };
}

/**
 * Run a benchmark N times and return averaged results.
 */
export function measureSharedPipelineAverage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorConfig: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presetSelection: any,
  rawDeclarations?: string[],
  iterations = 10,
): PipelineBenchmarkResult & { iterations: number } {
  const results: PipelineBenchmarkResult[] = [];

  for (let i = 0; i < iterations; i++) {
    results.push(measureSharedPipeline(colorConfig, presetSelection, rawDeclarations));
  }

  // Average the timings
  const avgTimings: PipelineTimings = {
    buildScales: results.reduce((sum, r) => sum + r.timings.buildScales, 0) / iterations,
    filterBoundary: results.reduce((sum, r) => sum + r.timings.filterBoundary, 0) / iterations,
    validate: results.reduce((sum, r) => sum + r.timings.validate, 0) / iterations,
    total: results.reduce((sum, r) => sum + r.timings.total, 0) / iterations,
  };

  // Use last result for non-timing fields (they're deterministic)
  const last = results[results.length - 1];

  return {
    ...last,
    timings: avgTimings,
    iterations,
  };
}
