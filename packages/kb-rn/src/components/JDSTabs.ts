import { defineComponent } from '../defineComponent';
import { COMPONENT_APPEARANCE_ENUM } from '../../../kb-core/src/schemas/sharedFragments';

export const JDSTabs = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Tabs',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A set of tabbed content sections.',

  propsSchema: {
    $id: 'jds.kb.rn.Tabs',
    type: 'object',
    properties: {
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      appearance: COMPONENT_APPEARANCE_ENUM,
      activateOnFocus: { type: 'boolean', default: false },
      loopFocus: { type: 'boolean', default: false },
      showIndicator: { type: 'boolean', default: true },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: [],
  },

  composition: {
    childKind: 'variadic',
    variadic: { accepts: ['TabItem'], min: 1, max: 100 },
  },

  a11y: {
    accessibilityRole: 'tablist',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-tabs-v4',
    keyHistory: [],
    variantProperties: { Component: 'Tabs' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'tabs'],
} as const);
