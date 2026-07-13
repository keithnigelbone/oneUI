import 'package:flutter/material.dart';

import '../widgets/one_ui_circular_progress_indicator.dart';
import '../widgets/one_ui_icon.dart';
import 'circular_progress_indicator_props_table.dart';

/// Web Storybook canvas + Controls — `CircularProgressIndicator.stories.tsx` argTypes.
///
/// Used by **Docs** (description + props table), **Default**, and **Interactive**.
class CircularProgressIndicatorInteractiveStory extends StatefulWidget {
  const CircularProgressIndicatorInteractiveStory({
    super.key,
    this.showHeader = false,
    this.showPropsTable = false,
    this.fillHeight = true,
  });

  /// Docs autodocs title + description above the canvas.
  final bool showHeader;

  /// Storybook props table (Name / Description / Default / Control).
  final bool showPropsTable;

  /// When true, preview expands (Default / Interactive). Docs uses scroll + fixed canvas.
  final bool fillHeight;

  @override
  State<CircularProgressIndicatorInteractiveStory> createState() =>
      _CircularProgressIndicatorInteractiveStoryState();
}

class _CircularProgressIndicatorInteractiveStoryState
    extends State<CircularProgressIndicatorInteractiveStory> {
  static const _componentDescription =
      'Circular progress indicators provide a visual representation of the current '
      'progress of a task, such as a file upload or content loading. Supports '
      'determinate (value-driven) and indeterminate (spinning) variants with 10 size '
      'presets and 9 multi-accent appearance roles.';

  /// Web `Default` story args.
  String _variant = 'determinate';
  String _size = 'M';
  String _appearance = 'secondary';
  String _content = 'none';
  double _value = 25;
  double _min = 0;
  double _max = 100;
  bool _animate = false;
  bool _show = true;
  late final TextEditingController _labelController;

  static const _appearances = [
    'auto',
    'primary',
    'secondary',
    'sparkle',
    'brand-bg',
    'neutral',
    'positive',
    'negative',
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
        'cpi|$_variant|$_size|$_appearance|$_content|$_value|$_min|$_max|'
        '$_animate|$_show|${_labelController.text}',
      ),
      child: OneUiCircularProgressIndicator(
        variant: _variant,
        size: _size,
        appearance: _appearance,
        content: _content,
        value: _variant == 'indeterminate' ? null : _value,
        min: _min,
        max: _max,
        animate: _animate,
        show: _show,
        semanticsLabel: _labelController.text.trim().isEmpty
            ? null
            : _labelController.text.trim(),
        child: _content == 'icon' ? const OneUiIcon(icon: 'download') : null,
      ),
    );
  }

  /// Storybook canvas — preview ring centred on the token surface.
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
          child: _preview(),
        ),
      ),
    );
  }

  /// Bounded vs unbounded parent — `Expanded` inside an infinite-height
  /// `Column` throws (same root cause as Avatar Default / qa-playground).
  Widget _defaultStoryLayout(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.showHeader) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CircularProgressIndicator',
                  style: Theme.of(context)
                      .textTheme
                      .headlineMedium
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Text(_componentDescription,
                    style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        ],
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: _canvasDecorated(context),
            ),
          ),
        ),
        _bottomControlsPanel(context),
      ],
    );
  }

  Widget _variantControl() {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(value: 'determinate', label: Text('determinate')),
        ButtonSegment(value: 'indeterminate', label: Text('indeterminate')),
      ],
      selected: {_variant},
      onSelectionChanged: (s) => setState(() => _variant = s.first),
    );
  }

  Widget _sizeControl() {
    return DropdownMenu<String>(
      label: const Text('size'),
      initialSelection: _size,
      dropdownMenuEntries: [
        for (final s in kOneUiCircularProgressIndicatorSizes)
          DropdownMenuEntry(value: s, label: s),
      ],
      onSelected: (v) {
        if (v != null) setState(() => _size = v);
      },
    );
  }

  Widget _appearanceControl({bool compact = false}) {
    if (compact) {
      return DropdownMenu<String>(
        label: const Text('appearance'),
        initialSelection: _appearance,
        dropdownMenuEntries: [
          for (final a in _appearances) DropdownMenuEntry(value: a, label: a),
        ],
        onSelected: (v) {
          if (v != null) setState(() => _appearance = v);
        },
      );
    }
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final a in _appearances)
          ChoiceChip(
            label: Text(a),
            selected: _appearance == a,
            onSelected: (_) => setState(() => _appearance = a),
          ),
      ],
    );
  }

  Widget _contentControl() {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(value: 'none', label: Text('none')),
        ButtonSegment(value: 'icon', label: Text('icon')),
        ButtonSegment(value: 'text', label: Text('text')),
      ],
      selected: {_content},
      onSelectionChanged: (s) => setState(() => _content = s.first),
    );
  }

  Widget _valueFieldControl({double? width}) {
    return SizedBox(
      width: width ?? 88,
      child: TextFormField(
        key: ValueKey('cpi-value-${_value.round()}'),
        initialValue: _value.round().toString(),
        decoration: const InputDecoration(
          labelText: 'value',
          isDense: true,
          border: OutlineInputBorder(),
        ),
        keyboardType: TextInputType.number,
        onChanged: (t) {
          final n = double.tryParse(t);
          if (n != null) setState(() => _value = n.clamp(_min, _max));
        },
      ),
    );
  }

  Widget _valueControl() {
    return SizedBox(
      width: 280,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('value: ${_value.round()}'),
          Slider(
            key: ValueKey('cpi-value-slider-${_min.round()}-${_max.round()}'),
            value: _value.clamp(_min, _max),
            min: _min,
            max: _max,
            divisions: (_max - _min).round().clamp(1, 100),
            onChanged: (v) => setState(() => _value = v),
          ),
        ],
      ),
    );
  }

  Widget _minMaxControls() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 88,
          child: TextFormField(
            initialValue: _min.round().toString(),
            decoration: const InputDecoration(labelText: 'min', isDense: true),
            keyboardType: TextInputType.number,
            onChanged: (t) {
              final n = double.tryParse(t);
              if (n != null) setState(() => _min = n);
            },
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 88,
          child: TextFormField(
            initialValue: _max.round().toString(),
            decoration: const InputDecoration(labelText: 'max', isDense: true),
            keyboardType: TextInputType.number,
            onChanged: (t) {
              final n = double.tryParse(t);
              if (n != null) setState(() => _max = n);
            },
          ),
        ),
      ],
    );
  }

  Widget _bottomControlsPanel(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = Theme.of(context).colorScheme;

    return Material(
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
                _variantControl(),
                _sizeControl(),
                _contentControl(),
                if (_variant == 'determinate') _valueControl(),
                if (_variant == 'determinate') _minMaxControls(),
                SizedBox(
                  width: 240,
                  child: TextField(
                    controller: _labelController,
                    decoration: const InputDecoration(
                      labelText: 'aria-label',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                FilterChip(
                  label: const Text('animate'),
                  selected: _animate,
                  onSelected: (v) => setState(() => _animate = v),
                ),
                FilterChip(
                  label: const Text('show'),
                  selected: _show,
                  onSelected: (v) => setState(() => _show = v),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _appearanceControl(),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (widget.showPropsTable) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.showHeader) ...[
              Text(
                'CircularProgressIndicator',
                style: theme.textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                _componentDescription,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 24),
            ],
            SizedBox(
              width: double.infinity,
              height: 220,
              child: _canvasDecorated(context),
            ),
            const SizedBox(height: 24),
            CircularProgressIndicatorPropsTable(
              variant: _variant,
              size: _size,
              appearance: _appearance,
              content: _content,
              value: _value,
              min: _min,
              max: _max,
              variantControl: _variantControl(),
              sizeControl: _sizeControl(),
              appearanceControl: _appearanceControl(compact: true),
              contentControl: _contentControl(),
              valueControl: _variant == 'determinate'
                  ? _valueFieldControl(width: 120)
                  : const Text('—'),
              minControl: _minMaxControls(),
              maxControl: const SizedBox.shrink(),
              labelControl: SizedBox(
                width: 200,
                child: TextField(
                  controller: _labelController,
                  decoration: const InputDecoration(
                    labelText: 'aria-label',
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return _defaultStoryLayout(context);
  }
}
