/**
 * Card.meta.ts
 *
 * ComponentMeta for the Card content container. Documents the public API for
 * the registry, editor previews, and AI/agent context.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CARD_TOKEN_MANIFEST } from './Card.tokens';

const SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;

const APPEARANCE_OPTIONS = [
  'auto',
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

export const CARD_META: ComponentMeta = {
  name: 'Card',
  slug: 'card',
  displayName: 'Card',
  description:
    'Content card / panel container. Geometry (corner radius, stroke, shadow, padding, gap) follows the brand\'s "Cards" theme family. By default it paints the brand-configured card fill; pass `surface` to render as a tinted/bold/elevated Surface so children adapt via the [data-surface] cascade.',
  category: 'layout',

  props: [
    {
      name: 'surface',
      type: 'enum',
      description:
        'Surface mode for the card fill. When set, children adapt via surface context remapping.',
      defaultValue: undefined,
      options: SURFACE_MODES,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role used when `surface` is set.',
      defaultValue: 'auto',
      options: APPEARANCE_OPTIONS,
    },
    {
      name: 'interactive',
      type: 'boolean',
      description: 'Hover lift and focus halo for clickable cards.',
      defaultValue: false,
    },
    {
      name: 'as',
      type: 'string',
      description: 'Rendered element — `div` (default), `article`, `section`, `li`…',
      defaultValue: 'div',
    },
  ],
  slots: [],

  previewMatrix: {
    variants: ['default', 'subtle', 'elevated'],
    variantLabels: {
      default: 'Default fill',
      subtle: 'Subtle surface',
      elevated: 'Elevated surface',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tags: ['card', 'panel', 'container', 'group', 'tile'],

  tokenManifest: CARD_TOKEN_MANIFEST,
};
