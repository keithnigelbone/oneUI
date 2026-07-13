import 'package:flutter/material.dart';

/// Mirrors web `InputField.stories.tsx` `argTypes` + autodocs props table.
class InputFieldPropsTable extends StatelessWidget {
  const InputFieldPropsTable({super.key});

  static const _rows =
      <({String name, String description, String defaultValue})>[
    (
      name: 'placeholder',
      description: 'Placeholder text inside the input.',
      defaultValue: '—'
    ),
    (
      name: 'label',
      description: 'Field label. Ignored when `labelSlot` is provided.',
      defaultValue: '—'
    ),
    (
      name: 'description',
      description: 'Helper copy below the label.',
      defaultValue: '—'
    ),
    (name: 'size', description: 'Component size — S, M, L.', defaultValue: 'm'),
    (
      name: 'appearance',
      description: 'Multi-accent appearance role.',
      defaultValue: 'auto',
    ),
    (
      name: 'shape',
      description: 'Bordered shell shape — default or pill.',
      defaultValue: 'default'
    ),
    (
      name: 'attention',
      description:
          'Visual attention — medium (outlined) or high (filled neutral background).',
      defaultValue: 'medium',
    ),
    (
      name: 'start',
      description: 'Toggle start slot icon.',
      defaultValue: 'false'
    ),
    (name: 'end', description: 'Toggle end slot icon.', defaultValue: 'false'),
    (
      name: 'disabled',
      description: 'Disables the field.',
      defaultValue: 'false'
    ),
    (name: 'readOnly', description: 'Read-only value.', defaultValue: 'false'),
    (
      name: 'required',
      description: 'Shows required asterisk on label.',
      defaultValue: 'false'
    ),
    (
      name: 'error',
      description: 'Error string → `OneUiInputFeedback` negative row.',
      defaultValue: '—'
    ),
    (
      name: 'dynamicText',
      description: 'Dynamic text row content (character count, hints).',
      defaultValue: '—'
    ),
    (
      name: 'type',
      description: 'HTML input type (`text`, `email`, `password`, …).',
      defaultValue: 'text',
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
              0: FlexColumnWidth(1.2),
              1: FlexColumnWidth(2.8),
              2: FlexColumnWidth(0.8),
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
                    color:
                        scheme.surfaceContainerHighest.withValues(alpha: 0.5)),
                children: [
                  _headerCell('Name', headerStyle),
                  _headerCell('Description', headerStyle),
                  _headerCell('Default', headerStyle),
                ],
              ),
              for (final row in _rows)
                TableRow(
                  children: [
                    _bodyCell(row.name, cellStyle, monospace: true),
                    _bodyCell(row.description, cellStyle),
                    _bodyCell(row.defaultValue, cellStyle, monospace: true),
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
