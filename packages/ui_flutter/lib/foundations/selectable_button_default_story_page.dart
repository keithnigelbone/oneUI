import 'package:flutter/material.dart';

import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_selectable_button.dart';
import '../widgets/one_ui_selectable_button_types.dart';

class SelectableButtonDefaultStoryPage extends StatefulWidget {
  const SelectableButtonDefaultStoryPage({super.key});

  @override
  State<SelectableButtonDefaultStoryPage> createState() =>
      _SelectableButtonDefaultStoryPageState();
}

class _SelectableButtonDefaultStoryPageState
    extends State<SelectableButtonDefaultStoryPage> {
  String _attention = 'high';
  String _size = 'm';
  String _appearance = 'auto';
  bool _contained = true;
  bool _condensed = false;
  bool _fullWidth = false;
  bool _selected = true;
  bool _disabled = false;
  bool _loading = false;
  bool _showStart = false;
  bool _showEnd = false;

  static const _appearances = kOneUiSelectableButtonAppearances;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiSelectableButton(
      label: 'Like',
      attention: _attention,
      size: _size,
      appearance: _appearance,
      contained: _contained,
      condensed: _condensed,
      fullWidth: _fullWidth,
      selected: _selected,
      disabled: _disabled,
      loading: _loading,
      start: _showStart
          ? OneUiIcon(
              icon: 'heart',
              size: selectableButtonSlotIconSize(_size),
              excludeFromSemantics: true,
            )
          : null,
      end: _showEnd
          ? OneUiIcon(
              icon: 'heart',
              size: selectableButtonSlotIconSize(_size),
              excludeFromSemantics: true,
            )
          : null,
      onSelectedChange: _disabled || _loading
          ? null
          : (v) => setState(() => _selected = v),
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
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Controls',
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  children: [
                    DropdownMenu<String>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      onSelected: (v) =>
                          setState(() => _attention = v ?? _attention),
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(value: 'high', label: 'high'),
                        DropdownMenuEntry(value: 'medium', label: 'medium'),
                        DropdownMenuEntry(value: 'low', label: 'low'),
                      ],
                    ),
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _size,
                      onSelected: (v) => setState(() => _size = v ?? _size),
                      dropdownMenuEntries: [
                        for (final s in kOneUiSelectableButtonSizes)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                    ),
                    DropdownMenu<String>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      onSelected: (v) =>
                          setState(() => _appearance = v ?? _appearance),
                      dropdownMenuEntries: [
                        for (final a in _appearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                    ),
                    FilterChip(
                      label: const Text('contained'),
                      selected: _contained,
                      onSelected: (v) => setState(() => _contained = v),
                    ),
                    FilterChip(
                      label: const Text('condensed'),
                      selected: _condensed,
                      onSelected: (v) => setState(() => _condensed = v),
                    ),
                    FilterChip(
                      label: const Text('fullWidth'),
                      selected: _fullWidth,
                      onSelected: (v) => setState(() => _fullWidth = v),
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
                    FilterChip(
                      label: const Text('loading'),
                      selected: _loading,
                      onSelected: (v) => setState(() => _loading = v),
                    ),
                    FilterChip(
                      label: const Text('start'),
                      selected: _showStart,
                      onSelected: (v) => setState(() => _showStart = v),
                    ),
                    FilterChip(
                      label: const Text('end'),
                      selected: _showEnd,
                      onSelected: (v) => setState(() => _showEnd = v),
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
