import { ICON_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSIcon = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Icon',
  importPath: '@oneui/ui/icons',
  status: 'stable',
  description: 'Web semantic icon. Inherits colour via currentColor / token cascade.',

  propsSchema: {
    $id: 'jds.kb.web.Icon',
    type: 'object',
    properties: {
      ...ICON_SHARED_PROPS,
      title: { type: 'string', description: 'Renders an <svg><title> for screen readers.' },
      className: { type: 'string' },
    },
    oneOf: [{ required: ['name'] }, { required: ['source'] }],
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    role: 'img',
    accessibleNameSource: 'aria-label',
    keyboardActivation: [],
    contrastRequirement: 'graphical-AA',
  },

  figma: { componentKey: 'jds-icon-v4', keyHistory: [] },

  renderHints: {
    baseElement: 'span',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['icon', 'chassis'],
} as const);
