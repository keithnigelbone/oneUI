/**
 * JDSRadio — RN knowledge entry for the Radio.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Radio/interface.ts`.
 *
 * STANDALONE-LEAF CONTRACT (the reason this meta exists):
 * Radio is a self-contained controlled/uncontrolled toggle. Single-selection
 * across multiple options is the PARENT's responsibility — there is no native
 * <RadioGroup> peer; `RadioField` pushes a controlled `checked` + `onChange`
 * to each child Radio. Codegen MUST NOT emit a bare list of Radios and expect
 * mutual exclusion — wrap them in RadioField (or manage `checked` upstream).
 *
 * APPEARANCE: like Checkbox, `appearance="auto"` resolves to the **secondary**
 * stack; the checked dot fills from `role.surfaces.bold`, the ring border from
 * `role.content.strokeMedium`, both resolved against the parent <Surface>.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSRadio = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Radio',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Single-selection control (leaf). Controlled via `checked` / uncontrolled via `defaultChecked`; mutual exclusion is owned by the parent (RadioField). `appearance="auto"` → secondary stack; dot + ring resolve against the parent <Surface>.',

  propsSchema: {
    $id: 'jds.kb.rn.Radio',
    type: 'object',
    properties: {
      value: { type: 'string', description: 'Option identifier read by RadioField to map the selected value.' },
      label: { type: 'string', description: 'Visible label; takes precedence over children. Becomes the accessible name.' },
      description: { type: 'string', description: 'Plain-text supplementary copy below the label row.' },
      children: { description: 'Option label when `label` is omitted.' },
      checked: { type: 'boolean', description: 'Checked state (controlled).' },
      defaultChecked: { type: 'boolean', default: false, description: 'Initial checked state (uncontrolled).' },
      onChange: { description: 'Called when a press would change the checked state (intended next value).' },
      onPress: { description: 'Raw press handler — fires before onChange.' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role for ring + dot, resolved against the parent <Surface>. 'auto' → secondary.",
      },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false, description: 'Focusable but cannot be toggled.' },
      errorHighlight: { type: 'boolean', default: false },
      'aria-label': { type: 'string' },
      'aria-describedby': { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. Paint is driven by appearance + the parent <Surface>.',
        'x-jds-suggestion': "Don't paint the Radio. Use `appearance`; the surface cascade resolves ring + dot.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold'],
    typography: ['label.S', 'label.M', 'label.L'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'radio',
    accessibilityState: ['selected', 'disabled'],
    accessibleNameSource: 'aria-label', // accessibilityLabel ?? aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-radio-v4',
    keyHistory: [],
    variantProperties: { Component: 'Radio' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'selection', 'control', 'surface-aware'],
} as const);
