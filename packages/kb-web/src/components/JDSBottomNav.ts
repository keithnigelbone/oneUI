import { BOTTOM_NAV_SHARED_PROPS, FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBottomNav = defineComponent({
  schemaVersion: '5.0.0',
  name: 'BottomNav',
  importPath: '@oneui/ui/components/BottomNavigation',
  status: 'beta',
  description: 'Web BottomNav — fixed-position primary nav on mobile breakpoints; degrades to <nav> with horizontal pills on desktop.',

  propsSchema: {
    $id: 'jds.kb.web.BottomNav',
    type: 'object',
    properties: {
      ...BOTTOM_NAV_SHARED_PROPS,
      className: { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
    required: ['activeId'],
  },

  tokens: {
    color: ['neutral', 'primary', 'brand-bg'],
    surface: ['default', 'elevated'],
    spacing: ['XS', 'S', 'M', 'L'],
    shape: ['XS', 'S', 'M'],
    elevation: [1, 2, 3],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: { childKind: 'variadic', variadic: { accepts: ['TabBarItem'], min: 2, max: 5 } },

  a11y: {
    role: 'tablist',
    accessibleNameSource: 'aria-label',
    keyboardActivation: ['Arrow', 'Tab'],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-bottomnav-v4', keyHistory: [], variantProperties: { Component: 'BottomNavigation' } },

  renderHints: {
    baseElement: 'div',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['navigation', 'chassis'],
} as const);
