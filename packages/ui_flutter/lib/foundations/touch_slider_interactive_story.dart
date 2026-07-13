import 'package:flutter/material.dart';

import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_touch_slider.dart';
import '../widgets/one_ui_touch_slider_types.dart';
import 'touch_slider_props_table.dart';

/// Web Storybook canvas + Controls — `TouchSlider.stories.tsx` argTypes.
class TouchSliderInteractiveStory extends StatefulWidget {
  const TouchSliderInteractiveStory({
    super.key,
    this.showHeader = false,
    this.showPropsTable = false,
    this.fillHeight = true,
  });

  final bool showHeader;
  final bool showPropsTable;
  final bool fillHeight;

  @override
  State<TouchSliderInteractiveStory> createState() =>
      _TouchSliderInteractiveStoryState();
}

class _TouchSliderInteractiveStoryState extends State<TouchSliderInteractiveStory> {
  static const _componentDescription =
      'Chunky fingertip-friendly slider per Figma: orientation, progressStyle, '
      'value, start icon slot, and appearance roles.';

  String _appearance = 'auto';
  String _orientation = 'horizontal';
  String _progressStyle = 'rounded';
  bool _disabled = false;
  bool _readOnly = false;
  bool _withStartSlot = true;
  double _defaultValue = 50;
  double _min = 0;
  double _max = 100;
  double _step = 1;
  late final TextEditingController _labelController;

  static const _appearances = [
    'auto',
    ...kOneUiTouchSliderFigmaAppearanceRoles,
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
        'touch-slider|$_appearance|$_orientation|$_progressStyle|'
        '$_disabled|$_readOnly|$_withStartSlot|'
        '$_defaultValue|$_min|$_max|$_step|${_labelController.text}',
      ),
      child: OneUiTouchSlider(
        defaultValue: _defaultValue,
        min: _min,
        max: _max,
        step: _step,
        appearance: _appearance,
        orientation: _orientation,
        progressStyle: _progressStyle,
        disabled: _disabled,
        readOnly: _readOnly,
        start: _withStartSlot
            ? const OneUiIcon(icon: 'volumeOn', size: '5')
            : null,
        ariaLabel: _labelController.text.trim().isEmpty
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
          // Web `TouchSlider` root is `inline-flex` — intrinsic min-width, not stretched.
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
                  'TouchSlider',
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
                    ButtonSegment(value: 'rounded', label: Text('rounded')),
                    ButtonSegment(value: 'sharp', label: Text('sharp')),
                  ],
                  selected: {_progressStyle},
                  onSelectionChanged: (s) =>
                      setState(() => _progressStyle = s.first),
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
                  label: const Text('start slot'),
                  selected: _withStartSlot,
                  onSelected: (v) => setState(() => _withStartSlot = v),
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
                'TouchSlider',
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
            TouchSliderPropsTable(
              appearance: _appearance,
              orientation: _orientation,
              progressStyle: _progressStyle,
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
              progressStyleControl: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'rounded', label: Text('rounded')),
                  ButtonSegment(value: 'sharp', label: Text('sharp')),
                ],
                selected: {_progressStyle},
                onSelectionChanged: (s) =>
                    setState(() => _progressStyle = s.first),
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
                  key: ValueKey('touch-default-${_defaultValue.round()}'),
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
