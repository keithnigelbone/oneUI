import { FORBIDDEN_COLOR_LITERAL, SEARCH_BAR_SHARED_PROPS } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSSearchBar = defineComponent({
  schemaVersion: '5.0.0',
  name: 'SearchBar',
  importPath: '@oneui/ui/components/SearchBar',
  status: 'alpha',
  description: 'Web search input with leading icon + clearable text + optional loading state.',

  propsSchema: {
    $id: 'jds.kb.web.SearchBar',
    type: 'object',
    properties: {
      ...SEARCH_BAR_SHARED_PROPS,
      onSubmit: { description: 'Fires on Enter.' },
      onChange: { description: 'Web change handler.' },
      autoComplete: { type: 'string', default: 'off' },
      className: { type: 'string' },
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
    role: 'form',
    accessibleNameSource: 'aria-label',
    keyboardActivation: ['Enter', 'Escape'],
    contrastRequirement: 'AA',
  },

  figma: { componentKey: 'jds-searchbar-v4', keyHistory: [], variantProperties: { Component: 'SearchBar' } },

  renderHints: {
    baseElement: 'input',
    baseUiPrimitive: '@base-ui/react/field',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['input', 'discovery', 'chassis'],
} as const);
