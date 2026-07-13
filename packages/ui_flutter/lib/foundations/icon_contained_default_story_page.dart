import 'package:flutter/material.dart';

import '../widgets/one_ui_icon_contained.dart';
import '../widgets/one_ui_icon_contained_types.dart';

/// Web `Default` + `Interactive` — centered preview + Controls.
class IconContainedDefaultStoryPage extends StatefulWidget {
  const IconContainedDefaultStoryPage({super.key});

  @override
  State<IconContainedDefaultStoryPage> createState() =>
      _IconContainedDefaultStoryPageState();
}

class _IconContainedDefaultStoryPageState
    extends State<IconContainedDefaultStoryPage> {
  String _iconName = 'heart';
  String _size = 'm';
  OneUiIconContainedAttention _attention = OneUiIconContainedAttention.medium;
  String _appearance = 'secondary';
  bool _disabled = false;
  late final TextEditingController _labelController;

  static const _iconNames = [
    'heart',
    'star',
    'check',
    'search',
    'settings',
    'home'
  ];

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'Interactive heart');
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiIconContained(
      icon: _iconName,
      size: _size,
      attention: _attention,
      appearance: _appearance == 'auto' ? null : _appearance,
      disabled: _disabled,
      semanticsLabel: _labelController.text,
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
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    DropdownMenu<String>(
                      label: const Text('icon'),
                      initialSelection: _iconName,
                      dropdownMenuEntries: [
                        for (final n in _iconNames)
                          DropdownMenuEntry(value: n, label: n),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _iconName = v);
                      },
                    ),
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _size,
                      dropdownMenuEntries: [
                        for (final s in kOneUiIconContainedSizes)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                    ),
                    DropdownMenu<OneUiIconContainedAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      dropdownMenuEntries: [
                        for (final a in OneUiIconContainedAttention.values)
                          DropdownMenuEntry(value: a, label: a.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                    ),
                    DropdownMenu<String>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      dropdownMenuEntries: [
                        const DropdownMenuEntry(value: 'auto', label: 'auto'),
                        for (final a in kOneUiIconContainedAppearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _appearance = v);
                      },
                    ),
                    FilterChip(
                      label: const Text('disabled'),
                      selected: _disabled,
                      onSelected: (v) => setState(() => _disabled = v),
                    ),
                    SizedBox(
                      width: 220,
                      child: TextField(
                        decoration: const InputDecoration(
                          labelText: 'aria-label',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        controller: _labelController,
                        onChanged: (_) => setState(() {}),
                      ),
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
