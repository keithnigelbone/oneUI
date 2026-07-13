/**
 * JDSSlider — RN knowledge entry for Slider.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Slider/interface.ts`
 * (semantic source: `packages/ui/src/components/Slider/Slider.shared.ts`).
 *
 * Supports both a single thumb (`value`/`defaultValue`: number) and a range
 * (array of numbers) — `min`/`max`/`step` apply to both.
 */

import { defineComponent } from '../defineComponent';
import { COMPONENT_APPEARANCE_ENUM } from '../../../kb-core/src/schemas/sharedFragments';

export const JDSSlider = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Slider',
  importPath: '@oneui/ui-native',
  status: 'beta',
  description:
    'Draggable value slider — single thumb (number) or range (number[]). Optional tick marks, tooltip, and leading/trailing icon slots.',

  propsSchema: {
    $id: 'jds.kb.rn.Slider',
    type: 'object',
    properties: {
      value: { description: 'Current value (controlled) — a number, or number[] for a range slider.' },
      defaultValue: { description: 'Default value (uncontrolled) — same shape as `value`.' },
      onValueChange: { description: 'Called as the user drags.' },
      onValueCommitted: { description: 'Called when the user releases / commits the value.' },
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      step: { type: 'number', default: 1 },
      largeStep: { type: 'number', default: 10 },
      minStepsBetweenValues: { type: 'number', description: 'Minimum step gap enforced between thumbs on a range slider.' },
      appearance: COMPONENT_APPEARANCE_ENUM,
      orientation: { enum: ['horizontal', 'vertical'], default: 'horizontal' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      knobStyle: { enum: ['inside', 'outside'], default: 'outside' },
      showTooltip: { description: '"auto" (default, drag + focus) | "always" | false.' },
      formatValue: { description: 'Formatter for the tooltip value: (value, index) => string.' },
      showSteps: { type: 'boolean', description: 'Render tick marks at every step.' },
      stepLabels: { description: 'Optional labels rendered under step marks (ReactNode[]).' },
      snapToSteps: {
        type: 'boolean',
        default: true,
        description: 'When true (default) the thumb snaps to exact step positions; when false, dragging is continuous but tick marks still appear at step positions.',
      },
      start: { description: 'Node rendered at the start of the slider (e.g. an IconButton). ~30×30 slot.' },
      end: { description: 'Node rendered at the end of the slider (e.g. an IconButton). ~30×30 slot.' },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
      ariaLabels: { description: 'Per-thumb aria-label for range sliders (array indexed by thumb).' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: [],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      start: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Leading slot.' },
      end: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Trailing slot.' },
    },
  },

  a11y: {
    accessibilityRole: 'adjustable',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-slider-v4',
    keyHistory: [],
    variantProperties: { Component: 'Slider' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['press'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'input', 'slider'],
} as const);
