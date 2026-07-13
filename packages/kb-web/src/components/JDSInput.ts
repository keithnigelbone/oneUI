import { FORBIDDEN_COLOR_LITERAL, INPUT_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSInput = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Input',
  importPath: '@oneui/ui/components/Input',
  status: 'stable',
  description: 'Web labelled input. Wraps a Base UI Field with the OneUI label / helper / error trio.',

  propsSchema: {
    $id: 'jds.kb.web.Input',
    type: 'object',
    properties: {
      ...INPUT_SHARED_PROPS,
      type: {
        enum: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time'],
        default: 'text',
      },
      autoComplete: { type: 'string' },
      onChange: { description: 'Web change handler.' },
      name: { type: 'string' },
      id: { type: 'string' },
      className: { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
  },

  tokens: {
    color: ['neutral', 'primary', 'negative', 'positive', 'warning'],
    surface: ['subtle', 'moderate'],
    typography: ['body.M', 'body.L', 'label.S', 'label.XS'],
    spacing: ['3XS', '2XS', 'XS', 'S', 'M'],
    shape: ['XS', 'S', 'M'],
    motion: ['motion.duration.discreet.short'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    role: 'none',
    accessibleNameSource: 'aria-labelledby',
    states: ['aria-disabled'],
    keyboardActivation: ['Tab'],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-input-v4', keyHistory: [], variantProperties: { Component: 'Input' } },

  renderHints: {
    baseElement: 'input',
    baseUiPrimitive: '@base-ui/react/field',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['input', 'form', 'chassis'],
} as const);
