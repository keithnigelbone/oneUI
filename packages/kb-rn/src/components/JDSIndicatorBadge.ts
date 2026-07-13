/**
 * JDSIndicatorBadge — RN knowledge entry for the IndicatorBadge.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/IndicatorBadge/interface.ts`.
 *
 * DOT + SLOT-APPEARANCE CONTRACT (the reason this meta exists):
 * IndicatorBadge is a contentless status DOT (no count, no label) — the
 * minimal "unread" affordance. Like CounterBadge, `appearance` resolution is
 * explicit-role → slot-owning parent (Badge/Button via SlotParentAppearanceContext)
 * → `primary`. It fills from `role.surfaces.bold` against the parent <Surface>.
 * It is hidden from assistive tech UNLESS an `aria-label` is provided (then it
 * exposes role="image"); use CounterBadge when a count needs announcing.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSIndicatorBadge = defineComponent({
  schemaVersion: '5.0.0',
  name: 'IndicatorBadge',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Contentless status dot ("unread" affordance). Five sizes. `appearance` inherits from a slot-owning parent (Badge/Button) when unset, else primary; fills from the bold surface. Hidden from assistive tech unless `aria-label` is set. Use CounterBadge for a count.',

  propsSchema: {
    $id: 'jds.kb.rn.IndicatorBadge',
    type: 'object',
    properties: {
      size: { enum: ['xs', 's', 'm', 'l', 'xl'], default: 'm' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role. When unset, inherits from a slot-owning parent (Badge/Button), else 'primary'.",
      },
      'aria-label': { type: 'string', description: 'When set, exposes role="image"; otherwise the dot is decorative (hidden).' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only — appearance + the parent <Surface> drive the fill.',
        'x-jds-suggestion': "Don't paint the dot; use `appearance`. In a parent slot, leave appearance unset to inherit.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image', // → 'none' (decorative) when no aria-label
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-indicator-badge-v4',
    keyHistory: [],
    variantProperties: { Component: 'IndicatorBadge' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'status', 'indicator', 'surface-aware'],
} as const);
