import 'package:flutter/material.dart';

import '../widgets/one_ui_chip.dart';
import '../widgets/one_ui_chip_group.dart';
import '../widgets/one_ui_chip_types.dart';

/// Default + Interactive controls — mirrors `ChipGroup.stories.tsx` argTypes.
class ChipGroupDefaultStoryPage extends StatefulWidget {
  const ChipGroupDefaultStoryPage({super.key});

  @override
  State<ChipGroupDefaultStoryPage> createState() =>
      _ChipGroupDefaultStoryPageState();
}

class _ChipGroupDefaultStoryPageState extends State<ChipGroupDefaultStoryPage> {
  bool _multiple = false;
  String _orientation = 'horizontal';
  bool _wrap = true;
  bool _loopFocus = true;
  OneUiChipSize _size = 'm';
  bool _disabled = false;
  List<String> _selected = const [];

  static const _chips = [
    ('all', 'All'),
    ('news', 'News'),
    ('sport', 'Sport'),
    ('tech', 'Tech'),
    ('culture', 'Culture'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiChipGroup(
      multiple: _multiple,
      orientation: _orientation,
      wrap: _wrap,
      loopFocus: _loopFocus,
      size: _size,
      disabled: _disabled,
      value: _selected,
      onValueChange: _disabled
          ? null
          : (List<String> next) => setState(() => _selected = next),
      semanticsLabel: 'Content categories',
      children: [
        for (final (value, label) in _chips)
          OneUiChip(
            value: value,
            child: label,
            semanticsLabel: label,
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
                    FilterChip(
                      label: const Text('multiple'),
                      selected: _multiple,
                      onSelected: _disabled
                          ? null
                          : (v) => setState(() {
                                _multiple = v;
                                if (!v && _selected.length > 1) {
                                  _selected = _selected.take(1).toList();
                                }
                              }),
                    ),
                    FilterChip(
                      label: const Text('wrap'),
                      selected: _wrap,
                      onSelected: _orientation == 'vertical'
                          ? null
                          : (v) => setState(() => _wrap = v),
                    ),
                    FilterChip(
                      label: const Text('loopFocus'),
                      selected: _loopFocus,
                      onSelected: (v) => setState(() => _loopFocus = v),
                    ),
                    FilterChip(
                      label: const Text('disabled'),
                      selected: _disabled,
                      onSelected: (v) => setState(() => _disabled = v),
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
                      label: const Text('orientation'),
                      initialSelection: _orientation,
                      onSelected: (v) {
                        if (v != null) {
                          setState(() {
                            _orientation = v;
                            if (v == 'vertical') _wrap = true;
                          });
                        }
                      },
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(
                            value: 'horizontal', label: 'horizontal'),
                        DropdownMenuEntry(value: 'vertical', label: 'vertical'),
                      ],
                    ),
                  ],
                ),
                if (_selected.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Selected: ${_selected.join(', ')}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
