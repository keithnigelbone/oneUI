/**
 * JDSLinkButton — RN knowledge entry for the LinkButton.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/LinkButton/interface.ts`. Shares the
 * button-family state base (`resolveButtonStateBase` / `BUTTON_ATTENTION_TO_VARIANT`)
 * with Button + IconButton, so variant / appearance / attention are identical.
 *
 * LINK-ROLE + UNCONTAINED CONTRACT (the reason this meta exists):
 * LinkButton renders as inline text styled like a link — NO surface fill. It
 * exposes `accessibilityRole="link"` (not "button"). Colour comes from
 * `role.content.high` / `tintedA11y` with `role.states.hover` / `pressed`
 * resolved against the parent <Surface>; there are no `role.surfaces.*` reads.
 * `showUnderline` toggles the underline affordance. Use Button for a filled
 * CTA, IconButton for icon-only.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSLinkButton = defineComponent({
  schemaVersion: '5.0.0',
  name: 'LinkButton',
  importPath: '@oneui/ui-native',
  // GATED: implementation complete but not yet exported from the public barrel.
  // Mirrors GATED_COMPONENTS in packages/ui-native/scripts/copy-to-root-dist.mjs.
  status: 'planned',
  description:
    'Inline text link with button-family semantics. role="link", no surface fill — colour + hover/pressed states resolve against the parent <Surface>. Four f-step sizes (6/8/10/12), optional start/end slots, optional underline. Use Button for a filled CTA.',

  propsSchema: {
    $id: 'jds.kb.rn.LinkButton',
    type: 'object',
    properties: {
      children: { description: 'Link label. String children become the accessible name.' },
      variant: { enum: ['bold', 'subtle', 'ghost'], default: 'bold' },
      attention: { enum: ['high', 'medium', 'low'], description: 'Figma alias → variant (high→bold, medium→subtle, low→ghost).' },
      size: { enum: [6, 8, 10, 12], default: 10, description: 'f-step numeric size; t-shirt aliases (xs/s/m/l) canonicalise to these.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: 'Multi-accent role resolved against the parent <Surface>.',
      },
      start: { description: 'Leading slot — typically a JDS <Icon>.' },
      end: { description: 'Trailing slot — typically a JDS <Icon>.' },
      showUnderline: { type: 'boolean', default: true, description: 'Toggles the underline affordance.' },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false, description: 'Sets accessibilityState.busy.' },
      onPress: { description: 'RN press handler.' },
      'aria-label': { type: 'string' },
      color: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. Colour is driven by appearance + the parent <Surface>.',
        'x-jds-suggestion': "Don't paint the link. Use `appearance`; content + state tokens resolve against the surface.",
        'x-jds-severity': 'warn',
      },
    },
    required: ['children'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    typography: ['label.S', 'label.M', 'label.L'],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      start: { accepts: ['Icon'], cardinality: 'optional', description: 'Leading icon.' },
      end: { accepts: ['Icon'], cardinality: 'optional', description: 'Trailing icon.' },
    },
  },

  a11y: {
    accessibilityRole: 'link',
    accessibilityState: ['disabled', 'busy'],
    accessibleNameSource: 'children', // aria-label ?? string children
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-link-button-v4',
    keyHistory: [],
    variantProperties: { Component: 'LinkButton' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['cta', 'link', 'action', 'interactive'],
} as const);
