import '../engine/native_design_system_payload.dart';
import '../tokens/dimension_scale.dart';
import '../tokens/platform_foundation_config.dart';

/// Resolves f-step px — **Convex `designSystem.dimensionContexts` first** (same values as
/// TS `buildStructuredDimensionContexts` / web injection), then Dart brand interpolation
/// from `getBrandOverviewData.platforms.config`, then static `scale.css` tables.
double resolveFStepPx({
  required NativeDesignSystemPayload? designSystem,
  required PlatformsFoundationConfig? platformsConfig,
  required String platformId,
  required String density,
  required String step,
}) {
  final fromConvex = _fStepFromDesignSystem(
    designSystem,
    platformId,
    density,
    step,
  );
  if (fromConvex != null) return fromConvex;
  return getDimensionValue(
    platform: platformId,
    density: density,
    step: step,
    platformsConfig: platformsConfig,
  );
}

/// `--Spacing-{name}` — snapshot dimensions include spacing aliases when Convex deploys
/// augmented contexts; else falls through to [getSpacingTokenPx].
double resolveSpacingPx({
  required NativeDesignSystemPayload? designSystem,
  required PlatformsFoundationConfig? platformsConfig,
  required String platformId,
  required String density,
  required String spacingName,
}) {
  if (spacingName == 'None') return 0;
  if (designSystem != null) {
    final ctx = designSystem.dimensionContextFor(platformId, density);
    final raw = ctx?.dimensions['--Spacing-$spacingName'];
    if (raw != null) {
      final px = designSystem.parsePx(raw);
      if (px != null) return px;
    }
  }
  return getSpacingTokenPx(
    spacingName: spacingName,
    platform: platformId,
    density: density,
    platformsConfig: platformsConfig,
  );
}

/// `--Grid-Margin` / `--Grid-Gutter` from structured context when present.
({double margin, double gutter}) resolveGridSpacingPx({
  required NativeDesignSystemPayload? designSystem,
  required PlatformsFoundationConfig? platformsConfig,
  required String platformId,
  required String density,
}) {
  if (designSystem != null) {
    final ctx = designSystem.dimensionContextFor(platformId, density);
    if (ctx != null) {
      final m = designSystem.parsePx(ctx.gridMargin);
      final g = designSystem.parsePx(ctx.gridGutter);
      if (m != null && g != null) {
        return (margin: m, gutter: g);
      }
    }
  }
  return getGridSpacing(
    platform: platformId,
    density: density,
    platformsConfig: platformsConfig,
  );
}

double? _fStepFromDesignSystem(
  NativeDesignSystemPayload? ds,
  String platformId,
  String density,
  String step,
) {
  if (ds == null) return null;
  final ctx = ds.dimensionContextFor(platformId, density);
  if (ctx == null) return null;
  final raw = ctx.dimensions['--Dimension-$step'];
  if (raw == null) return null;
  return ds.parsePx(raw);
}
