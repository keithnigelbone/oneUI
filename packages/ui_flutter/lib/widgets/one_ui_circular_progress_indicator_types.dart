/// Types for [OneUiCircularProgressIndicator] — parity with Figma API + Convex tokens.
library;

import 'one_ui_icon_types.dart';

typedef OneUiCircularProgressIndicatorSize = String;

/// Canonical t-shirt sizes (web / RN).
const List<OneUiCircularProgressIndicatorSize>
    kOneUiCircularProgressIndicatorSizes = [
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
];

/// Figma API table sizes (`2xs` … `5xl`).
const List<String> kOneUiCpiFigmaSizes = [
  '2xs',
  'xs',
  's',
  'm',
  'l',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
];

const Map<String, OneUiCircularProgressIndicatorSize> kCpiSizeAliases = {
  '2xs': '2XS',
  'xs': 'XS',
  's': 'S',
  'm': 'M',
  'l': 'L',
  'xl': 'XL',
  '2xl': '2XL',
  '3xl': '3XL',
  '4xl': '4XL',
  '5xl': '5XL',
};

OneUiCircularProgressIndicatorSize resolveCpiSize(
    OneUiCircularProgressIndicatorSize? size) {
  if (size == null || size.isEmpty) return 'M';
  if (kOneUiCircularProgressIndicatorSizes.contains(size)) return size;
  return kCpiSizeAliases[size.toLowerCase()] ?? 'M';
}

typedef OneUiCircularProgressIndicatorAppearance = String;

/// Figma OneUI plugin appearance roles.
const List<OneUiCircularProgressIndicatorAppearance> kOneUiCpiFigmaAppearances =
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

/// Extended roles including web `brand-bg`.
const List<OneUiCircularProgressIndicatorAppearance>
    kOneUiCircularProgressIndicatorAppearances = [
  ...kOneUiCpiFigmaAppearances,
  'brand-bg',
];

typedef OneUiCircularProgressIndicatorVariant = String;

const List<OneUiCircularProgressIndicatorVariant>
    kOneUiCircularProgressIndicatorVariants = [
  'determinate',
  'indeterminate',
];

typedef OneUiCircularProgressIndicatorContent = String;

const List<OneUiCircularProgressIndicatorContent>
    kOneUiCircularProgressIndicatorContents = [
  'none',
  'icon',
  'text',
];

typedef OneUiCircularProgressIndicatorLabelSize = String;

/// Spacing token name per CPI size (web `data-size` → `--Spacing-*`).
const Map<OneUiCircularProgressIndicatorSize, String> kCpiSizeToSpacingName = {
  '2XS': '2',
  'XS': '3',
  'S': '4',
  'M': '5',
  'L': '6',
  'XL': '8',
  '2XL': '10',
  '3XL': '12',
  '4XL': '14',
  '5XL': '16',
};

/// Web CSS centre-icon slot at 2XS/XS/S — overrides Icon `data-size` box.
/// `.root[data-size="2XS"] .icon > * { --Spacing-1 }` etc.
const Map<OneUiCircularProgressIndicatorSize, String>
    kCpiSizeToCenterIconSlotSpacing = {
  '2XS': '1',
  'XS': '1-5',
  'S': '1-5',
};

/// Figma: CPI size → centre `Icon` spacing index.
const Map<OneUiCircularProgressIndicatorSize, OneUiIconSize>
    kCpiSizeToIconSize = {
  '2XS': '2',
  'XS': '2',
  'S': '2',
  'M': '2',
  'L': '2.5',
  'XL': '3.5',
  '2XL': '4',
  '3XL': '4.5',
  '4XL': '5',
  '5XL': '6',
};

/// Percentage labels render at every CPI size when `content="text"` (Label 3XS→M
/// typography per `kCpiSizeToLabelSize`). Legacy Figma gate at L+ was too strict
/// (BUG-CPI-2 — ring is large enough at M/S to show the value).
const List<OneUiCircularProgressIndicatorSize> kCpiLabelVisibleSizes =
    kOneUiCircularProgressIndicatorSizes;

bool isCpiLabelVisible(OneUiCircularProgressIndicatorSize size) {
  return kCpiLabelVisibleSizes.contains(size);
}

/// Web / RN: icon renders at every size when `content="icon"` and child is set.
bool isCpiIconContentVisible(
  OneUiCircularProgressIndicatorContent content,
  Object? child,
) {
  if (content != 'icon' || child == null) return false;
  if (child is String && child.trim().isEmpty) return false;
  return true;
}

