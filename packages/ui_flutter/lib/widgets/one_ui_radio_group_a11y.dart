/// RadioGroup accessibility — web `role="radiogroup"` / RN fieldset patterns.
library;

class OneUiRadioGroupSemantics {
  const OneUiRadioGroupSemantics({
    required this.exposeGroup,
    this.label,
    this.describedBy,
    this.hint,
    this.disabled = false,
  });

  final bool exposeGroup;
  final String? label;
  final String? describedBy;
  final String? hint;
  final bool disabled;
}

OneUiRadioGroupSemantics resolveOneUiRadioGroupSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? semanticsDescribedBy,
  String? ariaDescribedby,
  String? semanticsHint,
  String? accessibilityHint,
  bool disabled = false,
}) {
  final label = (semanticsLabel ?? ariaLabel)?.trim();
  final describedBy = (semanticsDescribedBy ?? ariaDescribedby)?.trim();
  final hint = (semanticsHint ?? accessibilityHint)?.trim();
  final hasName = label != null && label.isNotEmpty;

  return OneUiRadioGroupSemantics(
    exposeGroup: hasName,
    label: hasName ? label : null,
    describedBy: describedBy?.isNotEmpty == true ? describedBy : null,
    hint: hint?.isNotEmpty == true ? hint : null,
    disabled: disabled,
  );
}
