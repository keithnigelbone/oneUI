/**
 * JioRibbon.meta.ts
 *
 * Unified metadata for the JioRibbon component (Jio brand-specific).
 */

import type { ComponentMeta } from '@oneui/shared';
import { JIO_RIBBON_TOKEN_MANIFEST } from './JioRibbon.tokens';

export const JIO_RIBBON_META: ComponentMeta = {
  name: 'JioRibbon',
  slug: 'jio-ribbon',
  displayName: 'Jio Ribbon',
  description:
    'Jio brand dot-pattern ribbon with optional Jio symbol. Procedural SVG grid with constraint-based 3-color coloring, dynamic geometric-mean scaling, and interactive symbol positioning.',
  category: 'display',

  props: [
    {
      name: 'variant',
      type: 'enum',
      description:
        'Ribbon variant: dots-only grid or dots with embedded Jio symbol',
      defaultValue: 'dots',
      options: ['dots', 'dots-with-symbol'] as const,
    },
    {
      name: 'orientation',
      type: 'enum',
      description:
        'Ribbon orientation. Auto-detected from canvas aspect ratio when omitted.',
      defaultValue: 'vertical',
      options: ['vertical', 'horizontal'] as const,
    },
    {
      name: 'placement',
      type: 'enum',
      description:
        'Edge placement. Vertical: left/center/right. Horizontal: top/bottom.',
      defaultValue: 'right',
      options: ['left', 'center', 'right', 'top', 'bottom'] as const,
    },
    {
      name: 'canvasWidth',
      type: 'number',
      description: 'Canvas width in pixels for geometric-mean scaling',
      required: true,
    },
    {
      name: 'canvasHeight',
      type: 'number',
      description: 'Canvas height in pixels for geometric-mean scaling',
      required: true,
    },
    {
      name: 'size',
      type: 'enum',
      description:
        'Ribbon thickness vs L: M=0.8, S=0.7, XS=0.6, XXS=0.5 (geometric-mean targets).',
      defaultValue: 'L',
      options: ['XXS', 'XS', 'S', 'M', 'L'] as const,
    },
    {
      name: 'symbolPosition',
      type: 'number',
      description:
        'Row/column count before the Jio symbol (dots-with-symbol variant only)',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['dots', 'dots-with-symbol'],
    variantLabels: {
      dots: 'Dots',
      'dots-with-symbol': 'Dots + Symbol',
    },
    sizes: ['vertical', 'horizontal'],
    sizeLabels: {
      vertical: 'Vertical',
      horizontal: 'Horizontal',
    },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: JIO_RIBBON_TOKEN_MANIFEST,
};
