/**
 * JDSPagination — RN knowledge entry for the numbered Pagination navigator.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Pagination/interface.ts`.
 *
 * Composite of prev/first/last IconButtons + numbered PaginationItem chips,
 * with `siblingCount`/`boundaryCount`-driven ellipsis collapsing (peer of the
 * web `Pagination` — same slot algorithm). Controlled via `page` or
 * uncontrolled via `defaultPage`. Selected chip paints via `attention`
 * (bold/subtle/ghost variant) against the parent <Surface>.
 */

import { defineComponent } from '../defineComponent';

export const JDSPagination = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Pagination',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Numbered page navigator. Renders numbered chips with sibling/boundary-driven ellipsis collapsing, plus optional prev/next and first/last IconButton navigation. Controlled (`page`) or uncontrolled (`defaultPage`). Selected chip variant resolves from `attention` (high → bold, medium → subtle, low → outlined ghost).',

  propsSchema: {
    $id: 'jds.kb.rn.Pagination',
    type: 'object',
    properties: {
      totalPages: { type: 'number', description: 'Total number of pages.' },
      page: { type: 'number', description: 'Current page (controlled), 1-indexed.' },
      defaultPage: { type: 'number', default: 1, description: 'Initial page (uncontrolled).' },
      onPageChange: { description: 'Fires with the next page number.' },
      siblingCount: { type: 'number', default: 1, description: 'Pages shown on each side of the current page before collapsing to an ellipsis.' },
      boundaryCount: { type: 'number', default: 1, description: 'Pages always shown at the start/end regardless of collapsing.' },
      showPrevNext: { type: 'boolean', default: true, description: 'Show previous/next IconButton controls.' },
      showFirstLast: { type: 'boolean', default: false, description: 'Show first/last IconButton controls.' },
      disabled: { type: 'boolean', default: false, description: 'Disables the entire control.' },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'medium',
        description: 'Selected-chip prominence: high → bold fill, medium → subtle fill, low → outlined ghost.',
      },
      size: { description: 'Row size, drives chip and nav-icon-button sizing.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        description: 'Multi-accent role for the selected chip and nav buttons, resolved against the parent <Surface>.',
      },
      'aria-label': { type: 'string', default: 'Pagination' },
      accessibilityHint: { type: 'string' },
      style: { description: 'Root layout style.' },
      testID: { type: 'string' },
    },
    required: ['totalPages'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'none',
    accessibilityState: ['selected', 'disabled'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-pagination-v4',
    keyHistory: [],
    variantProperties: { Component: 'Pagination' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'pagination', 'surface-aware'],
} as const);
