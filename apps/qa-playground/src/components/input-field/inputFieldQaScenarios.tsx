import type { InputAppearance } from '@oneui/ui/components/Input';
import type { InputFieldProps } from '@oneui/ui/components/InputField';
import {
  QA_DYNAMIC_TEXT_SLOT,
  QA_FEEDBACK_SLOT,
  QA_INPUT_END2_SUFFIX,
  QA_INPUT_END_ICON,
  QA_INPUT_START2_PREFIX,
  QA_INPUT_START_ICON,
  QA_LABEL_SLOT,
} from './inputFieldQaSlotNodes';

export type InputFieldMountScenario = {
  testId: string;
  props: InputFieldProps;
};

export type InputFieldQaSection = {
  id: string;
  title: string;
  scenarios: readonly InputFieldMountScenario[];
};

export type InputFieldSizeFigma = 'S' | 'M' | 'L';

const SIZE_CODE: Record<InputFieldSizeFigma, 8 | 10 | 12> = {
  S: 8,
  M: 10,
  L: 12,
};

const LABEL = 'Field label';
const DESCRIPTION = 'Helper description for this field.';
const ERROR = 'This value is not valid.';
const DYNAMIC = '0 / 128 characters';
const HELPER = 'Forgot?';

export type InputFieldQaFlags = {
  size?: InputFieldSizeFigma;
  label?: boolean;
  required?: boolean;
  infoIcon?: boolean;
  description?: boolean;
  feedback?: boolean;
  dynamicText?: boolean;
  disabled?: boolean;
};

/** Build props from QA boolean axes (Figma-style toggles). */
export function buildInputFieldQaProps(
  flags: InputFieldQaFlags,
  overrides: Partial<InputFieldProps> = {},
): InputFieldProps {
  const {
    size = 'M',
    label = true,
    required = false,
    infoIcon = false,
    description = false,
    feedback = false,
    dynamicText = false,
    disabled = false,
  } = flags;

  const props: InputFieldProps = {
    size: SIZE_CODE[size],
    disabled: disabled || undefined,
    required: required || undefined,
    infoIcon: infoIcon || undefined,
    placeholder: 'Enter text',
    ...overrides,
  };

  if (label) {
    props.label = overrides.label ?? LABEL;
  }
  if (description) {
    props.description = overrides.description ?? DESCRIPTION;
  }
  if (feedback) {
    props.error = overrides.error ?? ERROR;
  }
  if (dynamicText) {
    props.dynamicText = overrides.dynamicText ?? DYNAMIC;
    props.helperButton = overrides.helperButton ?? HELPER;
  }

  return props;
}

function scenario(testId: string, flags: InputFieldQaFlags, overrides?: Partial<InputFieldProps>): InputFieldMountScenario {
  return { testId, props: buildInputFieldQaProps(flags, overrides) };
}

export const FIGMA_SIZES: InputFieldSizeFigma[] = ['S', 'M', 'L'];

/** 1 — Default */
export const DEFAULT_SCENARIO: InputFieldMountScenario = {
  testId: 'input-field-default',
  props: {
    size: 10,
    label: 'Email address',
    placeholder: 'name@example.com',
  },
};

/** All QA boolean axes enabled + 4-slot icons on the bordered Input */
export const ALL_PROPS_SCENARIO: InputFieldMountScenario = {
  testId: 'input-field-all-props',
  props: {
    ...buildInputFieldQaProps({
      size: 'M',
      label: true,
      required: true,
      infoIcon: true,
      description: true,
      feedback: true,
      dynamicText: true,
      disabled: false,
    }),
    start: QA_INPUT_START_ICON,
    end: QA_INPUT_END_ICON,
    appearance: 'secondary',
    attention: 'medium',
    shape: 'default',
    type: 'text',
  },
};

export const SIZE_SCENARIOS: InputFieldMountScenario[] = FIGMA_SIZES.map((figma) =>
  scenario(`input-field-size-${figma}`, { size: figma, label: true }),
);

