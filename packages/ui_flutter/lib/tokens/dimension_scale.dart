import 'platform_foundation_config.dart';
import '../utils/viewport_to_platform.dart';

part 'dimension_brand_resolve.dart';

/// Discrete dimension f-scale — parity with `packages/shared/src/data/dimension-scales.ts`.
/// Spacing aliases match `packages/tokens/src/css/primitives.css` (`--Spacing-*` → `--Dimension-f*`).
///
/// **Dimensions foundations parity (web `Dimensions.stories.tsx`):**
/// - F-step scale: `getDimensionValue`
/// - Spacing tokens: `getSpacingTokenPx` (same f-step chain as CSS)
/// - Grid: `getGridMargin` / `getGridGutter` (= TS `getGridValue`)
/// - Platform matrix: `f0` for each platform × density (compact → default → open)
/// - Optional later: `getDimensionValueFromConfig` when brand overrides breakpoints
///
/// Values are logical px for the active platform × density.

/// 25 f-steps, same ordering as TS `F_STEPS`.
const List<String> fSteps = [
  'f-8',
  'f-7',
  'f-6',
  'f-5',
  'f-4',
  'f-3',
  'f-2',
  'f-1',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
];

const List<String> platformIds = [
  'S',
  'M',
  'L',
];

/// Toolbar / matrix section order: compact → default → open (web `DENSITY_ORDER`).
const List<String> densityIds = ['compact', 'default', 'open'];

/// Spacing names in story order — `Foundations/Dimensions` → SpacingTokens.
const List<String> spacingTokenNames = [
  'None',
  '6XS',
  '5XS',
  '4XS',
  '3XS',
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
  '6XL',
  '7XL',
  '8XL',
  '9XL',
  '10XL',
  '11XL',
  '12XL',
  '13XL',
  '14XL',
  '15XL',
];

/// Maps `--Spacing-{name}` to dimension f-step.
///
/// - T-shirt aliases (`Spacing-M`, …): same as Foundations/Dimensions on web.
/// - Numeric primitives (`Spacing-4-5`, …): parity with `SPACING_TO_FSTEP` /
///   `getDynamicSpacingToFStep` in `packages/shared/src/utils/dimension.ts`.
String? fStepAliasForSpacingName(String spacingName) {
  return switch (spacingName) {
    'None' => null,
    // Numeric spacing tokens (--Spacing-* in primitives.css)
    '0' => 'f-8',
    '0-5' => 'f-7',
    '1' => 'f-6',
    '1-5' => 'f-5',
    '2' => 'f-4',
    '2-5' => 'f-3',
    '3' => 'f-2',
    '3-5' => 'f-1',
    '4' => 'f0',
    '4-5' => 'f1',
    '5' => 'f2',
    '5-5' => 'f2-5',
    '6' => 'f3',
    '7' => 'f4',
    '8' => 'f5',
    '9' => 'f6',
    '10' => 'f7',
    '12' => 'f8',
    '14' => 'f9',
    '16' => 'f10',
    '18' => 'f11',
    '20' => 'f12',
    '24' => 'f13',
    '28' => 'f14',
    '32' => 'f15',
    '40' => 'f16',
    // Dimension story / doc labels (Spacing-6XS …)
    '6XS' => 'f-7',
    '5XS' => 'f-6',
    '4XS' => 'f-5',
    '3XS' => 'f-4',
    '2XS' => 'f-3',
    'XS' => 'f-2',
    'S' => 'f-1',
    'M' => 'f0',
    'L' => 'f1',
    'XL' => 'f2',
    '2XL' => 'f3',
    '3XL' => 'f4',
    '4XL' => 'f5',
    '5XL' => 'f6',
    '6XL' => 'f7',
    '7XL' => 'f8',
    '8XL' => 'f9',
    '9XL' => 'f10',
    '10XL' => 'f11',
    '11XL' => 'f12',
    '12XL' => 'f13',
    '13XL' => 'f14',
    '14XL' => 'f15',
    '15XL' => 'f16',
    _ => throw ArgumentError.value(
        spacingName, 'spacingName', 'Unknown Spacing-* token'),
  };
}

