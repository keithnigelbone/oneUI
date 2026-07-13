import 'package:flutter/material.dart';

import '../widgets/one_ui_single_text_button.dart';
import '../widgets/one_ui_single_text_button_types.dart';

class SingleTextButtonDefaultStoryPage extends StatefulWidget {
  const SingleTextButtonDefaultStoryPage({super.key});

  @override
  State<SingleTextButtonDefaultStoryPage> createState() =>
      _SingleTextButtonDefaultStoryPageState();
}

class _SingleTextButtonDefaultStoryPageState
    extends State<SingleTextButtonDefaultStoryPage> {
  late final TextEditingController _labelController;
  String _label = 'Ag';
  OneUiSingleTextButtonAttention _attention =
      OneUiSingleTextButtonAttention.high;
  String _size = 'm';
  String _appearance = 'auto';
  bool _condensed = false;
  bool _fullWidth = false;
  bool _disabled = false;
  bool _loading = false;
  int _pressCount = 0;

  static const _sizes = ['s', 'm', 'l'];
  static const _appearances = kOneUiSingleTextButtonAppearances;

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: _label);
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
    final interactive = !_disabled && !_loading;

    final preview = OneUiSingleTextButton(
      label: _label,
      attention: _attention,
      size: _size,
      appearance: _appearance,
      condensed: _condensed,
      fullWidth: _fullWidth,
      disabled: _disabled,
      loading: _loading,
      onPressed: interactive ? () => setState(() => _pressCount++) : null,
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
                if (_pressCount > 0) ...[
                  const SizedBox(height: 4),
                  Text('Pressed $_pressCount time(s)',
                      style: theme.textTheme.bodySmall),
                ],
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
                        controller: _labelController,
                        onChanged: (v) => setState(() => _label = v),
                      ),
                    ),
                    DropdownMenu<OneUiSingleTextButtonAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                      dropdownMenuEntries: [
                        for (final a in OneUiSingleTextButtonAttention.values)
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
