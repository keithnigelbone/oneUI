import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../engine/native_theme_snapshot.dart';
import '../engine/native_typography_snapshot.dart';
import 'convex_query.dart';

/// Convex `nativeTheme:getNativeThemeSnapshot` — full `buildNativeTheme` JSON.
///
/// [density] / [platform] match TS [NativeThemeContext] (`compact|default|open`,
/// `mobile|tablet|desktop`). The Convex query stays server-side; this is the Dart HTTP client.
Future<NativeThemeSnapshot?> fetchNativeThemeSnapshot(
  String convexUrl,
  String brandId,
  String theme, {
  String density = 'default',
  String platform = 'mobile',
}) async {
  if (convexUrl.isEmpty || brandId.isEmpty) return null;
  final t = (theme == 'light' || theme == 'dark') ? theme : 'light';
  final d = density == 'compact' || density == 'open' ? density : 'default';
  final p = platform == 'tablet' || platform == 'desktop' ? platform : 'mobile';
  try {
    final res = await http.post(
      Uri.parse('$convexUrl/api/query'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'path': 'nativeTheme:getNativeThemeSnapshot',
        'args': {
          'brandId': brandId,
          'theme': t,
          'density': d,
          'platform': p,
        },
        'format': 'json',
      }),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      debugPrint(
        'fetchNativeThemeSnapshot: HTTP ${res.statusCode} for $convexUrl — '
        '${res.body.length > 280 ? "${res.body.substring(0, 280)}…" : res.body}',
      );
      return null;
    }
    final decoded = jsonDecode(res.body);
    if (decoded is! Map) {
      debugPrint(
          'fetchNativeThemeSnapshot: response JSON is not an object (${decoded.runtimeType})');
      return null;
    }
    final data = Map<String, dynamic>.from(decoded);
    if (data['status'] != 'success') {
      debugPrint('fetchNativeThemeSnapshot: Convex status not success — $data');
      return null;
    }
    if (!data.containsKey('value')) {
      debugPrint(
          'fetchNativeThemeSnapshot: response missing value key — $data');
      return null;
    }
    if (data['value'] == null) {
      debugPrint(
        'fetchNativeThemeSnapshot: query returned JSON null — no color.foundation.config on this '
        'brand or buildNativeTheme failed server-side. Fix brand foundations or deploy latest '
        '`packages/convex/convex/nativeTheme.ts`.',
      );
      return null;
    }
    final value = convexQuerySuccessValue(data['value']);
    if (value == null) {
      debugPrint(
        'fetchNativeThemeSnapshot: value is not a JSON object (got ${data['value'].runtimeType})',
      );
      return null;
    }
    final snap = NativeThemeSnapshot.tryParse(value);
    if (snap == null) {
      debugPrint(
        'fetchNativeThemeSnapshot: JSON did not parse as NativeThemeSnapshot '
        '(check Convex deployment matches packages/convex nativeTheme + color foundation). '
        'Keys: ${value.keys.take(12).map((k) => k.toString()).join(", ")}',
      );
      return null;
    }
    if (snap.designSystem == null) {
      debugPrint(
        'fetchNativeThemeSnapshot: schemaVersion=${snap.schemaVersion} but designSystem is null '
        '(deploy nativeTheme with schema v2 + designSystem block, or verify JSON shape).',
      );
    }
    final typ = snap.typography;
    if (typ == null) {
      debugPrint(
        'fetchNativeThemeSnapshot: response has no `typography` map — '
        'Flutter OneUiScope.nativeTypography will be null; Button `var(--Label-*)` chains need this. '
        'Verify Convex `nativeTheme:getNativeThemeSnapshot` returns `built.typography`.',
      );
    } else {
      final parsed = NativeTypographySnapshot.tryParse(typ);
      if (parsed == null) {
        debugPrint(
          'fetchNativeThemeSnapshot: `typography` is present but not a valid NativeTypography tree '
          '(need at least `label` or `body` with `sizes`). Keys: ${typ.keys.take(20).join(", ")}',
        );
      }
    }
    return snap;
  } catch (_) {
    return null;
  }
}
