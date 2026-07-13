import 'package:flutter/material.dart';

import '../engine/input_color_resolve.dart';
import '../engine/input_size_resolve.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_text_types.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_input_a11y.dart';
import 'one_ui_input_autofill.dart';
import 'one_ui_input_types.dart';
import 'one_ui_icon_button.dart';
import 'one_ui_icon_button_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_web_aria_described_by.dart';

/// Bordered 4-slot text input — `Input.tsx` / `Input.native.tsx` parity.
///
/// Pair validation rows with [OneUiInputField] or compose [OneUiInputFeedback] /
/// [OneUiInputDynamicText] manually below the shell.

/// RN `TextInputSubmitEditingEvent` — receives submitted text.
typedef OneUiInputSubmitEditingCallback = void Function(String value);

class OneUiInput extends StatefulWidget {
  const OneUiInput({
    super.key,
    this.label,
    this.description,
    this.labelSuffixInside,
    this.labelTrailing,
    this.labelAssociation = OneUiInputLabelAssociation.native,
    this.externalLabelHeader = false,
    this.errorHighlight = false,
    this.ariaInvalid = false,
    this.size = 10,
    this.appearance = OneUiInputAppearance.auto,
    this.shape = OneUiInputShape.defaultShape,
    this.attention = OneUiInputAttention.medium,
    this.start,
    this.start2,
    this.end,
    this.end2,

    /// Deprecated web alias — use [start] instead.
    this.leftAddon,

    /// Deprecated web alias — use [end] instead.
    this.rightAddon,
    this.placeholder,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.onSubmit,
    this.onSubmitEditing,
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
    this.ariaLabel,
    this.accessibilityLabel,
    this.accessibilityHint,
    this.ariaDescribedBy,
    this.ariaHidden = false,
    this.width,
    this.focusNode,
    this.controller,
  });

  final String? label;
  final String? description;
  final Widget? labelSuffixInside;
  final Widget? labelTrailing;
  final OneUiInputLabelAssociation labelAssociation;
  final bool externalLabelHeader;
  final bool errorHighlight;
  final bool ariaInvalid;
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

  /// Ergonomic submit alias — also invokes [onSubmitEditing] when set.
  final ValueChanged<String>? onSubmit;

  /// RN `onSubmitEditing` — raw submit event (same payload as [onSubmit]).
  final OneUiInputSubmitEditingCallback? onSubmitEditing;
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
  final String? ariaLabel;

  /// RN `accessibilityLabel` — preferred over [ariaLabel] when both set.
  final String? accessibilityLabel;
  final String? accessibilityHint;
  final String? ariaDescribedBy;
  final bool ariaHidden;
  final double? width;

  /// Optional external [FocusNode] — Flutter peer of web/RN `ref` on the control.
  final FocusNode? focusNode;

  /// Optional external [TextEditingController].
  final TextEditingController? controller;

  @override
  State<OneUiInput> createState() => _OneUiInputState();
}

class _OneUiInputState extends State<OneUiInput> {
  late FocusNode _focusNode;
  late TextEditingController _controller;
  bool _hovered = false;
  bool _passwordRevealed = false;
  bool _ownsFocusNode = false;
  bool _ownsController = false;

  @override
  void initState() {
    super.initState();
    _ownsFocusNode = widget.focusNode == null;
    _focusNode = widget.focusNode ??
        FocusNode(
            debugLabel: widget.label ?? widget.placeholder ?? 'OneUiInput');
    _focusNode.addListener(_onFocusChange);
    _ownsController = widget.controller == null;
    _controller = widget.controller ??
        TextEditingController(text: widget.value ?? widget.defaultValue ?? '');
    _controller.addListener(_onControllerChanged);
    if (_ownsController && widget.value == null) {
      // uncontrolled — keep internal controller
    }
  }

  void _onControllerChanged() {
    if (mounted) setState(() {});
  }

  bool get _hasExpandedTextSelection {
    final sel = _controller.selection;
    return sel.isValid && !sel.isCollapsed;
  }

