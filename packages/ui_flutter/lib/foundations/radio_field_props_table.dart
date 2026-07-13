import 'package:flutter/material.dart';

/// Mirrors web `RadioField.stories.tsx` `argTypes` + autodocs props table.
class RadioFieldPropsTable extends StatelessWidget {
  const RadioFieldPropsTable({super.key});

  static const _rows =
      <({String name, String description, String defaultValue})>[
    (
      name: 'label',
      description: 'Field label (legend for multi-option).',
      defaultValue: '—'
    ),
    (
      name: 'description',
      description: 'Helper copy below the label.',
      defaultValue: '—'
    ),
    (
      name: 'children',
      description:
          'Radio options. Omit for integrated single (Default, SingleOptionWithDescription, WithInfoIcon).',
      defaultValue: '[]',
    ),
    (
      name: 'size',
      description: 'Field + option size — s, m, l.',
      defaultValue: 'm'
    ),
    (
      name: 'appearance',
      description: 'Multi-accent appearance role.',
      defaultValue: 'auto'
    ),
    (
      name: 'orientation',
      description: 'RadioGroup layout — vertical or horizontal.',
      defaultValue: 'vertical'
    ),
    (
      name: 'value',
      description: 'Controlled selected option value.',
      defaultValue: '—'
    ),
    (
      name: 'defaultValue',
      description: 'Uncontrolled initial value.',
      defaultValue: '—'
    ),
    (
      name: 'checked',
      description: 'Integrated single — bool on/off.',
      defaultValue: '—'
    ),
    (
      name: 'defaultChecked',
      description: 'Integrated single uncontrolled default on/off.',
      defaultValue: '—'
    ),
    (
      name: 'singleOptionValue',
      description: 'Integrated single form value when on.',
      defaultValue: 'on'
    ),
    (
      name: 'disabled',
      description: 'Disables the field and group.',
      defaultValue: 'false'
    ),
    (
      name: 'readOnly',
      description: 'Read-only selection.',
      defaultValue: 'false'
    ),
    (
      name: 'required',
      description: 'Required asterisk on label.',
      defaultValue: 'false'
    ),
    (
      name: 'invalid',
      description: 'Invalid state + error highlight on options.',
      defaultValue: 'false'
    ),
    (
      name: 'infoIconSlot',
      description: 'Trailing control beside the label (WithInfoIcon).',
      defaultValue: '—'
    ),
    (
      name: 'feedback',
      description: 'Custom InputFeedback after options (WithFeedback).',
      defaultValue: '—'
    ),
    (
      name: 'dynamicTextSlot',
      description: 'Custom InputDynamicText after options (WithDynamicText).',
      defaultValue: '—'
    ),
    (
      name: 'onValueChange',
      description: 'Fired when selection changes.',
      defaultValue: '—'
    ),
    (
      name: 'onCheckedChange',
      description: 'Integrated single — fired when on/off toggles.',
      defaultValue: '—'
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
              1: FlexColumnWidth(2.5),
              2: FlexColumnWidth(0.8),
            },
            border: TableBorder(
              horizontalInside: BorderSide(color: scheme.outlineVariant),
              verticalInside: BorderSide(color: scheme.outlineVariant),
            ),
            children: [
              TableRow(
                decoration:
                    BoxDecoration(color: scheme.surfaceContainerHighest),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Text('Name', style: headerStyle),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Text('Description', style: headerStyle),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Text('Default', style: headerStyle),
                  ),
                ],
              ),
              for (final row in _rows)
                TableRow(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(row.name,
                          style: cellStyle?.copyWith(fontFamily: 'monospace')),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(row.description, style: cellStyle),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(row.defaultValue, style: cellStyle),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }
}
