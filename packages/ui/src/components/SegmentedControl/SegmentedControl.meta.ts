/**
 * SegmentedControl.meta.ts
 * Unified metadata for SegmentedControl.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SEGMENTED_CONTROL_TOKEN_MANIFEST } from './SegmentedControl.tokens';
import { SEGMENTED_CONTROL_RECIPE_DEFINITION } from './SegmentedControl.recipe';

export const SEGMENTED_CONTROL_META: ComponentMeta = {
  name: 'SegmentedControl',
  slug: 'segmented-control',
  displayName: 'Segmented Control',
  description:
    'Mutually exclusive segmented control for switching between related views or filters. Wraps Base UI ToggleGroup. Supports track emphasis, attention-driven selected states, equal-width layout, text and icon-only segments, and start (icon) / end (CounterBadge) slots.',
  category: 'actions',

  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Controlled selected segment value',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: 'Uncontrolled initial selected value',
    },
    {
      name: 'onValueChange',
      type: 'function',
      description: 'Called when the selected segment changes',
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Segment size propagated to all items',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
      brandOverridable: true,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Selected segment visual prominence. low uses auto(neutral): parent Surface appearance ?? neutral (same as track).',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Active segment colour role for high/medium attention. auto = parent Surface → primary. When attention is low, selected role follows auto(neutral): parent Surface ?? neutral.',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'shape',
      type: 'enum',
      description: 'Track and segment corner shape',
      defaultValue: 'pill',
      options: ['pill', 'rectangular'] as const,
      brandOverridable: true,
    },
    {
      name: 'equalWidth',
      type: 'boolean',
      description: 'Distribute equal width to all segments',
      defaultValue: true,
    },
    {
      name: 'trackEmphasis',
      type: 'enum',
      description: 'Track (container) background prominence',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'type',
      type: 'enum',
      description: 'Text labels or icon-only layout (`start` icon per item, labels hidden)',
      defaultValue: 'text',
      options: ['text', 'icon'] as const,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable the entire control',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'SegmentedControl.Item components',
      acceptedTypes: ['SegmentedControl.Item'],
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: { high: 'High', medium: 'Medium', low: 'Low' },
    sizes: ['s', 'm', 'l'],
    sizeLabels: { s: 'S', m: 'M', l: 'L' },
  },

  surfaceAware: true,
  multiAccent: true,

  tags: ['navigation', 'filter', 'toggle', 'selection', 'segmented'],

  tokenManifest: SEGMENTED_CONTROL_TOKEN_MANIFEST,
  recipeDefinition: SEGMENTED_CONTROL_RECIPE_DEFINITION,
};
