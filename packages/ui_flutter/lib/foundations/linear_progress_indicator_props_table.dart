import 'package:flutter/material.dart';

class LinearProgressIndicatorPropsTable extends StatelessWidget {
  const LinearProgressIndicatorPropsTable({super.key});

  @override
  Widget build(BuildContext context) {
    const rows = [
      ('type', 'determinate | indeterminate', 'determinate', 'Progress mode'),
      ('size', 'S | M | L', 'M', 'Track height preset'),
      ('appearance', 'auto + 9 roles', 'primary', 'Multi-accent colour role'),
      ('roundCaps', 'bool', 'true', 'Pill vs square track rail ends; fill matches'),
      ('value', 'number 0–100', '0', 'Determinate only; clamped'),
      ('aria-label', 'string', '—', 'Required accessible name'),
      ('indicatorColor', 'Color?', '—', 'Flutter dev escape hatch — not in web API'),
      ('trackColor', 'Color?', '—', 'Flutter dev escape hatch — not in web API'),
    ];

    return Table(
      columnWidths: const {
        0: FlexColumnWidth(1.2),
        1: FlexColumnWidth(2),
        2: FlexColumnWidth(1),
        3: FlexColumnWidth(2.5),
      },
      border: TableBorder.all(color: Theme.of(context).dividerColor),
      children: [
        TableRow(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
          ),
          children: const [
            Padding(padding: EdgeInsets.all(8), child: Text('Prop')),
            Padding(padding: EdgeInsets.all(8), child: Text('Values')),
            Padding(padding: EdgeInsets.all(8), child: Text('Default')),
            Padding(padding: EdgeInsets.all(8), child: Text('Description')),
          ],
        ),
        for (final (name, values, def, desc) in rows)
          TableRow(
            children: [
              Padding(padding: const EdgeInsets.all(8), child: Text(name)),
              Padding(padding: const EdgeInsets.all(8), child: Text(values)),
              Padding(padding: const EdgeInsets.all(8), child: Text(def)),
              Padding(padding: const EdgeInsets.all(8), child: Text(desc)),
            ],
          ),
      ],
    );
  }
}
