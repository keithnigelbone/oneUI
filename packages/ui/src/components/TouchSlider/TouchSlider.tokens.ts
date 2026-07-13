/**
 * TouchSlider.tokens.ts — single size, Figma-aligned (138×32).
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const TOUCH_SLIDER_TOKENS: Record<string, TokenDefinition> = {
  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Track + indicator corner radius when progressStyle=rounded',
    cssProperty: 'border-radius',
  },

  thickness: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-9',
    description: 'Track thickness (Figma = 32px)',
    cssProperty: 'height',
  },

  width: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Dimension-f14',
    description: 'Track length (Figma = 138px)',
    cssProperty: 'width',
  },
};

export const TOUCH_SLIDER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'TouchSlider',
  version: '1.0.0',
  description:
    'Chunky fingertip-friendly slider. The track is the tap target and the fill is the value. Supports rounded/sharp progress style and horizontal/vertical orientation. Single size per Figma spec.',
  tokens: TOUCH_SLIDER_TOKENS,
  totalTokens: Object.keys(TOUCH_SLIDER_TOKENS).length,
  categories: {
    shape: 1,
    spacing: 2,
  },
};

export function getTouchSliderTokensByCategory(category: string): [string, TokenDefinition][] {
  return Object.entries(TOUCH_SLIDER_TOKENS).filter(([, def]) => def.category === category);
}
