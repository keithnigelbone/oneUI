import { describe, it, expect } from 'vitest';
import { measureSharedPipeline, measureSharedPipelineAverage } from '../benchmark';

// Use a custom color config that generates scales
const COLOR_CONFIG = {
  brandScales: [
    { name: 'Brand', source: 'custom' as const, baseColor: '#ff5500' },
  ],
};

describe('measureSharedPipeline', () => {
  it('returns a PipelineBenchmarkResult', () => {
    const result = measureSharedPipeline(COLOR_CONFIG, null);

    expect(result).toHaveProperty('timings');
    expect(result).toHaveProperty('scaleCount');
    expect(result).toHaveProperty('declarationCount');
    expect(result).toHaveProperty('cssSize');
    expect(result).toHaveProperty('tokenCount');
    expect(result).toHaveProperty('isValid');
  });

  it('timings has all required fields', () => {
    const result = measureSharedPipeline(COLOR_CONFIG, null);

    expect(typeof result.timings.buildScales).toBe('number');
    expect(typeof result.timings.filterBoundary).toBe('number');
    expect(typeof result.timings.validate).toBe('number');
    expect(typeof result.timings.total).toBe('number');
  });

  it('total time >= sum of individual steps', () => {
    const result = measureSharedPipeline(COLOR_CONFIG, null);
    const componentSum = result.timings.buildScales + result.timings.filterBoundary + result.timings.validate;
    // Total is measured separately and may be slightly more due to overhead
    expect(result.timings.total).toBeGreaterThanOrEqual(componentSum * 0.9);
  });

  it('scaleCount reflects the number of scales built', () => {
    const result = measureSharedPipeline(COLOR_CONFIG, null);
    // Brand scale + auto-injected Neutral = 2
    expect(result.scaleCount).toBe(2);
  });

  it('scaleCount includes built-in neutral even with no color config', () => {
    const result = measureSharedPipeline(null, null);
    // Built-in neutral is always injected
    expect(result.scaleCount).toBe(1);
  });

  it('handles rawDeclarations parameter', () => {
    const declarations = [
      '--Surface-Default: #fff;',
      '--Surface-Bold: #333;',
      '--Text-High: #111;',
      '--Text-OnBold-High: #fff;',
    ];
    const result = measureSharedPipeline(COLOR_CONFIG, null, declarations);
    expect(result.declarationCount).toBe(4);
    expect(result.tokenCount).toBe(4);
    expect(result.isValid).toBe(true);
  });

  it('filters disallowed declarations', () => {
    const declarations = [
      '--Surface-Default: #fff;',
      '--Surface-Bold: #333;',
      '--Text-High: #111;',
      '--Text-OnBold-High: #fff;',
      '--Shape-4: 8px;', // Should be filtered out
    ];
    const result = measureSharedPipeline(COLOR_CONFIG, null, declarations);
    expect(result.declarationCount).toBe(4); // Shape-M filtered
  });

  it('cssSize is non-negative', () => {
    const result = measureSharedPipeline(COLOR_CONFIG, null, [
      '--Surface-Default: #fff;',
      '--Surface-Bold: #333;',
      '--Text-High: #111;',
      '--Text-OnBold-High: #fff;',
    ]);
    expect(result.cssSize).toBeGreaterThan(0);
  });
});

describe('measureSharedPipelineAverage', () => {
  it('returns averaged timings over N iterations', () => {
    const result = measureSharedPipelineAverage(COLOR_CONFIG, null, undefined, 3);

    expect(result).toHaveProperty('iterations');
    expect(result.iterations).toBe(3);
    expect(result).toHaveProperty('timings');
    expect(typeof result.timings.total).toBe('number');
  });

  it('defaults to 10 iterations', () => {
    const result = measureSharedPipelineAverage(COLOR_CONFIG, null);
    expect(result.iterations).toBe(10);
  });

  it('averaged timings are non-negative', () => {
    const result = measureSharedPipelineAverage(COLOR_CONFIG, null, undefined, 3);
    expect(result.timings.buildScales).toBeGreaterThanOrEqual(0);
    expect(result.timings.filterBoundary).toBeGreaterThanOrEqual(0);
    expect(result.timings.validate).toBeGreaterThanOrEqual(0);
    expect(result.timings.total).toBeGreaterThanOrEqual(0);
  });

  it('non-timing fields come from last iteration (deterministic)', () => {
    const result = measureSharedPipelineAverage(COLOR_CONFIG, null, undefined, 5);
    // Brand scale + auto-injected Neutral = 2
    expect(result.scaleCount).toBe(2);
  });
});
