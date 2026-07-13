/**
 * JDSBanner — inline status messages (informative / positive / warning /
 * negative). Coffee Shop uses these for stock alerts, payment confirmations,
 * delivery state messages.
 */

import {
  BANNER_SHARED_PROPS,
  FORBIDDEN_COLOR_LITERAL,
} from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBanner = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Banner',
  importPath: '@oneui/ui-native',
  status: 'alpha',
  description:
    'Inline status banner with a tone (informative / positive / warning / negative), title, body, and optional dismiss action.',

  propsSchema: {
    $id: 'jds.kb.rn.Banner',
    type: 'object',
    properties: {
      ...BANNER_SHARED_PROPS,
      onDismiss: { description: 'Fires when the user taps the close icon.' },
      action: { description: 'Optional ReactNode rendered on the trailing edge (typically a Button).' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
    required: ['tone'],
  },

  tokens: {
    color: ['informative', 'positive', 'warning', 'negative'],
    surface: ['subtle', 'moderate'],
    typography: ['body.M', 'body.S', 'label.S'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L'],
    shape: ['S', 'M', 'L'],
    motion: ['motion.duration.expressive.medium', 'motion.easing.entrance'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      icon: { accepts: ['Icon'], cardinality: 'optional' },
      title: { accepts: ['#string', 'Text'], cardinality: 'optional' },
      body: { accepts: ['#string', 'Text'], cardinality: 'single' },
      action: { accepts: ['Button'], cardinality: 'optional' },
    },
  },

  a11y: {
    accessibilityRole: 'text',
    accessibilityState: ['busy'],
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-banner-v4',
    keyHistory: [],
    variantProperties: { Component: 'Banner' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['feedback', 'status', 'chassis'],
} as const);
