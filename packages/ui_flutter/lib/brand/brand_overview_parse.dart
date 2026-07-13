import '../tokens/platform_foundation_config.dart';

Map<String, dynamic>? typographyConfigFromBrandOverview(
    Map<String, dynamic>? overview) {
  if (overview == null) return null;
  final t = overview['typography'];
  if (t is! Map<String, dynamic>) return null;
  final c = t['config'];
  return c is Map<String, dynamic> ? c : null;
}

List<Map<String, dynamic>>? customFontsFromBrandOverview(
    Map<String, dynamic>? overview) {
  if (overview == null) return null;
  final raw = overview['customFonts'];
  if (raw is! List) return null;
  return raw
      .whereType<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList(growable: false);
}

PlatformsFoundationConfig? platformsConfigFromBrandOverview(
    Map<String, dynamic>? overview) {
  if (overview == null) return null;
  final plat = overview['platforms'];
  final platMap = plat is Map<String, dynamic>
      ? plat
      : (plat is Map ? Map<String, dynamic>.from(plat) : null);
  final rawConfig = platMap?['config'];
  final configMap = rawConfig is Map<String, dynamic>
      ? rawConfig
      : (rawConfig is Map ? Map<String, dynamic>.from(rawConfig) : null);
  return PlatformsFoundationConfig.tryParse(configMap);
}

bool brandOverviewHasColorConfig(Map<String, dynamic>? overview) {
  if (overview == null) return false;
  final c = overview['color'];
  if (c is! Map) return false;
  final cfg = c['config'];
  return cfg is Map && cfg.isNotEmpty;
}
