import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'dimensions_common.dart';
import 'dimensions_resolve.dart';

/// Foundations / Dimensions / Spacing tokens — parity with web `SpacingTokens` story.
class DimensionsSpacingTokensPage extends StatelessWidget {
  const DimensionsSpacingTokensPage({super.key});

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
          'Semantic spacing tokens alias f-steps. Resolved values shown per row '
          'for the currently-selected platform × density.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        ...spacingTokenNames.map((name) {
          final px = resolveSpacingPx(
            designSystem: ds,
            platformsConfig: scope.platformsFoundationConfig,
            platformId: scope.platformId,
            density: scope.density,
            spacingName: name,
          );
          final cssProp = '--Spacing-$name';
          return dimensionDataRow(
            context,
            label: 'Spacing-$name',
            varName: cssProp,
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
