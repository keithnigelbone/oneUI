import 'package:flutter/material.dart';

import 'checkbox_brand_bind.dart';
import '../widgets/one_ui_checkbox.dart';
import '../widgets/one_ui_checkbox_types.dart';

class CheckboxDefaultStoryPage extends StatefulWidget {
  const CheckboxDefaultStoryPage({super.key});

  @override
  State<CheckboxDefaultStoryPage> createState() =>
      _CheckboxDefaultStoryPageState();
}

class _CheckboxDefaultStoryPageState extends State<CheckboxDefaultStoryPage> {
  OneUiCheckboxSize _size = 'm';
  String _appearance = 'neutral';
  bool _checked = false;
  bool _indeterminate = false;
  bool _disabled = false;
  bool _readOnly = false;

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
    bindCheckboxBrandScope(context);
    final brandKey = checkboxBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiCheckbox(
      key: ValueKey(
        'default-$brandKey-$_size-$_appearance-$_checked-$_indeterminate-$_disabled-$_readOnly',
      ),
      label: 'Accept terms and conditions',
      size: _size,
      appearance: _appearance,
      checked: _indeterminate ? false : _checked,
      indeterminate: _indeterminate,
      disabled: _disabled,
      readOnly: _readOnly,
      onCheckedChange: _disabled || _readOnly
          ? null
          : (v) => setState(() {
                _checked = v;
                if (v) _indeterminate = false;
              }),
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
                    DropdownMenu<OneUiCheckboxSize>(
                      label: const Text('size'),
                      initialSelection: _size,
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                      dropdownMenuEntries: [
                        for (final s in kOneUiCheckboxSizes)
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
                      label: const Text('checked'),
                      selected: _checked,
                      onSelected: (v) => setState(() {
                        _checked = v;
                        if (v) _indeterminate = false;
                      }),
                    ),
                    FilterChip(
                      label: const Text('indeterminate'),
                      selected: _indeterminate,
                      onSelected: (v) => setState(() {
                        _indeterminate = v;
                        if (v) _checked = false;
                      }),
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
