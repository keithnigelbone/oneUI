import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'one_ui_aria_described_by.dart';
import 'one_ui_input_types.dart';

export 'one_ui_aria_described_by.dart'
    show
        composeOneUiAriaDescribedBy,
        oneUiInputFieldDescriptionSemanticsId,
        oneUiInputFieldDynamicTextSemanticsId,
        oneUiInputFieldFeedbackSemanticsId,
        oneUiParseAriaDescribedByNodeIds;

/// Resolved state — mirrors RN `useInputState` / web `useInputState`.
class OneUiInputResolvedState {
  const OneUiInputResolvedState({
    required this.resolvedAppearance,
    required this.numericSize,
    required this.labelSize,
    required this.shape,
    required this.attention,
    required this.isDisabled,
    required this.isReadOnly,
    required this.hasErrorHighlight,
    required this.hasAnySlot,
    required this.dataSize,
    required this.dataAppearance,
    required this.dataAttention,
    required this.dataShape,
    required this.dataDisabled,
    required this.dataInvalid,
    required this.dataReadOnly,
  });

  final String resolvedAppearance;
  final OneUiInputNumericSize numericSize;
  final OneUiInputLabelSize labelSize;
  final OneUiInputShape shape;
  final OneUiInputAttention attention;
  final bool isDisabled;
  final bool isReadOnly;
  final bool hasErrorHighlight;
  final bool hasAnySlot;
  final String dataSize;
  final String dataAppearance;
  final String dataAttention;
  final String dataShape;
  final bool dataDisabled;
  final bool dataInvalid;
  final bool dataReadOnly;

  /// Web `Input.tsx` container `data-*` parity for QA / Storybook harnesses.
  String get dataPayloadKey =>
      'oneui-input|data-size=$dataSize|data-appearance=$dataAppearance|'
      'data-attention=$dataAttention|data-shape=$dataShape'
      '${dataDisabled ? '|data-disabled=true' : ''}'
      '${dataInvalid ? '|data-invalid=true' : ''}'
      '${dataReadOnly ? '|data-readonly=true' : ''}';
}

OneUiInputResolvedState resolveOneUiInputState({
  Object? size,
  OneUiInputAppearance appearance = OneUiInputAppearance.auto,
  OneUiInputShape shape = OneUiInputShape.defaultShape,
  OneUiInputAttention attention = OneUiInputAttention.medium,
  bool disabled = false,
  bool readOnly = false,
  bool errorHighlight = false,
  bool ariaInvalid = false,
  Object? start,
  Object? start2,
  Object? end,
  Object? end2,
  Object? leftAddon,
  Object? rightAddon,
  String? parentAppearance,
}) {
  final numericSize = resolveOneUiInputNumericSize(size);
  final resolvedAppearance = resolveOneUiInputAppearance(
    appearance,
    parentAppearance: parentAppearance,
  );
  final hasError = errorHighlight || ariaInvalid;
  final startSlot = start ?? leftAddon;
  final endSlot = end ?? rightAddon;
  return OneUiInputResolvedState(
    resolvedAppearance: resolvedAppearance,
    numericSize: numericSize,
    labelSize: oneUiInputSizeToLabelSize(numericSize),
    shape: shape,
    attention: attention,
    isDisabled: disabled,
    isReadOnly: readOnly,
    hasErrorHighlight: hasError,
    hasAnySlot:
        startSlot != null || start2 != null || endSlot != null || end2 != null,
    dataSize: '$numericSize',
    dataAppearance: resolvedAppearance,
    dataAttention: attention.wireValue,
    dataShape: shape.wireValue,
    dataDisabled: disabled,
    dataInvalid: hasError,
    dataReadOnly: readOnly,
  );
}

OneUiInputResolvedState resolveOneUiInputStateInContext({
  required BuildContext context,
  Object? size,
  OneUiInputAppearance appearance = OneUiInputAppearance.auto,
  OneUiInputShape shape = OneUiInputShape.defaultShape,
  OneUiInputAttention attention = OneUiInputAttention.medium,
  bool disabled = false,
  bool readOnly = false,
  bool errorHighlight = false,
  bool ariaInvalid = false,
  Object? start,
  Object? start2,
  Object? end,
  Object? end2,
  Object? leftAddon,
  Object? rightAddon,
}) {
  return resolveOneUiInputState(
    size: size,
    appearance: appearance,
    shape: shape,
    attention: attention,
    disabled: disabled,
    readOnly: readOnly,
    errorHighlight: errorHighlight,
    ariaInvalid: ariaInvalid,
    start: start,
    start2: start2,
    end: end,
    end2: end2,
    leftAddon: leftAddon,
    rightAddon: rightAddon,
    parentAppearance: resolveOneUiInputParentAppearance(context),
  );
}

/// Keyboard mapping — RN `resolveTextInputType`.
class OneUiInputTextInputOptions {
  const OneUiInputTextInputOptions({
    required this.keyboardType,
    required this.obscureText,
  });

  final TextInputType keyboardType;
  final bool obscureText;
}

