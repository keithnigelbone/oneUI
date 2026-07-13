import 'package:flutter/material.dart';

import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';

class IconButtonDefaultStoryPage extends StatefulWidget {
  const IconButtonDefaultStoryPage({super.key});

  @override
  State<IconButtonDefaultStoryPage> createState() =>
      _IconButtonDefaultStoryPageState();
}

class _IconButtonDefaultStoryPageState
    extends State<IconButtonDefaultStoryPage> {
  OneUiIconButtonAttention _attention = OneUiIconButtonAttention.high;
  String _sizeAlias = 'm';
  String _appearance = 'auto';
  bool _condensed = false;
  OneUiIconButtonLayout _layout = OneUiIconButtonLayout.square;
  bool _fullWidth = false;
  bool _disabled = false;
  bool _loading = false;

  static const _sizeAliases = ['2xs', 'xs', 's', 'm', 'l', 'xl'];
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

  String get _resolvedAppearance =>
      _appearance == 'auto' ? 'primary' : _appearance;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiIconButton(
      icon: 'add',
      attention: _attention,
      sizeAlias: _sizeAlias,
      appearance: _resolvedAppearance,
      condensed: _condensed,
      layout: _layout,
      fullWidth: _fullWidth,
      disabled: _disabled,
      loading: _loading,
      semanticsLabel: 'Add item',
      onPressed: _disabled || _loading ? null : () {},
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
                    DropdownMenu<OneUiIconButtonAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                      dropdownMenuEntries: [
                        for (final a in OneUiIconButtonAttention.values)
                          DropdownMenuEntry(value: a, label: a.name),
                      ],
                    ),
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _sizeAlias,
                      onSelected: (v) {
                        if (v != null) setState(() => _sizeAlias = v);
                      },
                      dropdownMenuEntries: [
                        for (final s in _sizeAliases)
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
                    DropdownMenu<OneUiIconButtonLayout>(
                      label: const Text('layout'),
                      initialSelection: _layout,
                      onSelected: (v) {
                        if (v != null) setState(() => _layout = v);
                      },
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(
                          value: OneUiIconButtonLayout.square,
                          label: '1:1',
                        ),
                        DropdownMenuEntry(
                          value: OneUiIconButtonLayout.wide,
                          label: '3:2',
                        ),
                      ],
                    ),
                    _switchRow('condensed', _condensed,
                        (v) => setState(() => _condensed = v)),
                    _switchRow('fullWidth', _fullWidth,
                        (v) => setState(() => _fullWidth = v)),
                    _switchRow('disabled', _disabled,
                        (v) => setState(() => _disabled = v)),
                    _switchRow('loading', _loading,
                        (v) => setState(() => _loading = v)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _switchRow(String label, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label),
        Switch(value: value, onChanged: onChanged),
      ],
    );
  }
}
