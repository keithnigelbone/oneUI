/**
 * JDSHeaderNative — RN knowledge entry for HeaderNative.
 *
 * Mirrors the native-owned prop contract at
 * `packages/ui-native/src/components/HeaderNative/interface.ts`. Figma source
 * of truth: OneUI Micropatterns — HeaderNative family (2134:15129).
 *
 * Compound API: HeaderNative → PrimaryNav (chrome row: logo/back, title,
 * search, end actions, avatar) + SecondaryNav (HeaderItem tab row, only when
 * `secondaryNav` is true). HeaderItem children belong in SecondaryNav only —
 * PrimaryNav has no children slot. Chrome paint is resolved from
 * `useSurfaceTokens('neutral' | 'primary')`, not static colours.
 */

import { defineComponent } from '../defineComponent';

export const JDSHeaderNative = defineComponent({
  schemaVersion: '5.0.0',
  name: 'HeaderNative',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'App-shell header micropattern. Root renders a PrimaryNav chrome row (homeBar/contextBar/searchBar) and an optional SecondaryNav row of HeaderItem tabs, plus an optional bottom divider. `expanded` switches to a two-row layout with a Headline/L title on row two.',

  propsSchema: {
    $id: 'jds.kb.rn.HeaderNative',
    type: 'object',
    required: ['children'],
    properties: {
      expanded: { type: 'boolean', default: false, description: 'Two-row expanded layout (chrome row + Headline/L title row).' },
      secondaryNav: { type: 'boolean', default: false, description: 'Render the SecondaryNav HeaderItem tab row below PrimaryNav.' },
      divider: { type: 'boolean', default: false, description: 'Show a hairline divider below the header (after SecondaryNav when present).' },
      children: { description: 'HeaderNative.PrimaryNav (required) followed by optional HeaderNative.SecondaryNav.' },
      'aria-label': { type: 'string' },
      'aria-labelledby': { type: 'string' },
      accessibilityHint: { type: 'string' },
    },
  },

  tokens: {
    color: ['neutral', 'primary'],
    surface: ['default', 'bold'],
    typography: ['title.M', 'headline.L', 'label.XS'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['HeaderNative.PrimaryNav', 'HeaderNative.SecondaryNav'],
        cardinality: 'multiple',
        description: 'PrimaryNav is required chrome; SecondaryNav (HeaderItem tabs) renders only when `secondaryNav` is true.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'header',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-header-native-v1',
    keyHistory: [],
    variantProperties: { Component: 'HeaderNative' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'header', 'app-shell', 'compound', 'surface-aware'],
} as const);
