import '../engine/native_design_system_payload.dart';
import 'dimension_scale.dart';
import 'platform_foundation_config.dart';

/// Static + dynamic stroke catalogue — parity with web `Strokes.stories.tsx`.

class StrokeRow {
  const StrokeRow({
    required this.name,
    required this.use,
    this.px,
    this.fStepAlias,
  });

  final String name;
  final String use;

  /// Nominal static width when [fStepAlias] is null.
  final double? px;

  /// Maps to `--Dimension-f{N}` when non-null (dynamic tier).
  final String? fStepAlias;

  /// CSS custom property, e.g. `--Stroke-M`.
  String get cssVar => '--$name';

  /// Nominal column (fixed px or f-step alias label).
  String get nominalLabel {
    if (fStepAlias != null) return fStepAlias!;
    if (px == null) return '—';
    if (px == 0) return '0px';
    if (px == 0.5) return '0.5px';
    if (px == 1) return '1px';
    if (px == 1.5) return '1.5px';
    if (px == 2) return '2px';
    return '${formatStrokePx(px!)}px';
  }
}

const staticStrokeRows = <StrokeRow>[
  StrokeRow(name: 'Stroke-None', px: 0, use: 'Reset / borderless'),
  StrokeRow(
      name: 'Stroke-S', px: 0.5, use: 'Hairline — dividers, subtle borders'),
  StrokeRow(name: 'Stroke-M', px: 1, use: 'Default border — inputs, cards'),
  StrokeRow(name: 'Stroke-L', px: 1.5, use: 'Medium border — emphasis'),
  StrokeRow(
      name: 'Stroke-XL', px: 2, use: 'Thick border — buttons, focus halos'),
];

const dynamicStrokeRows = <StrokeRow>[
  StrokeRow(
      name: 'Stroke-2XL',
      fStepAlias: 'f-6',
      use: 'Spinner stroke (S / M sizes)'),
  StrokeRow(
      name: 'Stroke-3XL',
      fStepAlias: 'f-5',
      use: 'Spinner stroke (L / XL sizes)'),
  StrokeRow(
      name: 'Stroke-4XL',
      fStepAlias: 'f-4',
      use: 'Spinner stroke (2XL / 3XL sizes)'),
  StrokeRow(
      name: 'Stroke-5XL',
      fStepAlias: 'f-3',
      use: 'Spinner stroke (4XL / 5XL sizes)'),
  StrokeRow(name: 'Stroke-6XL', fStepAlias: 'f-2', use: 'Heavy decorative'),
  StrokeRow(name: 'Stroke-7XL', fStepAlias: 'f-1', use: 'Heavy decorative'),
  StrokeRow(
      name: 'Stroke-8XL',
      fStepAlias: 'f0',
      use: 'Heaviest — matches base f-step'),
];

String formatStrokePx(double v) {
  if (v == v.roundToDouble()) return v.round().toString();
  return v.toStringAsFixed(2).replaceAll(RegExp(r'\.?0+$'), '');
}

/// Resolves stroke width — parity with web `getComputedStyle` on `--Stroke-*`:
/// static tier uses fixed px (or snapshot override if present); dynamic tier
/// aliases `--Dimension-f{N}` via Convex `dimensionContexts`, brand platforms
/// interpolation, then static `scale.css` tables.
double resolveStrokeWidth(
  StrokeRow row, {
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeDesignSystemPayload? designSystem,
}) {
  if (row.fStepAlias == null) {
    return _resolveStaticStrokePx(
      row,
      platform: platform,
      density: density,
      designSystem: designSystem,
    );
  }
  return _resolveDynamicStrokePx(
    row.fStepAlias!,
    platform: platform,
    density: density,
    platformsConfig: platformsConfig,
    designSystem: designSystem,
  );
}

double _resolveStaticStrokePx(
  StrokeRow row, {
  required String platform,
  required String density,
  NativeDesignSystemPayload? designSystem,
}) {
  if (designSystem != null) {
    final ctx = designSystem.dimensionContextFor(platform, density);
    final fromCtx = designSystem.parsePx(ctx?.dimensions[row.cssVar]);
    if (fromCtx != null) return fromCtx;
    final resolved = designSystem.parsePx(
      designSystem.resolveCSSValue(row.cssVar),
    );
    if (resolved != null) return resolved;
  }
  return row.px ?? 0;
}

double _resolveDynamicStrokePx(
  String fStep, {
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeDesignSystemPayload? designSystem,
}) {
  if (designSystem != null) {
    final ctx = designSystem.dimensionContextFor(platform, density);
    if (ctx != null) {
      final dimPx = designSystem.parsePx(ctx.dimensions['--Dimension-$fStep']);
      if (dimPx != null) return dimPx;
      final strokeVar = _dynamicStrokeVarForFStep(fStep);
      if (strokeVar != null) {
        final aliasPx = designSystem.parsePx(ctx.dimensions[strokeVar]);
        if (aliasPx != null) return aliasPx;
      }
    }
  }
  return getDimensionValue(
    platform: platform,
    density: density,
    step: fStep,
    platformsConfig: platformsConfig,
  );
}

/// Mirrors `primitives.css` dynamic stroke → f-step map.
String? _dynamicStrokeVarForFStep(String fStep) {
  const map = {
    'f-6': '--Stroke-2XL',
    'f-5': '--Stroke-3XL',
    'f-4': '--Stroke-4XL',
    'f-3': '--Stroke-5XL',
    'f-2': '--Stroke-6XL',
    'f-1': '--Stroke-7XL',
    'f0': '--Stroke-8XL',
  };
  return map[fStep];
}
