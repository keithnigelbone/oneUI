/**
 * JDSSegmentedControl — RN knowledge entry for the SegmentedControl compound.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/SegmentedControl/interface.ts`.
 *
 * Compound API: `SegmentedControl` (root/track) + `SegmentedControl.Item`
 * (single-select segment). Root resolves `attention` (selected fill: bold /
 * subtle) and `trackEmphasis` (track fill: minimal / ghost+stroke / ghost)
 * against the parent <Surface>. Items accept `start` (icon) / `end`
 * (CounterBadge) slots; a selected item publishes its own Surface boundary so
 * a nested CounterBadge re-steps for contrast.
 */

import { defineComponent } from '../defineComponent';

export const JDSSegmentedControl = defineComponent({
  schemaVersion: '5.0.0',
  name: 'SegmentedControl',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Single-select segmented control. Compound API: root manages selection state (controlled via `value` or uncontrolled via `defaultValue`) and track paint; `SegmentedControl.Item` renders each segment with optional icon/CounterBadge slots. `attention` drives selected-segment prominence (bold/subtle), `trackEmphasis` drives the track container prominence, `shape` is pill or rectangular, `type` is text or icon-only.',

  propsSchema: {
    $id: 'jds.kb.rn.SegmentedControl',
    type: 'object',
    required: ['children'],
    properties: {
      children: { description: 'One or more `SegmentedControl.Item` elements.' },
      value: { type: 'string', description: 'Controlled selected value.' },
      defaultValue: { type: 'string', description: 'Uncontrolled initial selected value.' },
      onValueChange: { description: 'Fires with the newly selected value.' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'high',
        description: 'Selected-segment fill prominence: high → bold, medium → subtle (item role), low → subtle (track role).',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: 'Multi-accent role for selected segments when attention is high/medium. auto resolves to parent Surface appearance → primary.',
      },
      shape: { enum: ['pill', 'rectangular'], default: 'pill' },
      equalWidth: { type: 'boolean', description: 'Every segment shares equal width. Defaults to true for `text` type.' },
      trackEmphasis: {
        enum: ['high', 'medium', 'low'],
        default: 'high',
        description: 'Track container prominence: high → minimal fill, medium → ghost + strokeMedium border, low → ghost.',
      },
      type: { enum: ['text', 'icon'], default: 'text' },
      disabled: { type: 'boolean', default: false },
      style: { description: 'Additional native styles applied to the track container.' },
      testID: { type: 'string' },
      accessibilityHint: { type: 'string' },
      'aria-label': { type: 'string' },
      'aria-labelledby': { type: 'string', description: 'Web parity only — no id resolution on native; use aria-label.' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['minimal', 'ghost', 'bold', 'subtle'],
    shape: ['pill', 'S'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['SegmentedControl.Item'],
        cardinality: 'multiple',
        description: 'At least one SegmentedControl.Item is required.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'none', // each Item exposes 'button'/'radio'-style selected state
    accessibilityState: ['selected', 'disabled'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-segmented-control-v4',
    keyHistory: [],
    variantProperties: { Component: 'SegmentedControl' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'selection', 'compound', 'surface-aware'],
} as const);
