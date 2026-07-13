/// CheckboxField state — `CheckboxField.shared.ts` parity.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_checkbox.dart';
import 'one_ui_checkbox_field_a11y.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_field_types.dart' show kDefaultInfoAriaLabel;

/// Figma API row sizes (S / M / L) — same vocabulary as [OneUiCheckbox].
const List<OneUiCheckboxSize> kOneUiCheckboxFieldFigmaSizes =
    kOneUiCheckboxSizes;

class OneUiCheckboxFieldResolvedState {
  const OneUiCheckboxFieldResolvedState({
    required this.resolvedAppearance,
    required this.resolvedSize,
    required this.labelTier,
    required this.feedbackSize,
    required this.isDisabled,
    required this.isReadOnly,
    required this.isInvalid,
    required this.hasLabel,
    required this.hasDescription,
    required this.hasInfoIcon,
    required this.hasFeedback,
    required this.fieldErrorOnlyRow,
    required this.hasDynamicRow,
    required this.integratedSingle,
    required this.multiOptionMode,
    required this.useFieldsetLegend,
    required this.infoIconAriaLabel,
    required this.headingSemanticsId,
    required this.descriptionSemanticsId,
    required this.feedbackSemanticsId,
    required this.dynamicTextSemanticsId,
    required this.dataSize,
    required this.dataAppearance,
    required this.dataDisabled,
    required this.dataInvalid,
  });

  final String resolvedAppearance;
  final OneUiCheckboxSize resolvedSize;
  final OneUiCheckboxSize labelTier;
  final OneUiInputFeedbackSize feedbackSize;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isInvalid;
  final bool hasLabel;
  final bool hasDescription;
  final bool hasInfoIcon;
  final bool hasFeedback;

  /// Web `InputFeedback fieldErrorSlot` — invalid without string `error` / custom `feedback`.
  final bool fieldErrorOnlyRow;
  final bool hasDynamicRow;
  final bool integratedSingle;
  final bool multiOptionMode;
  final bool useFieldsetLegend;
  final String infoIconAriaLabel;
  final String? headingSemanticsId;
  final String? descriptionSemanticsId;
  final String? feedbackSemanticsId;
  final String? dynamicTextSemanticsId;
  final String dataSize;
  final String dataAppearance;
  final bool dataDisabled;
  final bool dataInvalid;

  String get dataPayloadKey =>
      'oneui-checkbox-field|data-size=$dataSize|data-appearance=$dataAppearance'
      '${dataDisabled ? '|data-disabled=true' : ''}'
      '${dataInvalid ? '|data-invalid=true' : ''}';
}

bool _trimmed(String? v) => v != null && v.trim().isNotEmpty;

OneUiInputFeedbackSize _feedbackSizeForLabelTier(OneUiCheckboxSize labelTier) {
  return switch (resolveCheckboxSize(labelTier)) {
    's' => OneUiInputFeedbackSize.s,
    'l' => OneUiInputFeedbackSize.l,
    _ => OneUiInputFeedbackSize.m,
  };
}

OneUiCheckboxFieldResolvedState resolveOneUiCheckboxFieldState({
  OneUiCheckboxAppearance appearance = 'auto',
  OneUiCheckboxSize size = 'm',
  bool disabled = false,
  bool readOnly = false,
  bool invalid = false,
  bool? ariaInvalid,
  String? error,
  Widget? feedback,
  String? label,
  String? description,
  bool infoIcon = false,
  String? infoIconAriaLabel,
  Widget? dynamicTextSlot,
  String? dynamicText,
  String? helperButton,
  required List<Widget> flattenedChildren,
  String? id,
}) {
  final resolvedSize = resolveCheckboxSize(size);
  final labelTier = checkboxSizeToLabelSize(size);
  final rawAppearance = appearance != 'auto' ? appearance : 'secondary';
  final resolvedAppearance =
      rawAppearance == 'auto' ? 'secondary' : rawAppearance;
  final hasLabel = _trimmed(label);
  final hasDescription = _trimmed(description);
  final hasInfoIcon = infoIcon && hasLabel;
  final hasErrorString = _trimmed(error);
  final isInvalid = invalid || ariaInvalid == true || hasErrorString;
  final fieldErrorOnlyRow = invalid && !hasErrorString && feedback == null;
  final hasFeedback = hasErrorString || feedback != null || fieldErrorOnlyRow;
  final hasDynamicStrings = _trimmed(dynamicText) || _trimmed(helperButton);
  final hasDynamicRow = dynamicTextSlot != null || hasDynamicStrings;

  final optionCount = flattenedChildren.length;
  final integratedSingle = optionCount == 0;
  final multiOptionMode = optionCount > 0;
  final useFieldsetLegend = multiOptionMode && hasLabel;

  final fieldId = id?.trim();
  final headingSemanticsId = oneUiCheckboxFieldHeadingSemanticsId(
    fieldId,
    hasHeading: integratedSingle && hasLabel,
  );
  final descriptionSemanticsId = oneUiCheckboxFieldDescriptionSemanticsId(
    fieldId,
    hasDescription: hasDescription,
  );
  final feedbackSemanticsId = oneUiCheckboxFieldFeedbackSemanticsId(
    fieldId,
    hasFeedback: hasFeedback,
  );
  final dynamicTextSemanticsId = oneUiCheckboxFieldDynamicTextSemanticsId(
    fieldId,
    hasDynamicRow: hasDynamicRow,
  );

  return OneUiCheckboxFieldResolvedState(
    resolvedAppearance: resolvedAppearance,
    resolvedSize: resolvedSize,
    labelTier: labelTier,
    feedbackSize: _feedbackSizeForLabelTier(labelTier),
    isDisabled: disabled,
    isReadOnly: readOnly,
    isInvalid: isInvalid,
    hasLabel: hasLabel,
    hasDescription: hasDescription,
    hasInfoIcon: hasInfoIcon,
    hasFeedback: hasFeedback,
    fieldErrorOnlyRow: fieldErrorOnlyRow,
    hasDynamicRow: hasDynamicRow,
    integratedSingle: integratedSingle,
    multiOptionMode: multiOptionMode,
    useFieldsetLegend: useFieldsetLegend,
    infoIconAriaLabel: infoIconAriaLabel ?? kDefaultInfoAriaLabel,
    headingSemanticsId: headingSemanticsId,
    descriptionSemanticsId: descriptionSemanticsId,
    feedbackSemanticsId: feedbackSemanticsId,
    dynamicTextSemanticsId: dynamicTextSemanticsId,
    dataSize: labelTier,
    dataAppearance: resolvedAppearance,
    dataDisabled: disabled,
    dataInvalid: isInvalid,
  );
}

