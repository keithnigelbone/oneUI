/// Radio accessibility — native `getRadioAccessibilityProps` / web `role="radio"`.
library;

class OneUiRadioSemantics {
  const OneUiRadioSemantics({
    required this.label,
    this.hint,
    required this.selected,
    required this.exposeControl,
    required this.canTap,
    this.labelledBy,
    this.describedBy,
    this.isInvalid = false,
    this.isRequired = false,
    this.hidden = false,
  });

  final String label;
  final String? hint;
  final bool selected;

  /// False when [hidden] — exclude from tree.
  final bool exposeControl;

  /// False when disabled or read-only (no selection change).
  final bool canTap;
  final String? labelledBy;
  final String? describedBy;
  final bool isInvalid;
  final bool isRequired;
  final bool hidden;
}

String? resolveRadioAccessibilityLabel({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  Object? child,
}) {
  for (final candidate in [
    semanticsLabel,
    ariaLabel,
    accessibilityLabel,
    label,
  ]) {
    if (candidate != null && candidate.trim().isNotEmpty) {
      return candidate.trim();
    }
  }
  if (child is String && child.trim().isNotEmpty) return child.trim();
  return null;
}

OneUiRadioSemantics resolveOneUiRadioSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  Object? child,
  String? semanticsHint,
  String? accessibilityHint,
  String? ariaLabelledBy,
  String? ariaDescribedby,
  Object? ariaInvalid,
  bool? ariaHidden,
  bool required = false,
  required bool isChecked,
  required bool isDisabled,
  required bool isReadOnly,
}) {
  final hidden = ariaHidden == true;
  final resolvedLabel = resolveRadioAccessibilityLabel(
        semanticsLabel: semanticsLabel,
        ariaLabel: ariaLabel,
        accessibilityLabel: accessibilityLabel,
        label: label,
        child: child,
      ) ??
      'Radio';

  final invalid = ariaInvalid == true || ariaInvalid == 'true';

  return OneUiRadioSemantics(
    label: resolvedLabel,
    hint: semanticsHint ?? accessibilityHint,
    selected: isChecked,
    exposeControl: !hidden,
    canTap: !isDisabled && !isReadOnly,
    labelledBy: ariaLabelledBy?.trim().isNotEmpty == true
        ? ariaLabelledBy!.trim()
        : null,
    describedBy: ariaDescribedby?.trim().isNotEmpty == true
        ? ariaDescribedby!.trim()
        : null,
    isInvalid: invalid,
    isRequired: required,
    hidden: hidden,
  );
}

/// RN `getRadioAccessibilityProps` — maps to Flutter [Semantics] on [OneUiRadio].
OneUiRadioSemantics getRadioAccessibilityProps({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  Object? child,
  String? semanticsHint,
  String? accessibilityHint,
  String? ariaLabelledBy,
  String? ariaDescribedby,
  Object? ariaInvalid,
  bool? ariaHidden,
  bool required = false,
  required bool isDisabled,
  required bool isReadOnly,
  required bool isChecked,
}) =>
    resolveOneUiRadioSemantics(
      semanticsLabel: semanticsLabel,
      ariaLabel: ariaLabel,
      accessibilityLabel: accessibilityLabel,
      label: label,
      child: child,
      semanticsHint: semanticsHint,
      accessibilityHint: accessibilityHint,
      ariaLabelledBy: ariaLabelledBy,
      ariaDescribedby: ariaDescribedby,
      ariaInvalid: ariaInvalid,
      ariaHidden: ariaHidden,
      required: required,
      isChecked: isChecked,
      isDisabled: isDisabled,
      isReadOnly: isReadOnly,
    );
