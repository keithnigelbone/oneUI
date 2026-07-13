import 'package:flutter/material.dart';

import '../widgets/one_ui_selectable_icon_button.dart';

class SelectableIconButtonDefaultStoryPage extends StatefulWidget {
  const SelectableIconButtonDefaultStoryPage({super.key});

  @override
  State<SelectableIconButtonDefaultStoryPage> createState() =>
      _SelectableIconButtonDefaultStoryPageState();
}

class _SelectableIconButtonDefaultStoryPageState
    extends State<SelectableIconButtonDefaultStoryPage> {
  OneUiSelectableIconButtonAttention _attention =
      OneUiSelectableIconButtonAttention.high;
  String _sizeAlias = 'm';
  String _appearance = 'auto';
  OneUiSelectableIconButtonShape _shape =
      OneUiSelectableIconButtonShape.square;
  bool _condensed = false;
  bool _fullWidth = false;
  bool _disabled = false;
  bool _loading = false;
  bool _selected = true;

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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiSelectableIconButton(
      icon: 'heart',
      attention: _attention,
      sizeAlias: _sizeAlias,
      appearance: _appearance,
      shape: _shape,
      condensed: _condensed,
      fullWidth: _fullWidth,
      disabled: _disabled,
      loading: _loading,
      selected: _selected,
      onSelectedChange: (v) => setState(() => _selected = v),
      semanticsLabel: 'Toggle like',
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
                Text('Controls', style: theme.textTheme.titleSmall),
                const SizedBox(height: 12),
                DropdownButtonFormField<OneUiSelectableIconButtonAttention>(
                  value: _attention,
                  decoration: const InputDecoration(labelText: 'attention'),
                  items: OneUiSelectableIconButtonAttention.values
                      .map((a) => DropdownMenuItem(
                            value: a,
                            child: Text(a.name),
                          ))
                      .toList(),
                  onChanged: (v) =>
                      setState(() => _attention = v ?? _attention),
                ),
                DropdownButtonFormField<String>(
                  value: _sizeAlias,
                  decoration: const InputDecoration(labelText: 'size'),
                  items: _sizeAliases
                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (v) =>
                      setState(() => _sizeAlias = v ?? _sizeAlias),
                ),
                DropdownButtonFormField<String>(
                  value: _appearance,
                  decoration: const InputDecoration(labelText: 'appearance'),
                  items: _appearances
                      .map((a) => DropdownMenuItem(value: a, child: Text(a)))
                      .toList(),
                  onChanged: (v) =>
                      setState(() => _appearance = v ?? _appearance),
                ),
                DropdownButtonFormField<OneUiSelectableIconButtonShape>(
                  value: _shape,
                  decoration: const InputDecoration(labelText: 'shape'),
                  items: const [
                    DropdownMenuItem(
                      value: OneUiSelectableIconButtonShape.square,
                      child: Text('1:1'),
                    ),
                    DropdownMenuItem(
                      value: OneUiSelectableIconButtonShape.wide,
                      child: Text('2:3'),
                    ),
                  ],
                  onChanged: (v) => setState(() => _shape = v ?? _shape),
                ),
                SwitchListTile(
                  title: const Text('condensed'),
                  value: _condensed,
                  onChanged: (v) => setState(() => _condensed = v),
                ),
                SwitchListTile(
                  title: const Text('fullWidth'),
                  value: _fullWidth,
                  onChanged: (v) => setState(() => _fullWidth = v),
                ),
                SwitchListTile(
                  title: const Text('disabled'),
                  value: _disabled,
                  onChanged: (v) => setState(() => _disabled = v),
                ),
                SwitchListTile(
                  title: const Text('loading'),
                  value: _loading,
                  onChanged: (v) => setState(() => _loading = v),
                ),
                SwitchListTile(
                  title: const Text('selected'),
                  value: _selected,
                  onChanged: (v) => setState(() => _selected = v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
