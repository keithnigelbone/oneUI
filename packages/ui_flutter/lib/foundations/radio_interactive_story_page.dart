import 'package:flutter/material.dart';

import 'radio_brand_bind.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_group.dart';

/// Web `Interactive` story — two-option group, no control panel.
class RadioInteractiveStoryPage extends StatefulWidget {
  const RadioInteractiveStoryPage({super.key});

  @override
  State<RadioInteractiveStoryPage> createState() =>
      _RadioInteractiveStoryPageState();
}

class _RadioInteractiveStoryPageState extends State<RadioInteractiveStoryPage> {
  String _value = '';

  @override
  Widget build(BuildContext context) {
    bindRadioBrandScope(context);
    final brandKey = radioBrandScopeKey(context);
    return Center(
      child: OneUiRadioGroup(
        key: ValueKey('interactive-$brandKey-$_value'),
        value: _value,
        onValueChange: (v) => setState(() => _value = v),
        ariaLabel: 'Interactive test',
        children: [
          OneUiRadio(value: 'first', child: 'First option'),
          OneUiRadio(value: 'second', child: 'Second option'),
        ],
      ),
    );
  }
}
