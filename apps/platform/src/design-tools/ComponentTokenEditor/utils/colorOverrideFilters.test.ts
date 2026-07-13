// @vitest-environment node

import { describe, expect, it } from 'vitest';
import type { ComponentTokenManifest, TokenOverrideValue } from '@oneui/shared';

import { filterLocalColorOverrideMap } from './colorOverrideFilters';

const manifestTokens: ComponentTokenManifest['tokens'] = {
  backgroundColor: {
    category: 'color',
    defaultToken: 'Primary-Bold',
    description: 'Fill',
    cssProperty: 'background',
  },
  borderColor: {
    category: 'color',
    defaultToken: 'Primary-Stroke-Medium',
    description: 'Stroke',
    cssProperty: 'border-color',
  },
  textColor: {
    category: 'color',
    defaultToken: 'Primary-Bold-High',
    description: 'Text',
    cssProperty: 'color',
  },
  strokeImage: {
    category: 'decoration',
    defaultToken: 'none',
    description: 'Image stroke',
    cssProperty: 'background-image',
  },
};

function override(value: Partial<TokenOverrideValue>): TokenOverrideValue {
  return {
    tokenName: value.tokenName ?? 'backgroundColor',
    selectedToken: value.selectedToken ?? 'Primary-Bold',
    ...value,
  };
}

describe('filterLocalColorOverrideMap', () => {
  it('keeps scoped interaction paint overrides restored without channel metadata', () => {
    const filtered = filterLocalColorOverrideMap(
      new Map<string, TokenOverrideValue>([
        [
          'borderColor.bold-hover',
          override({
            tokenName: 'borderColor',
            selectedToken: 'Material-Metallic-Gold-StrokeColor',
            variant: 'bold',
            state: 'hover',
            scope: 'variant-state',
          }),
        ],
        [
          'backgroundColor.bold',
          override({
            tokenName: 'backgroundColor',
            selectedToken: 'Primary-Bold',
            variant: 'bold',
            scope: 'variant',
          }),
        ],
        [
          'textColor.bold',
          override({
            tokenName: 'textColor',
            selectedToken: 'Primary-Bold-High',
            variant: 'bold',
            scope: 'variant',
          }),
        ],
      ]),
      manifestTokens,
    );

    expect([...filtered.keys()]).toEqual([
      'borderColor.bold-hover',
      'backgroundColor.bold',
      'textColor.bold',
    ]);
  });

  it('keeps freshly authored structured interaction paint overrides', () => {
    const filtered = filterLocalColorOverrideMap(
      new Map<string, TokenOverrideValue>([
        [
          'borderColor.bold',
          override({
            tokenName: 'borderColor',
            selectedToken: 'Material-Metallic-Gold-StrokeColor',
            variant: 'bold',
            channel: 'stroke',
            valueKind: 'material',
          }),
        ],
      ]),
      manifestTokens,
    );

    expect(filtered.has('borderColor.bold')).toBe(true);
  });

  it('still removes generic local color overrides from preview CSS', () => {
    const filtered = filterLocalColorOverrideMap(
      new Map<string, TokenOverrideValue>([
        [
          'backgroundColor.bold',
          override({
            tokenName: 'backgroundColor',
            selectedToken: 'Material-Metallic-Gold-Fill',
            variant: 'bold',
          }),
        ],
        [
          'strokeImage.bold',
          override({
            tokenName: 'strokeImage',
            selectedToken: 'Material-Metallic-Gold-Stroke',
            variant: 'bold',
          }),
        ],
      ]),
      manifestTokens,
    );

    expect(filtered.has('backgroundColor.bold')).toBe(false);
    expect(filtered.has('strokeImage.bold')).toBe(true);
  });
});
