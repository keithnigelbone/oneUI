import { defineComponent } from '../defineComponent';
import { COMPONENT_APPEARANCE_ENUM } from '../../../kb-core/src/schemas/sharedFragments';

export const JDSTouchSlider = defineComponent({
  schemaVersion: '5.0.0',
  name: 'TouchSlider',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'An adjustable slider control.',

  propsSchema: {
    $id: 'jds.kb.rn.TouchSlider',
    type: 'object',
    properties: {
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      step: { type: 'number', default: 1 },
      largeStep: { type: 'number', default: 10 },
      appearance: COMPONENT_APPEARANCE_ENUM,
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
      progressStyle: { enum: ['rounded', 'sharp'], default: 'rounded' },
      start: { description: 'Optional leading node rendered before the track (≈30×30 slot).' },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: [],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'adjustable',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-touchslider-v4',
    keyHistory: [],
    variantProperties: { Component: 'TouchSlider' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'input', 'slider'],
} as const);
