import 'dart:convert';

import 'package:flutter/services.dart';

import '../engine/native_theme_snapshot.dart';
import 'one_ui_brand_data.dart';

/// In-memory registry populated from bundled CDN snapshot assets
/// (`assets/brand_data/cdn/manifest.json`) or [registerBrandSnapshotCache].
///
/// Mirrors `@oneui/ui-native` `registerBrandCache` / `getCdnBrandData`.
final Map<String, NativeThemeSnapshot> _brandSnapshots = {};
final Map<String, NativeThemeSnapshot> _themeSnapshots = {};

/// Manifest rows loaded from [loadBundledCdnBrandSnapshots] (read-only).
List<OneUiCdnManifestEntry> get oneUiCdnManifestEntries =>
    List<OneUiCdnManifestEntry>.unmodifiable(_manifestEntries);
final List<OneUiCdnManifestEntry> _manifestEntries = [];

/// One row from `assets/brand_data/cdn/manifest.json`.
class OneUiCdnManifestEntry {
  const OneUiCdnManifestEntry({
    required this.brand,
    required this.variant,
    required this.theme,
    required this.platform,
    required this.density,
    required this.assetPath,
  });

  final String brand;

  /// `base` or sub-brand slug (`jiomart`, …).
  final String variant;
  final String theme;
  final String platform;
  final String density;
  final String assetPath;

  /// Value for [OneUiBrandProvider.theme] — `null` when [variant] is `base`.
  String? get themeProp =>
      variant.isEmpty || variant == 'base' ? null : variant;
}

String _themeCacheKey(String brand, String variant) => '$brand::$variant';

/// Merge prefetched brand snapshots into the in-memory cache.
void registerBrandSnapshotCache({
  Map<String, NativeThemeSnapshot>? brands,
  Map<String, NativeThemeSnapshot>? themes,
}) {
  if (brands != null) {
    _brandSnapshots.addAll(brands);
  }
  if (themes != null) {
    _themeSnapshots.addAll(themes);
  }
}

/// Parent brand snapshot for [brandSlug] at [themeMode] (`light` / `dark`).
NativeThemeSnapshot? getCdnBrandSnapshot(
  String brandSlug, {
  required String themeMode,
  String platform = 'mobile',
  String density = 'default',
}) {
  final key = _snapshotAssetStem(brandSlug, themeMode, platform, density);
  return _brandSnapshots[key] ?? _brandSnapshots[brandSlug];
}

/// Sub-brand snapshot merged at prefetch time — keyed `brand::variant`.
NativeThemeSnapshot? getCdnThemeSnapshot(
  String brandSlug,
  String variant, {
  required String themeMode,
  String platform = 'mobile',
  String density = 'default',
}) {
  if (variant.isEmpty || variant == 'base') return null;
  final key =
      '${_snapshotAssetStem(brandSlug, themeMode, platform, density, variant)}';
  return _themeSnapshots[key] ??
      _themeSnapshots[_themeCacheKey(brandSlug, variant)];
}

String _snapshotAssetStem(
  String brandSlug,
  String themeMode,
  String platform,
  String density, [
  String? variant,
]) {
  final parts = <String>[
    brandSlug.toLowerCase(),
    themeMode,
    platform,
    density,
  ];
  if (variant != null && variant.isNotEmpty && variant != 'base') {
    parts.add(variant.toLowerCase());
  }
  return parts.join('_');
}

/// Loads `assets/brand_data/cdn/manifest.json` + referenced snapshot files.
///
/// Call once before [runApp] when the app ships CDN snapshots under
/// `packages/ui_flutter/assets/brand_data/cdn/` (see `tool/sync_flutter_cdn_cache.sh`).
Future<void> loadBundledCdnBrandSnapshots(
    {String manifestAsset =
        'packages/ui_flutter/assets/brand_data/cdn/manifest.json'}) async {
  try {
    final manifestRaw = await rootBundle.loadString(manifestAsset);
    final manifest = jsonDecode(manifestRaw) as Map<String, dynamic>;
    final entries = manifest['entries'];
    if (entries is! List) return;

    final brands = <String, NativeThemeSnapshot>{};
    final themes = <String, NativeThemeSnapshot>{};

    for (final entry in entries) {
      if (entry is! Map) continue;
      final m = Map<String, dynamic>.from(entry);
      final assetPath = m['assetPath'] as String?;
      if (assetPath == null || assetPath.isEmpty) continue;

      final raw = await rootBundle.loadString(
        assetPath.startsWith('packages/')
            ? assetPath
            : 'packages/ui_flutter/$assetPath',
      );
      final json = jsonDecode(raw);
      if (json is! Map) continue;
      final snap =
          NativeThemeSnapshot.tryParse(Map<String, dynamic>.from(json));
      if (snap == null) continue;

      final brand = (m['brand'] as String? ?? '').toLowerCase();
      final variant = (m['variant'] as String? ?? 'base').toLowerCase();
      final theme = (m['theme'] as String? ?? 'light').toLowerCase();
      final platform = (m['platform'] as String? ?? 'mobile').toLowerCase();
      final density = (m['density'] as String? ?? 'default').toLowerCase();
      final stem = _snapshotAssetStem(
          brand, theme, platform, density, variant == 'base' ? null : variant);

      if (variant == 'base') {
        brands[stem] = snap;
        brands[brand] = snap;
      } else {
        themes[stem] = snap;
        themes[_themeCacheKey(brand, variant)] = snap;
      }
    }

    registerBrandSnapshotCache(brands: brands, themes: themes);
    _manifestEntries
      ..clear()
      ..addAll(
        entries.map((entry) {
          if (entry is! Map) return null;
          final m = Map<String, dynamic>.from(entry);
          final brand = (m['brand'] as String? ?? '').toLowerCase();
          if (brand.isEmpty) return null;
          return OneUiCdnManifestEntry(
            brand: brand,
            variant: (m['variant'] as String? ?? 'base').toLowerCase(),
            theme: (m['theme'] as String? ?? 'light').toLowerCase(),
            platform: (m['platform'] as String? ?? 'mobile').toLowerCase(),
            density: (m['density'] as String? ?? 'default').toLowerCase(),
            assetPath: m['assetPath'] as String? ?? '',
          );
        }).whereType<OneUiCdnManifestEntry>(),
      );
  } on Object {
    // Manifest absent — consumer uses default Jio only.
  }
}

/// Register a single [OneUiBrandData] JSON asset as a resolved snapshot (advanced).
void registerBrandDataSnapshot(
  String slug,
  NativeThemeSnapshot snapshot, {
  String? themeVariant,
}) {
  if (themeVariant != null &&
      themeVariant.isNotEmpty &&
      themeVariant != 'base') {
    _themeSnapshots[_themeCacheKey(slug, themeVariant)] = snapshot;
  } else {
    _brandSnapshots[slug.toLowerCase()] = snapshot;
  }
}
