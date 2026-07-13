import 'package:flutter/material.dart';

import '../widgets/one_ui_button.dart';

/// Web `Default` story — centered preview + **Controls** (no Events / A11y yet).
class ButtonDefaultStoryPage extends StatefulWidget {
  const ButtonDefaultStoryPage({super.key});

  @override
  State<ButtonDefaultStoryPage> createState() => _ButtonDefaultStoryPageState();
}

class _ButtonDefaultStoryPageState extends State<ButtonDefaultStoryPage> {
  late final TextEditingController _labelController;
  OneUiButtonAttention _attention = OneUiButtonAttention.high;
  int _size = 10;
  String _appearance = 'auto';
  bool _start = false;
  bool _end = false;
  bool _condensed = false;
  bool _fullWidth = false;
  bool _disabled = false;
  bool _loading = false;

  static const _sizes = <int>[6, 8, 10, 12];
  static const _sizeLabels = ['xs', 's', 'm', 'l'];
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

  String get _label => _labelController.text;

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'Button');
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

    final preview = OneUiButton(
      label: _label.isEmpty ? 'Button' : _label,
      attention: _attention,
      size: _size,
      appearance: _resolvedAppearance,
      condensed: _condensed,
      fullWidth: _fullWidth,
      disabled: _disabled,
      loading: _loading,
      start: _start ? const OneUiButtonSlotIcon() : null,
      end: _end ? const OneUiButtonSlotIcon() : null,
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
                Text('Controls',
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      child: TextField(
                        decoration: const InputDecoration(
                          labelText: 'children',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        controller: _labelController,
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    _labeled(
                      context,
                      'attention',
                      SegmentedButton<OneUiButtonAttention>(
                        segments: const [
                          ButtonSegment(
                              value: OneUiButtonAttention.high,
                              label: Text('high')),
                          ButtonSegment(
                              value: OneUiButtonAttention.medium,
                              label: Text('medium')),
                          ButtonSegment(
                              value: OneUiButtonAttention.low,
                              label: Text('low')),
                        ],
                        selected: {_attention},
                        onSelectionChanged: (s) =>
                            setState(() => _attention = s.first),
                      ),
                    ),
                    _labeled(
                      context,
                      'size',
                      DropdownButton<int>(
                        value: _size,
                        isDense: true,
                        items: [
                          for (var i = 0; i < _sizes.length; i++)
                            DropdownMenuItem(
                                value: _sizes[i], child: Text(_sizeLabels[i])),
                        ],
                        onChanged: (v) {
                          if (v != null) setState(() => _size = v);
                        },
                      ),
                    ),
                    _labeled(
                      context,
                      'appearance',
                      DropdownButton<String>(
                        value: _appearance,
                        isDense: true,
                        items: [
                          for (final a in _appearances)
                            DropdownMenuItem(value: a, child: Text(a)),
                        ],
                        onChanged: (v) {
                          if (v != null) setState(() => _appearance = v);
                        },
                      ),
                    ),
                    _switchRow(
                        'start', _start, (v) => setState(() => _start = v)),
                    _switchRow('end', _end, (v) => setState(() => _end = v)),
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

  Widget _labeled(BuildContext context, String name, Widget control) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(name, style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 4),
        control,
      ],
    );
  }

  Widget _switchRow(String name, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Switch(value: value, onChanged: onChanged),
        Text(name, style: Theme.of(context).textTheme.labelSmall),
      ],
    );
  }
}
