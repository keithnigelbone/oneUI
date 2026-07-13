/**
 * Icon.meta.ts
 * Unified metadata for the design-system Icon component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { ICON_TOKEN_MANIFEST } from './Icon.tokens';

export const ICON_META: ComponentMeta = {
  name: 'Icon',
  slug: 'icon',
  displayName: 'Icon',
  description: 'Design-system icon with token-based sizing, 8 appearance roles, and 5 emphasis levels.',
  category: 'display',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Icon size (spacing index)',
      defaultValue: '5',
      options: [
        '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8',
        '9', '10', '12', '14', '16', '18', '20', '24', '32', '40',
      ] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Colour role',
      defaultValue: 'neutral',
      options: [
        'neutral', 'primary', 'secondary', 'sparkle',
        'negative', 'positive', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'emphasis',
      type: 'enum',
      description: 'Colour prominence',
      defaultValue: 'high',
      options: ['high', 'medium', 'low', 'tinted', 'tintedA11y'] as const,
    },
    {
      name: 'icon',
      type: 'string',
      description: 'Semantic icon name (e.g., "star", "add", "search", "settings")',
      defaultValue: 'star',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['high', 'medium', 'low', 'tinted', 'tintedA11y'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      tinted: 'Tinted',
      tintedA11y: 'Tinted A11y',
    },
    sizes: ['3', '4', '5', '6', '8', '10'],
    sizeLabels: {
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '8': '8',
      '10': '10',
    },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: ICON_TOKEN_MANIFEST,
};
