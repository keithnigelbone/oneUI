/**
 * JDSCheckbox — RN knowledge entry for the Checkbox.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Checkbox/interface.ts`
 * (the native-owned peer of `packages/ui/src/components/Checkbox/Checkbox.shared.ts`).
 *
 * APPEARANCE CONTRACT (the reason this meta exists):
 * `appearance` drives BOTH the unchecked chrome (border, hover) and the
 * checked-state fill, resolved against the parent <Surface> — checked paints
 * from `role.surfaces.bold`, unchecked border from `role.content.strokeMedium`.
 * `appearance="auto"` (or unset) resolves to the **secondary** stack, NOT
 * primary. Codegen MUST drive colour through `appearance`; the legacy `accent`
 * prop is accepted for Layers parity but ignored at runtime.
 *
 * STATE MODEL: tri-state — `selected` / `defaultSelected` + `indeterminate`
 * (mixed). `indeterminate` wins over selected. Read-only is visually distinct
 * from disabled (solid dark fill) and stays in the a11y tree.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSCheckbox = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Checkbox',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Selection control with tri-state support (selected / indeterminate / unselected). `appearance` drives both unchecked border and checked fill via the parent <Surface>; auto resolves to the secondary stack. Read-only is distinct from disabled. For multi-option label stacks use CheckboxField.',

  propsSchema: {
    $id: 'jds.kb.rn.Checkbox',
    type: 'object',
    properties: {
      label: { type: 'string', description: 'Visible label beside the control. Becomes the accessible name when no aria-label is set.' },
      description: { type: 'string', description: 'Supplementary copy below the label row (plain text only).' },
      selected: { type: 'boolean', description: 'Checked state (controlled).' },
      defaultSelected: { type: 'boolean', default: false, description: 'Initial checked state (uncontrolled).' },
      indeterminate: { type: 'boolean', default: false, description: 'Mixed state — wins over selected; maps to accessibilityState.checked="mixed".' },
      onSelectedChange: { description: 'Fires with the next selected value on press.' },
      onPress: { description: 'Raw RN press handler (alias toggle).' },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Legacy small/medium/large aliases canonicalise to s/m/l.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role for border + checked fill, resolved against the parent <Surface>. 'auto' → secondary.",
      },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false, description: 'Non-toggleable but distinct from disabled (solid dark fill).' },
      errorHighlight: { type: 'boolean', default: false, description: 'Invalid chrome on the wrapper.' },
      value: { type: 'string', description: 'Option identifier read by CheckboxField to map selection keys.' },
      'aria-label': { type: 'string', description: 'Accessible name when there is no visible label.' },
      'aria-describedby': { type: 'string' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. backgroundColor / borderColor are forbidden — appearance + surface drive the fill.',
        'x-jds-suggestion': "Don't paint the Checkbox. Use `appearance`; the surface cascade resolves border + checked fill.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['default', 'bold'],
    typography: ['label.S', 'label.M', 'label.L'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'checkbox',
    accessibilityState: ['checked', 'disabled'],
    accessibleNameSource: 'aria-label', // aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-checkbox-v4',
    keyHistory: [],
    variantProperties: { Component: 'Checkbox' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'selection', 'control', 'surface-aware'],
} as const);
