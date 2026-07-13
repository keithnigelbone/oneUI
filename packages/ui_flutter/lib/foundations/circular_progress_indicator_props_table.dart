import 'package:flutter/material.dart';

/// Storybook autodocs props table — `CircularProgressIndicator.stories.tsx` argTypes.
class CircularProgressIndicatorPropsTable extends StatelessWidget {
  const CircularProgressIndicatorPropsTable({
    super.key,
    required this.variant,
    required this.size,
    required this.appearance,
    required this.content,
    required this.value,
    required this.min,
    required this.max,
    required this.variantControl,
    required this.sizeControl,
    required this.appearanceControl,
    required this.contentControl,
    required this.valueControl,
    required this.minControl,
    required this.maxControl,
    required this.labelControl,
  });

  final String variant;
  final String size;
  final String appearance;
  final String content;
  final double value;
  final double min;
  final double max;

  final Widget variantControl;
  final Widget sizeControl;
  final Widget appearanceControl;
  final Widget contentControl;
  final Widget valueControl;
  final Widget minControl;
  final Widget maxControl;
  final Widget labelControl;

  static const _rows =
      <({String name, String description, String defaultValue})>[
    (
      name: 'variant',
      description:
          'Determinate shows arc proportional to value; indeterminate shows spinning animation',
      defaultValue: 'determinate',
    ),
    (
      name: 'size',
      description: 'Size preset — maps to spacing dimension tokens',
      defaultValue: 'M',
    ),
    (
      name: 'appearance',
      description: 'Multi-accent appearance role',
      defaultValue: 'auto',
    ),
    (
      name: 'content',
      description: 'Center content type',
      defaultValue: 'none',
    ),
    (
      name: 'value',
      description: 'Current progress value (determinate only)',
      defaultValue: '—',
    ),
    (name: 'min', description: 'Minimum value', defaultValue: '0'),
    (name: 'max', description: 'Maximum value', defaultValue: '100'),
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
        'variant' => variantControl,
        'size' => sizeControl,
        'appearance' => appearanceControl,
        'content' => contentControl,
        'value' => valueControl,
        'min' => minControl,
        'max' => maxControl,
        'aria-label' => labelControl,
        _ => const SizedBox.shrink(),
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
                    _bodyCell(
                      row.name == 'value'
                          ? value.round().toString()
                          : row.name == 'min'
                              ? min.round().toString()
                              : row.name == 'max'
                                  ? max.round().toString()
                                  : row.defaultValue,
                      cellStyle,
                      monospace: true,
                    ),
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
