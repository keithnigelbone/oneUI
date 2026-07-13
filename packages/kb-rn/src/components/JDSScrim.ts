import { defineComponent } from '../defineComponent';

export const JDSScrim = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Scrim',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A layout fade or overlay tint used to improve legibility of content resting on images or complex backgrounds.',

  propsSchema: {
    $id: 'jds.kb.rn.Scrim',
    type: 'object',
    properties: {
      attention: {
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        description: 'Fade strength',
      },
      size: {
        enum: ['XS', 'S', 'M', 'L', 'XL', 'full'],
        default: 'XS',
        description: 'Band coverage within the parent',
      },
      position: {
        enum: ['top', 'bottom', 'start', 'end', 'center'],
        default: 'bottom',
        description: 'Edge the fade anchors to',
      },
      variant: {
        enum: ['gradient', 'overlay'],
        default: 'gradient',
        description: 'Edge fade or flat tint',
      },
    },
  },

  tokens: {
    color: [],
    surface: [],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-scrim-v4',
    keyHistory: [],
    variantProperties: { Component: 'Scrim' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: true,
    readsFromSurfaceContext: false,
  },

  tags: ['layout', 'overlay', 'background'],
} as const);
