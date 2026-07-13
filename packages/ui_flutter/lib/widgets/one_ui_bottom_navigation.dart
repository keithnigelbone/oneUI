import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/bottom_navigation_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_bottom_navigation_a11y.dart';
import 'one_ui_bottom_navigation_scope.dart';
import 'one_ui_bottom_navigation_types.dart';
import 'one_ui_bottom_nav_item.dart';
import 'one_ui_divider.dart';

export 'one_ui_bottom_navigation_types.dart';
export 'one_ui_bottom_navigation_a11y.dart';
export 'one_ui_bottom_nav_item_a11y.dart';
export 'one_ui_bottom_nav_item.dart';

/// Mobile/tablet bottom navigation bar — `BottomNavigation.tsx` / RN peer.
class OneUiBottomNavigation extends StatefulWidget {
  const OneUiBottomNavigation({
    required this.children,
    required this.semanticsLabel,
    super.key,
    this.ariaLabel,
    this.accessibilityLabel,
    this.labelType = kOneUiBottomNavLabel1Line,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.showDivider = true,
    this.appearance = 'primary',
    this.testId,
    this.testID,
    this.semanticsHint,
    this.accessibilityHint,
  });

  final List<Widget> children;
  final OneUiBottomNavigationLabelType labelType;
  final String? value;
  final String? defaultValue;
  final ValueChanged<String>? onValueChange;
  final bool showDivider;
  final OneUiBottomNavigationAppearance appearance;
  final String semanticsLabel;
  final String? ariaLabel;
  final String? accessibilityLabel;
  final String? testId;
  final String? testID;
  final String? semanticsHint;
  final String? accessibilityHint;

  @override
  State<OneUiBottomNavigation> createState() => _OneUiBottomNavigationState();
}

class _OneUiBottomNavigationState extends State<OneUiBottomNavigation> {
  String? _internalValue;

  @override
  void initState() {
    super.initState();
    _internalValue = widget.defaultValue;
  }

  @override
  void didUpdateWidget(OneUiBottomNavigation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value == null && oldWidget.defaultValue != widget.defaultValue) {
      _internalValue = widget.defaultValue;
    }
  }

  String? get _currentValue => widget.value ?? _internalValue;

  void _handleValueChange(String next) {
    if (widget.value == null) {
      setState(() => _internalValue = next);
    }
    widget.onValueChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiBrandLoadState.maybeOf(context);
    OneUiSurfaceScope.maybeOf(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed BottomNavigation without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final itemCount = widget.children.length;
    if (kDebugMode && itemCount > kOneUiBottomNavMaxItems) {
      debugPrint(
        'OneUiBottomNavigation: received $itemCount items — '
        'the design system supports up to $kOneUiBottomNavMaxItems.',
      );
    }
    if (kDebugMode && itemCount < kOneUiBottomNavMinItems) {
      debugPrint(
        'OneUiBottomNavigation: received $itemCount items — '
        'Figma requires at least $kOneUiBottomNavMinItems.',
      );
    }
    final navigationItems = widget.children;

    final parentAppearance =
        OneUiSurfaceScope.maybeOf(context)?.parentAppearance;
    final navState = resolveOneUiBottomNavigationState(
      labelType: widget.labelType,
      appearance: widget.appearance,
      parentAppearance: parentAppearance,
      itemCount: itemCount,
      context: context,
    );
    final resolvedAppearance = navState.resolvedAppearance;
    final resolvedLabelType = navState.labelType;

    final layout = resolveBottomNavigationLayout(
      context,
      ds,
      labelType: resolvedLabelType,
    );
    final navA11y = resolveOneUiBottomNavigationSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      accessibilityLabel: widget.accessibilityLabel,
      semanticsHint: widget.semanticsHint,
      accessibilityHint: widget.accessibilityHint,
    );

    final scopeDefaults = OneUiBottomNavigationDefaults(
      labelType: resolvedLabelType,
      appearance: resolvedAppearance,
      value: _currentValue,
      onValueChange: _handleValueChange,
      inNavigationGroup: true,
    );

    final testId = widget.testId ?? widget.testID;

    Widget row = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < navigationItems.length; i++) ...[
          if (i > 0) SizedBox(width: layout.itemGap),
          Expanded(child: navigationItems[i]),
        ],
      ],
    );

    Widget column = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.showDivider)
          const OneUiDivider(
            key: Key('oneui-bottom-nav-top-divider'),
            size: kOneUiDividerSizeS,
          ),
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: layout.paddingHorizontal,
            vertical: layout.paddingVertical,
          ),
          child: row,
        ),
      ],
    );

    column = OneUiBottomNavigationScope(
      defaults: scopeDefaults,
      child: column,
    );

    column = Semantics(
      container: true,
      explicitChildNodes: true,
      label: navA11y.label,
      hint: navA11y.hint,
      child: column,
    );

    if (testId != null) {
      column = Semantics(identifier: testId, child: column);
    }

    return KeyedSubtree(
      key: ValueKey<String>(navState.dataPayloadKey),
      child: column,
    );
  }
}
