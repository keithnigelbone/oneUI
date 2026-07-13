import 'package:flutter/material.dart';

String formatDimensionPx(double v) =>
    v == v.roundToDouble() ? v.round().toString() : v.toStringAsFixed(2);

Widget dimensionsSectionTitle(BuildContext context, String title) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(title, style: Theme.of(context).textTheme.titleLarge),
  );
}

Widget dimensionDataRow(
  BuildContext context, {
  required String label,
  required String varName,
  required double px,
  required double barWidth,
  required double barHeight,
  required Color accent,
  required double borderRadius,
}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 100,
          child: Text(label,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11)),
        ),
        Expanded(
          flex: 2,
          child: Text(
            varName.startsWith('--') ? 'var($varName)' : varName,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 10,
              color: Theme.of(context).hintColor,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        SizedBox(
          width: 52,
          child: Text(
            formatDimensionPx(px),
            textAlign: TextAlign.right,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 2,
          child: Align(
            alignment: Alignment.centerLeft,
            child: Container(
              width: barWidth.clamp(0, 480),
              height: barHeight.clamp(4, 200),
              decoration: BoxDecoration(
                color: accent,
                borderRadius: BorderRadius.circular(borderRadius.clamp(1, 16)),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

String densityTitleCase(String d) => d[0].toUpperCase() + d.substring(1);
