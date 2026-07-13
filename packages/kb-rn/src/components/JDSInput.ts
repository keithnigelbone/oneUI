/**
 * JDSInput — labelled text input. Surfaces label / helper / error text in the
 * canonical positions and wires accessibility roles to the field.
 *
 * Maps to `@oneui/ui-native/components/Input` (when present) — falls back to
 * the upstream Input package shape on web.
 *
 * 4-slot icon/adornment system (`../../ui-native/src/components/Input/interface.ts`):
 * `start`/`start2` (leading) and `end`/`end2` (trailing) each accept a ReactNode
 * (typically `<Icon>`, `<IconButton>`, or `<Text>` for a prefix/suffix). A leading
 * search icon or a trailing clear button belong in these slots, not as children.
 */

import {
  FORBIDDEN_COLOR_LITERAL,
  INPUT_SHARED_PROPS,
} from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSInput = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Input',
  importPath: '@oneui/ui-native',
  status: 'alpha',
  description:
    'Labelled text input. Pairs a single-line field with structured label / helper / error text rendered via Text role tokens.',

  propsSchema: {
    $id: 'jds.kb.rn.Input',
    type: 'object',
    properties: {
      ...INPUT_SHARED_PROPS,
      autoCapitalize: { enum: ['none', 'sentences', 'words', 'characters'] },
      autoCorrect: { type: 'boolean' },
      keyboardType: {
        enum: ['default', 'email-address', 'numeric', 'phone-pad', 'decimal-pad', 'url'],
        description: 'RN keyboardType — drives soft-keyboard layout.',
      },
      secureTextEntry: { type: 'boolean', default: false },
      onChangeText: { description: 'Text-change callback.' },
      start: { description: 'Leading adornment slot — typically <Icon> or <IconButton> (e.g. a search glyph).' },
      start2: { description: 'Second leading slot — typically Text (prefix, currency symbol).' },
      end: { description: 'Trailing adornment slot — typically <Icon> or <IconButton> (e.g. a clear button).' },
      end2: { description: 'Second trailing slot — Text, Icon, or IconButton.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
  },

  tokens: {
    color: ['neutral', 'primary', 'negative', 'positive', 'warning'],
    surface: ['subtle', 'moderate', 'bold'],
    typography: ['body.M', 'body.L', 'label.S', 'label.XS'],
    spacing: ['3XS', '2XS', 'XS', 'S', 'M'],
    shape: ['XS', 'S', 'M'],
    motion: ['motion.duration.discreet.short'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'text',
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-input-v4',
    keyHistory: [],
    variantProperties: { Component: 'Input' },
  },

  renderHints: {
    baseElement: 'TextInput',
    animatedOn: ['focus'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['input', 'form', 'chassis'],
} as const);
