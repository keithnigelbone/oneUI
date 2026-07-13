import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../engine/radio_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'one_ui_aria_described_by.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_radio_group_a11y.dart';
import 'one_ui_radio_group_focus.dart';
import 'one_ui_radio_group_scope.dart';
import 'one_ui_radio_group_types.dart';
import 'one_ui_test_id_semantics.dart';

export 'one_ui_radio_group_a11y.dart';
export 'one_ui_radio_group_scope.dart';
export 'one_ui_radio_group_types.dart';

/// Token-backed radio group — web `RadioGroup` / `BaseRadioGroup`.
class OneUiRadioGroup extends StatefulWidget {
  const OneUiRadioGroup({
    required this.children,
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.disabled = false,
    this.readOnly = false,
    this.size,
    this.appearance,

    /// @deprecated Ignored at runtime — use [appearance].
    String? accent,
    this.orientation = 'vertical',
    this.semanticsLabel,
    this.ariaLabel,
    this.semanticsDescribedBy,
    this.ariaDescribedby,
    this.errorHighlight = false,
    this.deselectOnReselect = false,
    this.accessibilityHint,
    String? testId,
    String? testID,
  }) : testId = testId ?? testID;

  final List<Widget> children;
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onValueChange;
  final bool disabled;
  final bool readOnly;
  final String? size;
  final String? appearance;
  final OneUiRadioGroupOrientation orientation;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? semanticsDescribedBy;
  final String? ariaDescribedby;
  final bool errorHighlight;
  final bool deselectOnReselect;
  final String? accessibilityHint;
  final String? testId;

  @override
  State<OneUiRadioGroup> createState() => _OneUiRadioGroupState();
}

class _OneUiRadioGroupState extends State<OneUiRadioGroup> {
  String? _internalValue;
  late final OneUiRadioGroupFocusController _focusController;

  @override
  void initState() {
    super.initState();
    _internalValue = widget.defaultValue;
    _focusController = OneUiRadioGroupFocusController(
      horizontal: widget.orientation == 'horizontal',
      enabled: !widget.disabled && !widget.readOnly,
    );
  }

  @override
  void dispose() {
    _focusController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant OneUiRadioGroup oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value == null && oldWidget.defaultValue != widget.defaultValue) {
      _internalValue = widget.defaultValue;
    }
    _focusController.horizontal = widget.orientation == 'horizontal';
    _focusController.enabled = !widget.disabled && !widget.readOnly;
  }

  bool get _isControlled => widget.value != null;

  String? get _selectedValue => _isControlled ? widget.value : _internalValue;

  void _selectValue(String optionValue) {
    if (widget.disabled || widget.readOnly) return;
    if (!_isControlled) {
      setState(() => _internalValue = optionValue);
    }
    widget.onValueChange?.call(optionValue);
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed RadioGroup without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final metrics = resolveRadioMetrics(
      context,
      ds,
      size: widget.size ?? 'm',
    );

    final gap = widget.orientation == 'horizontal'
        ? metrics.groupHorizontalGap
        : metrics.groupVerticalGap;

    final groupA11y = resolveOneUiRadioGroupSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      semanticsDescribedBy: widget.semanticsDescribedBy,
      ariaDescribedby: widget.ariaDescribedby,
      accessibilityHint: widget.accessibilityHint,
      disabled: widget.disabled,
    );

    Widget content;
    if (widget.orientation == 'horizontal') {
      // Web `Radio.module.css` — `flex-wrap: wrap` on horizontal groups.
      content = Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: widget.children,
      );
    } else {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < widget.children.length; i++) ...[
            if (i > 0) SizedBox(height: gap),
            widget.children[i],
          ],
        ],
      );
    }

    content = OneUiRadioGroupScope(
      defaults: OneUiRadioGroupDefaults(
        size: widget.size,
        appearance: widget.appearance,
        disabled: widget.disabled,
        readOnly: widget.readOnly,
        errorHighlight: widget.errorHighlight,
      ),
      selection: OneUiRadioGroupSelection(
        value: _selectedValue,
        selectValue: _selectValue,
        deselectOnReselect: widget.deselectOnReselect,
      ),
      child: content,
    );

    content = OneUiRadioGroupFocusKeyboardScope(
      controller: _focusController,
      textDirection: Directionality.of(context),
      child: content,
    );

    // Flutter requires checked radios to sit under a radiogroup semantics node
    // (web `role="radiogroup"`). Label is omitted when the field shell owns it.
    final describedByNodes =
        oneUiParseAriaDescribedByNodeIds(groupA11y.describedBy);
    content = Semantics(
      role: SemanticsRole.radioGroup,
      container: true,
      label: groupA11y.exposeGroup ? groupA11y.label : null,
      hint: groupA11y.hint,
      enabled: !groupA11y.disabled,
      identifier: oneUiResolveSemanticsTestIdentifier(testId: widget.testId),
      controlsNodes: describedByNodes,
      child: content,
    );

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      content = oneUiWrapKeyedTestId(testId: tid, child: content);
    }

    return content;
  }
}
