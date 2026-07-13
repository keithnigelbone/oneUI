import 'package:flutter/material.dart';
import 'package:ui_flutter/storybook.dart';

/// Story column header + status copy — reads [OneUiBrandLoadState] from [OneUiBrandScope].
class StorybookCanvasChrome extends StatelessWidget {
  const StorybookCanvasChrome({
    required this.breadcrumb,
    required this.title,
    required this.v2PlatformId,
    required this.canvasWidthPx,
    required this.density,
    required this.brandLabel,
    required this.breakpointLabel,
    required this.brandId,
    required this.breakpointStorageValue,
    super.key,
  });

  final String breadcrumb;
  final String title;
  final String v2PlatformId;
  final int canvasWidthPx;
  final String density;
  final String brandLabel;
  final String breakpointLabel;
  final String brandId;
  final String breakpointStorageValue;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final load = OneUiBrandLoadState.maybeOf(context);
    final snap = load?.snapshot;
    final overview = load?.brandOverview;
    final loading = load?.loading == true;
    final platformsConfig = platformsConfigFromBrandOverview(overview);

    final designSystemFromConvex = designSystemFromConvexSnapshot(
      brandId: brandId,
      snapshot: snap,
    );

    final dimNote = brandId.isEmpty
        ? 'Dimensions use static `scale.css` tables (same as web with no brand).'
        : (loading
            ? 'Loading brand data from Convex…'
            : (snap != null &&
                    snap.schemaVersion >= 2 &&
                    designSystemFromConvex &&
                    snap.designSystem!.dimensionContexts.isNotEmpty
                ? 'Dimensions list Convex `designSystem.dimensionContexts` first (same as TS `buildStructuredDimensionContexts`); then brand `platforms.config`; then static tables.'
                : (platformsConfig == null
                    ? 'No platforms foundation on this brand — static dimensions.'
                    : 'Dimensions follow `generateDimensionCSS` interpolation from brand platforms config.')));

    final surfaceNote = brandId.isEmpty
        ? 'Surfaces: demo greyscale `ThemeConfig` (web Storybook parity when no brand).'
        : (snap == null
            ? (brandOverviewHasColorConfig(overview)
                ? 'Surfaces: no native theme snapshot, but Convex overview includes color.config — open the debug console for `fetchNativeThemeSnapshot` (HTTP error, undeployed `nativeTheme`, or parse failure). Redeploy `packages/convex` from this repo. Button `--*` use manifest fallback until snapshot loads.'
                : 'Surfaces: no snapshot yet (brand may lack color foundation, or Convex `nativeTheme:getNativeThemeSnapshot` not deployed). Button `--*` tokens use the Storybook manifest until a snapshot loads.')
            : (snap.schemaVersion >= 2 && designSystemFromConvex
                ? 'Surfaces/colors: Convex snapshot v${snap.schemaVersion} (`rootRoles` + `typography` + `designSystem` component tokens & dimension contexts).'
                : (snap.schemaVersion >= 2 && !designSystemFromConvex
                    ? 'Surfaces/colors: Convex snapshot v${snap.schemaVersion} (`rootRoles` + `typography`). Button `--*` tokens use the Storybook manifest fallback (`designSystem` missing or legacy Convex).'
                    : 'Surfaces/colors: snapshot `schemaVersion ${snap.schemaVersion}` from Convex (`rootRoles` + `typography`). For component tokens + structured dimensions, deploy Convex schema v2 `nativeTheme`. Dimensions/typography pages may still use `getBrandOverviewData`.')));

    final viewportHint = breakpointStorageValue == 'responsive'
        ? ' Responsive: web uses the preview iframe width; Flutter uses this story column ($canvasWidthPx px). Pick the same fixed viewport (e.g. 768) on both for identical `--Dimension-*`.'
        : '';

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            breadcrumb,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: scheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 6),
          Text(
            'Effective V2 platform $v2PlatformId · story column ${canvasWidthPx}px · '
            'density $density · brand $brandLabel · $breakpointLabel.$viewportHint '
            '$dimNote · $surfaceNote',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: scheme.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}
