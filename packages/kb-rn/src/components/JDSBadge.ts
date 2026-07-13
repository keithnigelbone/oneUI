/**
 * JDSBadge — RN knowledge entry for the Badge.
 *
 * Mirrors the shared prop contract at
 * `packages/ui/src/components/Badge/Badge.shared.ts` (imported verbatim by
 * `@oneui/ui-native`'s `Badge.native.tsx`).
 *
 * SURFACE-CONTEXT CONTRACT (the reason this meta exists):
 * Badge has NO static palette. Its background, text, and (ghost) border are
 * resolved at render time from `useSurfaceTokens(appearance)` — the RN peer of
 * web's `[data-surface]` cascade — keyed by `variant`:
 *   bold   → bg role.surfaces.bold   / text role.onBoldContent.high
 *   subtle → bg role.surfaces.subtle / text role.onSubtleContent.tintedA11y
 *   ghost  → transparent + hairline role.content.strokeLow / text role.content.tintedA11y
 * Because it reads from the surface context, a Badge nested in a <Surface>
 * adapts automatically. Explicit `appearance` wins; otherwise Badge inherits
 * the nearest <Surface appearance>, with a root fallback to sparkle. Codegen
 * MUST drive colour through `variant` + `appearance` / Surface context — never
 * hardcode bg/text/border, or the badge stops adapting.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSBadge = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Badge',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Non-interactive status / notification chip. Three variants resolved against the current <Surface> via useSurfaceTokens — bold (filled), subtle (tinted), ghost (transparent + hairline). Optional start/end slots for icon / avatar / sub-badge. `attention` is the Figma alias (high→bold, medium→subtle, low→ghost).',

  propsSchema: {
    $id: 'jds.kb.rn.Badge',
    type: 'object',
    properties: {
      children: { type: 'string', description: 'Visible label text. Serves as the accessible name when present.' },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'high',
        description:
          'Public paint driver. Maps to an internal surface-resolved variant: high→bold (surfaces.bold + onBoldContent.high), medium→subtle (surfaces.subtle + onSubtleContent.tintedA11y), low→ghost (transparent + content.strokeLow border + content.tintedA11y text). There is no separate `variant` prop.',
      },
      size: { enum: ['xs', 's', 'm', 'l', 'xl'], default: 'm' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role filling the badge. Explicit roles win; unset/'auto' inherits the nearest <Surface appearance>; root fallback is sparkle.",
      },
      start: { description: 'Leading slot — Icon / Avatar / CounterBadge / IndicatorBadge.' },
      end: { description: 'Trailing slot — Icon / Avatar / CounterBadge / IndicatorBadge.' },
      'aria-label': { type: 'string', description: 'Recommended when the badge has no visible text content.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. attention + appearance + the parent <Surface> drive bg / text / border — do not paint here.',
        'x-jds-suggestion':
          "Badge colour is surface-resolved from `attention` + `appearance`. Don't set backgroundColor / borderColor; wrap in <Surface> and it adapts automatically.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['label.3XS', 'label.2XS', 'label.XS', 'label.S', 'label.M'],
    shape: ['6XS', '5XS', '4XS', '3XS'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      start: {
        accepts: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
        cardinality: 'optional',
        description: 'Content before the label.',
      },
      end: {
        accepts: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
        cardinality: 'optional',
        description: 'Content after the label.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'text',
    accessibleNameSource: 'children', // falls back to aria-label when there is no visible text
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-badge-v4',
    keyHistory: [],
    variantProperties: { Component: 'Badge' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'status', 'notification', 'surface-aware', 'inherits-appearance'],
} as const);
