import 'package:flutter/material.dart';

import 'radio_field_brand_bind.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_field.dart';

class RadioFieldDefaultStoryPage extends StatefulWidget {
  const RadioFieldDefaultStoryPage({super.key});

  @override
  State<RadioFieldDefaultStoryPage> createState() =>
      _RadioFieldDefaultStoryPageState();
}

class _RadioFieldDefaultStoryPageState
    extends State<RadioFieldDefaultStoryPage> {
  String _size = 'm';
  String _appearance = 'auto';
  bool _disabled = false;
  bool _readOnly = false;
  bool _required = false;
  bool _integrated = true;
  String _value = 'on';
  final _labelController =
      TextEditingController(text: 'Enable push notifications');

  static const _appearances = [
    'auto',
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'brand-bg',
    'positive',
    'negative',
    'warning',
    'informative',
  ];

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bindRadioFieldBrandScope(context);
    final brandKey = radioFieldBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = _integrated
        ? OneUiRadioField(
            key: ValueKey('integrated-$brandKey'),
            label: _labelController.text,
            value: _value,
            onValueChange: (v) => setState(() => _value = v),
            size: _size,
            appearance: _appearance,
            disabled: _disabled,
            readOnly: _readOnly,
            required: _required,
          )
        : OneUiRadioField(
            key: ValueKey('multi-$brandKey'),
            label: _labelController.text,
            value: _value,
            onValueChange: (v) => setState(() => _value = v),
            size: _size,
            appearance: _appearance,
            disabled: _disabled,
            readOnly: _readOnly,
            required: _required,
            children: [
              OneUiRadio(value: 'email', label: 'Email'),
              OneUiRadio(value: 'sms', label: 'SMS'),
            ],
          );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Align(
              alignment: Alignment.topLeft,
              child: SizedBox(width: 348, child: preview),
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Controls',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _labelController,
                  decoration:
                      const InputDecoration(labelText: 'label', isDense: true),
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 8),
                DropdownMenu<String>(
                  label: const Text('size'),
                  initialSelection: _size,
                  onSelected: (v) => setState(() => _size = v ?? 'm'),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 's', label: 's'),
                    DropdownMenuEntry(value: 'm', label: 'm'),
                    DropdownMenuEntry(value: 'l', label: 'l'),
                  ],
                ),
                const SizedBox(height: 8),
                DropdownMenu<String>(
                  label: const Text('appearance'),
                  initialSelection: _appearance,
                  onSelected: (v) => setState(() => _appearance = v ?? 'auto'),
                  dropdownMenuEntries: [
                    for (final a in _appearances)
                      DropdownMenuEntry(value: a, label: a),
                  ],
                ),
                SwitchListTile(
                  title: const Text('integrated single'),
                  value: _integrated,
                  onChanged: (v) => setState(() {
                    _integrated = v;
                    _value = v ? 'on' : 'email';
                  }),
                ),
                SwitchListTile(
                  title: const Text('disabled'),
                  value: _disabled,
                  onChanged: (v) => setState(() => _disabled = v),
                ),
                SwitchListTile(
                  title: const Text('readOnly'),
                  value: _readOnly,
                  onChanged: (v) => setState(() => _readOnly = v),
                ),
                SwitchListTile(
                  title: const Text('required'),
                  value: _required,
                  onChanged: (v) => setState(() => _required = v),
                ),
                Text('value: $_value', style: theme.textTheme.bodySmall),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
