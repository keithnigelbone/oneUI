/**
 * ListItem.meta.ts
 *
 * Unified metadata for the ListItem component — a single row (title +
 * optional supportText + start/end slots) used inside ListItemGroup.
 */

import type { ComponentMeta } from '@oneui/shared';
import { LIST_ITEM_TOKEN_MANIFEST } from './ListItem.tokens';
import { LIST_ITEM_RECIPE_DEFINITION } from './ListItem.recipe';

export const LIST_ITEM_META: ComponentMeta = {
  name: 'ListItem',
  slug: 'list-item',
  displayName: 'List Item',
  description:
    'Single row in a list. Renders a title (Label-M) and optional supportText (Body-S) with start/end slots for icons/avatars/badges/chevrons. Supports 4 start slot sizes (S/M/L/XL), 2 end sizes (S/M), three selected levels (false / medium / high), multi-accent appearance roles, bottom divider (none/full/inset), and an inset rounded-card container.',
  category: 'display',
  tags: ['list', 'row', 'menu', 'navigation', 'item'],

  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Primary line (Label-M-High).',
      required: true,
    },
    {
      name: 'supportText',
      type: 'ReactNode',
      description: 'Optional secondary line below the title (Body-S-Low).',
    },
    {
      name: 'supportStart',
      type: 'ReactNode',
      description:
        'Small inline decorative slot rendered BEFORE the support text. Follows the support text colour.',
    },
    {
      name: 'start',
      type: 'ReactNode',
      description: 'Leading content (icon / avatar / badge).',
    },
    {
      name: 'startSize',
      type: 'enum',
      description: 'Leading slot size.',
      defaultValue: 'M',
      options: ['S', 'M', 'L', 'XL'] as const,
    },
    {
      name: 'end',
      type: 'ReactNode',
      description: 'Trailing content (chevron / icon).',
    },
    {
      name: 'endSize',
      type: 'enum',
      description: 'Trailing slot size.',
      defaultValue: 'M',
      options: ['S', 'M'] as const,
    },
    {
      name: 'slotAlignment',
      type: 'enum',
      description:
        'Slot vertical alignment. When supportText is absent, the row single-lines regardless.',
      defaultValue: 'centre',
      options: ['centre', 'top'] as const,
    },
    {
      name: 'container',
      type: 'enum',
      description: 'Row container style.',
      defaultValue: 'fullWidth',
      options: ['fullWidth', 'inset'] as const,
    },
    {
      name: 'selected',
      type: 'enum',
      description:
        'Selected emphasis. `high` re-anchors the row onto a bold surface via [data-surface].',
      defaultValue: false,
      options: [false, 'medium', 'high'] as const,
    },
    {
      name: 'divider',
      type: 'enum',
      description:
        'Bottom hairline style. Auto-suppresses on the last row via :last-child.',
      defaultValue: 'none',
      options: ['none', 'full', 'inset'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role.',
      defaultValue: 'primary',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable interaction and apply reduced-opacity token.',
      defaultValue: false,
    },
    {
      name: 'href',
      type: 'string',
      description: 'When set, renders as <a>.',
    },
    {
      name: 'onClick',
      type: 'function',
      description: 'When set (and no href), renders as <button type="button">.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible name — required when `title` is non-textual.',
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Leading content slot (icon / avatar / badge).',
      acceptedTypes: ['Icon', 'Avatar', 'Badge', 'CounterBadge', 'IndicatorBadge'],
    },
    {
      name: 'end',
      description: 'Trailing content slot (chevron / icon).',
      acceptedTypes: ['Icon', 'IconButton'],
    },
  ],

  previewMatrix: {
    variants: ['default', 'medium', 'high'],
    variantLabels: {
      default: 'Default',
      medium: 'Selected (Medium)',
      high: 'Selected (High)',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: LIST_ITEM_TOKEN_MANIFEST,
  recipeDefinition: LIST_ITEM_RECIPE_DEFINITION,
};
