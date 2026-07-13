import { InputFeedback, InputDynamicText } from '@oneui/ui/components/Input';
import { InputFieldDefaultInfo } from '@oneui-ui-internals/components/InputField/InputFieldDefaultInfo';
import { Radio } from '@oneui/ui/components/Radio';
import type { RadioAppearance, RadioSize } from '@oneui/ui/components/Radio';
import type { RadioFieldProps } from '@oneui/ui/components/RadioField';

export type RadioFieldMountScenario = {
  testId: string;
  caption: string;
  /** Figma prop name ↔ code mapping notes for QA captions. */
  figmaNote?: string;
  props: RadioFieldProps;
};

export type RadioFieldQaSection = {
  id: string;
  title: string;
  lead?: string;
  scenarios: readonly RadioFieldMountScenario[];
};

const INFO_ICON_M = (
  <InputFieldDefaultInfo
    ariaLabel="More about this field"
    tooltipContent="Additional context shown on hover or focus."
    labelSize="m"
  />
);

/** Integrated single — implicit lone `Radio` (no `children`). */
function single(name: string, props: Omit<RadioFieldProps, 'name'>): RadioFieldProps {
  return { name, ...props };
}

/** 1 — Default */
export const DEFAULT_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-default',
  caption: 'Default integrated field',
  figmaNote: 'label + labelText',
  props: single('radio-field-default', {
    label: 'Default Radio Test',
  }),
};

/** All Figma props on one integrated single mount */
export const ALL_PROPS_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-all-props',
  caption:
    'size M · appearance secondary · checked · label · description · required · infoIcon · feedback · dynamicText',
  figmaNote:
    'size m · appearance secondary · checked → defaultChecked · require → required · infoIcon → infoIconSlot',
  props: single('radio-field-all-props', {
    size: 'm',
    appearance: 'secondary',
    defaultChecked: true,
    
    label: 'Enable notifications',
    description: 'Receive product updates and offers by email.',
    required: true,
    infoIconSlot: INFO_ICON_M,
    feedback: (
      <InputFeedback attention="low">You can change this later in settings.</InputFeedback>
    ),
    dynamicText: 'Renews automatically unless cancelled.',
  }),
};

/** 2 — Label */
export const LABEL_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-label',
  caption: 'label: true · labelText',
  props: single('radio-field-label', {
    label: 'Preferred Contact Method',
    appearance: 'primary',
  }),
};

/** 3–4 — Description */
export const DESCRIPTION_SCENARIOS: RadioFieldMountScenario[] = [
  {
    testId: 'radio-field-description',
    caption: 'description: true · descriptionText',
    props: single('radio-field-description', {
      label: 'Email Notifications',
      description: 'Receive updates via email',
      appearance: 'primary',
    }),
  },
  {
    testId: 'radio-field-description-long',
    caption: 'Long description · wrapping',
    props: single('radio-field-description-long', {
      label: 'Premium Plan',
      description:
        'Includes unlimited calls, unlimited SMS, and 2GB data per day for 84 days.',
      appearance: 'primary',
    }),
  },
];

/** 5 — Required */
export const REQUIRED_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-required',
  caption: 'require → required',
  figmaNote: 'Figma require → code required',
  props: single('radio-field-required', {
    label: 'Accept Communication Preference',
    required: true,
    infoIconSlot: INFO_ICON_M,

    appearance: 'secondary',
  }),
};

/** 6 — Info icon */
export const INFO_ICON_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-info-icon',
  caption: 'infoIcon → infoIconSlot',
  props: single('radio-field-info-icon', {
    label: 'Auto Recharge',
    infoIconSlot: INFO_ICON_M,
    appearance: 'primary',
  }),
};

/** 7–9 — Feedback & dynamic text */
export const FEEDBACK_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-feedback',
  caption: 'feedback slot',
  props: single('radio-field-feedback', {
    label: 'Payment Method',
    feedback: <InputFeedback attention="low">You can change this later in settings.</InputFeedback>,
    appearance: 'primary',
  }),
};

export const DYNAMIC_TEXT_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-dynamic-text',
  caption: 'dynamicText row',
  props: single('radio-field-dynamic-text', {
    label: 'Subscription Option',
    
    dynamicText: 'Renews automatically unless cancelled.',
    appearance: 'primary',
  }),
};

