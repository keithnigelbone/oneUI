import { SURFACE_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSSurface = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Surface',
  importPath: '@oneui/ui/components/Surface',
  status: 'stable',
  description:
    'Web Surface. Emits `data-surface="<mode>"` which the brand-CSS engine targets to remap role tokens for every child.',

  propsSchema: {
    $id: 'jds.kb.web.Surface',
    type: 'object',
    properties: {
      ...SURFACE_SHARED_PROPS,
      as: { description: 'Polymorphic root. Defaults to <div>.' },
      className: { type: 'string' },
      style: {
        description: 'Layout only; backgroundColor is forbidden.',
        'x-jds-suggestion': 'Surface mode IS the background. Pick a different `mode` or `appearance` instead.',
        'x-jds-severity': 'warn',
      },
    },
    required: ['mode'],
  },

  tokens: {
    color: [
      'primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle',
      'brand-bg', 'positive', 'negative', 'warning', 'informative',
    ],
    surface: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'],
  },

  composition: { childKind: 'variadic', variadic: { accepts: ['*'], min: 0, max: 10000 } },

  a11y: {
    role: 'none',
    accessibleNameSource: 'children',
    keyboardActivation: [],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-surface-v4', keyHistory: [], variantProperties: { Component: 'Surface' } },

  renderHints: {
    baseElement: 'div',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: true,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['layout', 'chassis', 'mandatory-wrapper'],
} as const);
