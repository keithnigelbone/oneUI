import '../tokens/appearance_roles.dart';
import 'button_decoration.dart';
import 'color_math.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Convex `nativeTheme:getNativeThemeSnapshot` after decode — matches `OneUINativeTheme` payload
/// from `buildNativeTheme` (plus `schemaVersion` / `brandId` wrapper fields).
class NativeThemeSnapshot {
  const NativeThemeSnapshot({
    required this.themeConfig,
    required this.rootParentStep,
    required this.darkMode,
    this.schemaVersion = 0,
    this.brandId,
    this.brandHash,
    this.configuredRoles,
    this.rootRoles,
    this.typography,
    this.designSystem,
    this.buttonOrnament,
  });

  final ThemeConfig themeConfig;
  final int rootParentStep;
  final bool darkMode;

  /// Server schema version (`1` = full snapshot with `rootRoles` / `typography`).
  final int schemaVersion;

  /// Convex `brands` id when present.
  final String? brandId;

  final String? brandHash;
  final List<String>? configuredRoles;

  /// Per-role hex maps at the **root** surface (optional on legacy servers).
  final Map<String, dynamic>? rootRoles;

  /// Resolved typography object from the engine (optional on legacy servers).
  final Map<String, dynamic>? typography;

  /// Schema ≥ 2: component `--*` map + structured dimensions (TS `designSystem` block).
  final NativeDesignSystemPayload? designSystem;

  /// Button SVG ornament when assigned in Convex `componentDecorations`.
  final ButtonOrnamentConfig? buttonOrnament;

  /// Returns null if payload missing or malformed.
  static NativeThemeSnapshot? tryParse(Map<String, dynamic>? json) {
    if (json == null) return null;
    final tcRaw = json['themeConfig'];
    if (tcRaw is! Map) return null;
    final tc = Map<String, dynamic>.from(tcRaw);
    try {
      final rootRolesRaw = json['rootRoles'];
      Map<String, dynamic>? rootRoles;
      if (rootRolesRaw is Map) {
        rootRoles =
            Map<String, dynamic>.from(rootRolesRaw);
      }
      final typRaw = json['typography'];
      Map<String, dynamic>? typography;
      if (typRaw is Map) {
        typography = Map<String, dynamic>.from(typRaw);
      }
      final brandId = _parseConvexStringId(json['brandId']);
      final sv = json['schemaVersion'];
      final schema = sv is num ? sv.round() : (int.tryParse('$sv') ?? 0);

      final designSystem =
          NativeDesignSystemPayload.tryParse(json['designSystem']);

      ButtonOrnamentConfig? buttonOrnament;
      final decoList = json['decorations'];
      if (decoList is List) {
        for (final item in decoList) {
          if (item is Map) {
            final m = Map<String, dynamic>.from(item);
            if (m['componentName'] == 'Button') {
              buttonOrnament = ButtonOrnamentConfig.fromJson(m);
              break;
            }
          }
        }
      }

      final rootStepRaw = json['rootParentStep'];
      final rootParentStep = rootStepRaw is num
          ? rootStepRaw.round()
          : int.tryParse('$rootStepRaw') ??
              (_parseBool(json['darkMode']) ? 100 : 2500);

      return NativeThemeSnapshot(
        themeConfig: themeConfigFromJson(tc),
        rootParentStep: rootParentStep,
        darkMode: _parseBool(json['darkMode']),
        schemaVersion: schema,
        brandId: brandId,
        brandHash: json['brandHash'] is String
            ? json['brandHash'] as String
            : json['brandHash']?.toString(),
        configuredRoles: _parseStringList(json['configuredRoles']),
        rootRoles: rootRoles,
        typography: typography,
        designSystem: designSystem,
        buttonOrnament: buttonOrnament,
      );
    } catch (_) {
      return null;
    }
  }
}

bool _parseBool(Object? v) {
  if (v is bool) return v;
  if (v is num) return v != 0;
  if (v is String) {
    final s = v.trim().toLowerCase();
    return s == 'true' || s == '1' || s == 'yes';
  }
  return false;
}

String? _parseConvexStringId(Object? v) {
  if (v == null) return null;
  if (v is String) return v.isEmpty ? null : v;
  if (v is Map) {
    final id = v['_id'] ?? v['id'];
    if (id is String) return id;
  }
  final s = v.toString();
  return s.isEmpty ? null : s;
}

List<String>? _parseStringList(Object? raw) {
  if (raw is! List) return null;
  final out = <String>[];
  for (final e in raw) {
    if (e == null) continue;
    out.add(e is String ? e : e.toString());
  }
  return out.isEmpty ? null : out;
}

