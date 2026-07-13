import 'package:flutter/material.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'one_ui_chip_group_a11y.dart';
import 'one_ui_chip_group_focus.dart';
import 'one_ui_chip_group_scope.dart';
import 'one_ui_chip_group_types.dart';
import 'one_ui_chip_types.dart';
import 'one_ui_test_id_semantics.dart';

export 'one_ui_chip_group_types.dart';
export 'one_ui_chip_group_a11y.dart';
export 'one_ui_chip_group_scope.dart';
export 'one_ui_chip_group_focus.dart';

/// Token-backed chip group — `ChipGroup.tsx` / `ChipGroup.native.tsx`.
class OneUiChipGroup extends StatefulWidget {
  const OneUiChipGroup({
    required this.children,
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.multiple = false,
    this.orientation = 'horizontal',
    this.containerType,
    this.wrap = true,
    this.size,
    this.variant,
    this.appearance,
    this.maxSelections,
    this.required = false,
    this.disabled = false,
    this.loopFocus = true,
    this.semanticsLabel,
    this.ariaLabel,
    this.semanticsLabelledBy,
    this.ariaLabelledBy,
    this.semanticsHint,
    this.accessibilityHint,
    String? testId,
    String? testID,
  }) : testId = testId ?? testID;

  final List<Widget> children;
  final List<String>? value;
  final List<String>? defaultValue;
  final ValueChanged<List<String>>? onValueChange;
  final bool multiple;
  final OneUiChipGroupOrientation orientation;

  /// Figma `containerType` — `inline` (horizontal scroll) or `wrap` (default).
  /// Takes precedence over [wrap] when set.
  final OneUiChipGroupContainerType? containerType;
  final bool wrap;
  final String? size;
  final String? variant;
  final String? appearance;
  final int? maxSelections;
  final bool required;
  final bool disabled;
  final bool loopFocus;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? semanticsLabelledBy;
  final String? ariaLabelledBy;
  final String? semanticsHint;
  final String? accessibilityHint;
  final String? testId;

  @override
  State<OneUiChipGroup> createState() => _OneUiChipGroupState();
}

class _OneUiChipGroupState extends State<OneUiChipGroup> {
  late List<String> _internalValue;
  late final OneUiChipGroupFocusController _focusController;

  @override
  void initState() {
    super.initState();
    _internalValue = List<String>.from(widget.defaultValue ?? []);
    _focusController = OneUiChipGroupFocusController(
      loopFocus: widget.loopFocus,
      horizontal: widget.orientation != 'vertical',
      enabled: !widget.disabled,
    );
  }

  @override
  void dispose() {
    _focusController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant OneUiChipGroup oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value == null && oldWidget.defaultValue != widget.defaultValue) {
      _internalValue = List<String>.from(widget.defaultValue ?? []);
    }
    _focusController.loopFocus = widget.loopFocus;
    _focusController.horizontal = widget.orientation != 'vertical';
    _focusController.enabled = !widget.disabled;
  }

  bool get _isControlled => widget.value != null;

  List<String> get _selectedValues =>
      _isControlled ? List<String>.from(widget.value!) : _internalValue;

  void _toggleValue(String chipValue) {
    final next = computeNextChipGroupValues(
      _selectedValues,
      chipValue,
      OneUiChipGroupToggleOptions(
        multiple: widget.multiple,
        required: widget.required,
        maxSelections: widget.maxSelections,
      ),
    );
    if (next == null) return;
    if (!_isControlled) {
      setState(() => _internalValue = next);
    }
    widget.onValueChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final groupState = resolveOneUiChipGroupState(
      size: widget.size,
      containerType: widget.containerType,
      wrap: widget.wrap,
      orientation: widget.orientation,
      disabled: widget.disabled,
    );

    // `--ChipGroup-gap` → `--Spacing-2` per `ChipGroup.tokens.ts`.
    final gap = scope.designSystem?.resolveComponentLengthPxCascade(
          ['--ChipGroup-gap', '--Spacing-2'],
          platformId: scope.platformId,
          density: scope.density,
          platformsConfig: scope.platformsFoundationConfig,
          nativeTypography: OneUiScope.nativeTypographyOf(context),
        ) ??
        resolveSpacingPx(
          designSystem: scope.designSystem,
          platformsConfig: scope.platformsFoundationConfig,
          platformId: scope.platformId,
          density: scope.density,
          spacingName: '2',
        );

    final a11y = resolveOneUiChipGroupSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      semanticsLabelledBy: widget.semanticsLabelledBy,
      ariaLabelledBy: widget.ariaLabelledBy,
      semanticsHint: widget.semanticsHint,
      accessibilityHint: widget.accessibilityHint,
      disabled: widget.disabled,
    );

    final validatedGroupAppearance = widget.appearance != null &&
            widget.appearance!.isNotEmpty &&
            widget.appearance != 'auto'
        ? oneUiResolveChipExplicitAppearance(context, widget.appearance!)
        : widget.appearance;

    final selection = OneUiChipGroupSelection(
      selectedValues: _selectedValues,
      toggleValue: _toggleValue,
    );

    final defaults = OneUiChipGroupDefaults(
      size: groupState.resolvedSize,
      variant: widget.variant,
      appearance: validatedGroupAppearance,
      disabled: widget.disabled,
    );

    final horizontal = widget.orientation != 'vertical';
    final Widget layout;
    if (!horizontal) {
      layout = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: gap,
        children: widget.children,
      );
    } else if (groupState.wrap) {
      layout = Wrap(
        spacing: gap,
        runSpacing: gap,
        children: widget.children,
      );
    } else {
      layout = SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          spacing: gap,
          children: widget.children,
        ),
      );
    }

    final textDirection = Directionality.of(context);
    Widget body = OneUiChipGroupFocusKeyboardScope(
      controller: _focusController,
      textDirection: textDirection,
      child: OneUiChipGroupScope(
        defaults: defaults,
        selection: selection,
        child: layout,
      ),
    );

    if (a11y.exposeGroup) {
      final tid = widget.testId?.trim();
      final labelledById = a11y.labelledBy?.trim();
      final semanticsId = tid != null && tid.isNotEmpty
          ? tid
          : (labelledById != null && labelledById.isNotEmpty
              ? labelledById
              : null);
      body = Semantics(
        container: true,
        label: a11y.label,
        hint: a11y.hint,
        enabled: !a11y.disabled,
        // Web `aria-labelledby` — pair with a sibling `Semantics(identifier: …, label: …)`.
        identifier: semanticsId,
        child: ExcludeSemantics(child: body),
      );
    } else {
      final tid = widget.testId?.trim();
      if (tid != null && tid.isNotEmpty) {
        body = Semantics(
          identifier: tid,
          container: true,
          child: ExcludeSemantics(child: body),
        );
      }
    }

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      body = oneUiWrapKeyedTestId(testId: tid, child: body);
    }

    return KeyedSubtree(
      key: ValueKey<String>(groupState.dataPayloadKey),
      child: body,
    );
  }
}
