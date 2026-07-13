import 'package:flutter/material.dart';

import '../widgets/one_ui_slider.dart';
import '../widgets/one_ui_slider_types.dart';
import 'slider_props_table.dart';

/// Web Storybook canvas + Controls — `Slider.stories.tsx` argTypes.
///
/// Used by **Docs** (description + props table), **Default**, and **Interactive**.
class SliderInteractiveStory extends StatefulWidget {
  const SliderInteractiveStory({
    super.key,
    this.showHeader = false,
    this.showPropsTable = false,
    this.fillHeight = true,
  });

  final bool showHeader;
  final bool showPropsTable;
  final bool fillHeight;

  @override
  State<SliderInteractiveStory> createState() => _SliderInteractiveStoryState();
}

class _SliderInteractiveStoryState extends State<SliderInteractiveStory> {
  static const _componentDescription =
      'Precision range input. Figma API: size s/m/l, knob styles, appearances, '
      'step ticks, and start/end slots. Platform extensions: vertical orientation '
      'and value tooltip.';

  String _appearance = 'secondary';
  String _orientation = 'horizontal';
  String _size = 'm';
  String _knobStyle = 'outside';
  String _showTooltip = 'auto';
  bool _showSteps = false;
  bool _snapToSteps = true;
  bool _disabled = false;
  bool _readOnly = false;
  double _defaultValue = 50;
  double _min = 0;
  double _max = 100;
  double _step = 10;
  late final TextEditingController _labelController;

