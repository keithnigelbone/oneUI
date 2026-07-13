import 'package:flutter/widgets.dart';

import 'one_ui_bottom_navigation_types.dart';

/// Shared defaults propagated to child items — `BottomNavigationContext`.
class OneUiBottomNavigationDefaults {
  const OneUiBottomNavigationDefaults({
    this.labelType = kOneUiBottomNavLabel1Line,
    this.appearance = 'primary',
    this.value,
    this.onValueChange,
    this.inNavigationGroup = false,
  });

  final OneUiBottomNavigationLabelType labelType;
  final OneUiBottomNavigationAppearance appearance;
  final String? value;
  final void Function(String next)? onValueChange;
  final bool inNavigationGroup;
}

class OneUiBottomNavigationScope extends InheritedWidget {
  const OneUiBottomNavigationScope({
    required this.defaults,
    required super.child,
    super.key,
  });

  final OneUiBottomNavigationDefaults defaults;

  static OneUiBottomNavigationDefaults defaultsOf(BuildContext context) {
    final scope = context
        .dependOnInheritedWidgetOfExactType<OneUiBottomNavigationScope>();
    return scope?.defaults ?? const OneUiBottomNavigationDefaults();
  }

  @override
  bool updateShouldNotify(OneUiBottomNavigationScope oldWidget) {
    return defaults != oldWidget.defaults;
  }
}
