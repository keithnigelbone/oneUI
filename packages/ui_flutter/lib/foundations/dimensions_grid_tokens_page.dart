import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'dimensions_common.dart';
import 'dimensions_resolve.dart';

/// Foundations / Dimensions / Grid tokens — parity with web `GridTokens` story.
class DimensionsGridTokensPage extends StatelessWidget {
  const DimensionsGridTokensPage({super.key});

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
    final grid = resolveGridSpacingPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
    );
    final margin = grid.margin;
    final gutter = grid.gutter;
    final layout = gridLayout[scope.platformId];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '--Grid-Margin and --Grid-Gutter per platform × density (see `primitives.css`).',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        dimensionDataRow(
          context,
          label: 'Grid-Margin',
          varName: '--Grid-Margin',
          px: margin,
          barWidth: margin,
          barHeight: f0,
          accent: accent,
          borderRadius: shape3xs,
        ),
        dimensionDataRow(
          context,
          label: 'Grid-Gutter',
          varName: '--Grid-Gutter',
          px: gutter,
          barWidth: gutter,
          barHeight: f0,
          accent: accent,
          borderRadius: shape3xs,
        ),
        const SizedBox(height: 16),
        Text(
          'Layout: ${scope.platformId} → ${layout?.columns ?? '—'} columns, '
          'max width ${layout?.maxWidthLabel ?? '—'}.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
