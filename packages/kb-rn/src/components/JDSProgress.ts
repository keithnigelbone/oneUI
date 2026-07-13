/**
 * JDSProgress — RN knowledge entry for the linear Progress bar.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Progress/interface.ts`.
 *
 * DETERMINATE-vs-INDETERMINATE CONTRACT (the reason this meta exists):
 * Omitting `value` (undefined/null) puts the bar in INDETERMINATE mode — it
 * animates continuously and announces `accessibilityState.busy=true` with no
 * `accessibilityValue`. Passing a `value` makes it DETERMINATE and exposes
 * `accessibilityValue {min,max,now}`. The track fills from `role.surfaces.bold`
 * over a `role.surfaces.subtle` rail, resolved against the parent <Surface>.
 * There is NO `appearance` prop — Progress is single-role. For a circular form
 * use CircularProgressIndicator.
 */

import { defineComponent } from '../defineComponent';

export const JDSProgress = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Progress',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Linear progress bar. Determinate when `value` is set (exposes accessibilityValue); indeterminate (busy, animated) when `value` is omitted. Three sizes (small / medium / large). Honours reduce-motion. No appearance prop — single-role fill over a subtle rail.',

  propsSchema: {
    $id: 'jds.kb.rn.Progress',
    type: 'object',
    properties: {
      value: { type: 'number', description: 'Current value. Omit for indeterminate (busy) mode.' },
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      size: { enum: ['small', 'medium', 'large'], default: 'medium' },
      'aria-label': { type: 'string', description: 'Accessible name for the progress bar.' },
      'aria-labelledby': { type: 'string' },
    },
  },

  tokens: {
    color: ['primary'],
    surface: ['bold', 'subtle'],
    motion: ['motion.duration.expressive.long', 'motion.easing.transition'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'progressbar',
    accessibilityState: ['busy'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-progress-v4',
    keyHistory: [],
    variantProperties: { Component: 'Progress' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['feedback', 'progress', 'surface-aware'],
} as const);
