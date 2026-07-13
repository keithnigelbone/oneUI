// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { STROKE_SCALE_TOKENS } from '@oneui/shared';

import {
  generateTokenOptionsFromFoundation,
  normalizeSpacingTokenSelection,
  type FoundationData,
} from './ComponentTokenEditorContext';

function spacingToken(step: string): string {
  return `Spacing-${step}`;
}

describe('ComponentTokenEditorContext spacing tokens', () => {
  it('generates canonical numeric spacing options instead of legacy t-shirt aliases', () => {
    const foundationData: FoundationData = {
      spacing: {
        config: {
          scale: {
            None: 0,
            '6XS': 2,
            M: 16,
            '15XL': 160,
          },
        },
      },
    };

    const options = generateTokenOptionsFromFoundation(foundationData, 'spacing');
    const tokens = options.map((option) => option.token);

    expect(tokens).toEqual([
      'Spacing-0',
      'Spacing-0-5',
      'Spacing-1',
      'Spacing-1-5',
      'Spacing-2',
      'Spacing-2-5',
      'Spacing-3',
      'Spacing-3-5',
      'Spacing-4',
      'Spacing-4-5',
      'Spacing-5',
      'Spacing-5-5',
      'Spacing-6',
      'Spacing-7',
      'Spacing-8',
      'Spacing-9',
      'Spacing-10',
      'Spacing-12',
      'Spacing-14',
      'Spacing-16',
      'Spacing-18',
      'Spacing-20',
      'Spacing-24',
      'Spacing-28',
      'Spacing-32',
      'Spacing-40',
      'Spacing-Margin',
      'Spacing-Gutter',
    ]);
    expect(tokens).not.toContain(spacingToken('None'));
    expect(tokens).not.toContain(spacingToken('6XS'));
    expect(tokens).not.toContain(spacingToken('15XL'));
  });

  it('keeps numeric selected spacing tokens unchanged before draft storage and save', () => {
    expect(normalizeSpacingTokenSelection('Spacing-4')).toBe('Spacing-4');
    expect(normalizeSpacingTokenSelection('Spacing-40')).toBe('Spacing-40');
    expect(normalizeSpacingTokenSelection('Shape-6XS')).toBe('Shape-6XS');
  });
});

describe('ComponentTokenEditorContext stroke tokens', () => {
  it('generates the full shared stroke scale for component token editing', () => {
    const foundationData: FoundationData = {};
    const options = generateTokenOptionsFromFoundation(foundationData, 'stroke');

    expect(options.map((option) => option.token)).toEqual(
      STROKE_SCALE_TOKENS.map((stroke) => stroke.token),
    );
    expect(options.find((option) => option.token === 'Stroke-2XL')?.previewValue).toBe('3px');
    expect(options.at(-1)?.token).toBe('Stroke-9XL');
  });
});
