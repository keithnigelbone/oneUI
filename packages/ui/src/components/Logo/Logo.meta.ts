/**
 * Logo.meta.ts
 * Unified metadata for the Logo component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { LOGO_TOKEN_MANIFEST } from './Logo.tokens';
import { LOGO_RECIPE_DEFINITION } from './Logo.recipe';

export const LOGO_META: ComponentMeta = {
  name: 'Logo',
  slug: 'logo',
  displayName: 'Logo',
  description: 'A visual mark that identifies and reinforces brand identity throughout the interface. Transparent size container — the SVG content controls its own shape and colors. Inside a BrandProvider, `<Logo alt="…" />` renders the active brand\'s logo automatically; pass children / svgContent / src only to override it.',
  category: 'display',

  props: [
    {
      name: 'variant',
      type: 'enum',
      description: 'Circular mark or full rectangular wordmark',
      defaultValue: 'mark',
      options: ['mark', 'full'] as const,
      group: 'appearance',
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Size preset',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l', 'xl', 'custom'] as const,
      group: 'layout',
    },
    {
      name: 'customSize',
      type: 'number',
      description: 'Custom size in pixels (only when size="custom")',
      group: 'layout',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Accessible alt text describing the brand',
      required: true,
      group: 'accessibility',
    },
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL for raster/external logos',
      group: 'content',
    },
    {
      name: 'svgContent',
      type: 'string',
      description: 'Raw SVG markup string (e.g., from Convex brand.logoSvg)',
      group: 'content',
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'Logo content as React node (SVG element, icon, etc.)',
      cardinality: 'single',
    },
  ],

  previewMatrix: {
    variants: ['mark', 'full'],
    variantLabels: {
      mark: 'Mark',
      full: 'Full',
    },
    sizes: ['xs', 's', 'm', 'l', 'xl'],
    sizeLabels: {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
      xl: 'XL',
    },
  },

  surfaceAware: false,
  multiAccent: false,

  tags: ['brand', 'identity', 'mark', 'wordmark', 'image'],

  tokenManifest: LOGO_TOKEN_MANIFEST,
  recipeDefinition: LOGO_RECIPE_DEFINITION,
};
