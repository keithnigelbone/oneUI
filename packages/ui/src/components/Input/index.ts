/**
 * Input — bordered text container + shared DNA for the input family.
 * For label + validation + dynamic text, import `InputField` from `@oneui/ui/components/InputField`
 * (or the re-exports below for backward compatibility).
 */

export { Input } from './Input';

// Subcomponents — advanced composition (`internals/`; Storybook: Components / Inputs / Input / Internals)
export {
  InputFeedback,
  InputDynamicText,
} from './internals';

// Aggregator + meta live in `InputField/` — re-exported here so `@oneui/ui/components/Input` stays stable.
export { InputField, INPUT_META } from '../InputField';
export type { InputFieldProps } from '../InputField';

// Types (container + leaf primitives)
export type {
  InputProps,
  InputAppearance,
  InputSize,
  InputShape,
  InputFeedbackProps,
  InputFeedbackVariant,
  InputFeedbackAttention,
  InputFeedbackSize,
  InputDynamicTextProps,
  InputLabelSize,
} from './Input.shared';

// Hooks & utilities
export { useInputState, resolveSize as resolveInputSize, resolveFeedbackSize, inputSizeToLabelSize } from './Input.shared';

// Registry / tokens / recipe (container tokens — shared with InputField)
export { INPUT_TOKEN_MANIFEST, INPUT_TOKENS, getInputTokensByCategory, getInputTokenDefault } from './Input.tokens';
export { INPUT_RECIPE_DEFINITION } from './Input.recipe';
export { InputPreview } from './InputPreview';
export type { InputPreviewProps } from './InputPreview';

// Showcase — shared between Storybook and platform docs
export {
  InputFieldSizes,
  InputFieldStates,
  InputFieldWithSlots,
  InputFieldAppearances,
  InputFeedbackShowcase,
  InputDynamicTextShowcase,
  InputFieldFullComposition,
  InputFieldSlotsComposition,
  InputFieldShapes,
  InputFieldSurfaceContext,
} from './Input.showcase';

/** @deprecated Use InputAppearance instead */
export type { InputVariant, InputAttention } from './Input.shared';
