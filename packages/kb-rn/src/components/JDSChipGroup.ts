/**
 * JDSChipGroup — RN knowledge entry for the ChipGroup.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/ChipGroup/interface.ts`
 * (semantic source `ChipGroup.shared.ts`).
 *
 * CONTEXT-PROVIDER + SELECTION CONTRACT (the reason this meta exists):
 * ChipGroup is the selection orchestrator + context provider for <Chip>
 * children. It pushes `size` / `variant` / `appearance` / `disabled` DOWN via
 * ChipContext (per-chip props still win), and owns selection state:
 *   - `multiple=false` (default): single-select; `required` blocks deselect.
 *   - `multiple=true`: multi-select, capped by `maxSelections`.
 * Controlled via `value` (string[]) / `onValueChange`. The container is hidden
 * from assistive tech so each child Chip stays individually focusable; an
 * optional `aria-label` exposes a screen-reader group name (header). Selection
 * lives HERE — bare <Chip>s don't coordinate.
 */

import { defineComponent } from '../defineComponent';

export const JDSChipGroup = defineComponent({
  schemaVersion: '5.0.0',
  name: 'ChipGroup',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Selection container + context provider for <Chip> children. Pushes size/variant/appearance/disabled down; owns single (default) or multiple selection with maxSelections + required constraints. Controlled via value/onValueChange. Container is a11y-transparent so child Chips stay focusable.',

  propsSchema: {
    $id: 'jds.kb.rn.ChipGroup',
    type: 'object',
    properties: {
      children: { description: '<Chip> children. Selection + inherited props flow through ChipContext.' },
      value: { description: 'Selected chip values (controlled, string[]).' },
      defaultValue: { description: 'Selected chip values (uncontrolled, string[]).' },
      onValueChange: { description: 'Change handler — receives the next list of selected values.' },
      multiple: { type: 'boolean', default: false, description: 'false = single-select, true = multi-select.' },
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
      wrap: { type: 'boolean', default: true },
      size: { enum: ['s', 'm', 'l'], description: 'Pushed to child Chips (per-chip prop wins).' },
      variant: { enum: ['bold', 'subtle', 'ghost'], description: 'Pushed to child Chips (per-chip prop wins).' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        description: 'Pushed to child Chips (per-chip prop wins).',
      },
      maxSelections: { type: 'number', description: 'Caps the number of selected chips (multiple mode).' },
      required: { type: 'boolean', default: false, description: 'Blocks deselecting the last selected chip.' },
      disabled: { type: 'boolean', default: false, description: 'Pushed to all child Chips.' },
      loopFocus: { type: 'boolean', default: false },
      'aria-label': { type: 'string', description: 'Exposes a screen-reader group name (header).' },
      'aria-labelledby': { type: 'string' },
    },
    required: ['children'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
  },

  composition: {
    childKind: 'variadic',
    variadic: { accepts: ['Chip'], min: 1, max: 50 },
  },

  a11y: {
    accessibilityRole: 'none', // container is a11y-transparent; child Chips stay individually focusable
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-chip-group-v4',
    keyHistory: [],
    variantProperties: { Component: 'ChipGroup' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: false,
  },

  tags: ['selection', 'filter', 'group', 'composition'],
} as const);
