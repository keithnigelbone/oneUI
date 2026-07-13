import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../engine/checkbox_size_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/text_style_resolve.dart';
import '../foundations/checkbox_field_brand_bind.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_checkbox.dart';
import 'one_ui_checkbox_field_a11y.dart';
import 'one_ui_checkbox_field_types.dart';
import 'one_ui_checkbox_group.dart';
import 'one_ui_checkbox_types.dart';
import 'one_ui_icon_button.dart';
import 'one_ui_icon_button_types.dart';
import 'one_ui_input_dynamic_text.dart';
import 'one_ui_input_feedback.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_types.dart';
import 'one_ui_text_types.dart';

export 'one_ui_checkbox_field_a11y.dart';
export 'one_ui_checkbox_field_types.dart';

/// Field shell for checkboxes — `CheckboxField.tsx` / `CheckboxField.native.tsx`.
class OneUiCheckboxField extends StatefulWidget {
  const OneUiCheckboxField({
    super.key,
    this.children = const [],
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
    this.invalid = false,
    this.ariaInvalid,
    this.required = false,
    this.checked,
    this.defaultChecked,
    this.selected,
    this.defaultSelected,
    this.indeterminate = false,
    this.onCheckedChange,
    this.onSelectedChange,
    this.groupValue,
    this.groupDefaultValue,
    this.onGroupValueChange,
    this.name,
    this.value,
    this.disabled = false,
    this.readOnly = false,
    this.size = 'm',
    this.appearance = 'auto',
    this.ariaLabel,
    this.accessibilityHint,
    this.ariaDescribedBy,
    this.ariaHidden,
    this.id,
    this.testId,
    this.width,
  }) : _onHelperPressed = onHelperPressed ?? onHelperPress;

  final VoidCallback? _onHelperPressed;

  final List<Widget> children;
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
  final bool invalid;
  final bool? ariaInvalid;
  final bool required;
  final bool? checked;
  final bool? defaultChecked;
  final bool? selected;
  final bool? defaultSelected;
  final bool indeterminate;
  final ValueChanged<bool>? onCheckedChange;
  final ValueChanged<bool>? onSelectedChange;
  final List<String>? groupValue;
  final List<String>? groupDefaultValue;
  final ValueChanged<List<String>>? onGroupValueChange;
  final String? name;
  final String? value;
  final bool disabled;
  final bool readOnly;
  final OneUiCheckboxSize size;
  final OneUiCheckboxAppearance appearance;
  final String? ariaLabel;
  final String? accessibilityHint;
  final String? ariaDescribedBy;
  final bool? ariaHidden;
  final String? id;
  final String? testId;
  final double? width;

  @override
  State<OneUiCheckboxField> createState() => _OneUiCheckboxFieldState();
}

class _OneUiCheckboxFieldState extends State<OneUiCheckboxField> {
  bool? _internalChecked;

  bool? get _controlledChecked => widget.checked ?? widget.selected;

  bool get _effectiveChecked {
    if (_controlledChecked != null) return _controlledChecked!;
    if (_internalChecked != null) return _internalChecked!;
    if (widget.defaultChecked != null) return widget.defaultChecked!;
    if (widget.defaultSelected != null) return widget.defaultSelected!;
    return false;
  }

  void _emitCheckedChange(bool next) {
    widget.onCheckedChange?.call(next);
    widget.onSelectedChange?.call(next);
  }

  void _toggleIntegratedCheckbox() {
    if (widget.disabled || widget.readOnly) return;
    final next = widget.indeterminate ? true : !_effectiveChecked;
    if (_controlledChecked == null) {
      setState(() => _internalChecked = next);
    }
    _emitCheckedChange(next);
  }

