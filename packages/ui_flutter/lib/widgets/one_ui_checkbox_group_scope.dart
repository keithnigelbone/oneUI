import 'package:flutter/widgets.dart';

import 'one_ui_checkbox_types.dart';

/// Defaults propagated from [OneUiCheckboxGroup] — web `CheckboxGroup`.
class OneUiCheckboxGroupDefaults {
  const OneUiCheckboxGroupDefaults({
    this.size,
    this.appearance,
    this.disabled = false,
    this.readOnly = false,
    this.errorHighlight = false,
  });

  final OneUiCheckboxSize? size;
  final OneUiCheckboxAppearance? appearance;
  final bool disabled;
  final bool readOnly;
  final bool errorHighlight;
}

/// Multi-select value API — web `CheckboxGroup` `value` / `onValueChange`.
class OneUiCheckboxGroupSelection {
  const OneUiCheckboxGroupSelection({
    required this.values,
    required this.toggleValue,
  });

  final Set<String> values;
  final void Function(String optionValue, bool selected) toggleValue;

  bool isSelected(String optionValue) => values.contains(optionValue);
}

class OneUiCheckboxGroupScope extends InheritedWidget {
  const OneUiCheckboxGroupScope({
    required this.defaults,
    required this.selection,
    required super.child,
    super.key,
  });

  final OneUiCheckboxGroupDefaults defaults;
  final OneUiCheckboxGroupSelection selection;

  static OneUiCheckboxGroupDefaults defaultsOf(BuildContext context) {
    return context
            .dependOnInheritedWidgetOfExactType<OneUiCheckboxGroupScope>()
            ?.defaults ??
        const OneUiCheckboxGroupDefaults();
  }

  static OneUiCheckboxGroupSelection? selectionOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiCheckboxGroupScope>()
        ?.selection;
  }

  @override
  bool updateShouldNotify(OneUiCheckboxGroupScope oldWidget) {
    return defaults != oldWidget.defaults || selection != oldWidget.selection;
  }
}
