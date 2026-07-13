import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../engine/native_design_system_payload.dart';
import '../engine/radio_size_resolve.dart';
import '../engine/text_style_resolve.dart';
import '../foundations/radio_field_brand_bind.dart';
import '../theme/one_ui_scope.dart';
import 'one_ui_aria_described_by.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_input_dynamic_text.dart';
import 'one_ui_input_feedback.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_input_types.dart';
import 'one_ui_radio.dart';
import 'one_ui_radio_field_a11y.dart';
import 'one_ui_radio_field_types.dart';
import 'one_ui_icon_button.dart';
import 'one_ui_icon_button_types.dart';
import 'one_ui_radio_group.dart';
import 'one_ui_radio_group_types.dart';
import 'one_ui_radio_types.dart';
import 'one_ui_text_types.dart';

export 'one_ui_radio_field_a11y.dart';
export 'one_ui_radio_field_types.dart';

/// Field shell for radios — `RadioField.tsx` / `RadioField.native.tsx` parity.
///
/// - **Integrated single** (no [children], string [label]): lone [OneUiRadio] beside label.
/// - **Plain** (one [OneUiRadio] child): optional field description; option owns label.
/// - **Multi** (two+ children): fieldset-style header, then [OneUiRadioGroup].
class OneUiRadioField extends StatefulWidget {
  const OneUiRadioField({
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
    this.required = false,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.checked,
    this.defaultChecked,
    this.onCheckedChange,
    this.singleOptionValue = 'on',
    this.name,
    this.disabled = false,
    this.readOnly = false,
    this.size = 'm',
    this.appearance = 'auto',
    this.orientation = 'vertical',
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
  final bool required;
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onValueChange;
  final bool? checked;
  final bool? defaultChecked;
  final ValueChanged<bool>? onCheckedChange;
  final String singleOptionValue;
  final String? name;
  final bool disabled;
  final bool readOnly;
  final OneUiRadioSize size;
  final OneUiRadioAppearance appearance;
  final OneUiRadioGroupOrientation orientation;
  final String? ariaLabel;
  final String? accessibilityHint;
  final String? ariaDescribedBy;
  final bool? ariaHidden;
  final String? id;
  final String? testId;
  final double? width;

  @override
  State<OneUiRadioField> createState() => _OneUiRadioFieldState();
}

class _OneUiRadioFieldState extends State<OneUiRadioField> {
  String? _integratedInternalValue;

  @override
  Widget build(BuildContext context) {
    bindRadioFieldBrandScope(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final scope = OneUiScope.of(context);
    final flattenedChildren = flattenRadioFieldChildren(widget.children);
    final fieldA11y = resolveOneUiRadioFieldAccessibility(
      label: widget.label,
      ariaLabel: widget.ariaLabel,
      accessibilityHint: widget.accessibilityHint,
      ariaDescribedBy: widget.ariaDescribedBy,
      ariaHidden: widget.ariaHidden == true,
      disabled: widget.disabled,
    );

    final state = resolveOneUiRadioFieldState(
      appearance: widget.appearance,
      size: widget.size,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      invalid: widget.invalid,
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
      ['--RadioField-gap', '--InputField-gap', '--Spacing-1-5'],
    );
    final singleColumnGap = _resolveLength(
          context,
          [
            '--RadioField-singleColumnGap',
            '--Spacing-${radioFieldSingleColumnGapSpacingTail(state.resolvedSize)}',
          ],
        ) ??
        radioFieldSingleColumnGapFallbackPx(state.resolvedSize);
    final singleRowGap = _resolveLength(
      context,
      ['--RadioField-singleRowGap', '--Spacing-1'],
    );
    if (fieldGap == null || singleColumnGap == null || singleRowGap == null) {
      return oneUiConvexGapPlaceholder(
          ['RadioField spacing tokens unresolved']);
    }

    final resolvedFieldGap = fieldGap;
    final labelStackInnerGap = _resolveLength(
          context,
          ['--InputLabel-stackGap', '--Spacing-1'],
        ) ??
        resolvedFieldGap;
    final labelIconGap = _resolveLength(
          context,
          [
            '--InputLabel-labelIconGap',
            '--InputField-labelIconGap',
            '--Spacing-1',
          ],
        ) ??
        4;
    final labelStackGap = labelStackInnerGap;

    final sv = widget.singleOptionValue;
    final groupDescribedBy = resolveOneUiRadioFieldGroupDescribedBy(
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

    final enhancedOptions = enhanceRadioFieldOptions(
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
        sv: sv,
        fieldGap: resolvedFieldGap,
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
        fieldGap: resolvedFieldGap,
        labelStackGap: labelStackGap,
        labelIconGap: labelIconGap,
        labelStackInnerGap: labelStackInnerGap,
        groupDescribedBy: groupDescribedBy,
        enhancedOptions: enhancedOptions,
        footerFeedback: footerFeedback,
        footerDynamic: footerDynamic,
        fieldA11y: fieldA11y,
      );
    } else if (state.plainOptionMode || flattenedChildren.isNotEmpty) {
      body = _buildPlain(
        context,
        state: state,
        fieldGap: resolvedFieldGap,
        labelStackGap: labelStackGap,
        labelIconGap: labelIconGap,
        labelStackInnerGap: labelStackInnerGap,
        groupDescribedBy: groupDescribedBy,
        enhancedOptions: enhancedOptions,
        footerFeedback: footerFeedback,
        footerDynamic: footerDynamic,
        fieldA11y: fieldA11y,
        deselectOnReselect: state.plainOptionMode,
      );
    } else {
      body = oneUiConvexGapPlaceholder(
        [
          'RadioField requires a label (integrated) or at least one Radio child.'
        ],
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

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      body = Semantics(
        identifier: tid,
        container: true,
        child: KeyedSubtree(key: ValueKey(tid), child: body),
      );
    }

    return body;
  }

  String _effectiveIntegratedValue(String sv) {
    final isBoolControlled = widget.checked != null;
    final isStringControlled = widget.value != null;
    if (isBoolControlled) return widget.checked! ? sv : '';
    if (isStringControlled) return widget.value ?? '';
    if (_integratedInternalValue != null) return _integratedInternalValue!;
    if (widget.defaultChecked != null) {
      return widget.defaultChecked! ? sv : '';
    }
    return widget.defaultValue ?? '';
  }

  void _handleIntegratedValueChange(String v, String sv) {
    final isBoolControlled = widget.checked != null;
    final isStringControlled = widget.value != null;
    final useInternal = !isBoolControlled && !isStringControlled;
    if (useInternal) {
      setState(() => _integratedInternalValue = v);
    }
    widget.onValueChange?.call(v);
    widget.onCheckedChange?.call(v == sv);
  }

  Widget _buildIntegrated(
    BuildContext context, {
    required OneUiRadioFieldResolvedState state,
    required String sv,
    required double fieldGap,
    required double singleColumnGap,
    required double singleRowGap,
    required double labelIconGap,
    required double labelStackInnerGap,
    required String? groupDescribedBy,
    required Widget? footerFeedback,
    required Widget? footerDynamic,
    required OneUiRadioFieldAccessibilityProps fieldA11y,
  }) {
    final ds = OneUiScope.designSystemOf(context)!;
    final radioMetrics = resolveRadioMetrics(
      context,
      ds,
      size: state.resolvedSize,
    );
    final copyIndent = radioMetrics.boxSize + singleColumnGap;
    final effectiveValue = _effectiveIntegratedValue(sv);
    final group = OneUiRadioGroup(
      value: effectiveValue,
      onValueChange: (v) => _handleIntegratedValueChange(v, sv),
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      orientation: widget.orientation,
      deselectOnReselect: true,
      errorHighlight: state.isInvalid,
      ariaDescribedby: groupDescribedBy,
      accessibilityHint: fieldA11y.accessibilityHint,
      children: [
        OneUiRadio(
          value: sv,
          size: state.resolvedSize,
          appearance: state.resolvedAppearance,
          disabled: widget.disabled,
          readOnly: widget.readOnly,
          errorHighlight: state.isInvalid,
          ariaLabelledBy: state.hasLabel ? state.headingSemanticsId : null,
          ariaDescribedby: groupDescribedBy,
          required: widget.required,
          semanticsLabel: fieldA11y.accessibilityLabel ?? widget.label?.trim(),
          accessibilityHint: fieldA11y.accessibilityHint,
        ),
      ],
    );

    final labelRow = state.hasLabel
        ? _buildLegendLabelRow(
            context,
            state: state,
            labelIconGap: labelIconGap,
            headingSemanticsId: state.headingSemanticsId,
          )
        : null;

    final copyBelowLabel = <Widget>[
      if (state.hasDescription)
        _buildDescription(
          context,
          description: widget.description!.trim(),
          semanticsId: state.descriptionSemanticsId,
          resolvedAppearance: state.resolvedAppearance,
        ),
      if (footerFeedback != null) ...[
        SizedBox(height: singleRowGap),
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
            group,
            SizedBox(width: singleColumnGap),
            if (labelRow != null) Expanded(child: labelRow),
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
    required OneUiRadioFieldResolvedState state,
    required double fieldGap,
    required double labelStackGap,
    required double labelIconGap,
    required double labelStackInnerGap,
    required String? groupDescribedBy,
    required List<Widget> enhancedOptions,
    required Widget? footerFeedback,
    required Widget? footerDynamic,
    required OneUiRadioFieldAccessibilityProps fieldA11y,
  }) {
    final group = OneUiRadioGroup(
      value: widget.value,
      defaultValue: widget.defaultValue,
      onValueChange: widget.onValueChange,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      orientation: widget.orientation,
      errorHighlight: state.isInvalid,
      ariaDescribedby: groupDescribedBy,
      semanticsLabel: state.hasLabel ? null : fieldA11y.accessibilityLabel,
      ariaLabel: state.hasLabel ? null : widget.ariaLabel,
      accessibilityHint: fieldA11y.accessibilityHint,
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

  Widget _buildPlain(
    BuildContext context, {
    required OneUiRadioFieldResolvedState state,
    required double fieldGap,
    required double labelStackGap,
    required double labelIconGap,
    required double labelStackInnerGap,
    required String? groupDescribedBy,
    required List<Widget> enhancedOptions,
    required Widget? footerFeedback,
    required Widget? footerDynamic,
    required OneUiRadioFieldAccessibilityProps fieldA11y,
    required bool deselectOnReselect,
  }) {
    final hasStringHeader = state.hasDescription ||
        state.hasInfoIcon ||
        widget.infoIconSlot != null;
    Widget? plainHeader;
    if (hasStringHeader && !state.hasLabel) {
      plainHeader = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (state.hasInfoIcon || widget.infoIconSlot != null)
            Align(
              alignment: Alignment.centerRight,
              child: widget.infoIconSlot ??
                  _buildDefaultInfoIcon(context, state: state),
            ),
          if (state.hasDescription)
            _buildDescription(
              context,
              description: widget.description!.trim(),
              semanticsId: state.descriptionSemanticsId,
              resolvedAppearance: state.resolvedAppearance,
            ),
        ],
      );
    }

    final group = OneUiRadioGroup(
      value: widget.value,
      defaultValue: widget.defaultValue,
      onValueChange: widget.onValueChange,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      size: state.resolvedSize,
      appearance: state.resolvedAppearance,
      orientation: widget.orientation,
      errorHighlight: state.isInvalid,
      deselectOnReselect: deselectOnReselect,
      semanticsLabel: fieldA11y.accessibilityLabel ?? widget.ariaLabel,
      ariaLabel: fieldA11y.accessibilityLabel ?? widget.ariaLabel,
      ariaDescribedby: groupDescribedBy,
      accessibilityHint: fieldA11y.accessibilityHint,
      children: enhancedOptions,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (plainHeader != null) ...[
          plainHeader,
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
  }

  Widget? _buildFieldHeader(
    BuildContext context, {
    required OneUiRadioFieldResolvedState state,
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
        'oneui-radio-field-label|data-size=${state.labelTier}'
        '${state.isDisabled ? '|data-disabled=true' : ''}',
      ),
      child: header,
    );

    return header;
  }

  Widget _buildLegendLabelRow(
    BuildContext context, {
    required OneUiRadioFieldResolvedState state,
    required double labelIconGap,
    String? headingSemanticsId,
    bool useLegend = false,
  }) {
    final role = OneUiSurfaceScope.tokensForAppearance(
        context, state.resolvedAppearance);
    final negative = OneUiSurfaceScope.tokensForAppearance(context, 'negative');
    final bodySize = kRadioLabelBodySize[state.labelTier] ?? 'M';

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
        Flexible(
          fit: FlexFit.loose,
          child: labelText,
        ),
        if (state.hasInfoIcon || widget.infoIconSlot != null) ...[
          SizedBox(width: labelIconGap),
          widget.infoIconSlot ??
              _buildDefaultInfoIcon(
                context,
                state: state,
              ),
        ],
      ],
    );
  }

  Widget _buildDefaultInfoIcon(
    BuildContext context, {
    required OneUiRadioFieldResolvedState state,
  }) {
    final iconSize = radioFieldSizeToInputNumeric(state.resolvedSize);
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

  OneUiInputLabelSize _labelSizeEnum(OneUiRadioSize labelTier) {
    return switch (resolveRadioSize(labelTier)) {
      's' => OneUiInputLabelSize.s,
      'l' => OneUiInputLabelSize.l,
      _ => OneUiInputLabelSize.m,
    };
  }
}
