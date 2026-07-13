import 'package:flutter/material.dart';

/// Storybook autodocs props table — `TouchSlider.stories.tsx` argTypes.
class TouchSliderPropsTable extends StatelessWidget {
  const TouchSliderPropsTable({
    super.key,
    required this.appearance,
    required this.orientation,
    required this.progressStyle,
    required this.disabled,
    required this.readOnly,
    required this.min,
    required this.max,
    required this.step,
    required this.defaultValue,
    required this.appearanceControl,
    required this.orientationControl,
    required this.progressStyleControl,
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
  final String progressStyle;
  final bool disabled;
  final bool readOnly;
  final double min;
  final double max;
  final double step;
  final double defaultValue;

  final Widget appearanceControl;
  final Widget orientationControl;
  final Widget progressStyleControl;
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
      defaultValue: 'auto',
    ),
    (
      name: 'orientation',
      description: 'Horizontal or vertical track',
      defaultValue: 'horizontal',
    ),
    (
      name: 'progressStyle',
      description: 'Rounded pill cap or sharp trailing edge',
      defaultValue: 'rounded',
    ),
    (name: 'disabled', description: 'Non-interactive disabled state', defaultValue: 'false'),
    (name: 'readOnly', description: 'Read-only — value visible but not editable', defaultValue: 'false'),
    (name: 'min', description: 'Minimum value', defaultValue: '0'),
    (name: 'max', description: 'Maximum value', defaultValue: '100'),
    (name: 'step', description: 'Step increment', defaultValue: '1'),
    (name: 'defaultValue', description: 'Initial value', defaultValue: '0'),
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
        'progressStyle' => progressStyleControl,
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
        'disabled' => disabled.toString(),
        'readOnly' => readOnly.toString(),
        'appearance' => appearance,
        'orientation' => orientation,
        'progressStyle' => progressStyle,
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
