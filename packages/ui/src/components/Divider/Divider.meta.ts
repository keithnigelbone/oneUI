/**
 * Divider.meta.ts
 *
 * Unified metadata for the Divider component.
 */

import type { ComponentMeta } from '@oneui/shared';

export const DIVIDER_META: ComponentMeta = {
  name: 'Divider',
  slug: 'divider',
  displayName: 'Divider',
  description: 'Visual separator with size, attention, appearance, optional Icon/Text children, and round caps support.',
  category: 'layout',

  props: [
    {
      name: 'orientation',
      type: 'enum',
      description: 'Component orientation',
      defaultValue: 'horizontal',
      options: ['horizontal', 'vertical'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Stroke width — S (hairline), M (thin), L (medium)',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Optional centre content — plain string (auto-wrapped in Label XS Medium `<Text />`), `<Icon />`, or `<Text />`. Divider merges `appearance`, `attention`, and Figma sizing (Icon `4`, Label XS) when those props are unset on the child. Omit for a bare separator.',
    },
    {
      name: 'contentAlign',
      type: 'enum',
      description: 'Position of the centre content',
      defaultValue: 'center',
      options: ['center', 'start', 'end'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 'neutral',
        'sparkle', 'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Prominence level — high, medium, low',
      defaultValue: 'low',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'roundCaps',
      type: 'boolean',
      description: 'Rounded stroke ends',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'Centre (or start/end) content between line segments — design-system Icon or Text',
      acceptedTypes: ['ReactNode', 'Icon', 'Text'],
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    sizes: ['s', 'm', 'l'],
    sizeLabels: {
      's': 'S',
      'm': 'M',
      'l': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,
};
