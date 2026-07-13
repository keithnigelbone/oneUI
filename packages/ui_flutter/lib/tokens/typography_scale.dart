import '../engine/native_design_system_payload.dart';
import '../foundations/dimensions_resolve.dart';
import 'dimension_scale.dart';
import 'platform_foundation_config.dart';

part 'typography_brand_resolve.dart';

/// Parity with `packages/shared/src/data/typography-roles.ts`.

const List<String> typographyRoles = [
  'display',
  'headline',
  'title',
  'body',
  'label',
  'code',
];

const Map<String, List<String>> typographySizes = {
  'display': ['L', 'M', 'S'],
  'headline': ['L', 'M', 'S'],
  'title': ['L', 'M', 'S'],
  'body': ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS'],
  'label': ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS', '3XS'],
  'code': ['M', 'S', 'XS'],
};

/// Default f-step assignments (Jio / system) — same keys as TS `DEFAULT_FSTEP_ASSIGNMENTS`.
const Map<String, Map<String, String>> defaultFStepAssignments = {
  'display': {'L': 'f7', 'M': 'f6', 'S': 'f5'},
  'headline': {'L': 'f4', 'M': 'f2', 'S': 'f0'},
  'title': {'L': 'f2', 'M': 'f0', 'S': 'f-2'},
  'body': {
    '2XL': 'f3',
    'XL': 'f2',
    'L': 'f1',
    'M': 'f0',
    'S': 'f-1',
    'XS': 'f-2',
    '2XS': 'f-3',
  },
  'label': {
    '2XL': 'f3',
    'XL': 'f2',
    'L': 'f1',
    'M': 'f0',
    'S': 'f-1',
    'XS': 'f-2',
    '2XS': 'f-3',
    '3XS': 'f-4',
  },
  'code': {'M': 'f0', 'S': 'f-1', 'XS': 'f-2'},
};

const Map<String, int> defaultLineHeightOffsets = {
  'display': 0,
  'headline': 0,
  'title': 1,
  'body': 3,
  'label': 0,
  'code': 2,
};

const Map<String, Map<String, int>> fixedFontWeights = {
  'display': {'L': 900, 'M': 900, 'S': 900},
  'headline': {'L': 900, 'M': 900, 'S': 850},
  'title': {'L': 800, 'M': 800, 'S': 750},
};

const Map<String, Map<String, int>> emphasisFontWeights = {
  'body': {'high': 700, 'medium': 500, 'low': 400},
  'label': {'high': 700, 'medium': 500, 'low': 400},
  'code': {'high': 700, 'medium': 500, 'low': 400},
};

int parseFStepNumber(String fStep) {
  return int.parse(fStep.replaceFirst(RegExp(r'^f'), ''));
}

String computeLineHeightFStep(String fontSizeFStep, int offset) {
  final n = parseFStepNumber(fontSizeFStep) + offset;
  final clamped = n.clamp(-8, 16).toInt();
  return 'f$clamped';
}

class TypographyEntry {
  const TypographyEntry({
    required this.role,
    required this.size,
    required this.tokenName,
    required this.fontSizeStep,
    required this.lineHeightStep,
  });

  final String role;
  final String size;
  final String tokenName;
  final String fontSizeStep;
  final String lineHeightStep;
}

String typographyTokenName(String role, String size) {
  return '${role[0].toUpperCase()}${role.substring(1)}-$size';
}

List<TypographyEntry> getAllTypographyEntries() =>
    getTypographyEntriesForBrand(null);
