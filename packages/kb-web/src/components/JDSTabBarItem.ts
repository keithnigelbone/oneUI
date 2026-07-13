import { TAB_BAR_ITEM_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSTabBarItem = defineComponent({
  schemaVersion: '5.0.0',
  name: 'TabBarItem',
  importPath: '@oneui/ui/components/BottomNavigation',
  status: 'beta',
  description: 'Web tab inside a BottomNav. Renders as <button role="tab">.',

  propsSchema: {
    $id: 'jds.kb.web.TabBarItem',
    type: 'object',
    properties: {
      ...TAB_BAR_ITEM_SHARED_PROPS,
      href: { type: 'string', description: 'Optional href; renders as <a> when present.' },
      onClick: { description: 'Click handler.' },
      className: { type: 'string' },
    },
    required: ['id', 'label'],
  },

  tokens: {
    color: ['neutral', 'primary'],
    surface: ['ghost', 'subtle'],
    typography: ['label.XS', 'label.S'],
    spacing: ['3XS', '2XS', 'XS', 'S'],
    motion: ['motion.duration.discreet.short'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      icon: { accepts: ['Icon'], cardinality: 'single' },
      label: { accepts: ['#string', 'Text'], cardinality: 'single' },
      badge: { accepts: ['Badge', 'CounterBadge'], cardinality: 'optional' },
    },
  },

  a11y: {
    role: 'tab',
    accessibleNameSource: 'children',
    states: ['aria-selected', 'aria-disabled'],
    keyboardActivation: ['Enter', 'Space'],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-tabbar-item-v4', keyHistory: [], variantProperties: { Component: 'TabBarItem' } },

  renderHints: {
    baseElement: 'button',
    baseUiPrimitive: 'none',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['navigation', 'chassis'],
} as const);
