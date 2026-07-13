import { defineComponent } from '../defineComponent';
import { ROLE_ENUM } from '../../../kb-core/src/schemas/sharedFragments';

export const JDSSwitch = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Switch',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A toggle switch for binary states.',

  propsSchema: {
    $id: 'jds.kb.rn.Switch',
    type: 'object',
    properties: {
      checked: { type: 'boolean' },
      defaultChecked: { type: 'boolean' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      appearance: ROLE_ENUM,
      accent: { enum: ['primary', 'secondary', 'sparkle'] },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'sparkle', 'neutral'],
    surface: [],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'switch',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-switch-v4',
    keyHistory: [],
    variantProperties: { Component: 'Switch' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'input', 'toggle'],
} as const);
