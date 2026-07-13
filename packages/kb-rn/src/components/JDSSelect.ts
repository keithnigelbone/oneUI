/**
 * JDSSelect — RN knowledge entry for the Select.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Select/interface.ts`. Select is a trigger
 * (input / button / iconButton — reusing those components) plus an anchored
 * dropdown menu (single / multi with checkboxes / actions), optional search and
 * sections. No Base UI on native — the menu is built from RN primitives.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSSelect = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Select',
  importPath: '@oneui/ui-native',
  status: 'beta',
  description:
    'Selection control: a trigger (input / button / iconButton) that opens an anchored dropdown menu. Single-select (check on the chosen row), multi-select (checkbox + optional secondary text), or actions. Optional search header and titled sections. Menu opens below / above / aligned with the trigger. Reuses Input/Button/IconButton + Checkbox; adapts on coloured surfaces via the parent <Surface>.',

  propsSchema: {
    $id: 'jds.kb.rn.Select',
    type: 'object',
    properties: {
      options: {
        description:
          'SelectOption[] — { value, label, secondaryText?, disabled?, icon?, badge?, group? }.',
      },
      sections: { description: 'SelectSection[] — { id, label? }; options grouped by option.group.' },
      value: { description: 'Single-select value (controlled).' },
      onChange: { description: 'Single-select change handler.' },
      values: { description: 'Multi-select values (controlled; menu="multi").' },
      onValuesChange: { description: 'Multi-select change handler.' },
      onAction: { description: 'Fired for menu="actions" rows, then the menu closes.' },
      menu: { enum: ['single', 'multi', 'actions'], default: 'single' },
      trigger: { enum: ['input', 'button', 'iconButton'], default: 'input' },
      menuDirection: { enum: ['below', 'above', 'alignWithTrigger'], default: 'below' },
      appearance: {
        enum: [
          'auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg',
          'positive', 'negative', 'warning', 'informative',
        ],
        default: 'auto',
        description: 'Multi-accent role resolved against the parent <Surface>.',
      },
      attention: { enum: ['high', 'medium', 'low'], default: 'medium', description: 'Button / iconButton trigger attention.' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      searchable: { type: 'boolean', default: false, description: 'Show a search/filter input in the menu header.' },
      placeholder: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      label: { type: 'string', description: 'Field label above the input trigger.' },
      description: { type: 'string' },
      required: { type: 'boolean', default: false },
      helperText: { type: 'string' },
      feedback: { type: 'string', description: 'Error/feedback message under the input trigger.' },
      errorHighlight: { type: 'boolean', default: false },
      triggerIcon: { description: 'Icon node for the iconButton trigger.' },
      'aria-label': { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. Colour is driven by appearance + the parent <Surface>.',
        'x-jds-suggestion': "Don't paint directly. Use `appearance` + <Surface>; the menu + rows resolve their own tokens.",
        'x-jds-severity': 'warn',
      },
    },
    required: ['options'],
  },

  tokens: {
    color: [
      'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg',
      'positive', 'negative', 'warning', 'informative',
    ],
    surface: ['default', 'subtle', 'elevated'],
    typography: ['label.M', 'label.S', 'body.S'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L'],
    shape: ['M', 'XL', 'pill'],
    elevation: [1],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'button',
    accessibilityState: ['disabled', 'expanded'],
    accessibleNameSource: 'aria-label', // aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-select-v4',
    keyHistory: [],
    variantProperties: { Component: 'Select' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'selection', 'dropdown', 'menu', 'interactive'],
} as const);
