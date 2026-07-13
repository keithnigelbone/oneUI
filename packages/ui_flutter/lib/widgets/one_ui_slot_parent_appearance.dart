import 'package:flutter/widgets.dart';

/// Resolved multi-accent role from a slot-owning parent (Button, Badge, …).
///
/// Parity with web `SlotParentAppearanceProvider` — [OneUiIcon] inherits
/// [appearance] when its own prop is unset.
class OneUiSlotParentAppearanceScope extends InheritedWidget {
  const OneUiSlotParentAppearanceScope({
    required this.appearance,
    required super.child,
    super.key,
  });

  /// Never `'auto'` — parent's resolved role.
  final String appearance;

  static String? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiSlotParentAppearanceScope>()
        ?.appearance;
  }

  @override
  bool updateShouldNotify(OneUiSlotParentAppearanceScope oldWidget) {
    return appearance != oldWidget.appearance;
  }
}