/// F-step for `--Shape-{tail}` when [tail] uses Figma numeric names (`0`–`10` and half-steps).
///
/// Matches `packages/tokens/src/css/primitives.css` (`--Shape-0` → `--Dimension-f-8`, …): same
/// f-step chain as `--Spacing-{tail}` for those numeric tails.
String? fStepAliasForPrimitivesNumericShape(String shapeTail) {
  switch (shapeTail) {
    case '0':
    case '0-5':
    case '1':
    case '1-5':
    case '2':
    case '2-5':
    case '3':
    case '3-5':
    case '4':
    case '4-5':
    case '5':
    case '5-5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '10':
      return fStepAliasForSpacingName(shapeTail);
    default:
      return null;
  }
}

/// Resolved px for `--Spacing-{name}` (same cascade as CSS var chain).
double getSpacingTokenPx({
  required String spacingName,
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
}) {
  if (spacingName == 'None') return 0;
  final step = fStepAliasForSpacingName(spacingName)!;
  return getDimensionValue(
    platform: platform,
    density: density,
    step: step,
    platformsConfig: platformsConfig,
  );
}

final Map<String, int> _fStepIndex = {
  for (var i = 0; i < fSteps.length; i++) fSteps[i]: i,
};

/// base-16 scale: S(360) and M(768)
const Map<String, List<double>> _base16 = {
  'default': [
    0,
    2,
    4,
    6,
    8,
    10,
    12,
    14,
    16,
    18,
    20,
    24,
    28,
    32,
    36,
    40,
    48,
    56,
    64,
    72,
    80,
    96,
    112,
    128,
    160,
  ],
  'compact': [
    0,
    1.75,
    3.5,
    5.25,
    7,
    8.75,
    10.5,
    12.25,
    14,
    15.75,
    17.5,
    21,
    24.5,
    28,
    31.5,
    35,
    42,
    49,
    56,
    63,
    70,
    84,
    98,
    112,
    140,
  ],
  'open': [
    0,
    2.25,
    4.5,
    6.75,
    9,
    11.25,
    13.5,
    15.75,
    18,
    20.25,
    22.5,
    27,
    31.5,
    36,
    40.5,
    45,
    54,
    63,
    72,
    81,
    90,
    108,
    126,
    144,
    180,
  ],
};

/// base-18 scale: M(1024) and L(1440)
const Map<String, List<double>> _base18 = {
  'default': [
    0,
    2.25,
    4.5,
    6.75,
    9,
    11.25,
    13.5,
    15.75,
    18,
    20.25,
    22.5,
    27,
    31.5,
    36,
    40.5,
    45,
    54,
    63,
    72,
    81,
    90,
    108,
    126,
    144,
    180,
  ],
  'compact': [
    0,
    2,
    4,
    6,
    8,
    10,
    12,
    14,
    16,
    18,
    20,
    24,
    28,
    32,
    36,
    40,
    48,
    56,
    64,
    72,
    80,
    96,
    112,
    128,
    160,
  ],
  'open': [
    0,
    2.5,
    5,
    7.5,
    10,
    12.5,
    15,
    17.5,
    20,
    22.5,
    25,
    30,
    35,
    40,
    45,
    50,
    60,
    70,
    80,
    90,
    100,
    120,
    140,
    160,
    200,
  ],
};

/// base-20 scale: L(1920)
const Map<String, List<double>> _base20 = {
  'default': [
    0,
    2.5,
    5,
    7.5,
    10,
    12.5,
    15,
    17.5,
    20,
    22.5,
    25,
    30,
    35,
    40,
    45,
    50,
    60,
    70,
    80,
    90,
    100,
    120,
    140,
    160,
    200,
  ],
  'compact': [
    0,
    2.25,
    4.5,
    6.75,
    9,
    11.25,
    13.5,
    15.75,
    18,
    20.25,
    22.5,
    27,
    31.5,
    36,
    40.5,
    45,
    54,
    63,
    72,
    81,
    90,
    108,
    126,
    144,
    180,
  ],
  'open': [
    0,
    2.75,
    5.5,
    8.25,
    11,
    13.75,
    16.5,
    19.25,
    22,
    24.75,
    27.5,
    33,
    38.5,
    44,
    49.5,
    55,
    66,
    77,
    88,
    99,
    110,
    132,
    154,
    176,
    220,
  ],
};

