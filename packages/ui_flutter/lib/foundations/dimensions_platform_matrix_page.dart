import 'package:flutter/material.dart';

import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../tokens/platform_foundation_config.dart';
import 'dimensions_common.dart';
import 'dimensions_resolve.dart';

/// Foundations / Dimensions / Platform matrix — parity with web `PlatformMatrix` story.
class DimensionsPlatformMatrixPage extends StatelessWidget {
  const DimensionsPlatformMatrixPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.maybeOf(context);
    final ds = OneUiScope.designSystemOf(context);
    final accent =
        scope?.foundationAccentColor ?? Theme.of(context).colorScheme.primary;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Each row: f0 for one platform × density. Shared base scales '
          '(S/M, L/L) produce matching values.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        for (final density in densityIds) ...[
          Text(
            densityTitleCase(density),
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 6),
          for (final platform in platformIds)
            _matrixRow(
              context: context,
              label: '$platform / ${densityTitleCase(density)}',
              platform: platform,
              density: density,
              accent: accent,
              designSystem: ds,
              platformsConfig: scope?.platformsFoundationConfig,
            ),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

Widget _matrixRow({
  required BuildContext context,
  required String label,
  required String platform,
  required String density,
  required Color accent,
  NativeDesignSystemPayload? designSystem,
  PlatformsFoundationConfig? platformsConfig,
}) {
  final f0Cell = resolveFStepPx(
    designSystem: designSystem,
    platformsConfig: platformsConfig,
    platformId: platform,
    density: density,
    step: 'f0',
  );
  final radius = resolveFStepPx(
    designSystem: designSystem,
    platformsConfig: platformsConfig,
    platformId: platform,
    density: density,
    step: 'f-4',
  );
  return dimensionDataRow(
    context,
    label: label,
    varName: '--Dimension-f0',
    px: f0Cell,
    barWidth: f0Cell,
    barHeight: f0Cell,
    accent: accent,
    borderRadius: radius,
  );
}
