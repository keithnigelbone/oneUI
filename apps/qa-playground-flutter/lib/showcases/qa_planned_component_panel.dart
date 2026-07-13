import 'package:flutter/material.dart';

/// Placeholder for catalog components not yet implemented in `ui_flutter`.
class QaPlannedComponentPanel extends StatelessWidget {
  const QaPlannedComponentPanel({
    required this.componentName,
    required this.scenarios,
    super.key,
  });

  final String componentName;
  final List<String> scenarios;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: scheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.construction_outlined, color: scheme.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  '$componentName — Flutter widget pending',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Scenarios below mirror web QA playground / Figma matrices. '
              'Automated tests will ship when `ui_flutter` exposes this component.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: scheme.onSurfaceVariant,
                    height: 1.45,
                  ),
            ),
            const SizedBox(height: 16),
            for (final scenario in scenarios)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('• ', style: TextStyle(color: scheme.onSurfaceVariant)),
                    Expanded(
                      child: Text(
                        scenario,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              height: 1.4,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