OneUiInputTextInputOptions resolveOneUiInputTextInputOptions(String? type) {
  if (type == 'password') {
    return const OneUiInputTextInputOptions(
      keyboardType: TextInputType.text,
      obscureText: true,
    );
  }
  return OneUiInputTextInputOptions(
    keyboardType: oneUiInputKeyboardType(type),
    obscureText: false,
  );
}

TextInputType oneUiInputKeyboardType(String? type) {
  switch (type) {
    case 'email':
      return TextInputType.emailAddress;
    case 'password':
      return TextInputType.visiblePassword;
    case 'number':
      return TextInputType.number;
    case 'tel':
      return TextInputType.phone;
    case 'url':
      return TextInputType.url;
    case 'search':
      return TextInputType.text;
    default:
      return TextInputType.text;
  }
}

bool oneUiInputObscureText(String? type) =>
    resolveOneUiInputTextInputOptions(type).obscureText;

List<TextInputFormatter>? oneUiInputFormatters(String? type) {
  if (type == 'number') {
    return [FilteringTextInputFormatter.digitsOnly];
  }
  return null;
}

/// Semantics config for the field — mirrors RN `getInputAccessibilityProps`.
class OneUiInputAccessibilityConfig {
  const OneUiInputAccessibilityConfig({
    required this.exposed,
    required this.hidden,
    this.label,
    this.hint,
    this.enabled = true,
    this.readOnly = false,
    this.obscured = false,
    this.isRequired = false,
    this.ariaDescribedBy,
    this.describedByNodeIds,
    this.ariaInvalid,
    this.validationResult = SemanticsValidationResult.none,
  });

  final bool exposed;
  final bool hidden;
  final String? label;
  final String? hint;
  final bool enabled;
  final bool readOnly;
  final bool obscured;
  final bool isRequired;
  final String? ariaDescribedBy;
  final Set<String>? describedByNodeIds;
  final bool? ariaInvalid;
  final SemanticsValidationResult validationResult;
}

String? oneUiInputExplicitAccessibilityLabel({
  String? accessibilityLabel,
  String? ariaLabel,
}) {
  final explicit = accessibilityLabel ?? ariaLabel;
  if (explicit == null) return null;
  final trimmed = explicit.trim();
  return trimmed.isEmpty ? null : trimmed;
}

String? oneUiInputVisibleLabelSemantics({String? label}) {
  final trimmed = label?.trim();
  return trimmed == null || trimmed.isEmpty ? null : trimmed;
}

OneUiInputAccessibilityConfig resolveOneUiInputAccessibility({
  String? accessibilityLabel,
  String? ariaLabel,
  String? accessibilityHint,
  String? visibleLabel,
  String? placeholder,
  String? ariaDescribedBy,
  bool ariaInvalid = false,
  bool ariaHidden = false,
  bool required = false,
  required bool isDisabled,
  required bool isReadOnly,
  required String type,
}) {
  if (ariaHidden) {
    return const OneUiInputAccessibilityConfig(
      exposed: false,
      hidden: true,
    );
  }

  final explicit = oneUiInputExplicitAccessibilityLabel(
    accessibilityLabel: accessibilityLabel,
    ariaLabel: ariaLabel,
  );
  final visible = oneUiInputVisibleLabelSemantics(label: visibleLabel);
  final label = explicit ?? visible;

  final explicitHint = accessibilityHint?.trim();
  final placeholderHint = placeholder?.trim();
  final hint = explicitHint != null && explicitHint.isNotEmpty
      ? explicitHint
      : (placeholderHint != null && placeholderHint.isNotEmpty
          ? placeholderHint
          : null);

  final describedByTrimmed = ariaDescribedBy?.trim();
  final describedByWire =
      describedByTrimmed != null && describedByTrimmed.isNotEmpty
          ? describedByTrimmed
          : null;

  return OneUiInputAccessibilityConfig(
    exposed: true,
    hidden: false,
    label: label,
    hint: hint,
    // Web `<input readonly>` and RN `accessibilityState` keep read-only fields
    // focusable/enabled; only `disabled` announces as not enabled.
    enabled: !isDisabled,
    readOnly: isReadOnly,
    obscured: oneUiInputObscureText(type),
    isRequired: required,
    ariaDescribedBy: describedByWire,
    describedByNodeIds: oneUiParseAriaDescribedByNodeIds(describedByWire),
    ariaInvalid: ariaInvalid ? true : null,
    validationResult: ariaInvalid
        ? SemanticsValidationResult.invalid
        : SemanticsValidationResult.none,
  );
}

/// @deprecated Use [resolveOneUiInputAccessibility].
String? oneUiInputSemanticsLabel({
  String? ariaLabel,
  String? label,
  String? placeholder,
}) {
  return resolveOneUiInputAccessibility(
    ariaLabel: ariaLabel,
    visibleLabel: label,
    placeholder: placeholder,
    isDisabled: false,
    isReadOnly: false,
    type: 'text',
  ).label;
}
