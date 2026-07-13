import 'one_ui_aria_described_by.dart';
import 'one_ui_input_field_a11y.dart';

export 'one_ui_input_field_a11y.dart'
    show OneUiInputFieldAccessibilityProps, resolveOneUiInputFieldAccessibility;

String? oneUiCheckboxFieldHeadingSemanticsId(
  String? fieldId, {
  required bool hasHeading,
}) {
  if (!hasHeading) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-checkboxfield-heading';
  return '$id-heading';
}

String? oneUiCheckboxFieldDescriptionSemanticsId(
  String? fieldId, {
  required bool hasDescription,
}) {
  if (!hasDescription) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-checkboxfield-desc';
  return '$id-desc';
}

String? oneUiCheckboxFieldFeedbackSemanticsId(
  String? fieldId, {
  required bool hasFeedback,
}) {
  if (!hasFeedback) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-checkboxfield-feedback';
  return '$id-feedback';
}

String? oneUiCheckboxFieldDynamicTextSemanticsId(
  String? fieldId, {
  required bool hasDynamicRow,
}) {
  if (!hasDynamicRow) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return 'oneui-checkboxfield-dynamic';
  return '$id-dynamic';
}

String? resolveOneUiCheckboxFieldGroupDescribedBy({
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

class OneUiCheckboxFieldAccessibilityProps {
  const OneUiCheckboxFieldAccessibilityProps({
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

OneUiCheckboxFieldAccessibilityProps resolveOneUiCheckboxFieldAccessibility({
  String? label,
  String? ariaLabel,
  String? accessibilityHint,
  String? ariaDescribedBy,
  bool ariaHidden = false,
  bool disabled = false,
}) {
  if (ariaHidden) {
    return const OneUiCheckboxFieldAccessibilityProps(hideSubtree: true);
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

  return OneUiCheckboxFieldAccessibilityProps(
    hideSubtree: false,
    accessibilityLabel: resolvedLabel,
    accessibilityHint: hint,
    callerAriaDescribedBy: describedBy,
    disabled: disabled,
  );
}
