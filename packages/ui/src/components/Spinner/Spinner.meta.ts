/**
 * Spinner.meta.ts
 *
 * Unified metadata for the Spinner component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SPINNER_TOKEN_MANIFEST } from './Spinner.tokens';

export const SPINNER_META: ComponentMeta = {
  name: 'Spinner',
  slug: 'spinner',
  displayName: 'Spinner',
  description:
    'Indeterminate three-arc loading indicator. Renders three distinct role-colored arcs (primary + secondary + sparkle) and adapts on colored surfaces via the [data-surface] system.',
  category: 'feedback',
  tags: ['loading', 'progress', 'indeterminate', 'spinner', 'busy'],

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Spinner diameter — matches Figma 10-size scale.',
      defaultValue: 'M',
      options: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label announced by screen readers.',
      defaultValue: 'Loading',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeLabels: {
      XS: 'XS',
      S: 'S',
      M: 'M',
      L: 'L',
      XL: 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: SPINNER_TOKEN_MANIFEST,
};
