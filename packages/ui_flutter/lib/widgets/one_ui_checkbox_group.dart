import 'package:flutter/material.dart';

import '../engine/checkbox_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_checkbox_group_scope.dart';
import 'one_ui_test_id_semantics.dart';

export 'one_ui_checkbox_group_scope.dart';

typedef OneUiCheckboxGroupChange = void Function(List<String> values);

/// Token-backed checkbox group — web `CheckboxGroup` / `BaseCheckboxGroup`.
class OneUiCheckboxGroup extends StatefulWidget {
  const OneUiCheckboxGroup({
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
    this.semanticsDescribedBy,
    this.ariaDescribedby,
    this.errorHighlight = false,
    String? testId,
    String? testID,
  }) : testId = testId ?? testID;

  final List<Widget> children;
  final List<String>? value;
  final List<String>? defaultValue;
  final OneUiCheckboxGroupChange? onValueChange;
  final bool disabled;
  final bool readOnly;
  final String? size;
  final String? appearance;
  final String? semanticsDescribedBy;
  final String? ariaDescribedby;
  final bool errorHighlight;
  final String? testId;

  @override
  State<OneUiCheckboxGroup> createState() => _OneUiCheckboxGroupState();
}

class _OneUiCheckboxGroupState extends State<OneUiCheckboxGroup> {
  late Set<String> _internalValues;

  @override
  void initState() {
    super.initState();
    _internalValues = Set<String>.from(widget.defaultValue ?? const []);
  }

  @override
  void didUpdateWidget(covariant OneUiCheckboxGroup oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value == null &&
        oldWidget.defaultValue != widget.defaultValue &&
        widget.defaultValue != null) {
      _internalValues = Set<String>.from(widget.defaultValue!);
    }
  }

  bool get _isControlled => widget.value != null;

  Set<String> get _selectedValues =>
      _isControlled ? Set<String>.from(widget.value!) : _internalValues;

  void _toggleValue(String optionValue, bool selected) {
    if (widget.disabled || widget.readOnly) return;
    final next = Set<String>.from(_selectedValues);
    if (selected) {
      next.add(optionValue);
    } else {
      next.remove(optionValue);
    }
    if (!_isControlled) {
      setState(() => _internalValues = next);
    }
    widget.onValueChange?.call(next.toList());
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed CheckboxGroup without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final metrics = resolveCheckboxMetrics(
      context,
      ds,
      size: widget.size ?? 'm',
    );

    final describedBy = widget.semanticsDescribedBy ?? widget.ariaDescribedby;
    final describedByNodes = oneUiParseAriaDescribedByNodeIds(describedBy);

    final scope = OneUiCheckboxGroupScope(
      defaults: OneUiCheckboxGroupDefaults(
        size: widget.size,
        appearance: widget.appearance,
        disabled: widget.disabled,
        readOnly: widget.readOnly,
        errorHighlight: widget.errorHighlight,
      ),
      selection: OneUiCheckboxGroupSelection(
        values: _selectedValues,
        toggleValue: _toggleValue,
      ),
      child: Semantics(
        container: true,
        identifier: oneUiResolveSemanticsTestIdentifier(testId: widget.testId),
        controlsNodes: describedByNodes,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: metrics.groupVerticalGap,
          children: widget.children,
        ),
      ),
    );

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      return oneUiWrapKeyedTestId(testId: tid, child: scope);
    }
    return scope;
  }
}
