/**
 * JDSPaginationDots — RN knowledge entry for the PaginationDots.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/PaginationDots/interface.ts`.
 *
 * COUNT-DRIVEN + WINDOWED CONTRACT (the reason this meta exists):
 * PaginationDots is NOT children-driven — it renders `count` dots internally
 * and slides a max-5 window over them, classifying each visible slot as
 * `active` (pill) / `regular` / `edge` (smaller, "more this way"). Controlled
 * via `activeIndex` or uncontrolled via `defaultActiveIndex`; `loop` wraps.
 * `readOnly` switches the root role from `tablist` (interactive tabs) to
 * `progressbar`. The active dot fills from `role.surfaces.bold`; inactive dots
 * from `role.content.strokeMedium` / `tintedA11y`, against the parent <Surface>.
 * Figma defines a single size (M).
 */

import { defineComponent } from '../defineComponent';

export const JDSPaginationDots = defineComponent({
  schemaVersion: '5.0.0',
  name: 'PaginationDots',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Carousel / page position indicator. Count-driven (renders `count` dots, not children) with a sliding max-5 window and three dot states (active / regular / edge). Controlled or uncontrolled active index; optional loop. readOnly → progressbar, otherwise tablist of tappable dots.',

  propsSchema: {
    $id: 'jds.kb.rn.PaginationDots',
    type: 'object',
    properties: {
      count: { type: 'number', description: 'Total number of pages/dots.' },
      activeIndex: { type: 'number', description: 'Active dot index (controlled).' },
      defaultActiveIndex: { type: 'number', default: 0, description: 'Initial active index (uncontrolled).' },
      onActiveIndexChange: { description: 'Fires with the next active index on dot press / step.' },
      loop: { type: 'boolean', default: false, description: 'Wrap the window around the ends.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: 'Multi-accent role for the active dot, resolved against the parent <Surface>.',
      },
      readOnly: { type: 'boolean', default: false, description: 'Non-interactive — root becomes progressbar instead of tablist.' },
      'aria-label': { type: 'string' },
    },
    required: ['count'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'tablist', // → 'progressbar' when readOnly; each dot is a 'tab'
    accessibilityState: ['selected'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-pagination-dots-v4',
    keyHistory: [],
    variantProperties: { Component: 'PaginationDots' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'pagination', 'indicator', 'surface-aware'],
} as const);
