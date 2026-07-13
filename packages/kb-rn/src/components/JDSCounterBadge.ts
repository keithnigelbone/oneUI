/**
 * JDSCounterBadge — RN knowledge entry for the CounterBadge.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/CounterBadge/interface.ts`.
 *
 * COUNT-OVERFLOW + SLOT-APPEARANCE CONTRACT (the reason this meta exists):
 *   - Displays a numeric `value`; `value > max` renders as `${max}+` (default
 *     max 99). `value <= 0` is HIDDEN unless `showZero` (negative always hidden).
 *   - `appearance` resolution: explicit role wins, else it INHERITS from a
 *     slot-owning parent (Badge / Button / Avatar via SlotParentAppearanceContext),
 *     else `primary`. So a CounterBadge dropped into a Badge's `end` slot picks
 *     up the Badge's role automatically — don't hardcode appearance there.
 * Surface-resolved by `variant` (bold/subtle/ghost) against the parent <Surface>.
 * Announces value changes via a polite live region.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSCounterBadge = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CounterBadge',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Numeric count badge (e.g. notification count). Overflows to `${max}+` (default 99); hidden at 0 unless showZero. Three surface-resolved variants. `appearance` inherits from a slot-owning parent (Badge/Button) when not set, else primary. Announces via a polite live region.',

  propsSchema: {
    $id: 'jds.kb.rn.CounterBadge',
    type: 'object',
    properties: {
      value: { type: 'number', description: 'Count to display. <=0 hidden unless showZero; > max renders as `${max}+`.' },
      max: { type: 'number', default: 99, description: 'Overflow cap.' },
      showZero: { type: 'boolean', default: false },
      size: { enum: ['xs', 's', 'm', 'l'], default: 'm' },
      variant: { enum: ['bold', 'subtle', 'ghost'], default: 'bold', description: 'Surface-resolved paint.' },
      attention: { enum: ['high', 'medium', 'low'], default: 'high', description: 'Figma alias → variant (default high → bold).' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role. When unset, inherits from a slot-owning parent (Badge/Button), else 'primary'.",
      },
      'aria-label': { type: 'string', description: 'Overrides the count as the accessible name.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only — variant + appearance + the parent <Surface> drive the fill.',
        'x-jds-suggestion': "Don't paint the CounterBadge; use `variant` + `appearance`. In a parent slot, leave appearance unset to inherit.",
        'x-jds-severity': 'warn',
      },
    },
    required: ['value'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['label.3XS', 'label.2XS', 'label.XS', 'label.S'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'text',
    accessibleNameSource: 'children', // aria-label ?? displayed count
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-counter-badge-v4',
    keyHistory: [],
    variantProperties: { Component: 'CounterBadge' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'status', 'notification', 'count', 'surface-aware'],
} as const);
