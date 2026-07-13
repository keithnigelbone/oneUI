/**
 * JDSSpinner — RN knowledge entry for the Spinner.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Spinner/interface.ts`.
 *
 * INDETERMINATE-ACTIVITY CONTRACT (the reason this meta exists):
 * Spinner is an SVG ring that rotates continuously to convey ongoing,
 * indeterminate activity (no progress value). It exposes
 * `accessibilityRole="progressbar"` + `accessibilityState.busy` +
 * `accessibilityLiveRegion="polite"`; the ring graphic is aria-hidden. Stroke
 * width is geometry-mapped per size (see SPINNER_SVG_STROKE_MAP); the arc
 * colour resolves from `role.content.tintedA11y` against the parent <Surface>.
 * It honours reduce-motion (the rotation is gated on useReduceMotion). For a
 * DETERMINATE value, use Progress / CircularProgressIndicator instead.
 */

import { defineComponent } from '../defineComponent';

export const JDSSpinner = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Spinner',
  importPath: '@oneui/ui-native',
  // GATED: implementation complete but not yet exported from the public barrel.
  // Mirrors GATED_COMPONENTS in packages/ui-native/scripts/copy-to-root-dist.mjs.
  status: 'planned',
  description:
    'Indeterminate loading indicator — a continuously rotating SVG ring. Ten t-shirt sizes (2XS…5XL) with geometry-mapped stroke widths. Honours reduce-motion. Announces via progressbar + busy + polite live region. Use Progress for a determinate value.',

  propsSchema: {
    $id: 'jds.kb.rn.Spinner',
    type: 'object',
    properties: {
      size: {
        enum: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
        default: 'M',
        description: 'Ring diameter; stroke width is derived per-size via SPINNER_SVG_STROKE_MAP.',
      },
      label: {
        type: 'string',
        description: 'Accessible name announced via the polite live region (e.g. "Loading…").',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    motion: ['motion.duration.expressive.long', 'motion.easing.transition'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'progressbar',
    accessibilityState: ['busy'],
    accessibleNameSource: 'aria-label', // `label` → accessibilityLabel
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-spinner-v4',
    keyHistory: [],
    variantProperties: { Component: 'Spinner' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['feedback', 'loading', 'indeterminate', 'surface-aware'],
} as const);
