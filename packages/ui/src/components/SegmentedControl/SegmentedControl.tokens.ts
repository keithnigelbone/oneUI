/**
 * SegmentedControl.tokens.ts
 * Token manifest for SegmentedControl track + item styling.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SEGMENTED_CONTROL_TOKENS: Record<string, TokenDefinition> = {
  trackPadding: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-1',
    description: 'Inner padding of the track container.',
    cssProperty: 'padding',
  },
  trackGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-0',
    description: 'Gap between segments inside the track.',
    cssProperty: 'gap',
  },
  trackRadiusPill: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Track corner radius when shape=pill.',
    cssProperty: 'border-radius',
  },
  trackRadiusRectangular: {
    category: 'shape',
    defaultToken: 'Shape-2',
    description: 'Track corner radius when shape=rectangular (Figma dimensions/shape/2).',
    cssProperty: 'border-radius',
  },
  trackBackgroundHigh: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Minimal',
    description: 'Track background when trackEmphasis=high.',
    cssProperty: 'background-color',
  },
  trackBackgroundMedium: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Ghost',
    description: 'Track background when trackEmphasis=medium.',
    cssProperty: 'background-color',
  },
  itemRadiusPill: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Segment corner radius when shape=pill.',
    cssProperty: 'border-radius',
  },
  itemRadiusRectangular: {
    category: 'shape',
    defaultToken: 'Shape-2',
    description: 'Segment corner radius when shape=rectangular (Figma dimensions/shape/2).',
    cssProperty: 'border-radius',
  },
  itemElevationSelectedHigh: {
    category: 'elevation',
    defaultToken: 'Elevation-1',
    description: 'Elevation shadow on selected segment when attention=high.',
    cssProperty: 'box-shadow',
  },
};

export const SEGMENTED_CONTROL_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'SegmentedControl',
  version: '1.0.0',
  description:
    'Mutually exclusive segmented control with track emphasis, attention-driven selected states, and multi-accent appearance roles. Built on Base UI ToggleGroup.',
  tokens: SEGMENTED_CONTROL_TOKENS,
  totalTokens: Object.keys(SEGMENTED_CONTROL_TOKENS).length,
  categories: {
    spacing: 2,
    shape: 4,
    color: 2,
    elevation: 1,
  },
};