  @override
  Widget build(BuildContext context) {
    bindCheckboxFieldBrandScope(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final flattenedChildren = flattenCheckboxFieldChildren(widget.children);
    final fieldA11y = resolveOneUiCheckboxFieldAccessibility(
      label: widget.label,
      ariaLabel: widget.ariaLabel,
      accessibilityHint: widget.accessibilityHint,
      ariaDescribedBy: widget.ariaDescribedBy,
      ariaHidden: widget.ariaHidden == true,
      disabled: widget.disabled,
    );

    final state = resolveOneUiCheckboxFieldState(
      appearance: widget.appearance,
      size: widget.size,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      invalid: widget.invalid,
      ariaInvalid: widget.ariaInvalid,
      error: widget.error,
      feedback: widget.feedback,
      label: widget.label,
      description: widget.description,
      infoIcon: widget.infoIcon,
      infoIconAriaLabel: widget.infoIconAriaLabel,
      dynamicTextSlot: widget.dynamicTextSlot,
      dynamicText: widget.dynamicText,
      helperButton: widget.helperButton,
      flattenedChildren: flattenedChildren,
      id: widget.id,
    );

    final fieldGap = _resolveLength(
      context,
      ['--CheckboxField-gap', '--InputField-gap', '--Spacing-1-5'],
    );
    final singleColumnGap = _resolveLength(
      context,
      [
        '--CheckboxField-singleColumnGap-${state.resolvedSize}',
        '--CheckboxField-singleColumnGap',
        '--Spacing-${state.resolvedSize == 's' ? '1-5' : state.resolvedSize == 'l' ? '2-5' : '2'}',
      ],
    );
    final singleRowGap = _resolveLength(
      context,
      ['--CheckboxField-singleRowGap', '--Spacing-1'],
    );
    if (fieldGap == null || singleColumnGap == null || singleRowGap == null) {
      return oneUiConvexGapPlaceholder(
          ['CheckboxField spacing tokens unresolved']);
    }

    final labelStackInnerGap = _resolveLength(
          context,
          ['--InputLabel-stackGap', '--Spacing-1'],
        ) ??
        fieldGap;
    final labelIconGap = _resolveLength(
          context,
          [
            '--InputLabel-labelIconGap',
            '--InputField-labelIconGap',
            '--Spacing-1',
          ],
        ) ??
        4;

    final groupDescribedBy = resolveOneUiCheckboxFieldGroupDescribedBy(
      callerAriaDescribedBy: fieldA11y.callerAriaDescribedBy,
      descriptionSemanticsId: state.descriptionSemanticsId,
      feedbackSemanticsId: state.feedbackSemanticsId,
      dynamicTextSemanticsId: state.dynamicTextSemanticsId,
    );

    Widget? footerFeedback = widget.feedback;
    if (footerFeedback == null &&
        widget.error != null &&
        widget.error!.trim().isNotEmpty) {
      footerFeedback = OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        size: state.feedbackSize,
        feedbackMessage: widget.error,
        semanticsIdentifier: state.feedbackSemanticsId,
      );
    } else if (footerFeedback == null && state.fieldErrorOnlyRow) {
      footerFeedback = OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        size: state.feedbackSize,
        semanticsIdentifier: state.feedbackSemanticsId,
        fieldErrorSlot: true,
      );
    } else if (footerFeedback != null && state.feedbackSemanticsId != null) {
      footerFeedback = Semantics(
        identifier: state.feedbackSemanticsId,
        container: true,
        child: footerFeedback,
      );
    }

    Widget? footerDynamic = widget.dynamicTextSlot;
    if (footerDynamic == null && state.hasDynamicRow) {
      footerDynamic = OneUiInputDynamicText(
        content: widget.dynamicText?.trim().isNotEmpty == true
            ? widget.dynamicText
            : null,
        end: widget.helperButton?.trim().isNotEmpty == true
            ? widget.helperButton
            : null,
        size: _labelSizeEnum(state.labelTier),
        disabled: state.isDisabled,
        onEndClick: widget._onHelperPressed,
        semanticsIdentifier: state.dynamicTextSemanticsId,
      );
    } else if (footerDynamic != null && state.dynamicTextSemanticsId != null) {
      footerDynamic = Semantics(
        identifier: state.dynamicTextSemanticsId,
        container: true,
        child: footerDynamic,
      );
    }

