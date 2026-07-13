/**
 * JDSSecondaryNav — RN knowledge entry for HeaderNative.SecondaryNav.
 *
 * Mirrors the native-owned prop contract at
 * `packages/ui-native/src/components/HeaderNative/interface.ts` (`SecondaryNavProps`).
 * Figma source of truth: HeaderNative.SecondaryNav (2134:14646) — rendered when
 * HeaderNative.secondaryNav=true. Composes HeaderItem children only.
 */

import { defineComponent } from '../defineComponent';

export const JDSSecondaryNav = defineComponent({
  schemaVersion: '5.0.0',
  name: 'SecondaryNav',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'HeaderNative tab row — a set of HeaderItem tabs. Rendered only when HeaderNative.secondaryNav is true.',

  propsSchema: {
    $id: 'jds.kb.rn.SecondaryNav',
    type: 'object',
    properties: {
      children: { description: 'HeaderItem elements only.' },
      'aria-label': { type: 'string' },
      'aria-labelledby': { type: 'string' },
      accessibilityHint: { type: 'string' },
    },
  },

  tokens: {
    color: ['neutral'],
    typography: ['label.S'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['HeaderItem'],
        cardinality: 'multiple',
        description: 'One HeaderItem per tab.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'tablist',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-header-native-secondarynav-v1',
    keyHistory: [],
    variantProperties: { Component: 'HeaderNative.SecondaryNav' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'header', 'tabs', 'compound'],
} as const);
