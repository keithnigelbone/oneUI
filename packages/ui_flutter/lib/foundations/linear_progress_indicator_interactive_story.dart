import 'package:flutter/material.dart';

import '../widgets/one_ui_linear_progress_indicator.dart';
import 'linear_progress_indicator_props_table.dart';
import 'linear_progress_indicator_showcase.dart';

class LinearProgressIndicatorInteractiveStory extends StatefulWidget {
  const LinearProgressIndicatorInteractiveStory({
    super.key,
    this.showHeader = false,
    this.showPropsTable = false,
    this.fillHeight = true,
  });

  final bool showHeader;
  final bool showPropsTable;
  final bool fillHeight;

  @override
  State<LinearProgressIndicatorInteractiveStory> createState() =>
      _LinearProgressIndicatorInteractiveStoryState();
}

class _LinearProgressIndicatorInteractiveStoryState
    extends State<LinearProgressIndicatorInteractiveStory> {
  static const _componentDescription =
      'A horizontal bar that communicates progress either as a known percentage '
      '(determinate) or as ongoing activity with no defined end (indeterminate). '
      'Supports S/M/L sizes, pill or flat caps, and multi-accent appearance roles.';

  String _type = 'determinate';
  String _size = 'M';
  String _appearance = 'primary';
  bool _roundCaps = true;
  double _value = 60;
  late final TextEditingController _labelController;

  static const _appearances = [
    'auto',
    'neutral',
    'primary',
    'secondary',
    'sparkle',
    'negative',
    'positive',
    'warning',
    'informative',
  ];

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'Task progress');
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  Widget _preview() {
    return KeyedSubtree(
      key: ValueKey(
        'lpi|$_type|$_size|$_appearance|$_roundCaps|$_value|'
        '${_labelController.text}',
      ),
      child: OneUiLinearProgressIndicator(
        type: _type,
        size: _size,
        appearance: _appearance,
        roundCaps: _roundCaps,
        value: _value,
        semanticsLabel: _labelController.text.trim().isEmpty
            ? null
            : _labelController.text.trim(),
      ),
    );
  }

  Widget _canvasDecorated(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border.all(color: scheme.outlineVariant),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: SizedBox(
            width: lpiStoryBarWidth(context),
            child: _preview(),
          ),
        ),
      ),
    );
  }

  Widget _controls() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('type', style: TextStyle(fontWeight: FontWeight.w600)),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'determinate', label: Text('determinate')),
            ButtonSegment(value: 'indeterminate', label: Text('indeterminate')),
          ],
          selected: {_type},
          onSelectionChanged: (s) => setState(() => _type = s.first),
        ),
        const SizedBox(height: 16),
        const Text('size', style: TextStyle(fontWeight: FontWeight.w600)),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'S', label: Text('S')),
            ButtonSegment(value: 'M', label: Text('M')),
            ButtonSegment(value: 'L', label: Text('L')),
          ],
          selected: {_size},
          onSelectionChanged: (s) => setState(() => _size = s.first),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _appearance,
          decoration: const InputDecoration(labelText: 'appearance'),
          items: [
            for (final a in _appearances)
              DropdownMenuItem(value: a, child: Text(a)),
          ],
          onChanged: (v) => setState(() => _appearance = v ?? 'primary'),
        ),
        SwitchListTile(
          title: const Text('roundCaps'),
          value: _roundCaps,
          onChanged: (v) => setState(() => _roundCaps = v),
        ),
        if (_type == 'determinate') ...[
          Text('value: ${_value.round()}'),
          Slider(
            value: _value,
            min: 0,
            max: 100,
            divisions: 100,
            label: '${_value.round()}',
            onChanged: (v) => setState(() => _value = v),
          ),
        ],
        TextField(
          controller: _labelController,
          decoration: const InputDecoration(labelText: 'aria-label'),
          onChanged: (_) => setState(() {}),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final body = widget.fillHeight
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(flex: 3, child: _canvasDecorated(context)),
              const VerticalDivider(width: 1),
              Expanded(
                flex: 2,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: _controls(),
                ),
              ),
            ],
          )
        : SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (widget.showHeader) ...[
                  Text(
                    'LinearProgressIndicator',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(_componentDescription),
                  const SizedBox(height: 24),
                ],
                _canvasDecorated(context),
                if (widget.showPropsTable) ...[
                  const SizedBox(height: 32),
                  const LinearProgressIndicatorPropsTable(),
                ],
              ],
            ),
          );

    if (!widget.fillHeight) return body;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.showHeader)
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'LinearProgressIndicator',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                const Text(_componentDescription),
              ],
            ),
          ),
        Expanded(child: body),
      ],
    );
  }
}
