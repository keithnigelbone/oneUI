import 'one_ui_aria_described_by.dart';
import 'one_ui_input_field_a11y.dart';

export 'one_ui_input_field_a11y.dart'
    show OneUiInputFieldAccessibilityProps, resolveOneUiInputFieldAccessibility;

String? oneUiRadioFieldHeadingSemanticsId(
  String? fieldId, {
  required bool hasHeading,
}) {
  if (!hasHeading) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-radiofield-heading';
  return '$id-heading';
}

String? oneUiRadioFieldDescriptionSemanticsId(
  String? fieldId, {
  required bool hasDescription,
}) {
  if (!hasDescription) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-radiofield-desc';
  return '$id-desc';
}

String? oneUiRadioFieldFeedbackSemanticsId(
  String? fieldId, {
  required bool hasFeedback,
}) {
  if (!hasFeedback) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-radiofield-feedback';
  return '$id-feedback';
}

String? oneUiRadioFieldDynamicTextSemanticsId(
  String? fieldId, {
  required bool hasDynamicRow,
}) {
  if (!hasDynamicRow) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-radiofield-dynamic';
  return '$id-dynamic';
}

String? resolveOneUiRadioFieldGroupDescribedBy({
  String? callerAriaDescribedBy,
  String? descriptionSemanticsId,
  String? feedbackSemanticsId,
  String? dynamicTextSemanticsId,
}) {
  return composeOneUiAriaDescribedBy(
    callerAriaDescribedBy: callerAriaDescribedBy,
    autoLinkedIds: [
      descriptionSemanticsId,
      feedbackSemanticsId,
      dynamicTextSemanticsId,
    ],
  );
}

/// Field-level accessibility — RN `getRadioFieldAccessibilityProps` parity.
class OneUiRadioFieldAccessibilityProps {
  const OneUiRadioFieldAccessibilityProps({
    required this.hideSubtree,
    this.accessibilityLabel,
    this.accessibilityHint,
    this.callerAriaDescribedBy,
    this.disabled = false,
  });

  final bool hideSubtree;
  final String? accessibilityLabel;
  final String? accessibilityHint;
  final String? callerAriaDescribedBy;
  final bool disabled;
}

OneUiRadioFieldAccessibilityProps resolveOneUiRadioFieldAccessibility({
  String? label,
  String? ariaLabel,
  String? accessibilityHint,
  String? ariaDescribedBy,
  bool ariaHidden = false,
  bool disabled = false,
}) {
  if (ariaHidden) {
    return const OneUiRadioFieldAccessibilityProps(hideSubtree: true);
  }

  String? resolvedLabel;
  final override = ariaLabel?.trim();
  if (override != null && override.isNotEmpty) {
    resolvedLabel = override;
  } else if (label != null && label.trim().isNotEmpty) {
    resolvedLabel = label.trim();
  }

  String? hint;
  if (accessibilityHint != null && accessibilityHint.trim().isNotEmpty) {
    hint = accessibilityHint.trim();
  }

  String? describedBy;
  if (ariaDescribedBy != null && ariaDescribedBy.trim().isNotEmpty) {
    describedBy = ariaDescribedBy.trim();
  }

  return OneUiRadioFieldAccessibilityProps(
    hideSubtree: false,
    accessibilityLabel: resolvedLabel,
    accessibilityHint: hint,
    callerAriaDescribedBy: describedBy,
    disabled: disabled,
  );
}
