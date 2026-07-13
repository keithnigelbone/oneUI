import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/text_style_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_icon_button.dart';
import 'one_ui_icon_button_types.dart';
import 'one_ui_input.dart';
import 'one_ui_input_dynamic_text.dart';
import 'one_ui_input_feedback.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_field_a11y.dart';
import 'one_ui_input_field_types.dart';
import 'one_ui_input_types.dart';
import 'one_ui_text_types.dart';

/// Full text field aggregator — `InputField.tsx` / `InputField.native.tsx` parity.
///
/// Stack order (Figma `.DNA/InputField` 4298:6330): label header → bordered
/// [OneUiInput] (no integrated label) → feedback → dynamic row.
class OneUiInputField extends StatelessWidget {
  const OneUiInputField({
    super.key,
    this.labelSlot,
    this.label,
    this.description,
    this.infoIcon = false,
    this.infoIconSlot,
    this.infoIconAriaLabel,
    this.fullWidth = false,
    this.error,
    this.feedback,
    this.dynamicTextSlot,
    this.dynamicText,
    this.helperButton,
    this.onHelperPressed,

    /// RN / web alias for [onHelperPressed].
    VoidCallback? onHelperPress,
    this.invalid,
    this.size = 10,
    this.appearance = OneUiInputAppearance.auto,
    this.shape = OneUiInputShape.defaultShape,
    this.attention = OneUiInputAttention.medium,
    this.start,
    this.start2,
    this.end,
    this.end2,

    /// Deprecated web aliases — use [start] / [end] instead.
    this.leftAddon,
    this.rightAddon,
    this.placeholder,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.onSubmit,
    this.disabled = false,
    this.readOnly = false,
    this.required = false,
    this.maxLength,
    this.name,
    this.type = 'text',
    this.onKeyDown,
    this.onBlur,
    this.onFocus,
    this.id,
    this.testId,
    this.autoComplete,
    this.autofocus = false,
    this.accessibilityLabel,
    this.ariaLabel,
    this.accessibilityHint,
    this.ariaDescribedBy,
    this.ariaInvalid,
    this.ariaHidden,
    this.width,
  }) : _onHelperPressed = onHelperPressed ?? onHelperPress;

  final VoidCallback? _onHelperPressed;

  final Widget? labelSlot;
  final String? label;
  final String? description;
  final bool infoIcon;
  final Widget? infoIconSlot;
  final String? infoIconAriaLabel;
  final bool fullWidth;
  final String? error;
  final Widget? feedback;
  final Widget? dynamicTextSlot;
  final String? dynamicText;
  final String? helperButton;
  final VoidCallback? onHelperPressed;
  final bool? invalid;

