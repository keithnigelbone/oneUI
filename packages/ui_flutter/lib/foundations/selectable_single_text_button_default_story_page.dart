import 'package:flutter/material.dart';

import '../widgets/one_ui_selectable_single_text_button.dart';

class SelectableSingleTextButtonDefaultStoryPage extends StatefulWidget {
  const SelectableSingleTextButtonDefaultStoryPage({super.key});

  @override
  State<SelectableSingleTextButtonDefaultStoryPage> createState() =>
      _SelectableSingleTextButtonDefaultStoryPageState();
}

class _SelectableSingleTextButtonDefaultStoryPageState
    extends State<SelectableSingleTextButtonDefaultStoryPage> {
  String _label = 'Ag';
  OneUiSelectableSingleTextButtonAttention _attention =
      OneUiSelectableSingleTextButtonAttention.high;
  String _size = 'm';
  String _appearance = 'auto';
  bool _condensed = false;
  bool _fullWidth = false;
  bool _disabled = false;
  bool _loading = false;
  bool _defaultSelected = true;

  static const _sizes = ['s', 'm', 'l'];
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

    final preview = OneUiSelectableSingleTextButton(
      label: _label,
      attention: _attention,
      size: _size,
      appearance: _appearance,
      condensed: _condensed,
      fullWidth: _fullWidth,
      disabled: _disabled,
      loading: _loading,
      defaultSelected: _defaultSelected,
      semanticsLabel: _label,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: SizedBox(
                width: _fullWidth ? 320 : null,
                child: preview,
              ),
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
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    SizedBox(
                      width: 120,
                      child: TextField(
                        decoration: const InputDecoration(
                          labelText: 'children',
                          isDense: true,
                        ),
                        controller: TextEditingController(text: _label),
                        onChanged: (v) => setState(() => _label = v),
                      ),
                    ),
                    DropdownMenu<OneUiSelectableSingleTextButtonAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                      dropdownMenuEntries: [
                        for (final a
                            in OneUiSelectableSingleTextButtonAttention.values)
                          DropdownMenuEntry(value: a, label: a.name),
                      ],
                    ),
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _size,
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                      dropdownMenuEntries: [
                        for (final s in _sizes)
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
                      label: const Text('defaultSelected'),
                      selected: _defaultSelected,
                      onSelected: (v) => setState(() => _defaultSelected = v),
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
