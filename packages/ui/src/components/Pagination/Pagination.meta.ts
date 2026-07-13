/**
 * Pagination.meta.ts
 *
 * Unified metadata for the Pagination + PaginationItem components.
 * Consumed by:
 *   - the Component Registry (lookup, code-export, AI-context generation)
 *   - the editor (preview matrix, property inspector)
 *   - the AST renderer (prop allow-list, default values)
 *   - LLM agents (description + prop docs + slot semantics)
 *
 * Two ComponentMeta objects are exported here — one per component — so
 * both surface independently in the registry and the AI sees them as
 * distinct primitives.
 */

import type { ComponentMeta } from '@oneui/shared';
import { PAGINATION_TOKEN_MANIFEST } from './Pagination.tokens';
import { PAGINATION_RECIPE_DEFINITION } from './Pagination.recipe';

// ─── Shared prop fragments ───────────────────────────────────────────────────

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

const SIZE_OPTIONS = ['S', 'M', 'L'] as const;
const ATTENTION_OPTIONS = ['high', 'medium', 'low'] as const;

// ─── Pagination (composite) ──────────────────────────────────────────────────

export const PAGINATION_META: ComponentMeta = {
  name: 'Pagination',
  slug: 'pagination',
  displayName: 'Pagination',
  description:
    'Composite numbered page navigator. Renders prev/next + first/last buttons, a windowed list of page numbers, and ellipses where gaps exist — the standard MUI / shadcn / Ant Design pattern, adapted to OneUI tokens, surface-context-awareness, and the high/medium/low attention vocabulary. Uncontrolled by default (`defaultPage`); pass `page` + `onPageChange` for controlled mode. WAI-ARIA navigation landmark with roving-tabindex keyboard navigation and a polite live region announcing page changes.',
  category: 'navigation',

  props: [
    {
      name: 'totalPages',
      type: 'number',
      description: 'Total number of pages. Required. Values < 1 render an empty navigation landmark.',
      required: true,
    },
    {
      name: 'page',
      type: 'number',
      description: 'Controlled current page (1-based).',
    },
    {
      name: 'defaultPage',
      type: 'number',
      description: 'Default current page (1-based) when uncontrolled.',
      defaultValue: 1,
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        'Number of always-visible page numbers immediately around the current page. Higher = wider window between ellipses.',
      defaultValue: 1,
      group: 'behavior',
    },
    {
      name: 'boundaryCount',
      type: 'number',
      description:
        'Number of always-visible page numbers at the very start AND end of the sequence.',
      defaultValue: 1,
      group: 'behavior',
    },
    {
      name: 'showPrevNext',
      type: 'boolean',
      description: 'Show the previous-page / next-page arrow buttons.',
      defaultValue: true,
      group: 'behavior',
    },
    {
      name: 'showFirstLast',
      type: 'boolean',
      description: 'Show first-page / last-page jump buttons (semantic `firstPage` / `lastPage` icons).',
      defaultValue: false,
      group: 'behavior',
    },
    {
      name: 'attention',
      type: 'enum',
      description:
        'Figma attention for the **selected** page chip only: high→bold fill, medium→subtle fill, low→ghost. Nav + ellipsis stay ghost + low attention; inactive page numerals stay ghost with high-emphasis colour.',
      defaultValue: 'medium',
      options: ATTENTION_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'size',
      type: 'enum',
      description: 'T-shirt size for page chips, nav controls, and ellipsis.',
      defaultValue: 'M',
      options: SIZE_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role. `auto` resolves to `primary`.',
      defaultValue: 'primary',
      options: APPEARANCE_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable the entire control.',
      defaultValue: false,
      group: 'behavior',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible label for the navigation landmark.',
      defaultValue: 'Pagination',
      group: 'accessibility',
    },
    {
      name: 'onPageChange',
      type: 'function',
      description: 'Fires whenever the active page changes (click, keyboard, controlled update).',
      group: 'behavior',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: [...ATTENTION_OPTIONS],
    variantLabels: {
      high: 'High (bold chip)',
      medium: 'Medium (subtle chip)',
      low: 'Low (ghost chip)',
    },
    sizes: [...SIZE_OPTIONS],
    sizeLabels: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tags: [
    'pagination',
    'pages',
    'navigation',
    'navigator',
    'page-numbers',
    'next',
    'previous',
    'list',
    'table',
    'carousel',
  ],

  tokenManifest: PAGINATION_TOKEN_MANIFEST,
  recipeDefinition: PAGINATION_RECIPE_DEFINITION,
};

// ─── PaginationItem (primitive) ──────────────────────────────────────────────

export const PAGINATION_ITEM_META: ComponentMeta = {
  name: 'PaginationItem',
  slug: 'pagination-item',
  displayName: 'Pagination Item',
  description:
    'Numbered page chip only (Base UI `Button`). Use inside `<Pagination>` or standalone. Nav arrows, first/last, and ellipsis are rendered by `<Pagination>`, not this primitive. Unselected: ghost + high-emphasis numeral (`--Primary-High`), label size one step below row size, weight medium. Selected: chip styling from the `attention` level (high / medium / low). Surface-context-aware.',
  category: 'navigation',

  props: [
    {
      name: 'page',
      type: 'number',
      description: '1-based page number this chip represents.',
    },
    {
      name: 'selected',
      type: 'boolean',
      description:
        'Whether this chip is the current page. When true, `attention` drives the selected look; when false, the chip stays ghost with `data-attention="high"` for numeral emphasis.',
      defaultValue: false,
      group: 'behavior',
    },
    {
      name: 'attention',
      type: 'enum',
      description:
        'Maps to chip attention when `selected` is true (high / medium / low). When not selected, inactive numerals still render with high-emphasis colour; this prop does not change unselected styling.',
      defaultValue: 'medium',
      options: ATTENTION_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'size',
      type: 'enum',
      description: 'T-shirt size.',
      defaultValue: 'M',
      options: SIZE_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role. `auto` resolves to `primary`.',
      defaultValue: 'primary',
      options: APPEARANCE_OPTIONS,
      group: 'appearance',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disabled state.',
      defaultValue: false,
      group: 'behavior',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible label override. Defaults to `"Go to page N"`.',
      group: 'accessibility',
    },
    {
      name: 'onSelect',
      type: 'function',
      description: 'Fires when the chip is clicked or activated. Receives the `page` prop value.',
      group: 'behavior',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: [...ATTENTION_OPTIONS],
    variantLabels: {
      high: 'High (bold)',
      medium: 'Medium (subtle)',
      low: 'Low (ghost)',
    },
    sizes: [...SIZE_OPTIONS],
    sizeLabels: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tags: ['pagination', 'page', 'button', 'navigation', 'item', 'cell'],

  tokenManifest: PAGINATION_TOKEN_MANIFEST,
  recipeDefinition: PAGINATION_RECIPE_DEFINITION,
};