  @override
  void didUpdateWidget(OneUiInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != null && widget.value != _controller.text) {
      _controller.text = widget.value!;
    }
    if (oldWidget.label != widget.label) {
      _focusNode.debugLabel =
          widget.label ?? widget.placeholder ?? 'OneUiInput';
    }
    if (oldWidget.type != widget.type) {
      _passwordRevealed = false;
    }
    if (oldWidget.focusNode != widget.focusNode && widget.focusNode != null) {
      if (_ownsFocusNode) {
        _focusNode.removeListener(_onFocusChange);
        _focusNode.dispose();
      }
      _ownsFocusNode = false;
      _focusNode = widget.focusNode!;
      _focusNode.addListener(_onFocusChange);
    }
    if (oldWidget.controller != widget.controller &&
        widget.controller != null) {
      if (_ownsController) {
        _controller.dispose();
      }
      _ownsController = false;
      _controller = widget.controller!;
    }
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      widget.onFocus?.call();
    } else {
      widget.onBlur?.call();
    }
    setState(() {});
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _controller.removeListener(_onControllerChanged);
    if (_ownsFocusNode) {
      _focusNode.dispose();
    }
    if (_ownsController) {
      _controller.dispose();
    }
    super.dispose();
  }

  bool get _showLabelStack {
    if (widget.externalLabelHeader ||
        widget.labelAssociation == OneUiInputLabelAssociation.field) {
      return false;
    }
    return _hasText(widget.label) ||
        _hasText(widget.description) ||
        widget.labelTrailing != null;
  }

  void _handleSubmitted(String value) {
    widget.onSubmit?.call(value);
    widget.onSubmitEditing?.call(value);
  }

  bool _hasText(String? value) => value != null && value.trim().isNotEmpty;

  /// Web `data-testid` and RN `testID` target the interactive control; `id` is
  /// the form identity when no explicit test anchor is provided.
  String? _resolveInputSemanticsIdentifier() {
    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) return tid;
    final id = widget.id?.trim();
    if (id != null && id.isNotEmpty) return id;
    return null;
  }

  TextStyle? _labelStyle(BuildContext context, OneUiInputLabelSize tier) {
    final size = switch (tier) {
      OneUiInputLabelSize.s => 'XS',
      OneUiInputLabelSize.m => 'S',
      OneUiInputLabelSize.l => 'M',
    };
    return resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.label,
      size: size,
      weight: OneUiTextWeight.medium,
    );
  }

  TextStyle? _descriptionStyle(BuildContext context, OneUiInputLabelSize tier) {
    final size = switch (tier) {
      OneUiInputLabelSize.s => 'XS',
      OneUiInputLabelSize.m => 'S',
      OneUiInputLabelSize.l => 'M',
    };
    return resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: size,
      weight: OneUiTextWeight.low,
    );
  }

  TextStyle? _controlStyle(BuildContext context, InputSizeMetrics metrics,
      InputResolvedPaint paint) {
    final body = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: metrics.bodySizeKey,
      weight: OneUiTextWeight.low,
    );
    return body?.copyWith(color: paint.textColor);
  }

  Widget _slotBox(
      {required Widget? child,
      required double iconSize,
      required Color tint,
      bool fixed = true}) {
    if (child == null) return const SizedBox.shrink();
    return IconTheme.merge(
      data: IconThemeData(color: tint, size: iconSize),
      child: fixed
          ? SizedBox(
              width: iconSize,
              height: iconSize,
              child: Center(child: child),
            )
          : DefaultTextStyle.merge(
              style: TextStyle(color: tint),
              child: child,
            ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final state = resolveOneUiInputStateInContext(
      context: context,
      size: widget.size,
      appearance: widget.appearance,
      shape: widget.shape,
      attention: widget.attention,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      errorHighlight: widget.errorHighlight,
      ariaInvalid: widget.ariaInvalid,
      start: widget.start,
      start2: widget.start2,
      end: widget.end,
      end2: widget.end2,
      leftAddon: widget.leftAddon,
      rightAddon: widget.rightAddon,
    );

    final numericSize = state.numericSize;
    final startContent = widget.start ?? widget.leftAddon;
    final userEnd = widget.end ?? widget.rightAddon;
    final isPassword = widget.type == 'password';
    Widget? endContent = userEnd;
    if (isPassword && userEnd == null && widget.end2 == null) {
      endContent = OneUiIconButton(
        icon: _passwordRevealed ? 'eyeOff' : 'eye',
        semanticsLabel: _passwordRevealed ? 'Hide password' : 'Show password',
        size: numericSize,
        variant: OneUiIconButtonVariant.ghost,
        attention: OneUiIconButtonAttention.low,
        condensed: true,
        disabled: widget.disabled,
        onPressed: widget.disabled || widget.readOnly
            ? null
            : () => setState(() => _passwordRevealed = !_passwordRevealed),
      );
    }
    final resolvedAppearance = state.resolvedAppearance;
    final role = resolveInputRoleTokens(context, resolvedAppearance);
    final errorRole =
        OneUiSurfaceScope.tokensForAppearance(context, 'negative');
    final metrics = resolveInputSizeMetrics(
      context,
      ds,
      numericSize: numericSize,
      pillShape: widget.shape == OneUiInputShape.pill,
    );
    final borders = resolveInputBorderWidths(context, ds);
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(['Input size metrics unresolved']);
    }

    final hasError = state.hasErrorHighlight;

    final scope = OneUiScope.of(context);
    final touchTargetMin = resolveTouchTargetMinPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: scope.nativeTypography,
    );
    final shellMinHeight = enforceButtonTouchMinHeight(
      tokenMinHeight: metrics.minHeight,
      touchTargetMinPx: touchTargetMin,
      platformId: scope.platformId,
    );

    final paint = resolveInputPaint(
      context: context,
      designSystem: ds,
      appearance: resolvedAppearance,
      role: role,
      errorRole: errorRole,
      attention: state.attention,
      borders: borders,
      hasFocus: _focusNode.hasFocus,
      hasError: hasError,
      isDisabled: widget.disabled,
      isHovered: _hovered,
      isReadOnly: widget.readOnly,
    );

    final labelTier = oneUiInputSizeToLabelSize(numericSize);
    final a11y = resolveOneUiInputAccessibility(
      accessibilityLabel: widget.accessibilityLabel,
      ariaLabel: widget.ariaLabel,
      accessibilityHint: widget.accessibilityHint,
      visibleLabel: widget.externalLabelHeader ? null : widget.label,
      placeholder: widget.placeholder,
      ariaDescribedBy: widget.ariaDescribedBy,
      ariaInvalid: hasError,
      ariaHidden: widget.ariaHidden,
      required: widget.required,
      isDisabled: widget.disabled,
      isReadOnly: widget.readOnly,
      type: widget.type,
    );

    final labelStyle = _labelStyle(context, labelTier)?.copyWith(
      color: widget.disabled ? paint.placeholderColor : paint.textColor,
    );
    final descriptionStyle = _descriptionStyle(context, labelTier)?.copyWith(
      color: widget.disabled ? paint.placeholderColor : paint.textColor,
    );
    final controlStyle = _controlStyle(context, metrics, paint);

    final shrink = paint.paddingShrink;
    final padH =
        (metrics.paddingHorizontal - shrink).clamp(0.0, double.infinity);
    final padV = (metrics.paddingVertical - shrink).clamp(0.0, double.infinity);
    final shellRadius = BorderRadius.circular(metrics.borderRadius);

    // RN `selectionColor` — solid role bold only when characters are selected.
    // Transparent when caret-only focus prevents Flutter web field-wide fill.
    final selectionColor = _hasExpandedTextSelection
        ? paint.accentBorderColor
        : Colors.transparent;

    Widget shell = MouseRegion(
      onEnter: widget.disabled || widget.readOnly
          ? null
          : (_) => setState(() => _hovered = true),
      onExit: widget.disabled || widget.readOnly
          ? null
          : (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.disabled
            ? null
            : () {
                if (!_focusNode.hasFocus) {
                  _focusNode.requestFocus();
                }
              },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          constraints: BoxConstraints(minHeight: shellMinHeight),
          padding: EdgeInsets.fromLTRB(padH, padV, padH, padV),
          decoration: BoxDecoration(
            color: paint.background,
            borderRadius: shellRadius,
            border: Border.all(
              color: paint.layoutBorderColor,
              width: paint.layoutBorderWidth,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _slotBox(
                  child: startContent,
                  iconSize: metrics.iconSize,
                  tint: paint.slotColor),
              if (startContent != null && widget.start2 != null)
                SizedBox(width: metrics.gap),
              _slotBox(
                  child: widget.start2,
                  iconSize: metrics.iconSize,
                  tint: paint.slotColor,
                  fixed: false),
              if ((startContent != null || widget.start2 != null))
                SizedBox(width: metrics.gap),
              Expanded(
                child: Focus(
                  onKeyEvent: widget.onKeyDown == null
                      ? null
                      : (node, event) {
                          widget.onKeyDown?.call(event);
                          return KeyEventResult.ignored;
                        },
                  // Web `.control` / RN inner TextInput — chromeless; shell owns border/fill.
                  child: Material(
                    type: MaterialType.transparency,
                    child: DefaultSelectionStyle(
                      selectionColor: selectionColor,
                      cursorColor: paint.accentBorderColor,
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        restorationId: widget.name?.trim().isNotEmpty == true
                            ? widget.name!.trim()
                            : null,
                        enabled: !widget.disabled,
                        readOnly: widget.readOnly,
                        autofocus: widget.autofocus,
                        maxLength: widget.maxLength,
                        autofillHints:
                            oneUiInputAutofillHints(widget.autoComplete),
                        keyboardType: oneUiInputKeyboardType(widget.type),
                        obscureText: isPassword
                            ? !_passwordRevealed
                            : oneUiInputObscureText(widget.type),
                        inputFormatters: oneUiInputFormatters(widget.type),
                        autocorrect:
                            widget.type != 'email' && widget.type != 'password',
                        textInputAction: widget.onSubmit != null ||
                                widget.onSubmitEditing != null
                            ? TextInputAction.done
                            : TextInputAction.next,
                        style: controlStyle,
                        cursorColor: paint.accentBorderColor,
                        decoration: InputDecoration.collapsed(
                          hintText: widget.placeholder,
                          hintStyle: controlStyle?.copyWith(
                              color: paint.placeholderColor),
                        ).copyWith(
                            counterText: widget.maxLength != null ? '' : null),
                        onChanged: widget.onChanged,
                        onSubmitted: _handleSubmitted,
                      ),
                    ),
                  ),
                ),
              ),
              if (widget.end2 != null || endContent != null)
                SizedBox(width: metrics.gap),
              _slotBox(
                  child: widget.end2,
                  iconSize: metrics.iconSize,
                  tint: paint.slotColor,
                  fixed: false),
              if (widget.end2 != null && endContent != null)
                SizedBox(width: metrics.gap),
              _slotBox(
                  child: endContent,
                  iconSize: metrics.iconSize,
                  tint: paint.slotColor),
            ],
          ),
        ),
      ),
    );

    if (widget.disabled) {
      shell = Opacity(opacity: borders.disabledOpacity, child: shell);
    }

    shell = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: shell,
    );

    Widget? labelStack;
    if (_showLabelStack) {
      final hasLabel = _hasText(widget.label);
      final hasDescription = _hasText(widget.description);
      labelStack = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasLabel || widget.labelTrailing != null)
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (hasLabel)
                  Flexible(
                    child: Text.rich(
                      TextSpan(
                        text: widget.label!.trim(),
                        style: labelStyle,
                        children: [
                          if (widget.labelSuffixInside != null)
                            WidgetSpan(
                              alignment: PlaceholderAlignment.middle,
                              child: widget.labelSuffixInside!,
                            ),
                        ],
                      ),
                    ),
                  ),
                if (widget.labelTrailing != null) ...[
                  const SizedBox(width: 4),
                  widget.labelTrailing!,
                ],
              ],
            ),
          if (hasDescription) ...[
            const SizedBox(height: 4),
            Text(widget.description!.trim(), style: descriptionStyle),
          ],
        ],
      );
    }

    Widget result = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (labelStack != null) ...[
          labelStack,
          SizedBox(height: borders.rootStackGap),
        ],
        OneUiWebAriaDescribedByBinder(
          controlIdentifier: widget.id?.trim() ?? '',
          ariaDescribedBy: a11y.ariaDescribedBy,
          child: Semantics(
            identifier: _resolveInputSemanticsIdentifier(),
            textField: true,
            label: a11y.label,
            hint: a11y.hint,
            enabled: a11y.enabled,
            readOnly: a11y.readOnly,
            obscured: a11y.obscured,
            excludeSemantics: a11y.hidden,
            isRequired: a11y.isRequired ? true : null,
            validationResult: a11y.validationResult,
            controlsNodes: a11y.describedByNodeIds,
            child: OneUiSlotParentAppearanceScope(
              appearance: resolvedAppearance,
              child: shell,
            ),
          ),
        ),
      ],
    );

    if (widget.width != null) {
      result = SizedBox(width: widget.width, child: result);
    }

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}