/** 4 — Input 4-slot system (icons + prefix/suffix text) */
export const INPUT_SLOT_SCENARIOS: InputFieldMountScenario[] = [
  {
    testId: 'input-field-slot-start',
    props: {
      label: 'Start icon',
      placeholder: 'With start icon',
      size: 10,
      start: QA_INPUT_START_ICON,
    },
  },
  {
    testId: 'input-field-slot-end',
    props: {
      label: 'End icon',
      placeholder: 'With end icon',
      size: 10,
      end: QA_INPUT_END_ICON,
    },
  },
  {
    testId: 'input-field-slot-start-end',
    props: {
      label: 'Start + end icons',
      placeholder: 'Both icons',
      size: 10,
      start: QA_INPUT_START_ICON,
      end: QA_INPUT_END_ICON,
    },
  },
  {
    testId: 'input-field-slot-start2',
    props: {
      label: 'Amount',
      placeholder: '0.00',
      size: 10,
      type: 'number',
      start2: QA_INPUT_START2_PREFIX,
    },
  },
  {
    testId: 'input-field-slot-end2',
    props: {
      label: 'Weight',
      placeholder: 'Enter weight',
      size: 10,
      type: 'number',
      end2: QA_INPUT_END2_SUFFIX,
    },
  },
  {
    testId: 'input-field-slot-all-four',
    props: {
      label: 'All four slots',
      placeholder: 'Enter amount',
      size: 10,
      start: QA_INPUT_START_ICON,
      start2: QA_INPUT_START2_PREFIX,
      end2: <span>.00</span>,
      end: QA_INPUT_END_ICON,
    },
  },
];

const INPUT_APPEARANCES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly InputAppearance[];

/** 5 — Input chrome (shape · attention · state) */
export const INPUT_CHROME_SCENARIOS: InputFieldMountScenario[] = [
  {
    testId: 'input-field-chrome-attention-medium',
    props: { label: 'Attention medium', placeholder: 'Outlined', size: 10, attention: 'medium' },
  },
  {
    testId: 'input-field-chrome-attention-high',
    props: { label: 'Attention high', placeholder: 'Filled', size: 10, attention: 'high' },
  },
  {
    testId: 'input-field-chrome-shape-default',
    props: {
      label: 'Shape default',
      placeholder: 'Rounded',
      size: 10,
      shape: 'default',
      start: QA_INPUT_START_ICON,
    },
  },
  {
    testId: 'input-field-chrome-shape-pill',
    props: {
      label: 'Shape pill',
      placeholder: 'Pill',
      size: 10,
      shape: 'pill',
      start: QA_INPUT_START_ICON,
    },
  },
  {
    testId: 'input-field-chrome-readonly',
    props: {
      label: 'Read only',
      defaultValue: 'Cannot edit',
      size: 10,
      readOnly: true,
    },
  },
  {
    testId: 'input-field-chrome-invalid',
    props: {
      label: 'Invalid (no error string)',
      placeholder: 'Invalid border',
      size: 10,
      invalid: true,
    },
  },
  {
    testId: 'input-field-chrome-full-width',
    props: {
      label: 'Full width',
      placeholder: 'Stretches to container',
      size: 10,
      fullWidth: true,
      start: QA_INPUT_START_ICON,
    },
  },
];

/** 6 — Input appearance roles */
export const INPUT_APPEARANCE_SCENARIOS: InputFieldMountScenario[] = INPUT_APPEARANCES.map(
  (appearance) => ({
    testId: `input-field-appearance-${appearance}`,
    props: {
      label: `${appearance} appearance`,
      placeholder: 'Placeholder',
      size: 10,
      appearance,
      start: QA_INPUT_START_ICON,
    },
  }),
);

/** 7 — HTML input types */
export const INPUT_TYPE_SCENARIOS: InputFieldMountScenario[] = (
  [
    { type: 'email', label: 'Email', placeholder: 'name@example.com' },
    { type: 'password', label: 'Password', placeholder: 'Enter password' },
    { type: 'number', label: 'Number', placeholder: '0' },
    { type: 'tel', label: 'Phone', placeholder: '+91 00000 00000' },
    { type: 'url', label: 'URL', placeholder: 'https://example.com' },
    { type: 'search', label: 'Search', placeholder: 'Search…' },
  ] as const
).map(({ type, label, placeholder }) => ({
  testId: `input-field-type-${type}`,
  props: {
    label,
    placeholder,
    size: 10 as const,
    type,
    start: QA_INPUT_START_ICON,
  },
}));

