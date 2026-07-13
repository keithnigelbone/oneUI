/**
 * JDSIconButton — RN knowledge entry for the IconButton.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/IconButton/interface.ts`. Shares the
 * button-family state base (`resolveButtonStateBase` / `BUTTON_ATTENTION_TO_VARIANT`)
 * with Button, so variant / appearance / attention semantics are identical.
 *
 * ICON-ONLY + ACCESSIBLE-NAME CONTRACT (the reason this meta exists):
 * IconButton has no text label, so `aria-label` is REQUIRED — it is the only
 * accessible name. The `icon` prop accepts a SemanticIconName string, a JDS
 * <Icon> element, or an IconComponent; codegen should pass a registry icon
 * name or a JDS <Icon>, never a raw <Svg>. Numeric f-step sizes {4,6,8,10,12,14}
 * (t-shirt aliases canonicalise to these). Surface-resolved paint by `variant`:
 * bold → role.surfaces.bold, subtle → role.surfaces.subtle, ghost → transparent.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSIconButton = defineComponent({
  schemaVersion: '5.0.0',
  name: 'IconButton',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Icon-only call-to-action sharing the Button family state model. Three variants (bold / subtle / ghost), 9 appearances + auto, six f-step sizes (4/6/8/10/12/14). `aria-label` is mandatory — it is the sole accessible name. Adapts on coloured surfaces via the parent <Surface> cascade.',

  propsSchema: {
    $id: 'jds.kb.rn.IconButton',
    type: 'object',
    properties: {
      icon: {
        description: 'SemanticIconName string, a JDS <Icon> element, or an IconComponent. Never a raw <Svg>.',
        'x-jds-suggestion': 'Pass an icon registry name (e.g. icon="close") or a JDS <Icon>; a bare <Svg> ignores the surface-resolved colour + size.',
        'x-jds-severity': 'warn',
      },
      variant: { enum: ['bold', 'subtle', 'ghost'], default: 'bold' },
      attention: { enum: ['high', 'medium', 'low'], default: 'high', description: 'Figma alias → variant (high→bold, medium→subtle, low→ghost).' },
      size: { enum: [4, 6, 8, 10, 12, 14], default: 10, description: 'f-step numeric size; t-shirt aliases (2xs…xl) canonicalise to these.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: 'Multi-accent role resolved against the parent <Surface>.',
      },
      contained: { type: 'boolean', default: true, description: 'When false, renders the bare icon (no chip / background); condensed / layout / fullWidth are ignored.' },
      condensed: { type: 'boolean', default: false, description: 'Reduces padding. Only when contained=true.' },
      layout: { enum: ['1:1', '3:2'], default: '1:1', description: 'Aspect ratio of the hit area. Only when contained=true.' },
      fullWidth: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false, description: 'Swaps the icon for a spinner; sets accessibilityState.busy.' },
      onPress: { description: 'RN press handler.' },
      'aria-label': { type: 'string', description: 'REQUIRED — the only accessible name for this icon-only control.' },
      'aria-expanded': { type: 'boolean' },
      'aria-haspopup': { description: 'boolean or one of dialog / grid / listbox / menu / tree.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. Painting via style is rejected — variant + appearance + surface drive the fill.',
        'x-jds-suggestion': 'Use the appearance + surface system; inline paint defeats the brand cascade.',
        'x-jds-severity': 'warn',
      },
    },
    required: ['icon', 'aria-label'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    shape: ['pill', '3XS', '2XS', 'XS', 'S', 'M'],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'button',
    accessibilityState: ['disabled', 'busy', 'expanded'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-icon-button-v4',
    keyHistory: [],
    variantProperties: { Component: 'IconButton' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['cta', 'action', 'interactive', 'icon-only'],
} as const);
