/**
 * Surface.meta.ts
 *
 * Unified metadata for the Surface component — the container primitive that
 * opts descendants into the OneUI surface cascade via [data-surface].
 */

import type { ComponentMeta } from '@oneui/shared';
import { SURFACE_TOKEN_MANIFEST } from './Surface.tokens';
import { SURFACE_RECIPE_DEFINITION } from './Surface.recipe';

export const SURFACE_META: ComponentMeta = {
  name: 'Surface',
  slug: 'surface',
  displayName: 'Surface',
  description:
    'Container primitive that opts descendants into the OneUI surface cascade via [data-surface]. The `mode` prop maps to one of the 8 canonical surface tokens (default/ghost/minimal/subtle/moderate/bold/elevated/blend). Optional transparent material composites over arbitrary media.',
  category: 'layout',
  tags: ['surface', 'container', 'layout', 'context', 'background'],

  props: [
    {
      name: 'mode',
      type: 'enum',
      description:
        'Surface mode — one of the 8 canonical surface tokens. Determines the background fill AND the data-surface context applied to descendants.',
      required: false,
      defaultValue: 'ghost',
      options: [
        'default',
        'ghost',
        'minimal',
        'subtle',
        'moderate',
        'bold',
        'elevated',
        'blend',
      ] as const,
    },
    {
      name: 'material',
      type: 'enum',
      description:
        'Resolution pipeline. Omit to use the active Material foundation default. `solid` uses opaque tokens from brand palette. `transparent` pulls from the transparent-material CSS block for compositing over arbitrary media (photo/video hero).',
      defaultValue: 'solid',
      options: ['solid', 'transparent'] as const,
    },
    {
      name: 'mediaContext',
      type: 'enum',
      description:
        'Required when `material="transparent"` is explicit; otherwise inherited from the Material foundation default. Hints the CSS which lookup row to use: `dynamic` (unknown media), `dark`, or `light`.',
      options: ['dynamic', 'dark', 'light'] as const,
    },
    {
      name: 'as',
      type: 'string',
      description: 'Polymorphic element type (default: "div").',
      defaultValue: 'div',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'],
    variantLabels: {
      default: 'Default',
      ghost: 'Ghost',
      minimal: 'Minimal',
      subtle: 'Subtle',
      moderate: 'Moderate',
      bold: 'Bold',
      elevated: 'Elevated',
      blend: 'Blend',
    },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: SURFACE_TOKEN_MANIFEST,
  recipeDefinition: SURFACE_RECIPE_DEFINITION,
};