/** 8 — Field-level slots (feedback · dynamicText · labelSlot) + full stack */
export const FIELD_SLOT_SCENARIOS: InputFieldMountScenario[] = [
  {
    testId: 'input-field-field-slot-feedback',
    props: {
      label: 'Feedback slot',
      placeholder: 'Placeholder',
      size: 10,
      feedback: QA_FEEDBACK_SLOT,
    },
  },
  {
    testId: 'input-field-field-slot-dynamic',
    props: {
      label: 'DynamicText slot',
      placeholder: 'Placeholder',
      size: 10,
      dynamicTextSlot: QA_DYNAMIC_TEXT_SLOT,
    },
  },
  {
    testId: 'input-field-field-slot-label',
    props: {
      labelSlot: QA_LABEL_SLOT,
      placeholder: 'labelSlot replaces string label',
      size: 10,
    },
  },
  {
    testId: 'input-field-field-slot-full-stack',
    props: {
      label: 'Full stack + slots',
      description: 'Label, description, 4 input slots, feedback slot, dynamic row.',
      placeholder: 'you@example.com',
      size: 10,
      type: 'email',
      required: true,
      infoIcon: true,
      start: QA_INPUT_START_ICON,
      end: QA_INPUT_END_ICON,
      feedback: QA_FEEDBACK_SLOT,
      dynamicText: '0 / 100 characters',
      helperButton: 'Help',
    },
  },
  {
    testId: 'input-field-field-slot-figma-composition',
    props: {
      label: 'Figma composition',
      placeholder: 'Placeholder',
      size: 10,
      start: QA_INPUT_START_ICON,
      feedback: QA_FEEDBACK_SLOT,
      dynamicTextSlot: QA_DYNAMIC_TEXT_SLOT,
    },
  },
];

/** Single-axis isolates */
export const ISOLATE_SCENARIOS: InputFieldMountScenario[] = [
  scenario('input-field-no-label', { label: false }),
  scenario('input-field-required', { label: true, required: true }),
  scenario('input-field-info-icon', { label: true, infoIcon: true }),
  scenario('input-field-description', { label: true, description: true }),
  scenario('input-field-feedback', { label: true, feedback: true }),
  scenario('input-field-dynamic-text', { label: true, dynamicText: true }),
  scenario('input-field-disabled', { label: true, disabled: true }),
];

/** Edge / regression mounts */
export const EDGE_SCENARIOS: InputFieldMountScenario[] = [
  {
    testId: 'input-field-edge-long-label',
    props: buildInputFieldQaProps(
      { label: true, infoIcon: true },
      {
        label:
          'International mobile subscriber identity and billing reference number for enterprise accounts',
      },
    ),
  },
  {
    testId: 'input-field-edge-long-description',
    props: buildInputFieldQaProps(
      { label: true, description: true },
      {
        description:
          'Use the registered mobile number linked to your Jio account. OTP will be sent within 30 seconds. Standard messaging rates may apply depending on your carrier and region.',
      },
    ),
  },
  {
    testId: 'input-field-edge-empty-value',
    props: buildInputFieldQaProps({ label: true }, { defaultValue: '', placeholder: 'Empty value' }),
  },
  {
    testId: 'input-field-edge-required-no-label',
    props: buildInputFieldQaProps(
      { label: false, required: true },
      { placeholder: 'Required field without visible label', 'aria-label': 'Account ID' },
    ),
  },
  {
    testId: 'input-field-edge-info-icon-no-label',
    props: buildInputFieldQaProps({ label: false, infoIcon: true }, { placeholder: 'infoIcon without label' }),
  },
  {
    testId: 'input-field-edge-feedback-no-description',
    props: buildInputFieldQaProps({ label: true, feedback: true }),
  },
  {
    testId: 'input-field-edge-disabled-feedback',
    props: buildInputFieldQaProps({ label: true, feedback: true, disabled: true }),
  },
  {
    testId: 'input-field-edge-disabled-dynamic',
    props: buildInputFieldQaProps({ label: true, dynamicText: true, disabled: true }),
  },
  scenario('input-field-edge-minimal', {
    label: false,
    required: false,
    infoIcon: false,
    description: false,
    feedback: false,
    dynamicText: false,
    disabled: false,
  }),
];

/** Named playground examples (documentation / smoke anchors) */
export const PLAYGROUND_SCENARIOS: InputFieldMountScenario[] = [
  scenario('input-field-playground-basic', { label: true }),
  scenario('input-field-playground-required', { label: true, required: true }),
  scenario('input-field-playground-description', { label: true, description: true }),
  scenario('input-field-playground-info-icon', { label: true, infoIcon: true }),
  scenario('input-field-playground-feedback', { label: true, feedback: true }),
  scenario('input-field-playground-dynamic-text', { label: true, dynamicText: true }),
  scenario('input-field-playground-disabled', { label: true, disabled: true }),
  scenario('input-field-playground-size-large', { size: 'L', label: true }),
  scenario('input-field-playground-size-small', { size: 'S', label: true }),
  scenario('input-field-playground-all-content', {
    label: true,
    required: true,
    infoIcon: true,
    description: true,
    feedback: true,
    dynamicText: true,
  }),
  scenario('input-field-playground-no-content', {
    label: false,
    required: false,
    infoIcon: false,
    description: false,
    feedback: false,
    dynamicText: false,
  }),
];