export const DESCRIPTION_FEEDBACK_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-description-feedback',
  caption: 'description + feedback layout',
  props: single('radio-field-description-feedback', {
    label: 'Mobile Plan',
    description: 'Recommended plan',
    feedback: <InputFeedback variant="informative" attention="low">Best value for most users.</InputFeedback>,
    appearance: 'primary',
  }),
};

/** 10–13 — States */
export const CHECKED_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-checked',
  caption: 'checked → defaultChecked',
  props: single('radio-field-checked', {
    label: 'Selected Option',
    defaultChecked: true,
    appearance: 'primary',
  }),
};

export const DISABLED_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-disabled',
  caption: 'disabled',
  props: single('radio-field-disabled', {
    label: 'Unavailable Option',
    disabled: true,
    appearance: 'primary',
  }),
};

export const DISABLED_CHECKED_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-disabled-checked',
  caption: 'disabled + checked',
  props: single('radio-field-disabled-checked', {
    label: 'Current Plan',
    disabled: true,
    defaultChecked: true,
    appearance: 'primary',
  }),
};

export const READONLY_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-readonly',
  caption: 'readOnly + checked',
  props: single('radio-field-readonly', {
    label: 'Current Subscription',
    readOnly: true,
    defaultChecked: true,
    appearance: 'primary',
  }),
};

/** 14 — Appearance (one field each, integrated single, checked for visible fill) */
export const APPEARANCE_SCENARIOS: RadioFieldMountScenario[] = (
  [
    'primary',
    'secondary',
    'positive',
    'negative',
    'warning',
    'informative',
    'neutral',
  ] as const satisfies readonly RadioAppearance[]
).map((appearance) => ({
  testId: `radio-field-appearance-${appearance}`,
  caption: `appearance: ${appearance}`,
  props: single(`radio-field-appearance-${appearance}`, {
    label: `${appearance.charAt(0).toUpperCase()}${appearance.slice(1)} appearance`,
    defaultChecked: true,
    appearance,
  }),
}));

/** 15 — Accent: single `Radio` child only (accent not on RadioField API) ⚠️ */
export const ACCENT_SCENARIOS: RadioFieldMountScenario[] = (
  ['primary', 'secondary', 'sparkle'] as const
).map((accent) => ({
  testId: `radio-field-accent-${accent}`,
  caption: `accent on lone Radio: ${accent} (Figma N/A on field) ⚠️`,
  figmaNote: 'One option only — validates accent, not group selection',
  props: {
    label: `${accent} accent`,
    name: `radio-field-accent-${accent}`,
    defaultValue: 'on',
    appearance: 'neutral',
    children: (
      <Radio value="on" accent={accent}>
        Enable option
      </Radio>
    ),
  },
}));

/** 16 — Size */
export const SIZE_SCENARIOS: RadioFieldMountScenario[] = (
  [
    { size: 's' as RadioSize, label: 'Small' },
    { size: 'm' as RadioSize, label: 'Medium' },
    { size: 'l' as RadioSize, label: 'Large' },
  ] as const
).map(({ size, label }) => ({
  testId: `radio-field-size-${size}`,
  caption: `size: ${size}`,
  props: single(`radio-field-size-${size}`, {
    label: `${label} RadioField`,
    size,
    defaultChecked: true,
    appearance: 'primary',
  }),
}));

/** Accessibility — integrated single mounts for screen reader / keyboard tests */
export const A11Y_SCENARIOS: RadioFieldMountScenario[] = [
  {
    testId: 'radio-field-a11y-aria-label',
    caption: 'aria-label (no visible label)',
    props: {
      'aria-label': 'Select prepaid plan',
      name: 'radio-field-a11y-aria-label',
      appearance: 'primary',
    },
  },
  {
    testId: 'radio-field-a11y-required',
    caption: 'Required announcement',
    props: single('radio-field-a11y-required', {
      label: 'Billing cycle',
      required: true,
      appearance: 'primary',
    }),
  },
  {
    testId: 'radio-field-a11y-disabled',
    caption: 'Disabled announcement',
    props: single('radio-field-a11y-disabled', {
      label: 'Legacy plan',
      disabled: true,
      defaultChecked: true,
      appearance: 'primary',
    }),
  },
  {
    testId: 'radio-field-a11y-keyboard',
    caption: 'Keyboard / Space toggle target',
    props: single('radio-field-a11y-keyboard', {
      label: 'Keyboard focus target',
      defaultChecked: false,
      appearance: 'primary',
    }),
  },
];

/**
 * Optional — field shell with two options (not Email/SMS/Post).
 * Only band that uses multi-option; documents group legend + option list layout.
 */
