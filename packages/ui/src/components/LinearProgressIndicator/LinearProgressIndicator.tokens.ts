/**
 * LinearProgressIndicator.tokens.ts
 * Token manifest for LinearProgressIndicator.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const LINEAR_PROGRESS_INDICATOR_TOKENS: Record<string, TokenDefinition> = {
  indicatorColor: {
    category: 'color',
    subcategory: 'fill',
    defaultToken: 'Primary-Bold',
    description: 'Fill colour of the progress indicator bar.',
    cssProperty: 'background-color',
  },
  trackColor: {
    category: 'color',
    subcategory: 'fill',
    defaultToken: 'Neutral-Subtle',
    description: 'Fill colour of the track rail behind the indicator.',
    cssProperty: 'background-color',
  },
  trackHeight: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'LinearProgressIndicator-trackHeight-M',
    variants: {
      S: 'LinearProgressIndicator-trackHeight-S',
      M: 'LinearProgressIndicator-trackHeight-M',
      L: 'LinearProgressIndicator-trackHeight-L',
    },
    description: 'Track height for each size preset.',
    cssProperty: 'height',
  },
  borderRadius: {
    category: 'shape',
    subcategory: 'radius',
    defaultToken: 'Shape-Pill',
    variants: {
      round: 'Shape-Pill',
      flat: 'Shape-0',
    },
    description: 'End cap radius when roundCaps is true (round) or false (flat).',
    cssProperty: 'border-radius',
  },
  valueTransitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-M',
    description: 'Determinate fill width transition duration.',
    cssProperty: 'transition-duration',
  },
  valueTransitionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Moderate',
    description: 'Determinate fill width transition easing.',
    cssProperty: 'transition-timing-function',
  },
  indeterminateDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-3XL',
    description: 'Indeterminate slide animation duration.',
    cssProperty: 'animation-duration',
  },
  indeterminateEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Moderate',
    description: 'Indeterminate slide animation easing.',
    cssProperty: 'animation-timing-function',
  },
  indeterminateWidth: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: '40%',
    description: 'Indeterminate bar width as a fraction of the track.',
    cssProperty: 'width',
  },
};

export const LINEAR_PROGRESS_INDICATOR_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'LinearProgressIndicator',
  version: '1.0.0',
  tokens: LINEAR_PROGRESS_INDICATOR_TOKENS,
  totalTokens: Object.keys(LINEAR_PROGRESS_INDICATOR_TOKENS).length,
  categories: {
    color: 2,
    spacing: 2,
    shape: 1,
    motion: 4,
  },
};
