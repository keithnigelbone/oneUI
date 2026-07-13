import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'jio_semantic_mapping.dart';

/// One record from `apps/platform/public/jio-icons-data.json` (Storybook Jio loader).
@immutable
class JioIconRecord {
  const JioIconRecord({required this.viewBox, required this.innerSvg});

  final String viewBox;
  final String innerSvg;
}

/// Loads the same Jio SVG catalog as web Storybook (`loadJioIconForStorybook`).
class JioIconCatalog {
  JioIconCatalog._();

  static final JioIconCatalog instance = JioIconCatalog._();

  /// Asset key — declared in `ui_flutter/pubspec.yaml` (symlink to platform JSON).
  ///
  /// Apps that depend on `ui_flutter` must load via the `packages/` prefix
  /// (`AssetManifest` never exposes bare `assets/…` from a path dependency).
  static const String defaultAssetKey =
      'packages/ui_flutter/assets/jio-icons-data.json';

  /// In-package tests / `flutter test` from `packages/ui_flutter` only.
  static const String packageLocalAssetKey = 'assets/jio-icons-data.json';

  Map<String, JioIconRecord>? _records;
  Future<void>? _loadFuture;

  bool get isReady => _records != null;

  Future<void> ensureLoaded({
    AssetBundle? bundle,
    String assetKey = defaultAssetKey,
  }) {
    if (_records != null) return Future.value();
    _loadFuture ??= _load(bundle: bundle, assetKey: assetKey);
    return _loadFuture!;
  }

  Future<String> _loadCatalogJson(AssetBundle bundle, String assetKey) async {
    final keys = assetKey == defaultAssetKey
        ? [defaultAssetKey, packageLocalAssetKey]
        : [assetKey];
    for (final key in keys) {
      try {
        return await bundle.loadString(key);
      } catch (_) {
        // Try fallback key (package vs in-package test).
      }
    }
    throw FlutterError(
      'Unable to load Jio icon catalog. Tried: ${keys.join(', ')}.',
    );
  }

  Future<void> _load({
    required AssetBundle? bundle,
    required String assetKey,
  }) async {
    final b = bundle ?? rootBundle;
    final jsonStr = await _loadCatalogJson(b, assetKey);
    final raw = json.decode(jsonStr) as Map<String, dynamic>;
    final parsed = <String, JioIconRecord>{};
    for (final entry in raw.entries) {
      final map = entry.value;
      if (map is! Map) continue;
      final v = map['v']?.toString();
      final d = map['d']?.toString();
      if (v == null || d == null || v.isEmpty || d.isEmpty) continue;
      parsed[entry.key] = JioIconRecord(viewBox: v, innerSvg: d);
    }
    _records = parsed;
  }

  JioIconRecord? record(String catalogId) => _records?[catalogId];

  /// Builds an SVG glyph widget (`currentColor` paths, same as web lazy Jio icons).
  Widget? buildGlyph(
    String catalogId, {
    required double size,
    required Color color,
  }) {
    final rec = record(catalogId);
    if (rec == null) return null;
    final svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" '
        'viewBox="${rec.viewBox}">${rec.innerSvg}</svg>';
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      fit: BoxFit.contain,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }

  /// Semantic name → Jio catalog glyph, or null if catalog/mapping missing.
  Widget? buildSemanticGlyph(
    String semanticName, {
    required double size,
    required Color color,
  }) {
    if (!isReady) return null;
    final id = jioCatalogIdForSemanticName(semanticName);
    if (id == null) return null;
    return buildGlyph(id, size: size, color: color);
  }
}
