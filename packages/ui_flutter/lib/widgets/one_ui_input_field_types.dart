/// InputField state — RN `InputField/interface.ts` parity.
library;

import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_types.dart';

const kDefaultInfoAriaLabel = 'More information';

/// Figma API row sizes (S / M / L).
const List<String> kOneUiInputFieldFigmaSizes = ['s', 'm', 'l'];

class OneUiInputFieldResolvedState {
  const OneUiInputFieldResolvedState({
    required this.resolvedAppearance,
    required this.numericSize,
    required this.labelSize,
    required this.shape,
    required this.attention,
    required this.isDisabled,
    required this.isReadOnly,
    required this.isInvalid,
    required this.hasLabel,
    required this.hasDescription,
    required this.hasInfoIcon,
    required this.hasFeedback,
    required this.fieldErrorOnlyRow,
    required this.hasDynamicRow,
    required this.feedbackSize,
    required this.infoIconAriaLabel,
    required this.resolvedAccessibilityLabel,
    required this.feedbackSemanticsId,
    required this.descriptionSemanticsId,
    required this.dynamicTextSemanticsId,
    required this.dataSize,
    required this.dataAppearance,
    required this.dataDisabled,
    required this.dataInvalid,
  });

  final String resolvedAppearance;
  final OneUiInputNumericSize numericSize;
  final OneUiInputLabelSize labelSize;
  final OneUiInputShape shape;
  final OneUiInputAttention attention;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isInvalid;
  final bool hasLabel;
  final bool hasDescription;
  final bool hasInfoIcon;
  final bool hasFeedback;
  /// Web `InputFeedback fieldErrorSlot` — valid field with no string `error` / custom `feedback`.
  final bool fieldErrorOnlyRow;
  final bool hasDynamicRow;
  final OneUiInputFeedbackSize feedbackSize;
  final String infoIconAriaLabel;
  final String? resolvedAccessibilityLabel;
  final String? feedbackSemanticsId;
  final String? descriptionSemanticsId;
  final String? dynamicTextSemanticsId;
  final String dataSize;
  final String dataAppearance;
  final bool dataDisabled;
  final bool dataInvalid;

  /// Web label stack `data-size` + field invalid/disabled parity for QA harnesses.
  String get dataPayloadKey =>
      'oneui-input-field|data-size=$dataSize|data-appearance=$dataAppearance'
      '${dataDisabled ? '|data-disabled=true' : ''}'
      '${dataInvalid ? '|data-invalid=true' : ''}';
}

bool _trimmed(String? v) => v != null && v.trim().isNotEmpty;

String? _firstNonEmpty(List<String?> candidates) {
  for (final c in candidates) {
    if (c != null && c.trim().isNotEmpty) return c.trim();
  }
  return null;
}

