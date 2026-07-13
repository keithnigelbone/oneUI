/// Checkbox accessibility — native `getCheckboxAccessibilityProps` / web `role="checkbox"`.
library;

class OneUiCheckboxSemantics {
  const OneUiCheckboxSemantics({
    required this.label,
    this.hint,
    required this.checked,
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

  /// `true`, `false`, or `'mixed'` for indeterminate.
  final Object checked;
  final bool exposeControl;
  final bool canTap;
  final String? labelledBy;
  final String? describedBy;
  final bool isInvalid;
  final bool isRequired;
  final bool hidden;
}

String? resolveCheckboxAccessibilityLabel({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  String? description,
}) {
  for (final candidate in [
    semanticsLabel,
    ariaLabel,
    accessibilityLabel,
    label,
    description,
  ]) {
    if (candidate != null && candidate.trim().isNotEmpty) {
      return candidate.trim();
    }
  }
  return null;
}

OneUiCheckboxSemantics resolveOneUiCheckboxSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  String? description,
  String? semanticsHint,
  String? accessibilityHint,
  String? ariaLabelledBy,
  String? ariaDescribedby,
  Object? ariaInvalid,
  bool? ariaHidden,
  bool required = false,
  bool errorHighlight = false,
  required bool isChecked,
  required bool isIndeterminate,
  required bool isDisabled,
  required bool isReadOnly,
}) {
  final hidden = ariaHidden == true;
  final labelledById =
      ariaLabelledBy?.trim().isNotEmpty == true ? ariaLabelledBy!.trim() : null;
  // When `aria-labelledby` references a field heading, avoid duplicating visible
  // label text on the control node (web `aria-labelledby` / RN labelledBy).
  final resolvedLabel = labelledById != null
      ? resolveCheckboxAccessibilityLabel(
            semanticsLabel: semanticsLabel,
            ariaLabel: ariaLabel,
            accessibilityLabel: accessibilityLabel,
          )
      : resolveCheckboxAccessibilityLabel(
          semanticsLabel: semanticsLabel,
          ariaLabel: ariaLabel,
          accessibilityLabel: accessibilityLabel,
          label: label,
          description: description,
        );
  final effectiveLabel = resolvedLabel != null && resolvedLabel.isNotEmpty
      ? resolvedLabel
      : (labelledById != null ? '' : 'Checkbox');

  final invalid = ariaInvalid == true ||
      ariaInvalid == 'true' ||
      errorHighlight;
  final checkedState = isIndeterminate ? 'mixed' : isChecked;

  return OneUiCheckboxSemantics(
    label: effectiveLabel,
    hint: semanticsHint ?? accessibilityHint,
    checked: checkedState,
    exposeControl: !hidden,
    canTap: !isDisabled && !isReadOnly,
    labelledBy: labelledById,
    describedBy: ariaDescribedby?.trim().isNotEmpty == true ? ariaDescribedby!.trim() : null,
    isInvalid: invalid,
    isRequired: required,
    hidden: hidden,
  );
}

OneUiCheckboxSemantics getCheckboxAccessibilityProps({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  String? description,
  String? semanticsHint,
  String? accessibilityHint,
  String? ariaLabelledBy,
  String? ariaDescribedby,
  Object? ariaInvalid,
  bool? ariaHidden,
  bool required = false,
  bool errorHighlight = false,
  required bool isDisabled,
  required bool isReadOnly,
  required bool isChecked,
  required bool isIndeterminate,
}) =>
    resolveOneUiCheckboxSemantics(
      semanticsLabel: semanticsLabel,
      ariaLabel: ariaLabel,
      accessibilityLabel: accessibilityLabel,
      label: label,
      description: description,
      semanticsHint: semanticsHint,
      accessibilityHint: accessibilityHint,
      ariaLabelledBy: ariaLabelledBy,
      ariaDescribedby: ariaDescribedby,
      ariaInvalid: ariaInvalid,
      ariaHidden: ariaHidden,
      required: required,
      errorHighlight: errorHighlight,
      isChecked: isChecked,
      isIndeterminate: isIndeterminate,
      isDisabled: isDisabled,
      isReadOnly: isReadOnly,
    );
