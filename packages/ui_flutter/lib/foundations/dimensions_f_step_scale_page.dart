import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'dimensions_common.dart';
import 'dimensions_resolve.dart';

/// Foundations / Dimensions / F-step scale — parity with web `FStepScale` story.
class DimensionsFStepScalePage extends StatelessWidget {
  const DimensionsFStepScalePage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final ds = OneUiScope.designSystemOf(context);
    final accent =
        scope.foundationAccentColor ?? Theme.of(context).colorScheme.primary;
    final f0 = resolveFStepPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      step: 'f0',
    );
    final shape3xs = resolveFStepPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      step: 'f-4',
    );

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '25 f-steps (f-8 → f16). Bar width = resolved value; bar height = '
          'f0 for this platform × density (${formatDimensionPx(f0)} px).',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        ...fSteps.map((step) {
          final px = resolveFStepPx(
            designSystem: ds,
            platformsConfig: scope.platformsFoundationConfig,
            platformId: scope.platformId,
            density: scope.density,
            step: step,
          );
          return dimensionDataRow(
            context,
            label: step,
            varName: '--Dimension-$step',
            px: px,
            barWidth: px,
            barHeight: f0,
            accent: accent,
            borderRadius: shape3xs,
          );
        }),
      ],
    );
  }
}