/// Rebuild [ThemeConfig] from JSON (`JSON.stringify(theme.themeConfig)` in Convex).
ThemeConfig themeConfigFromJson(Map<String, dynamic> json) {
  final appearancesRaw = json['appearances'];
  if (appearancesRaw is! Map) {
    throw const FormatException('themeConfig.appearances missing');
  }
  final appearances = <String, ScaleDefinition>{};
  for (final e in appearancesRaw.entries) {
    final key = normalizeAppearanceRoleKey(e.key.toString());
    final v = e.value;
    // `dart:convert` JSON objects are often `Map<dynamic, dynamic>` — not `Map<String, dynamic>`.
    if (v is Map) {
      appearances[key] =
          scaleDefinitionFromJson(Map<String, dynamic>.from(v));
    }
  }
  return ThemeConfig(appearances: appearances);
}

Map<String, dynamic>? _asStringKeyedMap(Object? raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) return Map<String, dynamic>.from(raw);
  return null;
}

Map<String, String> _stringMapFromJson(Object? raw) {
  if (raw is! Map) return {};
  return Map<String, String>.from(
    raw.map((k, v) {
      final s = v.toString().trim();
      if (s.startsWith('#')) {
        return MapEntry(k.toString(), normalizePaletteHexForEngine(s));
      }
      return MapEntry(k.toString(), s);
    }),
  );
}

/// Parses one role from Convex `rootRoles` (TS `NativeRoleTokens`).
FlatRoleTokens? flatRoleTokensFromRootRoleJson(Map<String, dynamic>? roleJson) {
  if (roleJson == null) return null;
  final surfaces = _stringMapFromJson(roleJson['surfaces']);
  if (surfaces.isEmpty) return null;
  return FlatRoleTokens(
    surfaces: surfaces,
    content: _stringMapFromJson(roleJson['content']),
    onBoldContent: _stringMapFromJson(roleJson['onBoldContent']),
    onSubtleContent: _stringMapFromJson(roleJson['onSubtleContent']),
    states: _stringMapFromJson(roleJson['states']),
    stateLayers: _stringMapFromJson(roleJson['stateLayers']),
  );
}

/// Root surface tokens per role — same object RN mounts as `theme.rootRoles`.
Map<String, FlatRoleTokens> resolvedRolesFromRootRoles(
    Map<String, dynamic>? rootRoles) {
  if (rootRoles == null) return {};
  final out = <String, FlatRoleTokens>{};
  for (final e in rootRoles.entries) {
    final role = normalizeAppearanceRoleKey(e.key.toString());
    final flat = flatRoleTokensFromRootRoleJson(_asStringKeyedMap(e.value));
    if (flat != null) out[role] = flat;
  }
  return out;
}

/// Root [data-surface] roles — RN `theme.rootRoles` + TS `resolveMultiRoleTokenSets`.
///
/// When [rootRolesJson] is present (Convex `buildNativeTheme`), each role uses the
/// **full** server-resolved token set — never merged token-by-token with a local
/// Dart recompute (that mixed Convex hex with engine drift).
/// Roles missing from the snapshot still fall back to [resolveNativeContextRoles].
Map<String, FlatRoleTokens> resolveRootSurfaceRoles({
  required ThemeConfig themeConfig,
  required int rootParentStep,
  required bool darkMode,
  Map<String, dynamic>? rootRolesJson,
}) {
  final fromSnapshot = resolvedRolesFromRootRoles(rootRolesJson);
  if (fromSnapshot.isEmpty) {
    return resolveNativeContextRoles(themeConfig, rootParentStep, darkMode);
  }

  final computed =
      resolveNativeContextRoles(themeConfig, rootParentStep, darkMode);
  final merged = <String, FlatRoleTokens>{};
  for (final role in themeConfig.appearances.keys) {
    final key = normalizeAppearanceRoleKey(role);
    merged[key] = fromSnapshot[key] ?? computed[key] ?? computed[role]!;
  }
  for (final e in fromSnapshot.entries) {
    merged.putIfAbsent(e.key, () => e.value);
  }
  return merged;
}

int _parseScaleInt(Object? v, String field) {
  if (v is num) return v.round();
  final p = int.tryParse('$v');
  if (p != null) return p;
  throw FormatException('invalid int for $field: $v');
}

ScaleDefinition scaleDefinitionFromJson(Map<String, dynamic> m) {
  final paletteRaw = m['palette'];
  if (paletteRaw is! Map) {
    throw const FormatException('scale.palette missing');
  }
  final palette = <int, String>{};
  for (final pe in paletteRaw.entries) {
    final step = int.tryParse(pe.key.toString());
    if (step == null) continue;
    final hex = pe.value;
    if (hex is String) {
      palette[step] = normalizePaletteHexForEngine(hex);
    }
  }
  return ScaleDefinition(
    name: m['name'] as String? ?? '',
    baseStep: _parseScaleInt(m['baseStep'], 'baseStep'),
    darkerBaseStep: _parseScaleInt(m['darkerBaseStep'], 'darkerBaseStep'),
    palette: palette,
    anchorBoldToBaseStep: m['anchorBoldToBaseStep'] as bool? ?? false,
  );
}
