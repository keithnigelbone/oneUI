/// RadioField state — `RadioField.shared.ts` / `InputField/interface.ts` parity.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_field_types.dart' show kDefaultInfoAriaLabel;
import 'one_ui_radio.dart';
import 'one_ui_radio_field_a11y.dart';

/// Figma API row sizes (S / M / L) — same vocabulary as [OneUiRadio].
const List<OneUiRadioSize> kOneUiRadioFieldFigmaSizes = kOneUiRadioSizes;

class OneUiRadioFieldResolvedState {
  const OneUiRadioFieldResolvedState({
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
    required this.hasDynamicRow,
    required this.integratedSingle,
    required this.plainOptionMode,
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
  final OneUiRadioSize resolvedSize;
  final OneUiRadioSize labelTier;
  final OneUiInputFeedbackSize feedbackSize;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isInvalid;
  final bool hasLabel;
  final bool hasDescription;
  final bool hasInfoIcon;
  final bool hasFeedback;
  final bool hasDynamicRow;
  final bool integratedSingle;
  final bool plainOptionMode;
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
      'oneui-radio-field|data-size=$dataSize|data-appearance=$dataAppearance'
      '${dataDisabled ? '|data-disabled=true' : ''}'
      '${dataInvalid ? '|data-invalid=true' : ''}';
}

bool _trimmed(String? v) => v != null && v.trim().isNotEmpty;

OneUiInputFeedbackSize _feedbackSizeForLabelTier(OneUiRadioSize labelTier) {
  return switch (resolveRadioSize(labelTier)) {
    's' => OneUiInputFeedbackSize.s,
    'l' => OneUiInputFeedbackSize.l,
    _ => OneUiInputFeedbackSize.m,
  };
}

OneUiRadioFieldResolvedState resolveOneUiRadioFieldState({
  OneUiRadioAppearance appearance = 'auto',
  OneUiRadioSize size = 'm',
  bool disabled = false,
  bool readOnly = false,
  bool invalid = false,
  String? error,
  Widget? feedback,
  String? label,
  String? description,
  bool infoIcon = false,
  Widget? dynamicTextSlot,
  String? dynamicText,
  String? helperButton,
  String? infoIconAriaLabel,
  required List<Widget> flattenedChildren,
  String? id,
}) {
  final resolvedSize = resolveRadioSize(size);
  final labelTier = radioSizeToLabelSize(size);
  final rawAppearance = appearance != 'auto' ? appearance : 'secondary';
  final resolvedAppearance =
      rawAppearance == 'auto' ? 'secondary' : rawAppearance;
  final hasLabel = _trimmed(label);
  final hasDescription = _trimmed(description);
  final hasInfoIcon = infoIcon && hasLabel;
  final hasErrorString = _trimmed(error);
  final isInvalid = invalid || hasErrorString;
  final hasFeedback = hasErrorString || feedback != null;
  final hasDynamicStrings = _trimmed(dynamicText) || _trimmed(helperButton);
  final hasDynamicRow = dynamicTextSlot != null || hasDynamicStrings;

  final optionCount = flattenedChildren.length;
  final integratedSingle = optionCount == 0 && hasLabel;
  final plainOptionMode = optionCount == 1;
  final multiOptionMode = optionCount > 1;
  final useFieldsetLegend = multiOptionMode && hasLabel;

  final fieldId = id?.trim();
  final headingSemanticsId = oneUiRadioFieldHeadingSemanticsId(
    fieldId,
    hasHeading: integratedSingle && hasLabel,
  );
  final descriptionSemanticsId = oneUiRadioFieldDescriptionSemanticsId(
    fieldId,
    hasDescription: hasDescription,
  );
  final feedbackSemanticsId = oneUiRadioFieldFeedbackSemanticsId(
    fieldId,
    hasFeedback: hasFeedback,
  );
  final dynamicTextSemanticsId = oneUiRadioFieldDynamicTextSemanticsId(
    fieldId,
    hasDynamicRow: hasDynamicRow,
  );

  return OneUiRadioFieldResolvedState(
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
    hasDynamicRow: hasDynamicRow,
    integratedSingle: integratedSingle,
    plainOptionMode: plainOptionMode,
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

/// Flatten option list — web `flattenFieldChildren` (Fragment / layout wrappers).
List<Widget> flattenRadioFieldChildren(List<Widget> children) {
  final out = <Widget>[];
  for (final child in children) {
    out.addAll(_flattenRadioFieldChild(child));
  }
  return out;
}

List<Widget> _flattenRadioFieldChild(Widget child) {
  if (child is OneUiRadio) return [child];

  if (child is Column) {
    final flat = <Widget>[];
    for (final c in child.children) {
      flat.addAll(_flattenRadioFieldChild(c));
    }
    if (flat.isNotEmpty && flat.every((w) => w is OneUiRadio)) return flat;
  }

  if (child is Row) {
    final flat = <Widget>[];
    for (final c in child.children) {
      flat.addAll(_flattenRadioFieldChild(c));
    }
    if (flat.isNotEmpty && flat.every((w) => w is OneUiRadio)) return flat;
  }

  if (child is Padding && child.child != null) {
    return _flattenRadioFieldChild(child.child!);
  }

  if (child is SizedBox && child.child != null) {
    return _flattenRadioFieldChild(child.child!);
  }

  return [child];
}

/// Propagate field-level props onto each [OneUiRadio] option — web `enhanceRadioOptions`.
List<Widget> enhanceRadioFieldOptions(
  List<Widget> children, {
  required bool disabled,
  required bool readOnly,
  required OneUiRadioSize size,
  required OneUiRadioAppearance appearance,
  required bool invalid,
  bool fieldRequired = false,
  String? groupAriaDescribedBy,
  String? groupAccessibilityHint,
}) {
  return children.map((child) {
    if (child is! OneUiRadio) return child;
    final r = child;
    final describedBy = r.ariaDescribedby?.trim().isNotEmpty == true
        ? r.ariaDescribedby
        : groupAriaDescribedBy;
    final hint = r.semanticsHint ?? groupAccessibilityHint;
    return OneUiRadio(
      key: r.key,
      child: r.child,
      label: r.label,
      description: r.description,
      value: r.value,
      size: size,
      appearance: r.appearance != 'auto' ? r.appearance : appearance,
      disabled: r.disabled || disabled,
      readOnly: r.readOnly || readOnly,
      checked: r.checked,
      defaultChecked: r.defaultChecked,
      onChange: r.onChange,
      onPress: r.onPress,
      errorHighlight: r.errorHighlight || invalid,
      labelSuffixInside: r.labelSuffixInside,
      labelTrailing: r.labelTrailing,
      semanticsLabel: r.semanticsLabel,
      ariaLabel: r.ariaLabel,
      accessibilityLabel: r.accessibilityLabel,
      semanticsHint: hint,
      accessibilityHint: hint,
      ariaLabelledBy: r.ariaLabelledBy,
      ariaDescribedby: describedBy,
      ariaInvalid: r.ariaInvalid,
      ariaHidden: r.ariaHidden,
      required: r.required || fieldRequired,
      autofocus: r.autofocus,
      forceFocusRing: r.forceFocusRing,
      suppressTapScale: r.suppressTapScale,
      testId: r.testId,
    );
  }).toList();
}
