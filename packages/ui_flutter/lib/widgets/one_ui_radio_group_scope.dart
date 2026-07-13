import 'package:flutter/widgets.dart';

import 'one_ui_radio_types.dart';

/// Defaults propagated from [OneUiRadioGroup] — web `RadioGroupContext`.
class OneUiRadioGroupDefaults {
  const OneUiRadioGroupDefaults({
    this.size,
    this.appearance,
    this.disabled = false,
    this.readOnly = false,
    this.errorHighlight = false,
  });

  final OneUiRadioSize? size;
  final OneUiRadioAppearance? appearance;
  final bool disabled;
  final bool readOnly;
  final bool errorHighlight;
}

/// Single-select value API — web `RadioGroup` `value` / `onValueChange`.
class OneUiRadioGroupSelection {
  const OneUiRadioGroupSelection({
    required this.value,
    required this.selectValue,
    this.deselectOnReselect = false,
  });

  final String? value;
  final void Function(String optionValue) selectValue;

  /// When true, tapping the already-selected option clears to `''` (RadioField plain / integrated).
  final bool deselectOnReselect;

  bool isSelected(String optionValue) => value == optionValue;
}

class OneUiRadioGroupScope extends InheritedWidget {
  const OneUiRadioGroupScope({
    required this.defaults,
    required this.selection,
    required super.child,
    super.key,
  });

  final OneUiRadioGroupDefaults defaults;
  final OneUiRadioGroupSelection selection;

  static OneUiRadioGroupDefaults defaultsOf(BuildContext context) {
    return context
            .dependOnInheritedWidgetOfExactType<OneUiRadioGroupScope>()
            ?.defaults ??
        const OneUiRadioGroupDefaults();
  }

  static OneUiRadioGroupSelection? selectionOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiRadioGroupScope>()
        ?.selection;
  }

  @override
  bool updateShouldNotify(OneUiRadioGroupScope oldWidget) {
    return defaults != oldWidget.defaults || selection != oldWidget.selection;
  }
}
