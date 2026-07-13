/**
 * JDSButton — RN knowledge entry for the canonical Button.
 *
 * Mirrors the prop contract at
 * `/Users/.../packages/ui/src/components/Button/Button.shared.ts`
 * (which `@oneui/ui-native`'s `Button.native.tsx` imports verbatim).
 *
 * Uses the shared fragment pattern from @jds/kb-core/schemas to keep
 * variant / appearance / disabled / loading / forbidden-pattern blocks in
 * lockstep with kb-web + future kb-ios / kb-android.
 */

import {
  BUTTON_REQUIRED_ONE_OF,
  BUTTON_SHARED_PROPS,
  FORBIDDEN_COLOR_LITERAL,
} from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSButton = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Button',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Primary call-to-action. Three variants (bold / subtle / ghost), 9 multi-accent appearances + auto, four sizes (6/8/10/12). Adapts on coloured surfaces via the parent <Surface> cascade.',

  propsSchema: {
    $id: 'jds.kb.rn.Button',
    type: 'object',
    properties: {
      ...BUTTON_SHARED_PROPS,
      // Button-local attention default (shared ATTENTION_ENUM intentionally has none).
      attention: { enum: ['high', 'medium', 'low'], default: 'high' },
      // RN-specific size enum (f-step numeric vs web's t-shirt aliases)
      size: { enum: [6, 8, 10, 12], default: 10 },
      condensed: {
        type: 'boolean',
        default: false,
        description: 'Reduces height + horizontal padding. Ignored when contained=false.',
      },
      contained: { type: 'boolean', default: true, description: 'When false, renders as an uncontained text-style button.' },
      start: { description: 'ReactNode rendered before the label. SemanticIconName strings warn at dev time.' },
      end: { description: 'ReactNode rendered after the label.' },
      onPress: { description: 'RN press handler.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Inline style allowed only for layout. Painting via style.backgroundColor / borderColor is rejected.',
        'x-jds-suggestion': 'Use the appearance + surface system. Inline paint defeats brand cascade and Surface context.',
        'x-jds-severity': 'warn',
      },
    },
    required: ['children'],
    oneOf: [...BUTTON_REQUIRED_ONE_OF],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle', 'ghost'],
    typography: ['label.XS', 'label.S', 'label.M', 'label.L'],
    spacing: ['6XS', '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    shape: ['pill', '3XS', '2XS', 'XS', 'S', 'M'],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'button',
    accessibilityState: ['disabled', 'busy'],
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-button-v4',
    keyHistory: [],
    variantProperties: { Component: 'Button' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['cta', 'action', 'interactive'],
} as const);
