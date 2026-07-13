/**
 * JDSSingleTextButton — RN knowledge entry for SingleTextButton.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/SingleTextButton/interface.ts`, which
 * itself mirrors the web shared contract at
 * `packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts`.
 *
 * Circular, non-toggle action button carrying a max-2-character text label
 * (e.g. "Ag", "En", "12"). `attention` drives the full visual — high→bold,
 * medium→subtle, low→ghost — resolved at render time via
 * `useSurfaceTokens(appearance)`, so it adapts automatically inside a
 * `<Surface>`. No separate `variant` prop exists at the public API boundary.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSSingleTextButton = defineComponent({
  schemaVersion: '5.0.0',
  name: 'SingleTextButton',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Circular single-text action button (max 2 characters). `attention` (high/medium/low) drives the full visual via surface-resolved bold/subtle/ghost variants. Supports `condensed` and `fullWidth` layout, `loading` (busy, non-disabled) and `disabled` states. Not a toggle — use IconButton/Chip for selection state.',

  propsSchema: {
    $id: 'jds.kb.rn.SingleTextButton',
    type: 'object',
    required: ['children'],
    properties: {
      children: {
        type: 'string',
        description: 'Visible label — max 2 characters (e.g. "Ag", "En", "A", "12"). Longer text is truncated in dev with a warning.',
      },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Button size. S/M/L only — no XS.' },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'high',
        description: 'Figma attention alias. high→bold fill + on-bold text, medium→subtle fill + accent text, low→ghost (transparent) + accent text.',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role. Widens the canonical 9-role set with 'tertiary'/'quaternary' for web parity. Explicit non-'auto' wins; otherwise inherits the nearest <Surface appearance>, falling back to 'primary'.",
      },
      condensed: { type: 'boolean', description: 'Reduces height/padding while keeping the same typography.' },
      fullWidth: { type: 'boolean', description: 'Stretch to fill container width — overrides the circular shape.' },
      disabled: { type: 'boolean', default: false },
      loading: {
        type: 'boolean',
        default: false,
        description: 'Shows a circular spinner replacing the label and marks the control busy (aria-busy / accessibilityState.busy). Activation is suppressed while busy but the control is not visually disabled unless `disabled` is also set.',
      },
      onPress: { description: 'Press handler (React Native convention).' },
      onClick: { description: 'Web parity alias for onPress.' },
      'aria-label': { type: 'string', description: 'Accessible label override — children text is visible so this is optional.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. attention + appearance + the parent <Surface> drive bg / text — do not paint here.',
        'x-jds-suggestion':
          "SingleTextButton colour is surface-resolved from `attention` + `appearance`. Don't set backgroundColor; wrap in <Surface> and it adapts automatically.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle', 'ghost'],
    typography: ['label.S', 'label.M', 'label.L'],
    shape: ['pill'],
    motion: ['motion.duration.expressive.long'],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'button',
    accessibleNameSource: 'children', // falls back to aria-label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-single-text-button-v4',
    keyHistory: [],
    variantProperties: { Component: 'SingleTextButton' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['action', 'button', 'circular', 'surface-aware', 'inherits-appearance'],
} as const);
