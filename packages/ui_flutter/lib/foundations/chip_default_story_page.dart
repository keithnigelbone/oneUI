import 'package:flutter/material.dart';

import '../widgets/one_ui_chip.dart';
import '../widgets/one_ui_chip_types.dart';

class ChipDefaultStoryPage extends StatefulWidget {
  const ChipDefaultStoryPage({super.key});

  @override
  State<ChipDefaultStoryPage> createState() => _ChipDefaultStoryPageState();
}

class _ChipDefaultStoryPageState extends State<ChipDefaultStoryPage> {
  OneUiChipAttention _attention = 'high';
  OneUiChipSize _size = 'm';
  String _appearance = 'secondary';
  bool _selected = true;
  bool _disabled = false;

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
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiChip(
      attention: _attention,
      size: _size,
      appearance: _appearance,
      selected: _selected,
      disabled: _disabled,
      semanticsLabel: 'Filter chip',
      child: 'Filter',
      onSelectedChange: _disabled
          ? null
          : (bool v, [Object? _]) => setState(() => _selected = v),
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
                    DropdownMenu<OneUiChipAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(value: 'high', label: 'high'),
                        DropdownMenuEntry(value: 'medium', label: 'medium'),
                        DropdownMenuEntry(value: 'low', label: 'low'),
                      ],
                    ),
                    DropdownMenu<OneUiChipSize>(
                      label: const Text('size'),
                      initialSelection: _size,
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(value: 's', label: 's'),
                        DropdownMenuEntry(value: 'm', label: 'm'),
                        DropdownMenuEntry(value: 'l', label: 'l'),
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
                      label: const Text('selected'),
                      selected: _selected,
                      onSelected: (v) => setState(() => _selected = v),
                    ),
                    FilterChip(
                      label: const Text('disabled'),
                      selected: _disabled,
                      onSelected: (v) => setState(() => _disabled = v),
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
