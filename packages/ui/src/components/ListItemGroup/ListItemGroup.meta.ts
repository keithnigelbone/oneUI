/**
 * ListItemGroup.meta.ts
 *
 * Unified metadata for the ListItemGroup layout primitive.
 */

import type { ComponentMeta } from '@oneui/shared';
import { LIST_ITEM_GROUP_TOKEN_MANIFEST } from './ListItemGroup.tokens';
import { LIST_ITEM_GROUP_RECIPE_DEFINITION } from './ListItemGroup.recipe';

export const LIST_ITEM_GROUP_META: ComponentMeta = {
  name: 'ListItemGroup',
  slug: 'list-item-group',
  displayName: 'List Item Group',
  description:
    'Stacks <ListItem> children vertically. Optional top edge-to-edge hairline (sectionDivider), inset rounded-card framing (container="inset"), and a uniform inter-row divider style propagated to all children (per-row override wins).',
  category: 'display',
  tags: ['list', 'group', 'section', 'layout'],

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '<ListItem> children. Optional — empty groups are valid.',
    },
    {
      name: 'sectionDivider',
      type: 'boolean',
      description: 'Top edge-to-edge hairline above the first row.',
      defaultValue: true,
    },
    {
      name: 'container',
      type: 'enum',
      description: 'Container framing.',
      defaultValue: 'fullWidth',
      options: ['fullWidth', 'inset'] as const,
    },
    {
      name: 'divider',
      type: 'enum',
      description:
        'Inter-row divider style injected into all <ListItem> children. Per-child `divider` prop overrides.',
      defaultValue: 'inset',
      options: ['none', 'full', 'inset'] as const,
    },
    {
      name: 'role',
      type: 'enum',
      description: 'Group landmark role.',
      defaultValue: 'group',
      options: ['group', 'list', 'menu'] as const,
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible name for the group landmark.',
    },
  ],

  slots: [
    {
      name: 'children',
      description: '<ListItem> children.',
      acceptedTypes: ['ListItem'],
      cardinality: 'multiple',
    },
  ],

  previewMatrix: {
    variants: ['fullWidth', 'inset'],
    variantLabels: {
      fullWidth: 'Full Width',
      inset: 'Inset',
    },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: LIST_ITEM_GROUP_TOKEN_MANIFEST,
  recipeDefinition: LIST_ITEM_GROUP_RECIPE_DEFINITION,
};
