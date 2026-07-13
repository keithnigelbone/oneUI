import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'convex_query.dart';

/// Convex HTTP `brands:get` — returns the brand row (includes `logoSvg`).
Future<Map<String, dynamic>?> fetchBrandRecord(
    String convexUrl, String brandId) async {
  if (convexUrl.isEmpty || brandId.isEmpty) return null;
  try {
    final res = await http.post(
      Uri.parse('$convexUrl/api/query'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'path': 'brands:get',
        'args': {'id': brandId},
        'format': 'json',
      }),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      debugPrint(
        'fetchBrandRecord: HTTP ${res.statusCode} for $convexUrl — '
        '${res.body.length > 280 ? "${res.body.substring(0, 280)}…" : res.body}',
      );
      return null;
    }
    final decoded = jsonDecode(res.body);
    if (decoded is! Map) return null;
    final data = Map<String, dynamic>.from(decoded);
    if (data['status'] != 'success') {
      debugPrint('fetchBrandRecord: non-success — $data');
      return null;
    }
    final value = convexQuerySuccessValue(data['value']);
    if (value == null) return null;
    if (value is! Map) return null;
    return Map<String, dynamic>.from(value);
  } catch (_) {
    return null;
  }
}
