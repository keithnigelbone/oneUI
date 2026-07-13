/**
 * JDSCheckboxField — RN knowledge entry for the CheckboxField.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/CheckboxField/interface.ts`
 * (semantic source `CheckboxField.shared.ts`).
 *
 * COMPOSITION-SHELL CONTRACT (the reason this meta exists):
 * CheckboxField is a field wrapper around <Checkbox>, with TWO modes:
 *   - SINGLE (no children): one integrated checkbox with field-level `label` /
 *     `description`, optional `infoIconSlot`, `error`/`feedback`, dynamic-text row.
 *   - MULTI-OPTION (children are <Checkbox> items): `label`/`description` render
 *     as a fieldset header, then the stacked children, then feedback + dynamic row.
 * Drive multi-option selection with `groupValue` / `onGroupValueChange`. RN has
 * no `role="group"`; the wrapper surfaces the legend via `accessible` +
 * `accessibilityLabel` while each inner Checkbox keeps `role="checkbox"`.
 * Validation is host-form-driven — forward `error` / `invalid`.
 */

import { defineComponent } from '../defineComponent';

export const JDSCheckboxField = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CheckboxField',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Field shell around Checkbox. Single mode = one integrated checkbox + label/description/feedback; multi-option mode = a fieldset of <Checkbox> children driven by groupValue/onGroupValueChange. Adds required asterisk, info-icon slot, error/feedback and dynamic-text rows.',

  propsSchema: {
    $id: 'jds.kb.rn.CheckboxField',
    type: 'object',
    properties: {
      children: { description: 'Multi-option <Checkbox> items. Omit for single integrated mode.' },
      label: { type: 'string', description: 'Field header (multi) or integrated label (single).' },
      description: { type: 'string' },
      groupValue: { description: 'Multi-option selected `value`s (controlled).' },
      groupDefaultValue: { description: 'Multi-option selected `value`s (uncontrolled).' },
      onGroupValueChange: { description: 'Multi-option change handler — receives the next list of selected values.' },
      selected: { type: 'boolean', description: 'Single-mode checked state.' },
      indeterminate: { type: 'boolean', description: 'Single-mode mixed state.' },
      onSelectedChange: { description: 'Single-mode change handler.' },
      invalid: { type: 'boolean', default: false, description: 'Drives error chrome on the inner Checkbox(es).' },
      error: { type: 'string', description: 'Shorthand negative feedback row.' },
      feedback: { description: 'Custom feedback node — replaces the auto error row (a JDS <InputFeedback>).' },
      infoIconSlot: { description: 'Trailing control beside the label (e.g. info <IconButton>).' },
      required: { type: 'boolean', default: false, description: 'Renders an asterisk after the label.' },
      fullWidth: { type: 'boolean', default: false },
      dynamicText: { type: 'string', description: 'Leading copy for the dynamic-text row.' },
      helperButton: { type: 'string', description: 'Trailing pressable label for the dynamic-text row.' },
      onHelperPress: { description: 'Handler for helperButton.' },
      dynamicTextSlot: { description: 'Custom dynamic-text node (overrides dynamicText/helperButton).' },
      size: { enum: ['s', 'm', 'l'], default: 'm' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Forwarded to the inner Checkbox(es). 'auto' → secondary.",
      },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
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
      children: { accepts: ['Checkbox'], cardinality: 'multiple', description: 'Multi-option checkbox items.' },
      infoIconSlot: { accepts: ['IconButton', 'Icon'], cardinality: 'optional', description: 'Trailing info control beside the label.' },
      feedback: { accepts: ['InputFeedback'], cardinality: 'optional', description: 'Custom feedback row.' },
      dynamicTextSlot: { accepts: ['InputDynamicText'], cardinality: 'optional', description: 'Custom dynamic-text row.' },
    },
  },

  a11y: {
    accessibilityRole: 'none', // RN has no role="group"; legend via accessible + label, inner Checkboxes keep role="checkbox"
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label', // aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-checkbox-field-v4',
    keyHistory: [],
    variantProperties: { Component: 'CheckboxField' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'field', 'selection', 'composition'],
} as const);
