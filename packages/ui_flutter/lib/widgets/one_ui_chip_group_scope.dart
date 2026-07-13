import 'package:flutter/widgets.dart';

import 'one_ui_chip_types.dart';

/// Layout + defaults propagated to child chips — `ChipGroupContext`.
class OneUiChipGroupDefaults {
  const OneUiChipGroupDefaults({
    this.size,
    this.variant,
    this.appearance,
    this.disabled = false,
  });

  final OneUiChipSize? size;
  final OneUiChipVariant? variant;
  final OneUiChipAppearance? appearance;
  final bool disabled;
}

/// Selection API for chips with a non-empty `value` — `ChipGroupSelectionContext`.
class OneUiChipGroupSelection {
  const OneUiChipGroupSelection({
    required this.selectedValues,
    required this.toggleValue,
  });

  final List<String> selectedValues;
  final void Function(String chipValue) toggleValue;

  bool isSelected(String chipValue) => selectedValues.contains(chipValue);
}

class OneUiChipGroupScope extends InheritedWidget {
  const OneUiChipGroupScope({
    required this.defaults,
    required this.selection,
    required super.child,
    super.key,
  });

  final OneUiChipGroupDefaults defaults;
  final OneUiChipGroupSelection? selection;

  static OneUiChipGroupDefaults defaultsOf(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<OneUiChipGroupScope>();
    return scope?.defaults ?? const OneUiChipGroupDefaults();
  }

  static OneUiChipGroupSelection? selectionOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiChipGroupScope>()
        ?.selection;
  }

  @override
  bool updateShouldNotify(OneUiChipGroupScope oldWidget) {
    return defaults != oldWidget.defaults || selection != oldWidget.selection;
  }
}
