/**
 * JDSInputField — RN knowledge entry for the InputField.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/InputField/interface.ts`
 * (aggregator over the bordered <Input>).
 *
 * AGGREGATOR-STACK CONTRACT (the reason this meta exists):
 * InputField is the full field stack: (1) label/description header with optional
 * required asterisk + info-icon, (2) the bordered <Input> (InputField owns the
 * label — it is NOT delegated), (3) optional <InputFeedback> (string `error`
 * shorthand or node), (4) optional <InputDynamicText> row (`dynamicText` /
 * `helperButton` shorthand or node). `appearance="auto"` → secondary. The root
 * <View> is DECORATIVE — the inner <Input> owns focus + a11y; the field only
 * forwards the accessible name (accessibilityLabel → aria-label → label).
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSInputField = defineComponent({
  schemaVersion: '5.0.0',
  name: 'InputField',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Full text-input field stack: label/description header + bordered Input + optional feedback + dynamic-text rows. Owns the label (not delegated). appearance="auto" → secondary; attention medium=outlined / high=filled; shape default|pill. Root View is decorative — the inner Input carries focus + a11y.',

  propsSchema: {
    $id: 'jds.kb.rn.InputField',
    type: 'object',
    properties: {
      label: { type: 'string' },
      description: { type: 'string' },
      infoIcon: { type: 'boolean', default: false, description: 'Show the default info control beside the label (needs a string label).' },
      infoIconSlot: { description: 'Replaces the default info <IconButton>.' },
      infoIconAriaLabel: { type: 'string', default: 'More information' },
      size: { enum: ['xs', 's', 'm', 'l'], default: 'm' },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Forwarded to the inner Input. 'auto' → secondary.",
      },
      shape: { enum: ['default', 'pill'], default: 'default', description: 'Per-size radius (default) or fully rounded (pill).' },
      attention: { enum: ['medium', 'high'], default: 'medium', description: 'medium = outlined, high = filled.' },
      start: { description: 'Leading slot (Icon / IconButton).' },
      start2: { description: 'Second leading slot.' },
      end: { description: 'Trailing slot.' },
      end2: { description: 'Second trailing slot.' },
      placeholder: { type: 'string' },
      value: { type: 'string' },
      defaultValue: { type: 'string' },
      onChange: { description: 'Text-change callback (value).' },
      onSubmit: { description: 'Submit callback (value).' },
      disabled: { type: 'boolean', default: false },
      readOnly: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false, description: 'Visible asterisk + a11y required.' },
      invalid: { type: 'boolean', default: false, description: 'Negative stroke chrome + negative feedback default.' },
      maxLength: { type: 'number' },
      type: { enum: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'], default: 'text' },
      autoComplete: { type: 'string' },
      autoFocus: { type: 'boolean', default: false },
      onFocus: { description: 'Focus handler.' },
      onBlur: { description: 'Blur handler.' },
      error: { type: 'string', description: 'Shorthand negative InputFeedback row.' },
      feedback: { description: 'Pre-built <InputFeedback> node — wins over `error`.' },
      dynamicText: { type: 'string', description: 'Leading copy for the dynamic-text row.' },
      helperButton: { type: 'string', description: 'Trailing action label for the dynamic-text row.' },
      onHelperPress: { description: 'Handler for helperButton.' },
      fullWidth: { type: 'boolean', default: false },
      'aria-label': { type: 'string', description: 'Forwarded to the inner Input when there is no visible label.' },
      'aria-describedby': { type: 'string' },
      'aria-invalid': { type: 'boolean' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
    },
  },

  tokens: {
    color: ['neutral', 'primary', 'secondary', 'negative', 'positive', 'warning'],
    typography: ['body.XS', 'body.S', 'body.M', 'label.S', 'label.M', 'label.L'],
    shape: ['pill', 'XS', 'S', 'M'],
    spacing: ['3XS', '2XS', 'XS', 'S'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      start: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Leading slot.' },
      start2: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Second leading slot.' },
      end: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Trailing slot.' },
      end2: { accepts: ['Icon', 'IconButton'], cardinality: 'optional', description: 'Second trailing slot.' },
      infoIconSlot: { accepts: ['IconButton', 'Icon'], cardinality: 'optional', description: 'Info control beside the label.' },
      feedback: { accepts: ['InputFeedback'], cardinality: 'optional', description: 'Feedback row.' },
    },
  },

  a11y: {
    accessibilityRole: 'none', // root is decorative; inner Input owns focus + a11y
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label', // accessibilityLabel ?? aria-label ?? label
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-input-field-v4',
    keyHistory: [],
    variantProperties: { Component: 'InputField' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['form', 'field', 'input', 'composition'],
} as const);
