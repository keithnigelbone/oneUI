/**
 * InputFeedback (native) barrel.
 *
 * Prop contract, state resolver, and accessibility helpers live in
 * `interface.ts`. Component / showcase imports the same file — never the
 * web `@oneui/ui` shared module.
 */

export { InputFeedback } from './InputFeedback.native';
export type {
  InputFeedbackProps,
  InputFeedbackNativeProps,
  InputFeedbackVariant,
  InputFeedbackAttention,
  InputFeedbackSize,
  InputFeedbackRole,
  InputFeedbackState,
  InputFeedbackAccessibilityProps,
} from './interface';
export {
  INPUT_FEEDBACK_VARIANTS,
  INPUT_FEEDBACK_ATTENTIONS,
  INPUT_FEEDBACK_SIZES,
  resolveFeedbackSize,
  useInputFeedbackState,
  getInputFeedbackAccessibilityProps,
} from './interface';
