/**
 * FAB.meta.ts
 *
 * Unified metadata for the FAB (Floating Action Button) component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { FAB_TOKEN_MANIFEST } from './FAB.tokens';
import { FAB_RECIPE_DEFINITION } from './FAB.recipe';

export const FAB_META: ComponentMeta = {
  name: 'FAB',
  slug: 'fab',
  displayName: 'FAB',
  description:
    'Floating Action Button — elevated primary action that lifts above the page. Circular when no label is present; pill-shaped when extended with a label. Supports 3 sizes (small/medium/large), 3 variants (primary/secondary/surface), and optional on-screen fixed positioning.',
  category: 'actions',
  tags: ['action', 'fab', 'floating', 'cta', 'elevated'],

  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon displayed in the FAB. Accepts a semantic icon name (string) or any ReactElement.',
      required: true,
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Optional label text. When provided, the FAB renders as an extended pill.',
    },
    {
      name: 'variant',
      type: 'enum',
      description: 'Visual variant affecting colors.',
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'surface'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Size affecting dimensions.',
      defaultValue: 'medium',
      options: ['small', 'medium', 'large'] as const,
    },
    {
      name: 'position',
      type: 'enum',
      description:
        'On-screen anchor. Only applies when the FAB is positioned fixed.',
      options: ['bottom-right', 'bottom-left', 'bottom-center'] as const,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disabled state.',
      defaultValue: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      description: 'Loading state (shows spinner, disables interaction).',
      defaultValue: false,
    },
    {
      name: 'onPress',
      type: 'function',
      description: 'Press/click handler.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible label. Required when no `label` prop is provided.',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['primary', 'secondary', 'surface'],
    variantLabels: {
      primary: 'Primary',
      secondary: 'Secondary',
      surface: 'Surface',
    },
    sizes: ['small', 'medium', 'large'],
    sizeLabels: {
      small: 'S',
      medium: 'M',
      large: 'L',
    },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: FAB_TOKEN_MANIFEST,
  recipeDefinition: FAB_RECIPE_DEFINITION,
};