export const GROUP_SHELL_SCENARIO: RadioFieldMountScenario = {
  testId: 'radio-field-group-shell',
  caption: 'Multi-option shell (2 choices) — group behavior only',
  props: {
    label: 'Billing cycle',
    description: 'Field label above option list.',
    name: 'radio-field-group-shell',
    required: true,
    defaultValue: 'monthly',
    appearance: 'neutral',
    children: (
      <>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="annual">Annual</Radio>
      </>
    ),
  },
};

/** Ordered sections for `RadioFieldQaShowcase` + Playwright manifest. */
export const RADIO_FIELD_QA_SECTIONS: readonly RadioFieldQaSection[] = [
  {
    id: 'radio-field-qa-default',
    title: '1 Default RadioField',
    lead: 'Integrated single — default rendering (`RadioField.stories.tsx` Default).',
    scenarios: [DEFAULT_SCENARIO],
  },
  {
    id: 'radio-field-qa-all-props',
    title: '2 All properties',
    lead:
      'Single mount — size M, appearance secondary, checked, label, description, required, infoIcon, feedback, dynamicText.',
    scenarios: [ALL_PROPS_SCENARIO],
  },
  {
    id: 'radio-field-qa-label',
    title: '3 Label',
    lead: 'Figma label + labelText → code `label` string.',
    scenarios: [LABEL_SCENARIO],
  },
  {
    id: 'radio-field-qa-description',
    title: '4 Description',
    scenarios: DESCRIPTION_SCENARIOS,
  },
  {
    id: 'radio-field-qa-required',
    title: '5 Required',
    scenarios: [REQUIRED_SCENARIO],
  },
  {
    id: 'radio-field-qa-info-icon',
    title: '6 Info icon',
    scenarios: [INFO_ICON_SCENARIO],
  },
  {
    id: 'radio-field-qa-feedback',
    title: '7 Feedback',
    scenarios: [FEEDBACK_SCENARIO],
  },
  {
    id: 'radio-field-qa-dynamic-text',
    title: '8 Dynamic text',
    scenarios: [DYNAMIC_TEXT_SCENARIO],
  },
  {
    id: 'radio-field-qa-description-feedback',
    title: '9 Description + feedback',
    scenarios: [DESCRIPTION_FEEDBACK_SCENARIO],
  },
  {
    id: 'radio-field-qa-checked',
    title: '10 Checked',
    lead: 'Figma checked → `defaultChecked` on integrated single.',
    scenarios: [CHECKED_SCENARIO],
  },
  {
    id: 'radio-field-qa-disabled',
    title: '11 Disabled',
    scenarios: [DISABLED_SCENARIO],
  },
  {
    id: 'radio-field-qa-disabled-checked',
    title: '12 Disabled + checked',
    scenarios: [DISABLED_CHECKED_SCENARIO],
  },
  {
    id: 'radio-field-qa-readonly',
    title: '13 Read only',
    scenarios: [READONLY_SCENARIO],
  },
  {
    id: 'radio-field-qa-appearance',
    title: '14 Appearance',
    lead: 'One integrated field per appearance role (checked for visible token fill).',
    scenarios: APPEARANCE_SCENARIOS,
  },
  {
    id: 'radio-field-qa-accent',
    title: '15 Accent',
    lead: 'accent is a `Radio` prop — one lone child per mount, not a survey group ⚠️',
    scenarios: ACCENT_SCENARIOS,
  },
  {
    id: 'radio-field-qa-size',
    title: '16 Size',
    lead: 'Figma S/M/L → code s / m / l.',
    scenarios: SIZE_SCENARIOS,
  },
  {
    id: 'radio-field-qa-a11y',
    title: '17 Accessibility',
    lead: 'Screen reader name, required/disabled chrome, keyboard toggle — fn + a11y specs.',
    scenarios: A11Y_SCENARIOS,
  },
  {
    id: 'radio-field-qa-group-shell',
    title: '18 Multi-option field shell (optional)',
    lead: 'Only scenario with 2 radios — validates legend + list layout, not selection permutations.',
    scenarios: [GROUP_SHELL_SCENARIO],
  },
] as const;

export function allRadioFieldScenarioTestIds(): string[] {
  return RADIO_FIELD_QA_SECTIONS.flatMap((section) => section.scenarios.map((s) => s.testId));
}

export const RADIO_FIELD_QA_SECTION_IDS = RADIO_FIELD_QA_SECTIONS.map((s) => s.id);
