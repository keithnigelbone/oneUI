part of 'dimension_scale.dart';

/// Same as `SCALE_RATIOS` in `packages/shared/src/data/scale-ratios.ts`.
const List<double> _kScaleRatios = [
  0,
  0.125,
  0.25,
  0.375,
  0.5,
  0.625,
  0.75,
  0.875,
  1,
  1.125,
  1.25,
  1.5,
  1.75,
  2,
  2.25,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
  6,
  7,
  8,
  10,
];

/// Index of `f0` in [fSteps] — `F_STEPS.indexOf('f0')`.
const int baseF0Index = 8;

const double gridMarginRatio = 1;
const double gridGutterRatio = 0.5;

double _round2(double v) => (v * 100).round() / 100;

double _interpolateValue(
  double viewportWidth,
  double minViewport,
  double maxViewport,
  double mobileValue,
  double desktopValue,
) {
  if (maxViewport == minViewport) return _round2(mobileValue);
  final t = ((viewportWidth - minViewport) / (maxViewport - minViewport))
      .clamp(0.0, 1.0);
  return _round2(mobileValue + (desktopValue - mobileValue) * t);
}

Map<String, double> _getBaseSizesForBreakpoint(
  double viewportWidth,
  double minVp,
  double maxVp,
  List<PlatformDensityConfig> densityConfigs,
) {
  final result = <String, double>{
    'compact': 14,
    'default': 16,
    'open': 18,
  };
  for (final dc in densityConfigs) {
    result[dc.density] = _interpolateValue(
      viewportWidth,
      minVp,
      maxVp,
      dc.mobile.baseSize,
      dc.desktop.baseSize,
    );
  }
  return result;
}

List<double> _computeScaleFromBase(double baseSize) {
  return _kScaleRatios.map((r) => _round2(baseSize * r)).toList();
}

final class PlatformDimensionBlock {
  const PlatformDimensionBlock({
    required this.platformId,
    required this.densityId,
    required this.values,
  });

  final String platformId;
  final String densityId;
  final List<double> values;
}

bool blockMatchesStaticTable(PlatformDimensionBlock block) {
  for (var i = 0; i < fSteps.length; i++) {
    final staticVal = staticDimensionValue(
      platform: block.platformId,
      density: block.densityId,
      step: fSteps[i],
    );
    if ((block.values[i] - staticVal).abs() >= 0.01) return false;
  }
  return true;
}

/// Mirrors `extractDimensionBlocks` in `packages/shared/src/utils/dimensionCSS.ts`.
List<PlatformDimensionBlock> extractDimensionBlocks(
    PlatformsFoundationConfig config) {
  final blocks = <PlatformDimensionBlock>[];
  final seenKeys = <String>{};
  final enabled = config.platforms.where((p) => p.isEnabled).toList();
  if (enabled.isEmpty) return [];

  for (final entry in enabled) {
    final activeBps = entry.breakpoints.where((b) => b.isActive).toList()
      ..sort((a, b) => a.viewportWidth.compareTo(b.viewportWidth));
    final minVp =
        activeBps.isNotEmpty ? activeBps.first.viewportWidth.toDouble() : 360.0;
    final maxVp =
        activeBps.isNotEmpty ? activeBps.last.viewportWidth.toDouble() : 360.0;

    if (activeBps.isNotEmpty) {
      for (final bp in activeBps) {
        final platformId = viewportToV2PlatformId(bp.viewportWidth.toDouble());
        final baseSizes = _getBaseSizesForBreakpoint(
          bp.viewportWidth.toDouble(),
          minVp,
          maxVp,
          entry.densityConfigs,
        );
        for (final densityId in densityIds) {
          final key = '$platformId:$densityId';
          if (seenKeys.contains(key)) continue;
          seenKeys.add(key);
          final base = baseSizes[densityId] ?? baseSizes['default'] ?? 16.0;
          blocks.add(PlatformDimensionBlock(
            platformId: platformId,
            densityId: densityId,
            values: _computeScaleFromBase(base),
          ));
        }
      }
    } else {
      final platformId = viewportToV2PlatformId(360);
      final baseSizes =
          _getBaseSizesForBreakpoint(360, 360, 360, entry.densityConfigs);
      for (final densityId in densityIds) {
        final key = '$platformId:$densityId';
        if (seenKeys.contains(key)) continue;
        seenKeys.add(key);
        final base = baseSizes[densityId] ?? baseSizes['default'] ?? 16.0;
        blocks.add(PlatformDimensionBlock(
          platformId: platformId,
          densityId: densityId,
          values: _computeScaleFromBase(base),
        ));
      }
    }
  }

  for (final platformId in platformIds) {
    for (final densityId in densityIds) {
      final key = '$platformId:$densityId';
      if (seenKeys.contains(key)) continue;
      final fallbackEntry = enabled.first;
      PlatformDensityConfig? dc;
      for (final d in fallbackEntry.densityConfigs) {
        if (d.density == densityId) {
          dc = d;
          break;
        }
      }
      final baseSize = dc?.mobile.baseSize ??
          (densityId == 'compact'
              ? 14.0
              : densityId == 'open'
                  ? 18.0
                  : 16.0);
      seenKeys.add(key);
      blocks.add(PlatformDimensionBlock(
        platformId: platformId,
        densityId: densityId,
        values: _computeScaleFromBase(baseSize),
      ));
    }
  }

  return blocks;
}

PlatformDimensionBlock? findDimensionBlock(
  String platform,
  String density,
  List<PlatformDimensionBlock> blocks,
) {
  for (final b in blocks) {
    if (b.platformId == platform && b.densityId == density) return b;
  }
  return null;
}

double? lookupBrandedDimensionValue(
  String platform,
  String density,
  String step,
  PlatformsFoundationConfig config,
) {
  final blocks = extractDimensionBlocks(config);
  final block = findDimensionBlock(platform, density, blocks);
  if (block == null) return null;
  if (step == 'f2-5') {
    final i2 = _fStepIndex['f2'];
    final i3 = _fStepIndex['f3'];
    if (i2 == null || i3 == null) return null;
    return _round2((block.values[i2] + block.values[i3]) / 2);
  }
  final idx = _fStepIndex[step];
  if (idx == null) return null;
  return block.values[idx];
}