List<Widget> flattenCheckboxFieldChildren(List<Widget> children) {
  final out = <Widget>[];
  for (final child in children) {
    out.addAll(_flattenCheckboxFieldChild(child));
  }
  return out;
}

List<Widget> _flattenCheckboxFieldChild(Widget child) {
  if (child is OneUiCheckbox) return [child];

  if (child is Column) {
    final flat = <Widget>[];
    for (final c in child.children) {
      flat.addAll(_flattenCheckboxFieldChild(c));
    }
    if (flat.isNotEmpty && flat.every((w) => w is OneUiCheckbox)) return flat;
  }

  if (child is Row) {
    final flat = <Widget>[];
    for (final c in child.children) {
      flat.addAll(_flattenCheckboxFieldChild(c));
    }
    if (flat.isNotEmpty && flat.every((w) => w is OneUiCheckbox)) return flat;
  }

  if (child is Padding && child.child != null) {
    return _flattenCheckboxFieldChild(child.child!);
  }

  if (child is SizedBox && child.child != null) {
    return _flattenCheckboxFieldChild(child.child!);
  }

  return [child];
}

List<Widget> enhanceCheckboxFieldOptions(
  List<Widget> children, {
  required bool disabled,
  required bool readOnly,
  required OneUiCheckboxSize size,
  required OneUiCheckboxAppearance appearance,
  required bool invalid,
  bool fieldRequired = false,
  String? groupAriaDescribedBy,
  String? groupAccessibilityHint,
}) {
  return children.map((child) {
    if (child is! OneUiCheckbox) return child;
    final c = child;
    final describedBy = c.ariaDescribedby?.trim().isNotEmpty == true
        ? c.ariaDescribedby
        : groupAriaDescribedBy;
    final hint = c.semanticsHint ?? groupAccessibilityHint;
    return OneUiCheckbox(
      key: c.key,
      label: c.label,
      description: c.description,
      value: c.value,
      size: size,
      appearance: c.appearance != 'auto' ? c.appearance : appearance,
      disabled: c.disabled || disabled,
      readOnly: c.readOnly || readOnly,
      checked: c.checked,
      defaultChecked: c.defaultChecked,
      selected: c.selected,
      defaultSelected: c.defaultSelected,
      indeterminate: c.indeterminate,
      onCheckedChange: c.onCheckedChange,
      onSelectedChange: c.onSelectedChange,
      onPress: c.onPress,
      errorHighlight: c.errorHighlight || invalid,
      ariaInvalid: c.ariaInvalid ?? (invalid ? true : null),
      labelSuffixInside: c.labelSuffixInside,
      labelTrailing: c.labelTrailing,
      semanticsLabel: c.semanticsLabel,
      ariaLabel: c.ariaLabel,
      accessibilityLabel: c.accessibilityLabel,
      semanticsHint: hint,
      ariaLabelledBy: c.ariaLabelledBy,
      ariaDescribedby: describedBy,
      ariaHidden: c.ariaHidden,
      required: c.required || fieldRequired,
      autofocus: c.autofocus,
      forceFocusRing: c.forceFocusRing,
      suppressTapScale: c.suppressTapScale,
      testId: c.testId,
    );
  }).toList();
}
