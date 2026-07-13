import { describe, expect, it } from 'vitest';
import { computeNextChipGroupValues, normalizeChipGroupSelection } from './interface';

describe('normalizeChipGroupSelection', () => {
  it('single-select keeps only the first default value', () => {
    expect(normalizeChipGroupSelection(['a', 'b'], { multiple: false })).toEqual(['a']);
  });

  it('single-select preserves empty initial state', () => {
    expect(normalizeChipGroupSelection([], { multiple: false })).toEqual([]);
  });

  it('single-select keeps a single value unchanged', () => {
    expect(normalizeChipGroupSelection(['news'], { multiple: false })).toEqual(['news']);
  });

  it('multi-select preserves all values', () => {
    expect(normalizeChipGroupSelection(['a', 'b'], { multiple: true })).toEqual(['a', 'b']);
  });

  it('multi-select trims to maxSelections', () => {
    expect(
      normalizeChipGroupSelection(['a', 'b', 'c'], { multiple: true, maxSelections: 2 }),
    ).toEqual(['a', 'b']);
  });
});

describe('computeNextChipGroupValues', () => {
  it('single-select replaces the previous value', () => {
    expect(computeNextChipGroupValues([], 'news', {})).toEqual(['news']);
    expect(computeNextChipGroupValues(['news'], 'sport', {})).toEqual(['sport']);
  });

  it('single-select deselects when not required', () => {
    expect(computeNextChipGroupValues(['news'], 'news', {})).toEqual([]);
  });

  it('multi-select accumulates values', () => {
    expect(computeNextChipGroupValues(['news'], 'sport', { multiple: true })).toEqual([
      'news',
      'sport',
    ]);
  });

  it('required blocks clearing the last selection', () => {
    expect(computeNextChipGroupValues(['news'], 'news', { required: true })).toBeNull();
  });

  it('maxSelections blocks adding beyond the cap', () => {
    expect(
      computeNextChipGroupValues(['news', 'sport'], 'tech', {
        multiple: true,
        maxSelections: 2,
      }),
    ).toBeNull();
  });
});
