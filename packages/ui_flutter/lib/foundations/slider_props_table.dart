import 'package:flutter/material.dart';

/// Storybook autodocs props table — `Slider.stories.tsx` argTypes.
class SliderPropsTable extends StatelessWidget {
  const SliderPropsTable({
    super.key,
    required this.appearance,
    required this.orientation,
    required this.size,
    required this.knobStyle,
    required this.showTooltip,
    required this.showSteps,
    required this.snapToSteps,
    required this.disabled,
    required this.readOnly,
    required this.min,
    required this.max,
    required this.step,
    required this.defaultValue,
    required this.appearanceControl,
    required this.orientationControl,
    required this.sizeControl,
    required this.knobStyleControl,
    required this.showTooltipControl,
    required this.showStepsControl,
    required this.snapToStepsControl,
    required this.disabledControl,
    required this.readOnlyControl,
    required this.minControl,
    required this.maxControl,
    required this.stepControl,
    required this.defaultValueControl,
    required this.labelControl,
  });

  final String appearance;
  final String orientation;
  final String size;
  final String knobStyle;
  final String showTooltip;
  final bool showSteps;
  final bool snapToSteps;
  final bool disabled;
  final bool readOnly;
  final double min;
  final double max;
  final double step;
  final double defaultValue;

  final Widget appearanceControl;
  final Widget orientationControl;
  final Widget sizeControl;
  final Widget knobStyleControl;
  final Widget showTooltipControl;
  final Widget showStepsControl;
  final Widget snapToStepsControl;
  final Widget disabledControl;
  final Widget readOnlyControl;
  final Widget minControl;
  final Widget maxControl;
  final Widget stepControl;
  final Widget defaultValueControl;
  final Widget labelControl;

  static const _rows =
      <({String name, String description, String defaultValue})>[
    (
      name: 'appearance',
      description: 'Multi-accent appearance role',
      defaultValue: 'secondary',
    ),
    (
      name: 'orientation',
      description: 'Horizontal or vertical track (platform extension — not in Figma API)',
      defaultValue: 'horizontal',
    ),
    (
      name: 'size',
      description: 'Component size — s, m, or l (Figma API)',
      defaultValue: 'm',
    ),
    (
      name: 'knobStyle',
      description: 'Outside (over track) or inside (in track) thumb style',
      defaultValue: 'outside',
    ),
    (
      name: 'showTooltip',
      description:
          'Value tooltip visibility: auto, always, or false (platform extension)',
      defaultValue: 'auto',
    ),
    (
      name: 'showSteps',
      description: 'Render step tick marks along the track',
      defaultValue: 'false',
    ),
    (
      name: 'snapToSteps',
      description:
          'Snap thumb to step positions when dragging (default true when steps shown)',
      defaultValue: 'true',
    ),
    (name: 'disabled', description: 'Non-interactive disabled state', defaultValue: 'false'),
    (name: 'readOnly', description: 'Read-only — value visible but not editable', defaultValue: 'false'),
    (name: 'min', description: 'Minimum value', defaultValue: '0'),
    (name: 'max', description: 'Maximum value', defaultValue: '100'),
    (name: 'step', description: 'Step increment', defaultValue: '1'),
    (name: 'defaultValue', description: 'Initial value (number or range pair)', defaultValue: '0'),
    (
      name: 'aria-label',
      description: 'Accessible label for screen readers',
      defaultValue: '—',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final headerStyle = theme.textTheme.labelSmall?.copyWith(
      fontWeight: FontWeight.w600,
      color: scheme.onSurfaceVariant,
    );
    final cellStyle = theme.textTheme.bodySmall;
    final border = BorderSide(color: scheme.outlineVariant);

    Widget controlFor(String name) {
      return switch (name) {
        'appearance' => appearanceControl,
        'orientation' => orientationControl,
        'size' => sizeControl,
        'knobStyle' => knobStyleControl,
        'showTooltip' => showTooltipControl,
        'showSteps' => showStepsControl,
        'snapToSteps' => snapToStepsControl,
        'disabled' => disabledControl,
        'readOnly' => readOnlyControl,
        'min' => minControl,
        'max' => maxControl,
        'step' => stepControl,
        'defaultValue' => defaultValueControl,
        'aria-label' => labelControl,
        _ => const SizedBox.shrink(),
      };
    }

    String defaultFor(String name) {
      return switch (name) {
        'min' => min.round().toString(),
        'max' => max.round().toString(),
        'step' => step.round().toString(),
        'defaultValue' => defaultValue.round().toString(),
        'showSteps' => showSteps.toString(),
        'snapToSteps' => snapToSteps.toString(),
        'disabled' => disabled.toString(),
        'readOnly' => readOnly.toString(),
        'appearance' => appearance,
        'orientation' => orientation,
        'size' => size,
        'knobStyle' => knobStyle,
        'showTooltip' => showTooltip,
        _ => _rows.firstWhere((r) => r.name == name).defaultValue,
      };
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Props',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Table(
            columnWidths: const {
              0: FlexColumnWidth(1.1),
              1: FlexColumnWidth(2.4),
              2: FlexColumnWidth(0.7),
              3: FlexColumnWidth(2.2),
            },
            border: TableBorder(
              horizontalInside: border,
              verticalInside: border,
              top: border,
              bottom: border,
              left: border,
              right: border,
            ),
            children: [
              TableRow(
                decoration: BoxDecoration(
                  color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
                ),
                children: [
                  _headerCell('Name', headerStyle),
                  _headerCell('Description', headerStyle),
                  _headerCell('Default', headerStyle),
                  _headerCell('Control', headerStyle),
                ],
              ),
              for (final row in _rows)
                TableRow(
                  children: [
                    _bodyCell(row.name, cellStyle, monospace: true),
                    _bodyCell(row.description, cellStyle),
                    _bodyCell(defaultFor(row.name), cellStyle, monospace: true),
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: controlFor(row.name),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _headerCell(String text, TextStyle? style) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Text(text, style: style),
    );
  }

  Widget _bodyCell(String text, TextStyle? style, {bool monospace = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Text(
        text,
        style: monospace
            ? style?.copyWith(fontFamily: 'monospace', fontSize: 12)
            : style,
      ),
    );
  }
}
