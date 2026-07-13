import { TEXT_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSText = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Text',
  importPath: '@oneui/ui/components/Text',
  status: 'alpha',
  description:
    'Web Text primitive. Reads --{Role}-{Size}-FontSize / LineHeight / FontWeight via the brand CSS cascade. No raw fontSize / fontWeight / color.',

  propsSchema: {
    $id: 'jds.kb.web.Text',
    type: 'object',
    properties: {
      ...TEXT_SHARED_PROPS,
      as: { enum: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'] },
      truncate: { type: 'boolean', default: false, description: 'Single-line ellipsis when true.' },
      className: { type: 'string' },
    },
    required: ['role', 'size', 'children'],
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    typography: [
      'display.L', 'display.M', 'display.S',
      'headline.L', 'headline.M', 'headline.S',
      'title.L', 'title.M', 'title.S',
      'body.2XL', 'body.XL', 'body.L', 'body.M', 'body.S', 'body.XS', 'body.2XS',
      'label.2XL', 'label.XL', 'label.L', 'label.M', 'label.S', 'label.XS', 'label.2XS', 'label.3XS',
      'code.M', 'code.S', 'code.XS',
    ],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    role: 'none',
    accessibleNameSource: 'children',
    keyboardActivation: [],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-text-v4', keyHistory: [] },

  renderHints: {
    baseElement: 'span',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['typography', 'chassis'],
} as const);
