import { BANNER_SHARED_PROPS, FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBanner = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Banner',
  importPath: '@oneui/ui/components/Banner',
  status: 'alpha',
  description: 'Web inline status banner with tone + title + body + optional dismiss / action.',

  propsSchema: {
    $id: 'jds.kb.web.Banner',
    type: 'object',
    properties: {
      ...BANNER_SHARED_PROPS,
      role: { enum: ['status', 'alert'], default: 'status', description: 'ARIA live-region role.' },
      onDismiss: { description: 'Fires when the user clicks the close button.' },
      action: { description: 'Optional ReactNode rendered trailing — typically a Button.' },
      className: { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
    required: ['tone'],
  },

  tokens: {
    color: ['informative', 'positive', 'warning', 'negative'],
    surface: ['subtle', 'moderate'],
    typography: ['body.M', 'body.S', 'label.S'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L'],
    shape: ['S', 'M', 'L'],
    motion: ['motion.duration.expressive.medium', 'motion.easing.entrance'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      icon: { accepts: ['Icon'], cardinality: 'optional' },
      title: { accepts: ['#string', 'Text'], cardinality: 'optional' },
      body: { accepts: ['#string', 'Text'], cardinality: 'single' },
      action: { accepts: ['Button'], cardinality: 'optional' },
    },
  },

  a11y: {
    role: 'banner',
    accessibleNameSource: 'children',
    states: ['aria-busy'],
    keyboardActivation: [],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-banner-v4', keyHistory: [], variantProperties: { Component: 'Banner' } },

  renderHints: {
    baseElement: 'div',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['feedback', 'status', 'chassis'],
} as const);
