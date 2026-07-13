/// Static per-weight font family maps — `staticFontFamilies.ts` in `@oneui/shared`.
library;

const List<int> kStandardCssWeights = [
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900
];

const Map<int, String> kCssWeightFamilySuffix = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
};

typedef StaticWeightFamilyMap = Map<int, String>;
typedef StaticWeightFamiliesBySlot = Map<String, StaticWeightFamilyMap>;

/// Maps typography role → font slot for static weight family lookup.
String typographySlotForRole(String role) {
  if (role == 'code') return 'code';
  if (role == 'display' || role == 'headline' || role == 'title') {
    return 'secondary';
  }
  return 'primary';
}

int snapToStandardCssWeight(int weight) {
  final rounded = ((weight / 100).round() * 100).clamp(100, 900);
  return rounded;
}

Map<int, String> buildStaticWeightFamilyMap(String prefix) {
  return {
    for (final w in kStandardCssWeights)
      w: '$prefix-${kCssWeightFamilySuffix[w]}',
  };
}

String? resolveStaticWeightFamily(
  StaticWeightFamilyMap? map,
  int weight,
) {
  if (map == null || map.isEmpty) return null;
  return map[snapToStandardCssWeight(weight)];
}

StaticWeightFamilyMap? _parseWeightMap(Object? raw) {
  if (raw is! Map) return null;
  final out = <int, String>{};
  for (final e in raw.entries) {
    final key = int.tryParse(e.key.toString());
    final val = e.value;
    if (key != null && val is String && val.isNotEmpty) {
      out[key] = val;
    }
  }
  return out.isEmpty ? null : out;
}

StaticWeightFamiliesBySlot? parseStaticWeightFamilies(Object? raw) {
  if (raw is! Map) return null;
  final out = <String, StaticWeightFamilyMap>{};
  for (final slot in ['primary', 'secondary', 'code']) {
    final m = _parseWeightMap(raw[slot]);
    if (m != null) out[slot] = m;
  }
  return out.isEmpty ? null : out;
}

Map<String, dynamic>? _prefixConfig(Object? raw) {
  if (raw is! Map) return null;
  return Map<String, dynamic>.from(raw);
}

/// Merge optional per-slot prefixes with explicit per-weight overrides.
StaticWeightFamiliesBySlot? mergeStaticWeightFamilyConfig({
  Map<String, dynamic>? prefix,
  StaticWeightFamiliesBySlot? explicit,
}) {
  final merged = <String, StaticWeightFamilyMap>{};
  for (final slot in ['primary', 'secondary', 'code']) {
    final slotPrefix = prefix?[slot];
    final fromPrefix = slotPrefix is String && slotPrefix.isNotEmpty
        ? buildStaticWeightFamilyMap(slotPrefix)
        : null;
    final fromExplicit = explicit?[slot];
    if (fromPrefix == null && fromExplicit == null) continue;
    merged[slot] = {...?fromPrefix, ...?fromExplicit};
  }
  return merged.isEmpty ? null : merged;
}

String? resolveStaticWeightFamilyForRole(
  StaticWeightFamiliesBySlot? staticFamilies,
  String role,
  int weight,
) {
  if (staticFamilies == null) return null;
  final slot = typographySlotForRole(role);
  return resolveStaticWeightFamily(staticFamilies[slot], weight);
}

/// Reads `staticWeightFamilies` + `staticWeightFamilyPrefix` from typography config.
StaticWeightFamiliesBySlot? staticWeightFamiliesFromTypographyConfig(
  Map<String, dynamic>? typographyConfig,
) {
  if (typographyConfig == null) return null;
  final unwrapped = unwrapNativeTypographyConfig(typographyConfig);
  final explicit = parseStaticWeightFamilies(unwrapped['staticWeightFamilies']);
  final prefix = _prefixConfig(unwrapped['staticWeightFamilyPrefix']);
  return mergeStaticWeightFamilyConfig(prefix: prefix, explicit: explicit);
}

/// Convex hosts may nest V2 fields under `typographyV2` — mirror TS `unwrapNativeTypographyConfig`.
Map<String, dynamic> unwrapNativeTypographyConfig(Map<String, dynamic> config) {
  final v2 = config['typographyV2'];
  if (v2 is! Map) return config;
  final inner = Map<String, dynamic>.from(v2);
  return {
    ...inner,
    ...config,
    if (config['staticWeightFamilyPrefix'] != null)
      'staticWeightFamilyPrefix': config['staticWeightFamilyPrefix'],
    if (config['staticWeightFamilies'] != null)
      'staticWeightFamilies': config['staticWeightFamilies'],
  };
}
