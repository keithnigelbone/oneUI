/**
 * JDSRadioField — RN knowledge entry for the RadioField.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/RadioField/interface.ts`
 * (semantic source `RadioField.shared.ts`).
 *
 * COMPOSITION-SHELL + MODE CONTRACT (the reason this meta exists):
 * RadioField wraps <Radio>, with THREE modes derived from children count:
 *   - INTEGRATED SINGLE (no children, string label): implicit lone Radio with
 *     on/off via `checked`/`onCheckedChange` or `value`/`onValueChange` against
 *     `singleOptionValue`.
 *   - MULTI-OPTION (>=2 <Radio> children): fieldset header + a RadioGroup of
 *     children (mutual exclusion is owned HERE, via `value`/`onValueChange`).
 *   - PLAIN OPTION (1 child): no legend; the option labels itself.
 * This is the component that provides single-selection across Radios — a bare
 * list of <Radio> does NOT mutually exclude. Validation is host-form-driven.
 */

import { defineComponent } from '../defineComponent';

export const JDSRadioField = defineComponent({
  schemaVersion: '5.0.0',
  name: 'RadioField',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Field shell around Radio that OWNS single-selection. Integrated-single / multi-option (RadioGroup) / plain-option modes by children count. Drive multi mode with value/onValueChange. Adds header, required asterisk, info-icon slot, error/feedback and dynamic-text rows, orientation.',

  propsSchema: {
    $id: 'jds.kb.rn.RadioField',
    type: 'object',
    properties: {
      children: { description: '<Radio> options. Omit for integrated single mode.' },
      value: { type: 'string', description: 'Selected option value (controlled, multi/integrated-string mode).' },
      defaultValue: { type: 'string', description: 'Selected option value (uncontrolled).' },
      onValueChange: { description: 'Group change handler — receives the selected option value.' },
      checked: { type: 'boolean', description: 'Integrated single mode — controlled on/off.' },
      defaultChecked: { type: 'boolean', description: 'Integrated single mode — uncontrolled on/off.' },
      onCheckedChange: { description: 'Integrated single mode — fired when the lone option toggles.' },
      singleOptionValue: { type: 'string', default: 'on', description: 'Form value of the implicit lone Radio in integrated mode.' },
      label: { type: 'string', description: 'Field header (multi) or integrated label (single).' },
      description: { type: 'string' },
      infoIconSlot: { description: 'Trailing control beside the label (e.g. info <IconButton>).' },
      invalid: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false, description: 'Renders an asterisk after the label.' },
      fullWidth: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
      size: { enum: ['s', 'm', 'l'], default: 'm', description: 'Forwarded to all options.' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Forwarded to all options. 'auto' → secondary.",
      },
      orientation: { enum: ['vertical', 'horizontal'], default: 'vertical' },
      error: { type: 'string', description: 'Shorthand negative feedback row.' },
      feedback: { description: 'Custom feedback node (a JDS <InputFeedback>).' },
      dynamicText: { type: 'string' },
      helperButton: { type: 'string' },
      onHelperPress: { description: 'Handler for helperButton.' },
      dynamicTextSlot: { description: 'Custom dynamic-text node.' },
      'aria-label': { type: 'string' },
      'aria-describedby': { type: 'string' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    typography: ['label.S', 'label.M', 'label.L', 'body.S', 'body.M'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: { accepts: ['Radio'], cardinality: 'multiple', description: 'Radio options (mutual exclusion owned by the field).' },
      infoIconSlot: { accepts: ['IconButton', 'Icon'], cardinality: 'optional', description: 'Trailing info control beside the label.' },
      feedback: { accepts: ['InputFeedback'], cardinality: 'optional', description: 'Custom feedback row.' },
      dynamicTextSlot: { accepts: ['InputDynamicText'], cardinality: 'optional', description: 'Custom dynamic-text row.' },
    },
  },

  a11y: {
    accessibilityRole: 'none', // RN has no role="radiogroup"; legend via accessible + label, inner Radios keep role="radio"
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label', // aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-radio-field-v4',
    keyHistory: [],
    variantProperties: { Component: 'RadioField' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'field', 'selection', 'composition'],
} as const);
