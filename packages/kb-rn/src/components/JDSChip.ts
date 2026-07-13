/**
 * JDSChip — RN knowledge entry for the Chip.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Chip/interface.ts`
 * (semantic source `packages/ui/src/components/Chip/Chip.shared.ts`).
 *
 * GROUP-CONTEXT + SURFACE CONTRACT (the reason this meta exists):
 * A Chip reads `useChipGroupContext()` — a parent <ChipGroup> can push
 * `size` / `variant` / `appearance` / `disabled` down, and the chip's own
 * props override per-chip. Colour is surface-resolved by `variant`:
 *   bold   → role.surfaces.bold + role.onBoldContent.high
 *   subtle → role.surfaces.subtle + role.content.tintedA11y
 *   ghost  → transparent + role.content.tintedA11y
 * `attention` (high/medium/low) is the Figma alias → variant. Default variant
 * is `ghost`. `appearance="auto"` → secondary. Pill shape (tokens.shape.Pill).
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSChip = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Chip',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Interactive selection / filter pill. Three surface-resolved variants (bold / subtle / ghost) inheritable from a parent <ChipGroup>. `attention` is the Figma alias (high→bold, medium→subtle, low→ghost). Selectable (toggle) with optional start/end slots. appearance="auto" → secondary; pill-shaped.',

  propsSchema: {
    $id: 'jds.kb.rn.Chip',
    type: 'object',
    properties: {
      children: { description: 'Label content. String children become the accessible name.' },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Inherited from <ChipGroup> when unset.' },
      variant: {
        enum: ['bold', 'subtle', 'ghost'],
        default: 'ghost',
        description: 'Surface-resolved paint. Inherited from <ChipGroup>; per-chip prop wins.',
      },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'low',
        description: 'Figma alias → variant (high→bold, medium→subtle, low→ghost). Used when `variant` is unset; default low → ghost.',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role, resolved against the parent <Surface>. Inherited from <ChipGroup>. Explicit prop wins; unset/'auto' resolves to secondary (or the nearest <Surface appearance>).",
      },
      selected: { type: 'boolean', description: 'Selected state (controlled).' },
      defaultSelected: { type: 'boolean', default: false },
      onSelectedChange: { description: 'Fires with the next selected value on press.' },
      value: { type: 'string', description: 'Identifier read by <ChipGroup> for selection mapping.' },
      disabled: { type: 'boolean', default: false, description: 'Inherited from <ChipGroup> when set.' },
      start: { description: 'Leading slot — Icon / Avatar.' },
      end: { description: 'Trailing slot — Icon (e.g. a dismiss affordance).' },
      'aria-label': { type: 'string', description: 'Recommended when children is not a plain string.' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. variant + appearance + parent <Surface> drive the fill.',
        'x-jds-suggestion': "Chip colour is surface-resolved from `variant` + `appearance`. Don't set backgroundColor / borderColor.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['label.S', 'label.M', 'label.L'],
    shape: ['pill'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      start: { accepts: ['Icon', 'Avatar'], cardinality: 'optional', description: 'Content before the label.' },
      end: { accepts: ['Icon'], cardinality: 'optional', description: 'Content after the label (e.g. dismiss icon).' },
    },
  },

  a11y: {
    accessibilityRole: 'button',
    accessibilityState: ['selected', 'disabled'],
    accessibleNameSource: 'children', // aria-label ?? string children
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-chip-v4',
    keyHistory: [],
    variantProperties: { Component: 'Chip' },
  },

  renderHints: {
    baseElement: 'Pressable',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['selection', 'filter', 'interactive', 'surface-aware', 'inherits-appearance'],
} as const);