final Map<String, Map<String, List<double>>> _platformToBase = {
  'S': _base16,
  'M': _base16,
  'L': _base18,
};

/// **Static** scale.css tables only (`STATIC_DIMENSION_TABLES` / no brand).
/// With a brand selected, use [getDimensionValue] + [PlatformsFoundationConfig]
/// so values match `generateDimensionCSS` + `extractDimensionBlocks` from
/// `@oneui/shared` (interpolated bases per breakpoint).
double staticDimensionValue({
  required String platform,
  required String density,
  required String step,
}) {
  if (step == 'f2-5') {
    return _round2(
      (staticDimensionValue(platform: platform, density: density, step: 'f2') +
              staticDimensionValue(
                  platform: platform, density: density, step: 'f3')) /
          2,
    );
  }
  final index = _fStepIndex[step];
  if (index == null) {
    throw ArgumentError.value(step, 'step', 'Invalid f-step');
  }
  final table = _platformToBase[platform]?[density];
  if (table == null) {
    throw ArgumentError('Unknown platform or density: $platform / $density');
  }
  return table[index];
}

double getDimensionValue({
  required String platform,
  required String density,
  required String step,
  PlatformsFoundationConfig? platformsConfig,
}) {
  if (platformsConfig != null && platformsConfig.platforms.isNotEmpty) {
    final branded =
        lookupBrandedDimensionValue(platform, density, step, platformsConfig);
    if (branded != null) return branded;
  }
  return staticDimensionValue(platform: platform, density: density, step: step);
}

/// Grid layout labels — parity with `GRID_LAYOUT` (values only for display).
const Map<String, ({int columns, String maxWidthLabel})> gridLayout = {
  'S': (columns: 4, maxWidthLabel: 'unbounded'),
  'M': (columns: 8, maxWidthLabel: 'unbounded'),
  'L': (columns: 12, maxWidthLabel: '1280'),
};

({double margin, double gutter}) getGridSpacing({
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
}) {
  if (platformsConfig != null && platformsConfig.platforms.isNotEmpty) {
    final blocks = extractDimensionBlocks(platformsConfig);
    final block = findDimensionBlock(platform, density, blocks);
    if (block != null && !blockMatchesStaticTable(block)) {
      final f0 = block.values[baseF0Index];
      return (
        margin: _round2(f0 * gridMarginRatio),
        gutter: _round2(f0 * gridGutterRatio),
      );
    }
  }
  return _staticGridSpacing(platform: platform, density: density);
}

({double margin, double gutter}) _staticGridSpacing({
  required String platform,
  required String density,
}) {
  return switch ((platform, density)) {
    ('S', 'default') => (margin: 16, gutter: 8),
    ('S', 'compact') => (margin: 10.5, gutter: 5.25),
    ('S', 'open') => (margin: 22.5, gutter: 11.25),
    ('M', 'default') => (margin: 24, gutter: 12),
    ('M', 'compact') => (margin: 17.5, gutter: 8.75),
    ('M', 'open') => (margin: 31.5, gutter: 15.75),
    ('L', 'default') => (margin: 45, gutter: 22.5),
    ('L', 'compact') => (margin: 36, gutter: 16),
    ('L', 'open') => (margin: 70, gutter: 25),
    _ => (margin: 16, gutter: 8),
  };
}

double getGridMargin({
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
}) =>
    getGridSpacing(
      platform: platform,
      density: density,
      platformsConfig: platformsConfig,
    ).margin;

double getGridGutter({
  required String platform,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
}) =>
    getGridSpacing(
      platform: platform,
      density: density,
      platformsConfig: platformsConfig,
    ).gutter;
