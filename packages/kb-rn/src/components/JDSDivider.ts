/**
 * JDSDivider — RN knowledge entry for the Divider.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Divider/interface.ts`.
 *
 * CONTENT-SLOT CONTRACT (the reason this meta exists):
 * A Divider is a separator that may carry a single inline content node —
 * either a string (rendered as a `label.XS` label via useTypographyTokens) or
 * a JDS <Icon>. The renderer inspects the child type: string → label content,
 * a JDS <Icon> element → icon content, anything else → no content. The line
 * itself is `aria-hidden`; the wrapper exposes `role="separator"` +
 * `aria-orientation`. `appearance="auto"` → neutral; the line/strokes resolve
 * from `role.content.strokeLow` / `strokeMedium` against the parent <Surface>.
 */

import { defineComponent } from '../defineComponent';

export const JDSDivider = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Divider',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Horizontal or vertical separator with an optional inline label (string) or JDS <Icon>. Stroke weight scales with size; attention sets the stroke emphasis. Decorative line is aria-hidden; wrapper is role="separator". appearance="auto" → neutral.',

  propsSchema: {
    $id: 'jds.kb.rn.Divider',
    type: 'object',
    properties: {
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Drives stroke weight.' },
      contentAlign: { enum: ['center', 'start', 'end'], default: 'center', description: 'Placement of the inline content along the line.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Stroke colour role, resolved against the parent <Surface>. 'auto' → neutral.",
      },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'low',
        description: 'Stroke emphasis (high/medium/low) → content stroke token.',
      },
      roundCaps: { type: 'boolean', default: false, description: 'Pill-rounded line caps (tokens.shape.Pill).' },
      children: {
        description: 'Optional inline content. MUST be a string (→ label) or a JDS <Icon>. Other nodes render no content.',
        'x-jds-suggestion': 'Divider content is a string label or a JDS <Icon>. A bare <Svg> or arbitrary node is ignored by the content resolver.',
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    typography: ['label.XS'],
    shape: ['pill'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['Icon', '#string'],
        cardinality: 'optional',
        description: 'Inline label (string) or JDS <Icon>. No other node types are honoured.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'none', // wrapper exposes role="separator" + aria-orientation; line is aria-hidden
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-divider-v4',
    keyHistory: [],
    variantProperties: { Component: 'Divider' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['layout', 'separator', 'surface-aware'],
} as const);
