/**
 * JDSBottomNavigation — variadic container for 2..5 BottomNavigationItems. The
 * cornerstone of every Jio mobile screen's primary navigation.
 *
 * Maps to the `BottomNavigation` export of `@oneui/ui-native`.
 */

import { BOTTOM_NAV_SHARED_PROPS, FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBottomNavigation = defineComponent({
  schemaVersion: '5.0.0',
  name: 'BottomNavigation',
  importPath: '@oneui/ui-native',
  status: 'beta',
  description:
    'Bottom navigation bar. Hosts 2..5 BottomNavigationItems. Sits above safe-area inset; elevates over scrolled content via the elevation token.',

  propsSchema: {
    $id: 'jds.kb.rn.BottomNavigation',
    type: 'object',
    properties: {
      ...BOTTOM_NAV_SHARED_PROPS,
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

  composition: {
    childKind: 'variadic',
    variadic: { accepts: ['BottomNavigationItem'], min: 2, max: 5 },
  },

  a11y: {
    accessibilityRole: 'tablist',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-bottomnav-v4',
    keyHistory: [],
    variantProperties: { Component: 'BottomNavigation' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'chassis', 'mobile-primary-nav'],
} as const);
