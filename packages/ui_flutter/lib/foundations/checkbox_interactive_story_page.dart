import 'package:flutter/material.dart';

import 'checkbox_brand_bind.dart';
import '../widgets/one_ui_checkbox.dart';

/// Web `Interactive` story — single checkbox, tap to toggle.
class CheckboxInteractiveStoryPage extends StatefulWidget {
  const CheckboxInteractiveStoryPage({super.key});

  @override
  State<CheckboxInteractiveStoryPage> createState() =>
      _CheckboxInteractiveStoryPageState();
}

class _CheckboxInteractiveStoryPageState
    extends State<CheckboxInteractiveStoryPage> {
  bool _checked = false;

  @override
  Widget build(BuildContext context) {
    bindCheckboxBrandScope(context);
    final brandKey = checkboxBrandScopeKey(context);
    return Center(
      child: OneUiCheckbox(
        key: ValueKey('interactive-$brandKey'),
        label: 'Toggle me',
        checked: _checked,
        onCheckedChange: (v) => setState(() => _checked = v),
      ),
    );
  }
}
