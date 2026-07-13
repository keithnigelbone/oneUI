import 'package:flutter/foundation.dart';

/// Public URL path for a file under `web/qa-reports/` (leading slash, site root).
String qaReportPublicPath(String path) {
  var p = path.startsWith('web/') ? path.substring(4) : path;
  if (!p.startsWith('/')) p = '/$p';
  return p;
}

/// Absolute URI for fetching synced report JSON/HTML on Flutter web.
///
/// Must be origin-rooted — on `/c/checkbox-field`, relative `qa-reports/…`
/// would incorrectly resolve to `/c/qa-reports/…`.
Uri qaReportWebUri(String path, {bool cacheBust = true}) {
  final public = qaReportPublicPath(path);
  return Uri.parse('${Uri.base.origin}$public').replace(
    queryParameters: cacheBust && kIsWeb
        ? {'_': '${DateTime.now().millisecondsSinceEpoch}'}
        : null,
  );
}
