import { CARD_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSCard = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Card',
  importPath: '@oneui/ui/components/Card',
  status: 'alpha',
  description: 'Composite container — Surface boundary + Container padding + a fixed slot tree.',

  propsSchema: {
    $id: 'jds.kb.web.Card',
    type: 'object',
    properties: {
      ...CARD_SHARED_PROPS,
      shape: { enum: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'], default: 'L' },
      padding: { enum: ['XS', 'S', 'M', 'L', 'XL', '2XL'], default: 'L' },
      decorativeStroke: {
        type: 'boolean',
        default: false,
        'x-jds-suggestion':
          'Tinted Card fills are their own boundary. Only enable when fill contrast < 1.5:1 vs page.',
        'x-jds-severity': 'warn',
      },
      onClick: { description: 'Fires when interactive=true.' },
      className: { type: 'string' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg'],
    surface: ['minimal', 'subtle', 'moderate', 'bold', 'elevated'],
    spacing: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    shape: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    elevation: [0, 1, 2],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      header: { accepts: ['Text', 'div', '*'], cardinality: 'optional' },
      media: { accepts: ['img', 'Image', 'div'], cardinality: 'optional' },
      body: { accepts: ['Text', 'div', '*'], cardinality: 'optional' },
      footer: { accepts: ['Text', 'div', '*'], cardinality: 'optional' },
      actions: { accepts: ['Button', 'IconButton'], cardinality: 'multiple' },
    },
  },

  a11y: {
    role: 'none',
    accessibleNameSource: 'children',
    keyboardActivation: ['Enter', 'Space'],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-card-v4', keyHistory: [], variantProperties: { Component: 'Card' } },

  renderHints: {
    baseElement: 'div',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: true,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['container', 'chassis', 'composition'],
} as const);
