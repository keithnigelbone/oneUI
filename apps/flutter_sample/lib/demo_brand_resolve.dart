import 'package:ui_flutter/convex/one_ui_brand.dart';

import 'demo_app_settings.dart';

/// Match a curated picker label to a Convex brand row (fuzzy on name/slug).
OneUiBrand? findConvexBrandByPickerLabel(
  List<OneUiBrand> brands,
  String pickerLabel,
) {
  if (brands.isEmpty) return null;
  final target = pickerLabel.trim().toLowerCase();
  for (final b in brands) {
    if (b.name.trim().toLowerCase() == target) return b;
  }
  for (final b in brands) {
    final n = b.name.trim().toLowerCase();
    if (n.contains(target) || target.contains(n)) return b;
  }
  final slugHint = cdnBrandSlugForPickerLabel(pickerLabel);
  for (final b in brands) {
    if (b.slug == slugHint || b.slug.startsWith('$slugHint-')) return b;
  }
  for (final b in brands) {
    if (b.slug.contains(slugHint)) return b;
  }
  return null;
}

OneUiBrand? findJioBrand(List<OneUiBrand> brands) {
  for (final b in brands) {
    if (b.slug == 'jio-default') return b;
  }
  for (final b in brands) {
    if (b.slug == 'jio') return b;
  }
  for (final b in brands) {
    final n = b.name.toLowerCase().trim();
    if (n == 'jio' || n == 'jio default') return b;
  }
  return brands.isNotEmpty ? brands.first : null;
}

/// Initial picker label after brands load — prefer Jio when present.
String initialBrandPickerLabel(List<OneUiBrand> brands) {
  if (findJioBrand(brands) != null) return 'Jio';
  if (brands.isNotEmpty) return brands.first.name;
  return kDemoBrandPickerOptions.first;
}
