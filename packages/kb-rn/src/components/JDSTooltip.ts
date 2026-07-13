import { defineComponent } from '../defineComponent';

export const JDSTooltip = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Tooltip',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A brief, contextual popup that displays when hovering or focusing an element.',

  propsSchema: {
    $id: 'jds.kb.rn.Tooltip',
    type: 'object',
    properties: {
      content: { description: 'Tooltip content — text or ReactNode. Required; serves as the accessible label.' },
      position: {
        enum: ['top', 'topStart', 'topEnd', 'bottom', 'bottomStart', 'bottomEnd', 'left', 'leftStart', 'leftEnd', 'right', 'rightStart', 'rightEnd']
      },
      side: { enum: ['top', 'bottom', 'left', 'right'], default: 'top' },
      align: { enum: ['start', 'center', 'end'], default: 'center' },
      trigger: { enum: ['hover', 'click', 'focus', 'manual'], default: 'hover' },
      open: { type: 'boolean', description: 'Controlled open state.' },
      defaultOpen: { type: 'boolean', description: 'Uncontrolled initial open state.' },
      onOpenChange: { description: 'Called with the next open state (boolean) when the tooltip opens/closes.' },
      delay: { type: 'number', default: 200 },
      closeDelay: { type: 'number' },
      arrow: { type: 'boolean', default: true },
      hoverable: { type: 'boolean', default: true },
      disabled: { type: 'boolean', default: false },
      subtle: { type: 'boolean', default: false },
    },
    required: ['content'],
  },

  tokens: {
    color: ['neutral'],
    surface: ['elevated'],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'button',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-tooltip-v4',
    keyHistory: [],
    variantProperties: { Component: 'Tooltip' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['overlay', 'popup', 'hint'],
} as const);
