/**
 * JDSText — typographic primitive. The KB entry that says "every text element
 * MUST declare role + size; raw fontSize / fontWeight literals are rejected."
 *
 * Maps to React Native's `<Text>` underneath, with brand-resolved typography
 * tokens via `useTypographyTokens(role, size, { emphasis })` from
 * `@oneui/ui-native/theme`.
 */

import { defineComponent } from '../defineComponent';

export const JDSText = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Text',
  importPath: '@oneui/ui-native',
  status: 'alpha',
  description:
    'Typographic primitive. Reads --{Role}-{Size}-FontSize / LineHeight / FontWeight via useTypographyTokens. Every text element in OneUI must be authored through this component, not a raw <Text>.',

  propsSchema: {
    $id: 'jds.kb.rn.Text',
    type: 'object',
    properties: {
      // Implementation prop is `variant` (was incorrectly published as `role`).
      variant: {
        enum: ['display', 'headline', 'title', 'body', 'label', 'code'],
      },
      size: {
        description: 'Variant-scoped size. Validator enforces the per-variant subset.',
        oneOf: [
          { enum: ['L', 'M', 'S'] },
          { enum: ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS'] },
          { enum: ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS', '3XS'] },
        ],
      },
      // Implementation prop is `weight` (was incorrectly published as `emphasis`).
      weight: {
        enum: ['high', 'medium', 'low'],
        default: 'medium',
        description: 'Only valid for variant ∈ {body, label, code}. Ignored otherwise (code coerces to medium).',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
      },
      // Implementation prop is `attention` (was incorrectly published as `contentSlot`).
      // Note: no `tinted` value on Text — the content-slot enum here is TextAttention.
      attention: {
        enum: ['high', 'medium', 'low', 'tintedA11y'],
        default: 'medium',
        description: 'Content token slot. Resolves to --{Role}-{Attention} or --{Role}-Bold-{Attention} inside a bold Surface.',
      },
      // Implementation prop is `maxLines` (maps internally to RN `numberOfLines`).
      maxLines: { type: 'integer', minimum: 1 },
      children: { description: 'String or interpolated string nodes only.' },

      // Forbidden direct paint / sizing.
      fontSize: {
        not: {},
        'x-jds-suggestion': 'Use `role` + `size` instead of fontSize. Raw font sizes break the brand cascade.',
        'x-jds-severity': 'error',
      },
      fontWeight: {
        not: {},
        'x-jds-suggestion': 'Use `weight` (body/label/code variants) instead of fontWeight.',
        'x-jds-severity': 'error',
      },
      color: {
        type: 'string',
        not: { anyOf: [{ pattern: '^#' }, { pattern: '^rgba?\\(' }, { pattern: '^oklch\\(' }] },
        'x-jds-suggestion': 'Use `appearance` + `attention` (e.g. appearance="primary" attention="high"). Surface context handles dark / tinted backgrounds automatically.',
        'x-jds-severity': 'error',
      },
    },
    required: ['variant', 'size', 'children'],
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    typography: [
      'display.L', 'display.M', 'display.S',
      'headline.L', 'headline.M', 'headline.S',
      'title.L', 'title.M', 'title.S',
      'body.2XL', 'body.XL', 'body.L', 'body.M', 'body.S', 'body.XS', 'body.2XS',
      'label.2XL', 'label.XL', 'label.L', 'label.M', 'label.S', 'label.XS', 'label.2XS', 'label.3XS',
      'code.M', 'code.S', 'code.XS',
    ],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'text',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-text-v4',
    keyHistory: [],
  },

  renderHints: {
    baseElement: 'Text',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['typography', 'chassis'],
} as const);
