import 'package:flutter/material.dart';

import 'checkbox_field_brand_bind.dart';
import '../widgets/one_ui_checkbox.dart';
import '../widgets/one_ui_checkbox_field.dart';
import '../widgets/one_ui_checkbox_types.dart';

class CheckboxFieldDefaultStoryPage extends StatefulWidget {
  const CheckboxFieldDefaultStoryPage({super.key});

  @override
  State<CheckboxFieldDefaultStoryPage> createState() =>
      _CheckboxFieldDefaultStoryPageState();
}

class _CheckboxFieldDefaultStoryPageState
    extends State<CheckboxFieldDefaultStoryPage> {
  OneUiCheckboxSize _size = 'm';
  String _appearance = 'auto';
  bool _checked = false;
  bool _indeterminate = false;
  bool _disabled = false;
  bool _readOnly = false;
  bool _required = false;
  bool _integrated = true;
  final _labelController =
      TextEditingController(text: 'Email me about product updates');
  List<String> _groupValue = [];

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
  void initState() {
    super.initState();
    _groupValue = ['news'];
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bindCheckboxFieldBrandScope(context);
    final brandKey = checkboxFieldBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = _integrated
        ? OneUiCheckboxField(
            key: ValueKey('integrated-$brandKey'),
            label: _labelController.text,
            checked: _indeterminate ? false : _checked,
            indeterminate: _indeterminate,
            onCheckedChange: (v) => setState(() {
              _checked = v;
              if (v) _indeterminate = false;
            }),
            size: _size,
            appearance: _appearance,
            disabled: _disabled,
            readOnly: _readOnly,
            required: _required,
          )
        : OneUiCheckboxField(
            key: ValueKey('multi-$brandKey'),
            label: _labelController.text,
            groupValue: _groupValue,
            onGroupValueChange: (v) => setState(() => _groupValue = v),
            size: _size,
            appearance: _appearance,
            disabled: _disabled,
            readOnly: _readOnly,
            required: _required,
            children: [
              OneUiCheckbox(value: 'news', label: 'Product news'),
              OneUiCheckbox(value: 'tips', label: 'Tips and tutorials'),
            ],
          );

    return LayoutBuilder(
      builder: (context, constraints) {
        // Keep preview visible — controls scroll inside a capped panel (React addon panel parity).
        final maxControlsHeight =
            (constraints.maxHeight * 0.45).clamp(200.0, 340.0);

        Widget controls = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Controls',
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _labelController,
              decoration:
                  const InputDecoration(labelText: 'label', isDense: true),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 8),
            DropdownMenu<OneUiCheckboxSize>(
              label: const Text('size'),
              initialSelection: _size,
              onSelected: (v) => setState(() => _size = v ?? 'm'),
              dropdownMenuEntries: [
                for (final s in kOneUiCheckboxSizes)
                  DropdownMenuEntry(value: s, label: s),
              ],
            ),
            const SizedBox(height: 8),
            DropdownMenu<String>(
              label: const Text('appearance'),
              initialSelection: _appearance,
              onSelected: (v) => setState(() => _appearance = v ?? 'auto'),
              dropdownMenuEntries: [
                for (final a in _appearances)
                  DropdownMenuEntry(value: a, label: a),
              ],
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('integrated single'),
              value: _integrated,
              onChanged: (v) => setState(() => _integrated = v),
            ),
            if (_integrated) ...[
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('checked'),
                value: _checked,
                onChanged: (v) => setState(() {
                  _checked = v;
                  if (v) _indeterminate = false;
                }),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('indeterminate'),
                value: _indeterminate,
                onChanged: (v) => setState(() {
                  _indeterminate = v;
                  if (v) _checked = false;
                }),
              ),
            ],
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('disabled'),
              value: _disabled,
              onChanged: (v) => setState(() => _disabled = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('readOnly'),
              value: _readOnly,
              onChanged: (v) => setState(() => _readOnly = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('required'),
              value: _required,
              onChanged: (v) => setState(() => _required = v),
            ),
            if (!_integrated)
              Text('groupValue: $_groupValue',
                  style: theme.textTheme.bodySmall),
          ],
        );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Align(
                  alignment: Alignment.topLeft,
                  child: SizedBox(width: 348, child: preview),
                ),
              ),
            ),
            Material(
              color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
              child: ConstrainedBox(
                constraints: BoxConstraints(maxHeight: maxControlsHeight),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                  child: controls,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
