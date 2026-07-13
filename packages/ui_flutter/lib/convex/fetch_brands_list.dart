import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'convex_query.dart';
import 'one_ui_brand.dart';

/// Convex HTTP `brands:list` — same transport as web Storybook `manager.tsx`.
Future<BrandsListResult> fetchBrandsList(String convexUrl) async {
  if (convexUrl.isEmpty) {
    return const BrandsListResult(brands: [], status: BrandsListStatus.error);
  }
  try {
    final res = await http.post(
      Uri.parse('$convexUrl/api/query'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'path': 'brands:list',
        'args': <String, dynamic>{},
        'format': 'json',
      }),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      debugPrint(
        'Convex brands:list HTTP ${res.statusCode} for $convexUrl — ${res.body.length > 200 ? "${res.body.substring(0, 200)}…" : res.body}',
      );
      return const BrandsListResult(brands: [], status: BrandsListStatus.error);
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (data['status'] != 'success') {
      debugPrint('Convex brands:list non-success: $data');
      return const BrandsListResult(brands: [], status: BrandsListStatus.error);
    }
    final raw = data['value'];
    if (raw is! List<dynamic>) {
      debugPrint('Convex brands:list value is not a list: $raw');
      return const BrandsListResult(brands: [], status: BrandsListStatus.error);
    }
    if (raw.isEmpty) {
      debugPrint(
        'Convex brands:list returned 0 rows — this deployment\'s `brands` table is empty. '
        'Run `brands:seedDefaultBrands` (Convex dashboard Functions, or CLI from packages/convex).',
      );
    }
    final brands = <OneUiBrand>[];
    for (final e in raw) {
      if (e is! Map) continue;
      final m = Map<String, dynamic>.from(e);
      final idRaw = m['_id'];
      if (idRaw == null) continue;
      brands.add(
        OneUiBrand(
          id: idRaw is String ? idRaw : idRaw.toString(),
          name: m['name'] as String? ?? '',
          slug: m['slug'] as String? ?? '',
          primaryHue: (m['primaryHue'] as num?)?.toDouble(),
          primaryChroma: (m['primaryChroma'] as num?)?.toDouble(),
        ),
      );
    }
    return BrandsListResult(brands: brands, status: BrandsListStatus.ok);
  } catch (e, st) {
    debugPrint('Convex brands:list failed: $e\n$st');
    return const BrandsListResult(brands: [], status: BrandsListStatus.error);
  }
}
