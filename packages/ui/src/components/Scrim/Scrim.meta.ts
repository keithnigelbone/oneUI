/**
 * Scrim.meta.ts
 * Unified metadata — extracted from Figma API table (node 4078:17919).
 */

import type { ComponentMeta } from '@oneui/shared';
import { SCRIM_TOKEN_MANIFEST } from './Scrim.tokens';

export const SCRIM_META: ComponentMeta = {
  name: 'Scrim',
  slug: 'scrim',
  displayName: 'Scrim',
  description:
    'Non-interactive overlay for media legibility (directional gradient) or modal backdrops (uniform fill). Supports position, size, attention, and variant axes from Figma.',
  category: 'layout',
  tags: ['overlay', 'gradient', 'backdrop', 'media', 'legibility'],

  props: [
    {
      name: 'position',
      type: 'enum',
      description: 'Edge or center placement of the scrim',
      defaultValue: 'bottom',
      options: ['bottom', 'left', 'top', 'right', 'center'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Fade extent along the anchored axis — XS through XL, or full container',
      defaultValue: 's',
      options: ['xs', 's', 'm', 'l', 'xl', 'full'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Fill strength — high, medium, low',
      defaultValue: 'medium',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'variant',
      type: 'enum',
      description: 'Gradient edge fade or uniform overlay fill',
      defaultValue: 'gradient',
      options: ['gradient', 'overlay'] as const,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['gradient', 'overlay'],
    variantLabels: {
      gradient: 'Gradient',
      overlay: 'Overlay',
    },
    sizes: ['xs', 's', 'm', 'l', 'xl', 'full'],
    sizeLabels: {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
      xl: 'XL',
      full: 'Full',
    },
  },

  surfaceAware: false,
  multiAccent: false,
  tokenManifest: SCRIM_TOKEN_MANIFEST,
};
