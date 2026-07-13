/**
 * Slider.tokens.ts
 *
 * Token manifest for Slider — single size, Figma-aligned.
 *
 *   Slider-height               = 24px (Spacing-4-5)
 *   Slider-trackHeight-outside  = 4px  (Spacing-1)
 *   Slider-trackHeight-inside   = 12px (Spacing-3)
 *   Slider-hitTarget            = 24px (Spacing-7) — keyboard/touch hit area
 *   Slider-knobSize-outside     = 12px (Spacing-3)  — solid accent-filled
 *   Slider-knobSize-inside      = 4px  (Spacing-1) — tiny white dot
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SLIDER_TOKENS: Record<string, TokenDefinition> = {
  height: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4-5',
    description: 'Overall slider height (container, Figma = 24px)',
    cssProperty: 'height',
  },

  trackBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Track + indicator corner radius',
    cssProperty: 'border-radius',
  },

  knobBorderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Knob dot corner radius',
    cssProperty: 'border-radius',
  },

  'trackHeight-outside': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-1',
    description: 'Thin rail thickness when knobStyle=outside (4px)',
    cssProperty: 'height',
  },

  'trackHeight-inside': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Thick rail thickness when knobStyle=inside (12px)',
    cssProperty: 'height',
  },

  hitTarget: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-12',
    description: 'Knob hit target (invisible 48×48 interactive layer per Figma)',
    cssProperty: 'width',
  },

  'knobSize-outside': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Visible knob diameter when knobStyle=outside, idle (12px, solid accent)',
    cssProperty: 'width',
  },

  'knobSize-outside-grown': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4-5',
    description: 'Visible knob diameter when knobStyle=outside, on hover/focus/pressed (18px)',
    cssProperty: 'width',
  },

  'knobSize-inside': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-1',
    description: 'Visible knob dot diameter when knobStyle=inside, idle (4px, white)',
    cssProperty: 'width',
  },

  'knobSize-inside-grown': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2',
    description: 'Visible knob dot diameter when knobStyle=inside, on hover/focus/pressed (8px)',
    cssProperty: 'width',
  },

  tickSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Stroke-XL',
    description: 'Diameter of each step tick mark',
    cssProperty: 'width',
  },

  'knobScale-outside': {
    category: 'shape',
    defaultToken: '1.5',
    description: 'Transform scale factor for knobStyle=outside on hover/focus/drag (12→18px)',
    cssProperty: 'transform',
  },

  'knobScale-inside': {
    category: 'shape',
    defaultToken: '2',
    description: 'Transform scale factor for knobStyle=inside on hover/focus/drag (4→8px)',
    cssProperty: 'transform',
  },

  slotGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-2',
    description: 'Gap between the start/end slots and the track (Figma node 5723:7597 = 8px)',
    cssProperty: 'gap',
  },

  slotSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-9',
    description: 'Width and height of each start/end slot (Figma = 30×30)',
    cssProperty: 'width',
  },

  tooltipOffset: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-2',
    description: 'Clearance between the value tooltip arrow tip and the top of the knob',
    cssProperty: 'top',
  },
};

export const SLIDER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Slider',
  version: '1.0.0',
  description:
    'Range input with multi-accent appearance (9 roles), two knob styles (inside/outside), optional step ticks, tooltip, range mode, and horizontal/vertical orientation. Single size per Figma spec.',
  tokens: SLIDER_TOKENS,
  totalTokens: Object.keys(SLIDER_TOKENS).length,
  categories: {
    shape: 4,
    spacing: 12,
  },
};

export function getSliderTokensByCategory(category: string): [string, TokenDefinition][] {
  return Object.entries(SLIDER_TOKENS).filter(([, def]) => def.category === category);
}
