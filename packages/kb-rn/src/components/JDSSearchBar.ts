/**
 * JDSSearchBar — composite input with a leading magnifier icon, optional
 * clear button, and optional loading spinner. Coffee Shop's catalog screens
 * lead with one of these.
 */

import { FORBIDDEN_COLOR_LITERAL, SEARCH_BAR_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSSearchBar = defineComponent({
  schemaVersion: '5.0.0',
  name: 'SearchBar',
  importPath: '@oneui/ui-native',
  status: 'alpha',
  description:
    'Composite search input with leading icon, clearable text, optional loading state. Filled-surface affordance, pill shape, single line.',

  propsSchema: {
    $id: 'jds.kb.rn.SearchBar',
    type: 'object',
    properties: {
      ...SEARCH_BAR_SHARED_PROPS,
      onSubmit: { description: 'Native onSubmitEditing handler.' },
      onChangeText: { description: 'Text-change callback.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
  },

  tokens: {
    color: ['neutral', 'primary'],
    surface: ['subtle', 'moderate'],
    typography: ['body.M', 'body.L'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L'],
    shape: ['M', 'L', 'pill'],
    motion: ['motion.duration.discreet.short'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-searchbar-v4',
    keyHistory: [],
    variantProperties: { Component: 'SearchBar' },
  },

  renderHints: {
    baseElement: 'TextInput',
    animatedOn: ['focus'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['input', 'discovery', 'chassis'],
} as const);
