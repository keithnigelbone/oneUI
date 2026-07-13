/**
 * JDSInputFeedback — RN knowledge entry for the InputFeedback row.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/InputFeedback/interface.ts`.
 *
 * VALIDATION-ROW CONTRACT (the reason this meta exists):
 * The contextual feedback / validation row under an input. Three orthogonal axes:
 *   variant   → semantic colour role (negative | positive | warning | informative)
 *   attention → prominence (low = text only, medium = tinted, high = filled fill
 *               from role.surfaces.subtle / bold against the parent <Surface>)
 *   size      → s | m | l
 * `variant="negative"` announces as an `alert` (assertive live region); the
 * others announce as `status` (polite). `customIcon` must be a JDS <Icon> /
 * RN-SVG component (no semantic-name catalogue on native). Empty message → the
 * row renders nothing. Usually consumed via InputField's `feedback` slot.
 */

import { defineComponent } from '../defineComponent';

export const JDSInputFeedback = defineComponent({
  schemaVersion: '5.0.0',
  name: 'InputFeedback',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Validation / feedback row under an input. variant = semantic role, attention = low(text)/medium(tint)/high(fill), size s/m/l. Negative announces as assertive alert; others as polite status. customIcon overrides the variant-default icon. Empty message renders nothing.',

  propsSchema: {
    $id: 'jds.kb.rn.InputFeedback',
    type: 'object',
    properties: {
      variant: { enum: ['negative', 'positive', 'warning', 'informative'], default: 'negative', description: 'Semantic colour role + default icon.' },
      attention: { enum: ['low', 'medium', 'high'], default: 'low', description: 'low = text only, medium = tinted, high = filled.' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      feedback_message: { type: 'string', description: 'Primary copy. Falls back to `children` when omitted.' },
      customIcon: {
        description: 'Overrides the variant-default icon. MUST be a JDS <Icon> / RN-SVG component.',
        'x-jds-suggestion': 'Pass a JDS <Icon> component; native has no semantic icon-name catalogue.',
        'x-jds-severity': 'warn',
      },
      children: { description: 'Rich content when feedback_message is not set.' },
      role: { enum: ['alert', 'status', 'none'], description: "Overrides the default role ('alert' for negative, 'status' otherwise)." },
      'aria-label': { type: 'string', description: 'Accessible name override; falls back to the message.' },
      'aria-describedby': { type: 'string' },
    },
  },

  tokens: {
    color: ['negative', 'positive', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['body.S', 'body.M', 'body.L'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      customIcon: { accepts: ['Icon'], cardinality: 'optional', description: 'Leading icon — overrides the variant default.' },
    },
  },

  a11y: {
    accessibilityRole: 'text', // negative maps to RN 'alert'; 'status' is conveyed via the live region
    accessibleNameSource: 'children', // feedback_message ?? children, or aria-label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-input-feedback-v4',
    keyHistory: [],
    variantProperties: { Component: 'InputFeedback' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'feedback', 'validation', 'surface-aware'],
} as const);
