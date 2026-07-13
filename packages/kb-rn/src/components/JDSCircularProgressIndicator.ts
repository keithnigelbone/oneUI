/**
 * JDSCircularProgressIndicator — RN knowledge entry for the circular progress
 * indicator (CPI).
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/CircularProgressIndicator/interface.ts`
 * (semantic source `CircularProgressIndicator.shared.ts`).
 *
 * VARIANT + CENTER-CONTENT CONTRACT (the reason this meta exists):
 *   - `variant="determinate"` requires `value`; omitting it coerces to
 *     indeterminate (busy spin) — web parity.
 *   - `content="text"` renders the auto percentage ONLY at size L and above
 *     (Figma); below L the ring renders alone.
 *   - `content="icon"` renders `children` (must be a JDS <Icon>) at every size.
 * `appearance="auto"` → primary. The arc resolves from `role.surfaces.bold`
 * over a `role.surfaces.subtle` track; the centre label/icon from
 * `role.content.tintedA11y`, all against the parent <Surface>.
 */

import { defineComponent } from '../defineComponent';

export const JDSCircularProgressIndicator = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CircularProgressIndicator',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Circular progress ring. Determinate (arc ∝ value) or indeterminate (spin). Ten t-shirt sizes (2XS…5XL); optional centre content — auto percentage (text, L+ only) or a JDS <Icon>. appearance="auto" → primary. Honours reduce-motion.',

  propsSchema: {
    $id: 'jds.kb.rn.CircularProgressIndicator',
    type: 'object',
    properties: {
      variant: { enum: ['determinate', 'indeterminate'], default: 'determinate', description: 'determinate requires `value`; missing value coerces to indeterminate.' },
      size: { enum: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'], default: 'M' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role resolved against the parent <Surface>. 'auto' → primary.",
      },
      content: { enum: ['none', 'icon', 'text'], default: 'none', description: 'text = auto percentage (L+ only); icon = `children` (a JDS <Icon>) at all sizes.' },
      value: { type: 'number', description: 'Required for determinate; clamped to [min, max].' },
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      children: {
        description: 'Centre icon node when content="icon". MUST be a JDS <Icon>.',
        'x-jds-suggestion': 'Use a JDS <Icon> for the centre slot; a bare <Svg> ignores the surface-resolved colour + size.',
        'x-jds-severity': 'warn',
      },
      animate: { type: 'boolean', default: false, description: 'Opt-in entry/exit animation; pair with `show`.' },
      show: { type: 'boolean', default: true, description: 'Controlled visibility when `animate` is true.' },
      valueTransitionDuration: { type: 'number', description: 'ms override for the determinate value transition. 0 = instant (continuous-tracking pattern).' },
      'aria-label': { type: 'string' },
      'aria-labelledby': { type: 'string' },
      'aria-live': { enum: ['off', 'polite', 'assertive'] },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['label.S', 'label.M', 'label.L'],
    shape: ['pill'],
    motion: ['motion.duration.expressive.long', 'motion.easing.transition'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['Icon'],
        cardinality: 'optional',
        description: 'Centre icon node (content="icon"). Must be a JDS <Icon>.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'progressbar',
    accessibilityState: ['busy'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-circular-progress-indicator-v4',
    keyHistory: [],
    variantProperties: { Component: 'CircularProgressIndicator' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['feedback', 'progress', 'circular', 'surface-aware'],
} as const);
