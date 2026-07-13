/// Types for [OneUiLinearProgressIndicator] — parity with Figma API + React LPI.
library;

typedef OneUiLinearProgressIndicatorType = String;

const List<OneUiLinearProgressIndicatorType> kOneUiLinearProgressIndicatorTypes =
    [
  'determinate',
  'indeterminate',
];

typedef OneUiLinearProgressIndicatorSize = String;

const List<OneUiLinearProgressIndicatorSize> kOneUiLinearProgressIndicatorSizes =
    [
  'S',
  'M',
  'L',
];

const Map<String, OneUiLinearProgressIndicatorSize> kLpiSizeAliases = {
  's': 'S',
  'm': 'M',
  'l': 'L',
};

OneUiLinearProgressIndicatorSize resolveLpiSize(
    OneUiLinearProgressIndicatorSize? size) {
  if (size == null || size.isEmpty) return 'M';
  if (kOneUiLinearProgressIndicatorSizes.contains(size)) return size;
  return kLpiSizeAliases[size.toLowerCase()] ?? 'M';
}

typedef OneUiLinearProgressIndicatorAppearance = String;

const List<OneUiLinearProgressIndicatorAppearance> kOneUiLpiFigmaAppearances =
    [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

const List<OneUiLinearProgressIndicatorAppearance>
    kOneUiLinearProgressIndicatorAppearances = [
  ...kOneUiLpiFigmaAppearances,
];

/// LPI size → spacing token for track height (web `data-size` → `--Spacing-*`).
const Map<OneUiLinearProgressIndicatorSize, String> kLpiSizeToSpacingName = {
  'S': '1-5',
  'M': '2-5',
  'L': '3-5',
};

/// Component token keys per size for track height override.
const Map<OneUiLinearProgressIndicatorSize, String>
    kLpiSizeToTrackHeightTokenKey = {
  'S': '--LinearProgressIndicator-trackHeight-S',
  'M': '--LinearProgressIndicator-trackHeight-M',
  'L': '--LinearProgressIndicator-trackHeight-L',
};

/// Indeterminate bar width as fraction of track — web `--LinearProgressIndicator-indeterminateWidth`.
const double kLpiIndeterminateWidthFraction = 0.4;

/// Surface modes that tint the track rail to the appearance role (web `[data-surface]`).
const Set<String> kLpiTintedSurfaceModes = {
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
};

/// Clamps progress value — `clampProgressValue` in React `LinearProgressIndicator.shared.ts`.
double clampLpiProgressValue(double? value, {double min = 0, double max = 100}) {
  final raw = value ?? min;
  return raw.clamp(min, max);
}

class OneUiLinearProgressIndicatorState {
  const OneUiLinearProgressIndicatorState({
    required this.clampedValue,
    required this.fillFraction,
    required this.percentage,
    required this.isIndeterminate,
    required this.resolvedAppearance,
    required this.resolvedType,
    required this.resolvedSize,
    required this.roundCaps,
    required this.dataAttrs,
  });

  final double clampedValue;
  final double fillFraction;
  final int percentage;
  final bool isIndeterminate;
  final String resolvedAppearance;
  final OneUiLinearProgressIndicatorType resolvedType;
  final OneUiLinearProgressIndicatorSize resolvedSize;
  final bool roundCaps;
  final Map<String, String?> dataAttrs;

  String get dataPayloadKey => oneUiLpiDataPayloadKey(dataAttrs);
}

Map<String, String> oneUiLpiDataAttrs({
  required OneUiLinearProgressIndicatorSize size,
  required OneUiLinearProgressIndicatorType type,
  required String resolvedAppearance,
  required bool roundCaps,
}) {
  return {
    'data-oneui-component': 'LinearProgressIndicator',
    'data-size': size,
    'data-type': type,
    'data-round-caps': roundCaps ? 'true' : 'false',
    'data-appearance': resolvedAppearance,
  };
}

String oneUiLpiDataPayloadKey(Map<String, String?> attrs) {
  final buffer = StringBuffer('oneui-lpi');
  for (final entry in attrs.entries) {
    final value = entry.value;
    if (value == null) continue;
    buffer.write('|${entry.key}');
    if (value.isNotEmpty) {
      buffer.write('=$value');
    }
  }
  return buffer.toString();
}

OneUiLinearProgressIndicatorState resolveOneUiLinearProgressIndicatorState({
  OneUiLinearProgressIndicatorType type = 'determinate',
  OneUiLinearProgressIndicatorSize? size,
  OneUiLinearProgressIndicatorAppearance appearance = 'primary',
  bool roundCaps = true,
  double value = 0,
  double min = 0,
  double max = 100,
}) {
  final resolvedSize = resolveLpiSize(size);
  final isIndeterminate = type == 'indeterminate';
  final resolvedType = isIndeterminate ? 'indeterminate' : 'determinate';

  final clampedValue =
      isIndeterminate ? 0.0 : clampLpiProgressValue(value, min: min, max: max);
  final range = max - min;
  final fillFraction =
      isIndeterminate ? 0.0 : (range > 0 ? (clampedValue - min) / range : 0.0);
  final percentage = (fillFraction * 100).round();

  final resolvedAppearance =
      (appearance == 'auto' || appearance.isEmpty) ? 'primary' : appearance;

  final dataAttrs = oneUiLpiDataAttrs(
    size: resolvedSize,
    type: resolvedType,
    resolvedAppearance: resolvedAppearance,
    roundCaps: roundCaps,
  );

  return OneUiLinearProgressIndicatorState(
    clampedValue: clampedValue,
    fillFraction: fillFraction,
    percentage: percentage,
    isIndeterminate: isIndeterminate,
    resolvedAppearance: resolvedAppearance,
    resolvedType: resolvedType,
    resolvedSize: resolvedSize,
    roundCaps: roundCaps,
    dataAttrs: dataAttrs,
  );
}