    final enhancedOptions = enhanceCheckboxFieldOptions(
      flattenedChildren,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      invalid: state.isInvalid,
      fieldRequired: widget.required,
      groupAriaDescribedBy: groupDescribedBy,
      groupAccessibilityHint: fieldA11y.accessibilityHint,
    );

    Widget body;
    if (state.integratedSingle) {
      body = _buildIntegrated(
        context,
        state: state,
        fieldGap: fieldGap,
        singleColumnGap: singleColumnGap,
        singleRowGap: singleRowGap,
        labelIconGap: labelIconGap,
        labelStackInnerGap: labelStackInnerGap,
        groupDescribedBy: groupDescribedBy,
        footerFeedback: footerFeedback,
        footerDynamic: footerDynamic,
        fieldA11y: fieldA11y,
      );
    } else if (state.multiOptionMode) {
      body = _buildMulti(
        context,
        state: state,
        fieldGap: fieldGap,
        labelStackGap: labelStackInnerGap,
        labelIconGap: labelIconGap,
        labelStackInnerGap: labelStackInnerGap,
        groupDescribedBy: groupDescribedBy,
        enhancedOptions: enhancedOptions,
        footerFeedback: footerFeedback,
        footerDynamic: footerDynamic,
        fieldA11y: fieldA11y,
      );
    } else {
      body = oneUiConvexGapPlaceholder(
        ['CheckboxField requires integrated single or Checkbox children.'],
      );
    }

    if (state.isDisabled) {
      body =
          Opacity(opacity: _resolveDisabledOpacity(context, ds), child: body);
    }

