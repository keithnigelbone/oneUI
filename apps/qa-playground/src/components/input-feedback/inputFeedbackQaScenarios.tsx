import { InputFeedback } from '@oneui/ui/components/Input';
import type {
  InputFeedbackAttention,
  InputFeedbackProps,
  InputFeedbackSize,
  InputFeedbackVariant,
} from '@oneui/ui/components/Input';
import type { SemanticIconName } from '@oneui/shared';

export type InputFeedbackMountScenario = {
  testId: string;
  props: InputFeedbackProps;
};

export type InputFeedbackQaSection = {
  id: string;
  title: string;
  scenarios: readonly InputFeedbackMountScenario[];
};

const DEFAULT_MESSAGE = 'Password must be at least 8 characters.';

export const FIGMA_SIZES: { figma: string; size: InputFeedbackSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

export const FIGMA_VARIANTS: readonly InputFeedbackVariant[] = [
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const FIGMA_ATTENTIONS: readonly InputFeedbackAttention[] = ['low', 'medium', 'high'] as const;

/** 1 — Default (Storybook / Figma baseline) */
export const DEFAULT_SCENARIO: InputFeedbackMountScenario = {
  testId: 'input-feedback-default',
  props: {
    variant: 'negative',
    attention: 'low',
    size: 'm',
    feedback_message: DEFAULT_MESSAGE,
  },
};

/** All API props on one mount */
export const ALL_PROPS_SCENARIO: InputFeedbackMountScenario = {
  testId: 'input-feedback-all-props',
  props: {
    size: 'm',
    attention: 'high',
    variant: 'warning',
    feedback_message: 'Your session expires in 5 minutes.',
    customIcon: 'help',
  },
};

/** 2 — Size */
export const SIZE_SCENARIOS: InputFeedbackMountScenario[] = FIGMA_SIZES.map(({ figma, size }) => ({
  testId: `input-feedback-size-${figma}`,
  props: {
    size,
    variant: 'negative',
    attention: 'medium',
    feedback_message: `Size ${figma} feedback row`,
  },
}));

/** 3 — Attention */
export const ATTENTION_SCENARIOS: InputFeedbackMountScenario[] = FIGMA_ATTENTIONS.map((attention) => ({
  testId: `input-feedback-attention-${attention}`,
  props: {
    attention,
    variant: 'informative',
    size: 'm',
    feedback_message: `${attention} attention feedback`,
  },
}));

/** 4 — Variant (M · low — isolates semantic colour) */
export const VARIANT_SCENARIOS: InputFeedbackMountScenario[] = FIGMA_VARIANTS.map((variant) => ({
  testId: `input-feedback-variant-${variant}`,
  props: {
    variant,
    attention: 'low',
    size: 'm',
    feedback_message: `${variant} message`,
  },
}));

/** 5 — Custom icon */
export const CUSTOM_ICON_SCENARIOS: InputFeedbackMountScenario[] = [
  {
    testId: 'input-feedback-custom-icon-help',
    props: {
      variant: 'informative',
      attention: 'medium',
      size: 'm',
      feedback_message: 'Replaced default info icon with help.',
      customIcon: 'help' satisfies SemanticIconName,
    },
  },
  {
    testId: 'input-feedback-custom-icon-lock',
    props: {
      variant: 'negative',
      attention: 'low',
      size: 'm',
      feedback_message: 'Using lock instead of error.',
      customIcon: 'lock' satisfies SemanticIconName,
    },
  },
];

type ComboRow = { props: InputFeedbackProps; testId: string };

export const COMBO_MATRIX: ComboRow[] = [
  {
    testId: 'input-feedback-combo-0',
    props: {
      size: 's',
      attention: 'high',
      variant: 'positive',
      feedback_message: 'Profile saved successfully.',
    },
  },
  {
    testId: 'input-feedback-combo-1',
    props: {
      size: 'm',
      attention: 'medium',
      variant: 'warning',
      feedback_message: 'Storage is almost full.',
    },
  },
  {
    testId: 'input-feedback-combo-2',
    props: {
      size: 'l',
      attention: 'low',
      variant: 'informative',
      feedback_message: 'We never share your email.',
    },
  },
  {
    testId: 'input-feedback-combo-3',
    props: {
      size: 'm',
      attention: 'high',
      variant: 'negative',
      feedback_message: 'Invalid card number.',
      customIcon: 'help',
    },
  },
];

/** Full variant × attention matrix at size M (12 cells) */
export const VARIANT_ATTENTION_MATRIX: InputFeedbackMountScenario[] = FIGMA_VARIANTS.flatMap((variant) =>
  FIGMA_ATTENTIONS.map((attention) => ({
    testId: `input-feedback-matrix-${variant}-${attention}`,
    props: {
      variant,
      attention,
      size: 'm' as const,
      feedback_message: 'Feedback message',
    },
  })),
);

export const INPUT_FEEDBACK_QA_SECTIONS: readonly InputFeedbackQaSection[] = [
  {
    id: 'input-feedback-qa-default',
    title: '1 Default',
    scenarios: [DEFAULT_SCENARIO],
  },
  {
    id: 'input-feedback-qa-all-props',
    title: '2 All properties',
    scenarios: [ALL_PROPS_SCENARIO],
  },
  {
    id: 'input-feedback-qa-size',
    title: '3 Size (S · M · L)',
    scenarios: SIZE_SCENARIOS,
  },
  {
    id: 'input-feedback-qa-attention',
    title: '4 Attention (low · medium · high)',
    scenarios: ATTENTION_SCENARIOS,
  },
  {
    id: 'input-feedback-qa-variant',
    title: '5 Variant',
    scenarios: VARIANT_SCENARIOS,
  },
  {
    id: 'input-feedback-qa-custom-icon',
    title: '6 Custom icon',
    scenarios: CUSTOM_ICON_SCENARIOS,
  },
  {
    id: 'input-feedback-qa-matrix',
    title: '7 Variant × attention (size M)',
    scenarios: VARIANT_ATTENTION_MATRIX,
  },
  {
    id: 'input-feedback-qa-combos',
    title: '8 Combination samples',
    scenarios: COMBO_MATRIX.map((row) => ({
      testId: row.testId,
      props: row.props,
    })),
  },
] as const;

export function allInputFeedbackScenarioTestIds(): string[] {
  return INPUT_FEEDBACK_QA_SECTIONS.flatMap((section) => section.scenarios.map((s) => s.testId));
}

export const INPUT_FEEDBACK_QA_SECTION_IDS = INPUT_FEEDBACK_QA_SECTIONS.map((s) => s.id);
