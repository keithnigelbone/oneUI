import 'package:flutter/services.dart';

/// Bundled JioMart mark — used when [OneUiBrandProvider.theme] is `jiomart`.
///
/// CDN `brand-data` JSON does not include `logoSvg`; offline apps load this file.
class DefaultJioMartBrandLogo {
  DefaultJioMartBrandLogo._();

  static String? _svg;
  static bool _loaded = false;

  static const String assetPath =
      'packages/ui_flutter/assets/jiomart-logo.svg';

  static Future<void> ensureLoaded() async {
    if (_loaded) return;
    try {
      final raw = await rootBundle.loadString(assetPath);
      _svg = raw.trim().isEmpty ? null : raw;
    } on Object {
      _svg = null;
    }
    _loaded = true;
  }

  /// Synchronous access after [ensureLoaded].
  static String? get svg => _svg;
}