OneUiInputFieldResolvedState resolveOneUiInputFieldState({
  OneUiInputAppearance appearance = OneUiInputAppearance.auto,
  Object? size,
  OneUiInputShape shape = OneUiInputShape.defaultShape,
  OneUiInputAttention attention = OneUiInputAttention.medium,
  bool disabled = false,
  bool readOnly = false,
  bool invalid = false,
  bool ariaInvalid = false,
  String? error,
  Widget? feedback,
  Widget? labelSlot,
  String? label,
  String? description,
  bool infoIcon = false,
  Widget? dynamicTextSlot,
  String? dynamicText,
  String? helperButton,
  String? accessibilityLabel,
  String? ariaLabel,
  String? id,
  String? infoIconAriaLabel,
  String? parentAppearance,
}) {
  final resolvedAppearance = resolveOneUiInputAppearance(
    appearance,
    parentAppearance: parentAppearance,
  );
  final numericSize = resolveOneUiInputNumericSize(size);
  final labelSize = oneUiInputSizeToLabelSize(numericSize);
  final hasLabel = _trimmed(label);
  final hasDescription = _trimmed(description);
  final hasErrorString = _trimmed(error);
  final isInvalid = invalid || ariaInvalid || hasErrorString;
  final hasInfoIcon = infoIcon && hasLabel && labelSlot == null;
  final fieldErrorOnlyRow = !hasErrorString && feedback == null;
  final hasFeedback = hasErrorString || feedback != null || fieldErrorOnlyRow;
  final hasDynamicStrings = _trimmed(dynamicText) || _trimmed(helperButton);
  final hasDynamicRow = dynamicTextSlot != null || hasDynamicStrings;

  final feedbackSize = switch (labelSize) {
    OneUiInputLabelSize.s => OneUiInputFeedbackSize.s,
    OneUiInputLabelSize.m => OneUiInputFeedbackSize.m,
    OneUiInputLabelSize.l => OneUiInputFeedbackSize.l,
  };

  final fieldId = id?.trim();
  final feedbackSemanticsId = oneUiInputFieldFeedbackSemanticsId(
    fieldId,
    hasFeedback: hasFeedback,
  );
  final descriptionSemanticsId = oneUiInputFieldDescriptionSemanticsId(
    fieldId,
    hasDescription: hasDescription,
  );
  final dynamicTextSemanticsId = oneUiInputFieldDynamicTextSemanticsId(
    fieldId,
    hasDynamicRow: hasDynamicRow,
  );

  return OneUiInputFieldResolvedState(
    resolvedAppearance: resolvedAppearance,
    numericSize: numericSize,
    labelSize: labelSize,
    shape: shape,
    attention: attention,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isInvalid: isInvalid,
    hasLabel: hasLabel,
    hasDescription: hasDescription,
    hasInfoIcon: hasInfoIcon,
    hasFeedback: hasFeedback,
    fieldErrorOnlyRow: fieldErrorOnlyRow,
    hasDynamicRow: hasDynamicRow,
    feedbackSize: feedbackSize,
    infoIconAriaLabel: infoIconAriaLabel ?? kDefaultInfoAriaLabel,
    resolvedAccessibilityLabel:
        _firstNonEmpty([accessibilityLabel, ariaLabel, label]),
    feedbackSemanticsId: feedbackSemanticsId,
    descriptionSemanticsId: descriptionSemanticsId,
    dynamicTextSemanticsId: dynamicTextSemanticsId,
    dataSize: labelSize.name,
    dataAppearance: resolvedAppearance,
    dataDisabled: disabled,
    dataInvalid: isInvalid,
  );
}

OneUiInputFieldResolvedState resolveOneUiInputFieldStateInContext({
  required BuildContext context,
  OneUiInputAppearance appearance = OneUiInputAppearance.auto,
  Object? size,
  OneUiInputShape shape = OneUiInputShape.defaultShape,
  OneUiInputAttention attention = OneUiInputAttention.medium,
  bool disabled = false,
  bool readOnly = false,
  bool invalid = false,
  bool ariaInvalid = false,
  String? error,
  Widget? feedback,
  Widget? labelSlot,
  String? label,
  String? description,
  bool infoIcon = false,
  Widget? dynamicTextSlot,
  String? dynamicText,
  String? helperButton,
  String? accessibilityLabel,
  String? ariaLabel,
  String? id,
  String? infoIconAriaLabel,
}) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  final parentAppearance = surface != null && surface.surfaceDepth > 0
      ? surface.parentAppearance
      : null;
  return resolveOneUiInputFieldState(
    appearance: appearance,
    size: size,
    shape: shape,
    attention: attention,
    disabled: disabled,
    readOnly: readOnly,
    invalid: invalid,
    ariaInvalid: ariaInvalid,
    error: error,
    feedback: feedback,
    labelSlot: labelSlot,
    label: label,
    description: description,
    infoIcon: infoIcon,
    dynamicTextSlot: dynamicTextSlot,
    dynamicText: dynamicText,
    helperButton: helperButton,
    accessibilityLabel: accessibilityLabel,
    ariaLabel: ariaLabel,
    id: id,
    infoIconAriaLabel: infoIconAriaLabel,
    parentAppearance: parentAppearance,
  );
}
