/**
 * Slider.meta.ts
 * Unified metadata for the Slider component. Single size per Figma spec.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SLIDER_TOKEN_MANIFEST } from './Slider.tokens';
import { SLIDER_RECIPE_DEFINITION } from './Slider.recipe';

export const SLIDER_META: ComponentMeta = {
  name: 'Slider',
  slug: 'slider',
  displayName: 'Slider',
  description:
    'Precision range input. Multi-accent appearance, inside/outside knob styles, optional step ticks, and a value tooltip that follows the thumb.',
  category: 'inputs',

  props: [
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role. Drives fill + knob colours.',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'orientation',
      type: 'enum',
      description: 'Slider orientation',
      defaultValue: 'horizontal',
      options: ['horizontal', 'vertical'] as const,
    },
    {
      name: 'knobStyle',
      type: 'enum',
      description: 'Knob placement. Outside = solid circle on thin rail; inside = white dot inside a thicker accent track.',
      defaultValue: 'outside',
      options: ['outside', 'inside'] as const,
    },
    {
      name: 'showTooltip',
      type: 'enum',
      description: 'Value tooltip visibility',
      defaultValue: 'auto',
      options: ['auto', 'always', 'false'] as const,
    },
    {
      name: 'showSteps',
      type: 'boolean',
      description: 'Render tick marks at every step',
      defaultValue: false,
    },
    { name: 'min', type: 'number', defaultValue: 0 },
    { name: 'max', type: 'number', defaultValue: 100 },
    { name: 'step', type: 'number', defaultValue: 1 },
    { name: 'disabled', type: 'boolean', defaultValue: false },
    { name: 'readOnly', type: 'boolean', defaultValue: false },
  ],

  slots: [
    {
      name: 'start',
      description: 'Node rendered at the start of the slider (e.g. an IconButton).',
      cardinality: 'single',
    },
    {
      name: 'end',
      description: 'Node rendered at the end of the slider (e.g. an IconButton).',
      cardinality: 'single',
    },
  ],

  previewMatrix: {
    variants: ['continuous', 'range'],
    variantLabels: {
      continuous: 'Continuous',
      range: 'Range',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: SLIDER_TOKEN_MANIFEST,
  recipeDefinition: SLIDER_RECIPE_DEFINITION,
};