  static const _appearances = [
    'auto',
    ...kOneUiSliderFigmaAppearanceRoles,
  ];

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'Volume');
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  Widget _preview() {
    return KeyedSubtree(
      key: ValueKey(
        'slider|$_appearance|$_orientation|$_size|$_knobStyle|$_showTooltip|'
        '$_showSteps|$_snapToSteps|$_disabled|$_readOnly|'
        '$_defaultValue|$_min|$_max|$_step|${_labelController.text}',
      ),
      child: SizedBox(
        width: 328,
        child: OneUiSlider(
          defaultValue: _defaultValue,
          min: _min,
          max: _max,
          step: _step,
          appearance: _appearance,
          orientation: _orientation,
          size: _size,
          knobStyle: _knobStyle,
          showTooltip: _showTooltip,
          showSteps: _showSteps,
          snapToSteps: _snapToSteps,
          disabled: _disabled,
          readOnly: _readOnly,
          ariaLabel: _labelController.text.trim().isEmpty
              ? null
              : _labelController.text.trim(),
        ),
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
          padding: const EdgeInsets.fromLTRB(48, 56, 48, 48),
          child: _preview(),
        ),
      ),
    );
  }

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
                  'Slider',
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
            child: Center(child: _canvasDecorated(context)),
          ),
        ),
        _bottomControlsPanel(context),
      ],
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

  Widget _bottomControlsPanel(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

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
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'horizontal', label: Text('horizontal')),
                    ButtonSegment(value: 'vertical', label: Text('vertical')),
                  ],
                  selected: {_orientation},
                  onSelectionChanged: (s) =>
                      setState(() => _orientation = s.first),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'outside', label: Text('outside')),
                    ButtonSegment(value: 'inside', label: Text('inside')),
                  ],
                  selected: {_knobStyle},
                  onSelectionChanged: (s) =>
                      setState(() => _knobStyle = s.first),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 's', label: Text('s')),
                    ButtonSegment(value: 'm', label: Text('m')),
                    ButtonSegment(value: 'l', label: Text('l')),
                  ],
                  selected: {_size},
                  onSelectionChanged: (s) => setState(() => _size = s.first),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'auto', label: Text('auto')),
                    ButtonSegment(value: 'always', label: Text('always')),
                    ButtonSegment(value: 'false', label: Text('false')),
                  ],
                  selected: {_showTooltip},
                  onSelectionChanged: (s) =>
                      setState(() => _showTooltip = s.first),
                ),
                SizedBox(
                  width: 280,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('defaultValue: ${_defaultValue.round()}'),
                      Slider(
                        value: _defaultValue.clamp(_min, _max),
                        min: _min,
                        max: _max,
                        divisions: (_max - _min).round().clamp(1, 100),
                        onChanged: (v) => setState(() => _defaultValue = v),
                      ),
                    ],
                  ),
                ),
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
                  label: const Text('showSteps'),
                  selected: _showSteps,
                  onSelected: (v) => setState(() => _showSteps = v),
                ),
                FilterChip(
                  label: const Text('snapToSteps'),
                  selected: _snapToSteps,
                  onSelected: (v) => setState(() => _snapToSteps = v),
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
                'Slider',
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
            SliderPropsTable(
              appearance: _appearance,
              orientation: _orientation,
              size: _size,
              knobStyle: _knobStyle,
              showTooltip: _showTooltip,
              showSteps: _showSteps,
              snapToSteps: _snapToSteps,
              disabled: _disabled,
              readOnly: _readOnly,
              min: _min,
              max: _max,
              step: _step,
              defaultValue: _defaultValue,
              appearanceControl: _appearanceControl(compact: true),
              orientationControl: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'horizontal', label: Text('horizontal')),
                  ButtonSegment(value: 'vertical', label: Text('vertical')),
                ],
                selected: {_orientation},
                onSelectionChanged: (s) =>
                    setState(() => _orientation = s.first),
              ),
              sizeControl: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 's', label: Text('s')),
                  ButtonSegment(value: 'm', label: Text('m')),
                  ButtonSegment(value: 'l', label: Text('l')),
                ],
                selected: {_size},
                onSelectionChanged: (s) => setState(() => _size = s.first),
              ),
              knobStyleControl: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'outside', label: Text('outside')),
                  ButtonSegment(value: 'inside', label: Text('inside')),
                ],
                selected: {_knobStyle},
                onSelectionChanged: (s) =>
                    setState(() => _knobStyle = s.first),
              ),
              showTooltipControl: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'auto', label: Text('auto')),
                  ButtonSegment(value: 'always', label: Text('always')),
                  ButtonSegment(value: 'false', label: Text('false')),
                ],
                selected: {_showTooltip},
                onSelectionChanged: (s) =>
                    setState(() => _showTooltip = s.first),
              ),
              showStepsControl: FilterChip(
                label: const Text('showSteps'),
                selected: _showSteps,
                onSelected: (v) => setState(() => _showSteps = v),
              ),
              snapToStepsControl: FilterChip(
                label: const Text('snapToSteps'),
                selected: _snapToSteps,
                onSelected: (v) => setState(() => _snapToSteps = v),
              ),
              disabledControl: FilterChip(
                label: const Text('disabled'),
                selected: _disabled,
                onSelected: (v) => setState(() => _disabled = v),
              ),
              readOnlyControl: FilterChip(
                label: const Text('readOnly'),
                selected: _readOnly,
                onSelected: (v) => setState(() => _readOnly = v),
              ),
              minControl: SizedBox(
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
              maxControl: SizedBox(
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
              stepControl: SizedBox(
                width: 88,
                child: TextFormField(
                  initialValue: _step.round().toString(),
                  decoration: const InputDecoration(labelText: 'step', isDense: true),
                  keyboardType: TextInputType.number,
                  onChanged: (t) {
                    final n = double.tryParse(t);
                    if (n != null) setState(() => _step = n);
                  },
                ),
              ),
              defaultValueControl: SizedBox(
                width: 120,
                child: TextFormField(
                  key: ValueKey('slider-default-${_defaultValue.round()}'),
                  initialValue: _defaultValue.round().toString(),
                  decoration: const InputDecoration(
                    labelText: 'defaultValue',
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  onChanged: (t) {
                    final n = double.tryParse(t);
                    if (n != null) {
                      setState(() => _defaultValue = n.clamp(_min, _max));
                    }
                  },
                ),
              ),
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