    body = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: body,
    );

    if (widget.fullWidth) {
      body = SizedBox(width: double.infinity, child: body);
    } else if (widget.width != null) {
      body = SizedBox(width: widget.width, child: body);
    }

    if (fieldA11y.hideSubtree) {
      body = ExcludeSemantics(child: body);
    }

    return body;
  }

  Widget _buildIntegrated(
    BuildContext context, {
    required OneUiCheckboxFieldResolvedState state,
    required double fieldGap,
    required double singleColumnGap,
    required double singleRowGap,
    required double labelIconGap,
    required double labelStackInnerGap,
    required String? groupDescribedBy,
    required Widget? footerFeedback,
    required Widget? footerDynamic,
    required OneUiCheckboxFieldAccessibilityProps fieldA11y,
  }) {
    final ds = OneUiScope.designSystemOf(context)!;
    final metrics = resolveCheckboxMetrics(
      context,
      ds,
      size: state.resolvedSize,
    );
    final copyIndent = metrics.boxSize + singleColumnGap;

    final control = OneUiCheckbox(
      checked: _controlledChecked,
      defaultChecked: widget.defaultChecked ?? widget.defaultSelected,
      indeterminate: widget.indeterminate,
      onCheckedChange: widget.disabled || widget.readOnly
          ? null
          : (next) {
              if (_controlledChecked == null) {
                setState(() => _internalChecked = next);
              }
              _emitCheckedChange(next);
            },
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      errorHighlight: state.isInvalid,
      ariaInvalid: state.isInvalid,
      ariaLabelledBy: state.hasLabel ? state.headingSemanticsId : null,
      ariaDescribedby: groupDescribedBy,
      required: widget.required,
      semanticsLabel: state.hasLabel
          ? fieldA11y.accessibilityLabel
          : fieldA11y.accessibilityLabel ?? widget.label?.trim(),
      semanticsHint: fieldA11y.accessibilityHint,
      value: widget.value ?? 'on',
      testId: widget.testId,
    );

    // Web `singleGrid`: label (or description-only copy) sits beside the control;
    // when both label and description exist, description drops to column 2 below.
    final descriptionBesideControl = state.hasDescription && !state.hasLabel;
    final descriptionBelowLabel = state.hasDescription && state.hasLabel;

    final besideControl = state.hasLabel
        ? _buildLegendLabelRow(
            context,
            state: state,
            labelIconGap: labelIconGap,
            headingSemanticsId: state.headingSemanticsId,
          )
        : descriptionBesideControl
            ? _buildDescription(
                context,
                description: widget.description!.trim(),
                semanticsId: state.descriptionSemanticsId,
                resolvedAppearance: state.resolvedAppearance,
              )
            : null;

    final tappableBesideControl =
        besideControl != null && !widget.disabled && !widget.readOnly
            ? GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _toggleIntegratedCheckbox,
                child: besideControl,
              )
            : besideControl;

    final copyBelowLabel = <Widget>[
      if (descriptionBelowLabel)
        _buildDescription(
          context,
          description: widget.description!.trim(),
          semanticsId: state.descriptionSemanticsId,
          resolvedAppearance: state.resolvedAppearance,
        ),
      if (footerFeedback != null) ...[
        if (descriptionBelowLabel) SizedBox(height: singleRowGap),
        footerFeedback,
      ],
      if (footerDynamic != null) ...[
        SizedBox(height: singleRowGap),
        footerDynamic,
      ],
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            control,
            SizedBox(width: singleColumnGap),
            if (tappableBesideControl != null)
              Expanded(child: tappableBesideControl),
          ],
        ),
        if (copyBelowLabel.isNotEmpty) ...[
          SizedBox(height: labelStackInnerGap),
          Padding(
            padding: EdgeInsets.only(left: copyIndent),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: copyBelowLabel,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMulti(
    BuildContext context, {
    required OneUiCheckboxFieldResolvedState state,
    required double fieldGap,
    required double labelStackGap,
    required double labelIconGap,
    required double labelStackInnerGap,
    required String? groupDescribedBy,
    required List<Widget> enhancedOptions,
    required Widget? footerFeedback,
    required Widget? footerDynamic,
    required OneUiCheckboxFieldAccessibilityProps fieldA11y,
  }) {
    final group = OneUiCheckboxGroup(
      value: widget.groupValue,
      defaultValue: widget.groupDefaultValue,
      onValueChange: widget.onGroupValueChange,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      errorHighlight: state.isInvalid,
      ariaDescribedby: groupDescribedBy,
      testId: widget.testId,
      children: enhancedOptions,
    );

    final header = _buildFieldHeader(
      context,
      state: state,
      labelIconGap: labelIconGap,
      labelStackInnerGap: labelStackInnerGap,
      useLegend: state.useFieldsetLegend,
      headingSemanticsId:
          state.useFieldsetLegend ? null : state.headingSemanticsId,
    );

    Widget column = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (header != null) ...[
          header,
          SizedBox(height: labelStackGap),
        ],
        group,
        if (footerFeedback != null) ...[
          SizedBox(height: fieldGap),
          footerFeedback,
        ],
        if (footerDynamic != null) ...[
          SizedBox(height: fieldGap),
          footerDynamic,
        ],
      ],
    );

    if (state.hasLabel) {
      column = Semantics(
        container: true,
        label: widget.label!.trim(),
        hint: fieldA11y.accessibilityHint,
        enabled: !state.isDisabled,
        controlsNodes: oneUiParseAriaDescribedByNodeIds(groupDescribedBy),
        child: column,
      );
    }

    return column;
  }

  Widget? _buildFieldHeader(
    BuildContext context, {
    required OneUiCheckboxFieldResolvedState state,
    required double labelIconGap,
    required double labelStackInnerGap,
    required bool useLegend,
    String? headingSemanticsId,
  }) {
    if (!state.hasLabel && !state.hasDescription) return null;

    Widget header = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (state.hasLabel)
          _buildLegendLabelRow(
            context,
            state: state,
            labelIconGap: labelIconGap,
            headingSemanticsId: headingSemanticsId,
            useLegend: useLegend,
          ),
        if (state.hasDescription) ...[
          if (state.hasLabel) SizedBox(height: labelStackInnerGap),
          _buildDescription(
            context,
            description: widget.description!.trim(),
            semanticsId: state.descriptionSemanticsId,
            resolvedAppearance: state.resolvedAppearance,
          ),
        ],
      ],
    );

    header = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-checkbox-field-label|data-size=${state.labelTier}'
        '${state.isDisabled ? '|data-disabled=true' : ''}',
      ),
      child: header,
    );

    return header;
  }

  Widget _buildLegendLabelRow(
    BuildContext context, {
    required OneUiCheckboxFieldResolvedState state,
    required double labelIconGap,
    String? headingSemanticsId,
    bool useLegend = false,
  }) {
    final role = OneUiSurfaceScope.tokensForAppearance(
        context, state.resolvedAppearance);
    final negative = OneUiSurfaceScope.tokensForAppearance(context, 'negative');
    final bodySize = kCheckboxLabelBodySize[state.labelTier] ?? 'M';

    final labelStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: bodySize,
      weight: OneUiTextWeight.medium,
    )?.copyWith(
      color: oneUiHexColor(role.content['high']!),
    );

    Widget labelText = Text.rich(
      TextSpan(
        text: widget.label!.trim(),
        style: labelStyle,
        children: [
          if (widget.required)
            TextSpan(
              text: ' *',
              style: labelStyle?.copyWith(
                color: oneUiHexColor(negative.content['tintedA11y']!),
              ),
            ),
        ],
      ),
    );

    final hid = headingSemanticsId?.trim();
    if (hid != null && hid.isNotEmpty && !useLegend) {
      labelText = Semantics(
        identifier: hid,
        container: true,
        header: true,
        label: widget.label!.trim(),
        child: ExcludeSemantics(child: labelText),
      );
    } else if (useLegend) {
      labelText = ExcludeSemantics(child: labelText);
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(fit: FlexFit.loose, child: labelText),
        if (state.hasInfoIcon || widget.infoIconSlot != null) ...[
          SizedBox(width: labelIconGap),
          widget.infoIconSlot ?? _buildDefaultInfoIcon(context, state: state),
        ],
      ],
    );
  }

  Widget _buildDefaultInfoIcon(
    BuildContext context, {
    required OneUiCheckboxFieldResolvedState state,
  }) {
    final iconSize = checkboxFieldSizeToInputNumeric(state.resolvedSize);
    return OneUiIconButton(
      icon: 'info',
      semanticsLabel: state.infoIconAriaLabel,
      disabled: state.isDisabled,
      size: iconSize,
      appearance: 'neutral',
      attention: OneUiIconButtonAttention.low,
      variant: OneUiIconButtonVariant.ghost,
      condensed: true,
    );
  }

  double _resolveDisabledOpacity(
      BuildContext context, NativeDesignSystemPayload ds) {
    final scope = OneUiScope.of(context);
    final raw = ds.resolveCSSValue(
      ds.rawTokenValue('--Disabled-Opacity') ??
          ds.componentCustomProperties['--Disabled-Opacity'],
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
    );
    return double.tryParse(raw ?? '') ?? 0.5;
  }

  Widget _buildDescription(
    BuildContext context, {
    required String description,
    required String? semanticsId,
    required String resolvedAppearance,
  }) {
    final role =
        OneUiSurfaceScope.tokensForAppearance(context, resolvedAppearance);
    final style = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: 'XS',
      weight: OneUiTextWeight.low,
    )?.copyWith(
      color: oneUiHexColor(role.content['medium']!),
    );

    Widget text = Text(description, style: style);
    final id = semanticsId?.trim();
    if (id != null && id.isNotEmpty) {
      text = Semantics(
        identifier: id,
        container: true,
        label: description,
        child: ExcludeSemantics(child: text),
      );
    }
    return text;
  }

  double? _resolveLength(BuildContext context, List<String> keys) {
    final scope = OneUiScope.of(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) return null;
    return ds.resolveComponentLengthPxCascade(
      keys,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
  }

  OneUiInputLabelSize _labelSizeEnum(OneUiCheckboxSize labelTier) {
    return switch (resolveCheckboxSize(labelTier)) {
      's' => OneUiInputLabelSize.s,
      'l' => OneUiInputLabelSize.l,
      _ => OneUiInputLabelSize.m,
    };
  }
}