  final Object? size;
  final OneUiInputAppearance appearance;
  final OneUiInputShape shape;
  final OneUiInputAttention attention;
  final Widget? start;
  final Widget? start2;
  final Widget? end;
  final Widget? end2;
  final Widget? leftAddon;
  final Widget? rightAddon;
  final String? placeholder;
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmit;
  final bool disabled;
  final bool readOnly;
  final bool required;
  final int? maxLength;
  final String? name;
  final String type;
  final ValueChanged<KeyEvent>? onKeyDown;
  final VoidCallback? onBlur;
  final VoidCallback? onFocus;
  final String? id;
  final String? testId;
  final String? autoComplete;
  final bool autofocus;
  final String? accessibilityLabel;
  final String? ariaLabel;
  final String? accessibilityHint;
  final String? ariaDescribedBy;
  final bool? ariaInvalid;
  final bool? ariaHidden;
  final double? width;

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiBrandLoadState.maybeOf(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final scope = OneUiScope.of(context);
    final fieldGap = ds.resolveComponentLengthPxCascade(
      ['--InputField-gap', '--Spacing-1-5'],
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
    if (fieldGap == null) {
      return oneUiConvexGapPlaceholder(['InputField gap unresolved']);
    }

    final typo = OneUiScope.nativeTypographyOf(context);
    final labelAreaGap = ds.resolveComponentLengthPxCascade(
          ['--InputField-labelGap', '--Spacing-0-5'],
          platformId: scope.platformId,
          density: scope.density,
          platformsConfig: scope.platformsFoundationConfig,
          nativeTypography: typo,
        ) ??
        resolveSpacingPx(
          designSystem: ds,
          platformsConfig: scope.platformsFoundationConfig,
          platformId: scope.platformId,
          density: scope.density,
          spacingName: '0-5',
        );
    final labelRowGap = ds.resolveComponentLengthPxCascade(
          ['--InputField-labelIconGap', '--Spacing-0-5'],
          platformId: scope.platformId,
          density: scope.density,
          platformsConfig: scope.platformsFoundationConfig,
          nativeTypography: typo,
        ) ??
        labelAreaGap;

    final state = resolveOneUiInputFieldStateInContext(
      context: context,
      appearance: appearance,
      size: size,
      shape: shape,
      attention: attention,
      disabled: disabled,
      readOnly: readOnly,
      invalid: invalid ?? false,
      ariaInvalid: ariaInvalid ?? false,
      label: label,
      description: description,
      infoIcon: infoIcon,
      labelSlot: labelSlot,
      error: error,
      feedback: feedback,
      dynamicTextSlot: dynamicTextSlot,
      dynamicText: dynamicText,
      helperButton: helperButton,
      accessibilityLabel: accessibilityLabel,
      ariaLabel: ariaLabel,
      infoIconAriaLabel: infoIconAriaLabel,
      id: id,
    );

    final inputA11y = resolveOneUiInputFieldInputAccessibility(
      accessibilityHint: accessibilityHint,
      ariaDescribedBy: ariaDescribedBy,
    );

    final composedDescribedBy = resolveOneUiInputFieldDescribedBy(
      callerAriaDescribedBy: inputA11y.ariaDescribedBy,
      descriptionSemanticsId: state.descriptionSemanticsId,
      feedbackSemanticsId: state.feedbackSemanticsId,
      dynamicTextSemanticsId: state.dynamicTextSemanticsId,
    );

    final resolvedAppearance = OneUiInputAppearance.values.firstWhere(
      (a) => a.wireValue == state.resolvedAppearance,
      orElse: () => OneUiInputAppearance.secondary,
    );

    final startContent = start ?? leftAddon;
    final endContent = end ?? rightAddon;

    Widget inputShell = OneUiInput(
      externalLabelHeader: true,
      size: size,
      appearance: resolvedAppearance,
      shape: shape,
      attention: attention,
      start: startContent,
      start2: start2,
      end: endContent,
      end2: end2,
      placeholder: placeholder,
      value: value,
      defaultValue: defaultValue,
      onChanged: onChanged,
      onSubmit: onSubmit,
      disabled: disabled,
      readOnly: readOnly,
      required: required,
      maxLength: maxLength,
      name: name,
      type: type,
      onKeyDown: onKeyDown,
      onBlur: onBlur,
      onFocus: onFocus,
      id: id,
      testId: testId,
      autoComplete: autoComplete,
      autofocus: autofocus,
      errorHighlight: state.isInvalid,
      ariaInvalid: state.isInvalid,
      accessibilityLabel: state.resolvedAccessibilityLabel,
      ariaLabel: ariaLabel,
      accessibilityHint: inputA11y.accessibilityHint,
      ariaDescribedBy: composedDescribedBy,
      width: width,
    );
    if (fullWidth) {
      inputShell = SizedBox(width: double.infinity, child: inputShell);
    }

    Widget? labelHeader = _buildLabelHeader(
      context,
      state: state,
      labelAreaGap: labelAreaGap,
      labelRowGap: labelRowGap,
    );

    Widget? feedbackRow = feedback;
    if (feedbackRow == null && error != null && error!.trim().isNotEmpty) {
      feedbackRow = OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        size: state.feedbackSize,
        feedbackMessage: error,
        semanticsIdentifier: state.feedbackSemanticsId,
      );
    } else if (feedbackRow == null && state.fieldErrorOnlyRow) {
      feedbackRow = OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        size: state.feedbackSize,
        semanticsIdentifier: state.feedbackSemanticsId,
        fieldErrorSlot: true,
      );
    } else if (feedbackRow != null && state.feedbackSemanticsId != null) {
      feedbackRow = Semantics(
        identifier: state.feedbackSemanticsId,
        container: true,
        child: feedbackRow,
      );
    }