/// CPI size → label typography step (`content="text"`).
const Map<OneUiCircularProgressIndicatorSize,
    OneUiCircularProgressIndicatorLabelSize> kCpiSizeToLabelSize = {
  '2XS': '3XS',
  'XS': '3XS',
  'S': '3XS',
  'M': '3XS',
  'L': '3XS',
  'XL': '2XS',
  '2XL': 'XS',
  '3XL': 'S',
  '4XL': 'S',
  '5XL': 'M',
};

/// SVG stroke width in viewBox units — identical to web/RN `SVG_STROKE_MAP`.
const Map<OneUiCircularProgressIndicatorSize, double> kCpiSvgStrokeMap = {
  '2XS': 25,
  'XS': 16.67,
  'S': 18.75,
  'M': 15,
  'L': 16.67,
  'XL': 12.5,
  '2XL': 15,
  '3XL': 12.5,
  '4XL': 14.29,
  '5XL': 12.5,
};

const double kCpiViewBox = 100;
const double kCpiCenter = kCpiViewBox / 2;

class OneUiCircularProgressIndicatorState {
  const OneUiCircularProgressIndicatorState({
    required this.normalizedValue,
    required this.percentage,
    required this.isIndeterminate,
    required this.center,
    required this.radius,
    required this.strokeWidth,
    required this.circumference,
    required this.dashOffset,
    required this.resolvedAppearance,
    required this.resolvedVariant,
    required this.resolvedSize,
    required this.resolvedContent,
    required this.dataAttrs,
  });

  final double normalizedValue;
  final int percentage;
  final bool isIndeterminate;
  final double center;
  final double radius;
  final double strokeWidth;
  final double circumference;
  final double dashOffset;
  final String resolvedAppearance;
  final OneUiCircularProgressIndicatorVariant resolvedVariant;
  final OneUiCircularProgressIndicatorSize resolvedSize;
  final OneUiCircularProgressIndicatorContent resolvedContent;
  final Map<String, String?> dataAttrs;

  String get dataPayloadKey => oneUiCpiDataPayloadKey(dataAttrs);
}

Map<String, String> oneUiCpiDataAttrs({
  required OneUiCircularProgressIndicatorSize size,
  required OneUiCircularProgressIndicatorVariant variant,
  required String resolvedAppearance,
  required OneUiCircularProgressIndicatorContent content,
}) {
  return {
    'data-size': size,
    'data-variant': variant,
    'data-appearance': resolvedAppearance,
    'data-content': content,
  };
}

String oneUiCpiDataPayloadKey(Map<String, String?> attrs) {
  final buffer = StringBuffer('oneui-cpi');
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

OneUiCircularProgressIndicatorState resolveOneUiCircularProgressIndicatorState({
  OneUiCircularProgressIndicatorVariant variant = 'determinate',
  OneUiCircularProgressIndicatorSize? size,
  OneUiCircularProgressIndicatorAppearance appearance = 'auto',
  OneUiCircularProgressIndicatorContent content = 'none',
  double? value,
  double min = 0,
  double max = 100,
}) {
  final resolvedSize = resolveCpiSize(size);
  final isIndeterminate = variant == 'indeterminate' || value == null;
  final resolvedVariant = isIndeterminate ? 'indeterminate' : 'determinate';

  final clampedValue = (value ?? min).clamp(min, max);
  final range = max - min;
  final normalizedValue = range > 0 ? (clampedValue - min) / range : 0.0;
  final percentage = (normalizedValue * 100).round();

  final strokeWidth = kCpiSvgStrokeMap[resolvedSize]!;
  final radius = (kCpiViewBox - strokeWidth) / 2;
  final circumference = 2 * 3.141592653589793 * radius;
  final dashOffset =
      isIndeterminate ? 0.0 : circumference * (1 - normalizedValue);

  final resolvedAppearance =
      (appearance == 'auto' || appearance.isEmpty) ? 'primary' : appearance;

  final dataAttrs = oneUiCpiDataAttrs(
    size: resolvedSize,
    variant: resolvedVariant,
    resolvedAppearance: resolvedAppearance,
    content: content,
  );

  return OneUiCircularProgressIndicatorState(
    normalizedValue: normalizedValue,
    percentage: percentage,
    isIndeterminate: isIndeterminate,
    center: kCpiCenter,
    radius: radius,
    strokeWidth: strokeWidth,
    circumference: circumference,
    dashOffset: dashOffset,
    resolvedAppearance: resolvedAppearance,
    resolvedVariant: resolvedVariant,
    resolvedSize: resolvedSize,
    resolvedContent: content,
    dataAttrs: dataAttrs,
  );
}

String cpiAppearanceToIconAppearance(String appearance) {
  if (appearance == 'brand-bg') return 'primary';
  return appearance;
}
