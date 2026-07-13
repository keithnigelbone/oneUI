import { defineComponent } from '../defineComponent';

export const JDSModal = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Modal',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A popup dialog that demands user attention and interaction.',

  propsSchema: {
    $id: 'jds.kb.rn.Modal',
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      defaultOpen: { type: 'boolean' },
      dismissible: { type: 'boolean', default: true },
      size: { enum: ['s', 'm', 'l', 'fullWidth'], default: 's' },
      header: { type: 'boolean', default: true },
      headerAlign: { enum: ['left', 'center'], default: 'left' },
      showTitle: { type: 'boolean', default: true },
      title: { type: 'string' },
      showDescription: { type: 'boolean', default: true },
      description: { type: 'string' },
      dividerTopVisibility: { enum: ['none', 'onScroll', 'always'], default: 'none' },
      dividerTopScrollPosition: { enum: ['start', 'middle', 'end'], default: 'middle' },
      dividerBottomVisibility: { enum: ['none', 'onScroll', 'always'], default: 'none' },
      dividerBottomScrollPosition: { enum: ['start', 'middle', 'end'], default: 'middle' },
      footer: { type: 'boolean', default: true },
      footerOrientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
    },
    required: [],
  },

  tokens: {
    color: [],
    surface: ['default', 'elevated'],
  },

  composition: {
    childKind: 'variadic',
    variadic: { accepts: ['*'], min: 0, max: 10000 },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-modal-v4',
    keyHistory: [],
    variantProperties: { Component: 'Modal' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['overlay', 'dialog', 'popup'],
} as const);