    Widget? dynamicRow = dynamicTextSlot;
    if (dynamicRow == null && state.hasDynamicRow) {
      dynamicRow = OneUiInputDynamicText(
        content: dynamicText?.trim().isNotEmpty == true ? dynamicText : null,
        end: helperButton?.trim().isNotEmpty == true ? helperButton : null,
        size: state.labelSize,
        disabled: state.isDisabled,
        onEndClick: _onHelperPressed,
        semanticsIdentifier: state.dynamicTextSemanticsId,
      );
    } else if (dynamicRow != null && state.dynamicTextSemanticsId != null) {
      dynamicRow = Semantics(
        identifier: state.dynamicTextSemanticsId,
        container: true,
        child: dynamicRow,
      );
    }

    Widget result = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (labelHeader != null) ...[
          labelHeader,
          SizedBox(height: fieldGap),
        ],
        inputShell,
        if (feedbackRow != null) ...[
          SizedBox(height: fieldGap),
          feedbackRow,
        ],
        if (dynamicRow != null) ...[
          SizedBox(height: fieldGap),
          dynamicRow,
        ],
      ],
    );

    result = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: result,
    );

    if (fullWidth) {
      result = SizedBox(width: double.infinity, child: result);
    } else if (width != null) {
      result = SizedBox(width: width, child: result);
    }

    final rootA11y =
        resolveOneUiInputFieldAccessibility(ariaHidden: ariaHidden == true);
    if (rootA11y.hideDescendants) {
      result = ExcludeSemantics(child: result);
    }

    final tid = testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }

  Widget _buildDescriptionSemantics({
    required String description,
    required String? semanticsId,
    required TextStyle? style,
  }) {
    final text = Text(description, style: style);
    final id = semanticsId?.trim();
    if (id == null || id.isEmpty) return text;
    return Semantics(
      identifier: id,
      container: true,
      label: description,
      child: ExcludeSemantics(child: text),
    );
  }

  Widget? _buildLabelHeader(
    BuildContext context, {
    required OneUiInputFieldResolvedState state,
    required double labelAreaGap,
    required double labelRowGap,
  }) {
    if (labelSlot != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [labelSlot!],
      );
    }

    if (!state.hasLabel && !state.hasDescription) {
      return null;
    }

    final neutral = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');
    final negative = OneUiSurfaceScope.tokensForAppearance(context, 'negative');

    final labelStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.label,
      size: switch (state.labelSize) {
        OneUiInputLabelSize.s => 'XS',
        OneUiInputLabelSize.m => 'S',
        OneUiInputLabelSize.l => 'M',
      },
      weight: OneUiTextWeight.medium,
    )?.copyWith(
      color: oneUiHexColor(neutral.content['high']!),
    );

    final descriptionStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: 'XS',
      weight: OneUiTextWeight.low,
    )?.copyWith(
      color: oneUiHexColor(neutral.content['low']!),
    );

    Widget? labelRow;
    if (state.hasLabel) {
      labelRow = Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text.rich(
              TextSpan(
                text: label!.trim(),
                style: labelStyle,
                children: [
                  if (required)
                    TextSpan(
                      text: ' *',
                      style: labelStyle?.copyWith(
                        color: oneUiHexColor(negative.content['tintedA11y']!),
                      ),
                    ),
                ],
              ),
            ),
          ),
          if (state.hasInfoIcon) ...[
            SizedBox(width: labelRowGap),
            infoIconSlot ??
                OneUiIconButton(
                  icon: 'info',
                  semanticsLabel: state.infoIconAriaLabel,
                  disabled: state.isDisabled,
                  size: state.numericSize == 8
                      ? 8
                      : (state.numericSize == 12 ? 12 : 10),
                  appearance: 'neutral',
                  attention: OneUiIconButtonAttention.low,
                  variant: OneUiIconButtonVariant.ghost,
                  condensed: true,
                ),
          ],
        ],
      );
    }

    Widget header = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (labelRow != null) labelRow,
        if (state.hasDescription) ...[
          if (labelRow != null) SizedBox(height: labelAreaGap),
          _buildDescriptionSemantics(
            description: description!.trim(),
            semanticsId: state.descriptionSemanticsId,
            style: descriptionStyle,
          ),
        ],
      ],
    );

    header = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-input-field-label|data-size=${state.labelSize.name}'
        '${state.isDisabled ? '|data-disabled=true' : ''}',
      ),
      child: header,
    );

    return header;
  }
}
