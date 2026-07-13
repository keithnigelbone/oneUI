import 'one_ui_aria_described_by.dart';

/// Field-root accessibility — RN `getInputFieldAccessibilityProps` parity.
class OneUiInputFieldAccessibilityProps {
  const OneUiInputFieldAccessibilityProps({
    required this.excludeFromSemantics,
    this.hideDescendants = false,
  });

  /// Root `<View>` is decorative; focus + name live on inner [OneUiInput].
  final bool excludeFromSemantics;

  /// When [ariaHidden] is true, collapse the entire stack for assistive tech.
  final bool hideDescendants;
}

OneUiInputFieldAccessibilityProps resolveOneUiInputFieldAccessibility({
  bool ariaHidden = false,
}) {
  if (ariaHidden) {
    return const OneUiInputFieldAccessibilityProps(
      excludeFromSemantics: true,
      hideDescendants: true,
    );
  }
  return const OneUiInputFieldAccessibilityProps(excludeFromSemantics: true);
}

/// Inner [OneUiInput] semantics — RN forwards `accessibilityHint` / `aria-describedby`.
class OneUiInputFieldInputAccessibility {
  const OneUiInputFieldInputAccessibility({
    this.accessibilityHint,
    this.ariaDescribedBy,
  });

  final String? accessibilityHint;
  final String? ariaDescribedBy;
}

OneUiInputFieldInputAccessibility resolveOneUiInputFieldInputAccessibility({
  String? accessibilityHint,
  String? ariaDescribedBy,
}) {
  String? hint;
  if (accessibilityHint != null && accessibilityHint.trim().isNotEmpty) {
    hint = accessibilityHint.trim();
  }
  String? describedBy;
  if (ariaDescribedBy != null && ariaDescribedBy.trim().isNotEmpty) {
    describedBy = ariaDescribedBy.trim();
  }
  return OneUiInputFieldInputAccessibility(
    accessibilityHint: hint,
    ariaDescribedBy: describedBy,
  );
}

/// Composes caller `aria-describedby` with field-owned semantics targets.
String? resolveOneUiInputFieldDescribedBy({
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
