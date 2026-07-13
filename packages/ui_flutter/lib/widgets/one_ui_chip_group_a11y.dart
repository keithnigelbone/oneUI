/// ChipGroup accessibility — `getChipGroupAccessibilityProps`.
library;

class OneUiChipGroupSemantics {
  const OneUiChipGroupSemantics({
    required this.exposeGroup,
    this.label,
    this.labelledBy,
    this.hint,
    this.disabled = false,
  });

  /// RN `accessible` — true when the group has a name.
  final bool exposeGroup;
  final String? label;
  final String? labelledBy;
  final String? hint;
  final bool disabled;
}

OneUiChipGroupSemantics resolveOneUiChipGroupSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? semanticsLabelledBy,
  String? ariaLabelledBy,
  String? semanticsHint,
  String? accessibilityHint,
  bool disabled = false,
}) {
  final label = (semanticsLabel ?? ariaLabel)?.trim();
  final labelledBy = (semanticsLabelledBy ?? ariaLabelledBy)?.trim();
  final hint = (semanticsHint ?? accessibilityHint)?.trim();
  final hasName = (label != null && label.isNotEmpty) ||
      (labelledBy != null && labelledBy.isNotEmpty);

  return OneUiChipGroupSemantics(
    exposeGroup: hasName,
    label: label?.isNotEmpty == true ? label : null,
    labelledBy: labelledBy?.isNotEmpty == true ? labelledBy : null,
    hint: hint?.isNotEmpty == true ? hint : null,
    disabled: disabled,
  );
}

/// RN `getChipGroupAccessibilityProps` alias.
OneUiChipGroupSemantics getChipGroupAccessibilityProps({
  String? semanticsLabel,
  String? ariaLabel,
  String? semanticsLabelledBy,
  String? ariaLabelledBy,
  String? semanticsHint,
  String? accessibilityHint,
  bool disabled = false,
}) =>
    resolveOneUiChipGroupSemantics(
      semanticsLabel: semanticsLabel,
      ariaLabel: ariaLabel,
      semanticsLabelledBy: semanticsLabelledBy,
      ariaLabelledBy: ariaLabelledBy,
      semanticsHint: semanticsHint,
      accessibilityHint: accessibilityHint,
      disabled: disabled,
    );
