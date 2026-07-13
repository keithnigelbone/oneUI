import 'dart:convert';

import 'package:flutter/services.dart';

import '../engine/native_theme_snapshot.dart';

/// Bundled default Jio brand snapshots (generated from `defaultJioBrandData.json`).
///
/// Regenerate:
///   pnpm --filter @oneui/ui-native run generate:default-brand
///   pnpm flutter:generate-default-brand
class DefaultJioBrandSnapshot {
  DefaultJioBrandSnapshot._();

  static NativeThemeSnapshot? _light;
  static NativeThemeSnapshot? _dark;
  static bool _loaded = false;

  /// Load bundled assets. Call from `main()` before `runApp` for sync access.
  static Future<void> ensureLoaded() async {
    if (_loaded) return;
    _light = await _loadAsset(
      'packages/ui_flutter/assets/brand_data/default_jio_light_mobile_default.json',
    );
    _dark = await _loadAsset(
      'packages/ui_flutter/assets/brand_data/default_jio_dark_mobile_default.json',
    );
    _loaded = true;
  }

  static Future<NativeThemeSnapshot?> _loadAsset(String path) async {
    try {
      final raw = await rootBundle.loadString(path);
      final json = jsonDecode(raw);
      if (json is! Map) return null;
      return NativeThemeSnapshot.tryParse(Map<String, dynamic>.from(json));
    } on Object {
      return null;
    }
  }

  /// Synchronous access after [ensureLoaded].
  static NativeThemeSnapshot? forMode(String mode) {
    final dark = mode == 'dark' || mode == 'dim';
    return dark ? (_dark ?? _light) : (_light ?? _dark);
  }

  static NativeThemeSnapshot? get light => _light;
  static NativeThemeSnapshot? get dark => _dark;
}
