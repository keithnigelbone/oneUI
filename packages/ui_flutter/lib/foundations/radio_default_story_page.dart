import 'package:flutter/material.dart';

import 'radio_brand_bind.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_group.dart';
import '../widgets/one_ui_radio_types.dart';

class RadioDefaultStoryPage extends StatefulWidget {
  const RadioDefaultStoryPage({super.key});

  @override
  State<RadioDefaultStoryPage> createState() => _RadioDefaultStoryPageState();
}

class _RadioDefaultStoryPageState extends State<RadioDefaultStoryPage> {
  OneUiRadioSize _size = 'm';
  String _appearance = 'neutral'; // Web Default story args.appearance
  bool _demoChecked = true;
  bool _disabled = false;
  bool _readOnly = false;
  String _selected = 'a';

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
  Widget build(BuildContext context) {
    bindRadioBrandScope(context);
    final brandKey = radioBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final groupValue = _demoChecked ? _selected : '';

    final preview = OneUiRadioGroup(
      key: ValueKey(
          'default-$brandKey-$groupValue-$_disabled-$_readOnly-$_size-$_appearance'),
      value: groupValue,
      onValueChange: _disabled || _readOnly
          ? null
          : (v) => setState(() {
                _selected = v;
                _demoChecked = true;
              }),
      disabled: _disabled,
      readOnly: _readOnly,
      size: _size,
      appearance: _appearance,
      ariaLabel: 'Interactive radio demo',
      children: [
        OneUiRadio(
          value: 'a',
          size: _size,
          appearance: _appearance,
          child: 'Option A',
        ),
        OneUiRadio(
          value: 'b',
          size: _size,
          appearance: _appearance,
          child: 'Option B',
        ),
        OneUiRadio(
          value: 'c',
          size: _size,
          appearance: _appearance,
          child: 'Option C',
        ),
      ],
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(child: preview),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withOpacity(0.5),
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
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  children: [
                    DropdownMenu<OneUiRadioSize>(
                      label: const Text('size'),
                      initialSelection: _size,
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                      dropdownMenuEntries: [
                        for (final s in kOneUiRadioSizes)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                    ),
                    DropdownMenu<String>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      onSelected: (v) {
                        if (v != null) setState(() => _appearance = v);
                      },
                      dropdownMenuEntries: [
                        for (final a in _appearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                    ),
                    FilterChip(
                      label: const Text('checked (demo)'),
                      selected: _demoChecked,
                      onSelected: (v) => setState(() => _demoChecked = v),
                    ),
                    FilterChip(
                      label: const Text('disabled'),
                      selected: _disabled,
                      onSelected: (v) => setState(() => _disabled = v),
                    ),
                    FilterChip(
                      label: const Text('readOnly'),
                      selected: _readOnly,
                      onSelected: (v) => setState(() => _readOnly = v),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