type PairBuilder = (a: boolean, b: boolean) => InputFieldQaFlags;

function pairwiseScenarios(pairKey: string, base: InputFieldQaFlags, build: PairBuilder): InputFieldMountScenario[] {
  const suffixes: [boolean, boolean, string][] = [
    [false, false, 'ff'],
    [false, true, 'ft'],
    [true, false, 'tf'],
    [true, true, 'tt'],
  ];
  return suffixes.map(([a, b, suffix]) =>
    scenario(`input-field-pw-${pairKey}-${suffix}`, { ...base, ...build(a, b) }),
  );
}

/** 2×2 pairwise — seven requested pairs */
export const PAIRWISE_SCENARIOS: InputFieldMountScenario[] = [
  ...pairwiseScenarios('label-required', { description: false, feedback: false, dynamicText: false }, (label, required) => ({
    label,
    required,
  })),
  ...pairwiseScenarios('label-description', { feedback: false, dynamicText: false }, (label, description) => ({
    label,
    description,
  })),
  ...pairwiseScenarios('label-info-icon', { description: false, feedback: false }, (label, infoIcon) => ({
    label,
    infoIcon,
  })),
  ...pairwiseScenarios('feedback-dynamic', { label: true, description: false }, (feedback, dynamicText) => ({
    feedback,
    dynamicText,
  })),
  ...pairwiseScenarios('feedback-disabled', { label: true, dynamicText: false }, (feedback, disabled) => ({
    feedback,
    disabled,
  })),
  ...pairwiseScenarios('description-feedback', { label: true, dynamicText: false }, (description, feedback) => ({
    description,
    feedback,
  })),
  ...pairwiseScenarios('description-dynamic', { label: true, feedback: false }, (description, dynamicText) => ({
    description,
    dynamicText,
  })),
];

/** A11y-focused mounts */
export const A11Y_SCENARIOS: InputFieldMountScenario[] = [
  {
    testId: 'input-field-a11y-aria-label',
    props: {
      placeholder: 'Search',
      size: 10,
    },
  },
  scenario('input-field-a11y-required', { label: true, required: true }),
  scenario('input-field-a11y-description', { label: true, description: true }),
  scenario('input-field-a11y-disabled', { label: true, disabled: true }),
  scenario('input-field-a11y-feedback', { label: true, feedback: true }),
];

export const INPUT_FIELD_QA_SECTIONS: readonly InputFieldQaSection[] = [
  { id: 'input-field-qa-default', title: '1 Default', scenarios: [DEFAULT_SCENARIO] },
  { id: 'input-field-qa-all-props', title: '2 All properties', scenarios: [ALL_PROPS_SCENARIO] },
  { id: 'input-field-qa-size', title: '3 Size (S · M · L)', scenarios: SIZE_SCENARIOS },
  {
    id: 'input-field-qa-input-slots',
    title: '4 Input slots (start · start2 · end · end2)',
    scenarios: INPUT_SLOT_SCENARIOS,
  },
  {
    id: 'input-field-qa-input-chrome',
    title: '5 Input chrome (attention · shape · readOnly · invalid · fullWidth)',
    scenarios: INPUT_CHROME_SCENARIOS,
  },
  {
    id: 'input-field-qa-appearance',
    title: '6 Input appearance (8 roles)',
    scenarios: INPUT_APPEARANCE_SCENARIOS,
  },
  { id: 'input-field-qa-input-types', title: '7 Input types', scenarios: INPUT_TYPE_SCENARIOS },
  {
    id: 'input-field-qa-field-slots',
    title: '8 Field slots (feedback · dynamicText · labelSlot · full stack)',
    scenarios: FIELD_SLOT_SCENARIOS,
  },
  { id: 'input-field-qa-isolates', title: '9 Property isolates', scenarios: ISOLATE_SCENARIOS },
  { id: 'input-field-qa-edge', title: '10 Edge cases', scenarios: EDGE_SCENARIOS },
  { id: 'input-field-qa-playground', title: '11 Playground examples', scenarios: PLAYGROUND_SCENARIOS },
  { id: 'input-field-qa-pairwise', title: '12 Pairwise (7 × 2×2)', scenarios: PAIRWISE_SCENARIOS },
  { id: 'input-field-qa-a11y', title: '13 Accessibility', scenarios: A11Y_SCENARIOS },
] as const;

export function allInputFieldScenarioTestIds(): string[] {
  return INPUT_FIELD_QA_SECTIONS.flatMap((section) => section.scenarios.map((s) => s.testId));
}

export const INPUT_FIELD_QA_SECTION_IDS = INPUT_FIELD_QA_SECTIONS.map((s) => s.id);
